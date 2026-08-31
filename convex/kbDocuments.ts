import {
  mutation,
  query,
  internalMutation,
  internalQuery,
  internalAction,
} from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { chunkText } from "./ai/chunking";
import { embedBatch } from "./ai/embed";
import { Id } from "./_generated/dataModel";
import { checkKbQuotaHelper } from "./usage";

/**
 * List all knowledge base documents for an organization
 */
export const list = query({
  args: { orgId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("kbDocuments")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .order("desc")
      .take(100);
  },
});

/**
 * Generate a signed upload URL for uploading source documents to Convex storage
 */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

/**
 * Register an uploaded document and trigger processing
 */
export const create = mutation({
  args: {
    orgId: v.string(),
    name: v.string(),
    fileId: v.id("_storage"),
    mimeType: v.string(),
    sizeBytes: v.number(),
  },
  handler: async (ctx, args) => {
    const quota = await checkKbQuotaHelper(ctx, args.orgId);
    if (!quota.allowed) {
      throw new Error(
        `Knowledge base document limit of ${quota.limit} reached for your ${quota.plan.toUpperCase()} plan. Please upgrade your subscription.`
      );
    }

    const documentId = await ctx.db.insert("kbDocuments", {
      orgId: args.orgId,
      name: args.name,
      fileId: args.fileId,
      mimeType: args.mimeType,
      sizeBytes: args.sizeBytes,
      status: "pending",
      chunkCount: 0,
    });

    // Schedule background processing action
    await ctx.scheduler.runAfter(
      0,
      internal.kbDocuments.processDocumentAction,
      { documentId }
    );

    return documentId;
  },
});

/**
 * Delete a document, its storage file, and its associated kbChunks
 */
export const remove = mutation({
  args: { id: v.id("kbDocuments") },
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.id);
    if (!doc) return;

    // Delete storage file if exists
    try {
      await ctx.storage.delete(doc.fileId);
    } catch (e) {
      console.warn("Could not delete file from storage:", e);
    }

    // Delete all chunks for this document
    const chunks = await ctx.db
      .query("kbChunks")
      .withIndex("by_document", (q) => q.eq("documentId", args.id))
      .collect();

    for (const chunk of chunks) {
      await ctx.db.delete(chunk._id);
    }

    // Delete document record
    await ctx.db.delete(args.id);
  },
});

/**
 * Internal query to fetch document details
 */
export const getDocument = internalQuery({
  args: { documentId: v.id("kbDocuments") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.documentId);
  },
});

/**
 * Internal mutation to update document processing status
 */
export const updateDocumentStatus = internalMutation({
  args: {
    documentId: v.id("kbDocuments"),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("ready"),
      v.literal("error")
    ),
    chunkCount: v.optional(v.number()),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.documentId, {
      status: args.status,
      chunkCount: args.chunkCount,
      errorMessage: args.errorMessage,
    });
  },
});

/**
 * Internal mutation to save document chunks and set status to ready
 */
export const saveDocumentChunks = internalMutation({
  args: {
    documentId: v.id("kbDocuments"),
    orgId: v.string(),
    chunks: v.array(
      v.object({
        content: v.string(),
        embedding: v.array(v.float64()),
        tokenCount: v.number(),
        chunkIndex: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    // Delete existing chunks
    const existing = await ctx.db
      .query("kbChunks")
      .withIndex("by_document", (q) => q.eq("documentId", args.documentId))
      .collect();

    for (const item of existing) {
      await ctx.db.delete(item._id);
    }

    // Insert new chunks
    for (const chunk of args.chunks) {
      await ctx.db.insert("kbChunks", {
        orgId: args.orgId,
        documentId: args.documentId,
        content: chunk.content,
        embedding: chunk.embedding,
        tokenCount: chunk.tokenCount,
        chunkIndex: chunk.chunkIndex,
      });
    }

    // Update document status
    await ctx.db.patch(args.documentId, {
      status: "ready",
      chunkCount: args.chunks.length,
      errorMessage: undefined,
    });
  },
});

/**
 * Internal action to process uploaded document:
 * 1. Download file from storage
 * 2. Extract text content
 * 3. Chunk text into ~500-1000 char chunks with overlap
 * 4. Generate 768-dim embeddings with Gemini
 * 5. Store chunks in kbChunks and mark status ready
 */
export const processDocumentAction = internalAction({
  args: { documentId: v.id("kbDocuments") },
  handler: async (ctx, args) => {
    try {
      const doc = await ctx.runQuery(internal.kbDocuments.getDocument, {
        documentId: args.documentId,
      });

      if (!doc) {
        throw new Error("Document not found");
      }

      await ctx.runMutation(internal.kbDocuments.updateDocumentStatus, {
        documentId: args.documentId,
        status: "processing",
      });

      const blob = await ctx.storage.get(doc.fileId);
      if (!blob) {
        throw new Error("File content not found in storage");
      }

      // Extract text
      let textContent = "";
      const isPdf =
        doc.mimeType.includes("pdf") || doc.name.toLowerCase().endsWith(".pdf");

      if (isPdf) {
        // Basic PDF text extraction: parse stream text or printable ASCII/UTF-8 blocks
        const arrayBuffer = await blob.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const rawString = buffer.toString("latin1");
        
        // Extract text objects inside BT ... ET blocks or string literals ( ... )
        const textMatches: string[] = [];
        const btRegex = /BT[\s\S]*?ET/g;
        let match;
        while ((match = btRegex.exec(rawString)) !== null) {
          const block = match[0];
          const stringRegex = /\(([^)]+)\)/g;
          let strMatch;
          while ((strMatch = stringRegex.exec(block)) !== null) {
            textMatches.push(strMatch[1]);
          }
        }

        if (textMatches.length > 0) {
          textContent = textMatches.join(" ");
        } else {
          // Fallback: extract printable strings
          textContent = rawString
            .replace(/[^\x20-\x7E\n\r\t]/g, " ")
            .replace(/\s{2,}/g, " ")
            .trim();
        }
      } else {
        textContent = await blob.text();
      }

      // Clean extracted text
      textContent = textContent.replace(/\r\n/g, "\n").replace(/\0/g, "").trim();

      if (!textContent) {
        throw new Error("No readable text could be extracted from the document");
      }

      // Chunk text
      const chunks = chunkText(textContent);
      if (chunks.length === 0) {
        throw new Error("Document produced zero content chunks");
      }

      // Embed chunks
      const embeddings = await embedBatch(chunks);

      const chunkRecords = chunks.map((chunk, idx) => ({
        content: chunk,
        embedding: embeddings[idx] || new Array(768).fill(0),
        tokenCount: Math.ceil(chunk.length / 4),
        chunkIndex: idx,
      }));

      // Save chunks & mark ready
      await ctx.runMutation(internal.kbDocuments.saveDocumentChunks, {
        documentId: args.documentId,
        orgId: doc.orgId,
        chunks: chunkRecords,
      });
    } catch (error) {
      console.error("Document processing error:", error);
      await ctx.runMutation(internal.kbDocuments.updateDocumentStatus, {
        documentId: args.documentId,
        status: "error",
        errorMessage: error instanceof Error ? error.message : "Failed to process document",
      });
    }
  },
});

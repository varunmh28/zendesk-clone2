"use client";

import React, { useState, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  UploadCloud,
  FileText,
  FileCode,
  File,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Clock,
  Sparkles,
  Database,
  Layers,
  HelpCircle,
} from "lucide-react";

interface DocumentIngestionTabProps {
  orgId: string;
}

function formatBytes(bytes: number, decimals: number = 1): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

function getFileIcon(name: string, mime: string) {
  const lower = name.toLowerCase();
  if (lower.endsWith(".md") || lower.endsWith(".markdown")) {
    return <FileCode className="h-5 w-5 text-indigo-500 shrink-0" />;
  }
  if (lower.endsWith(".pdf") || mime.includes("pdf")) {
    return <FileText className="h-5 w-5 text-rose-500 shrink-0" />;
  }
  if (lower.endsWith(".txt") || mime.includes("text")) {
    return <FileText className="h-5 w-5 text-sky-500 shrink-0" />;
  }
  return <File className="h-5 w-5 text-muted-foreground shrink-0" />;
}

export function DocumentIngestionTab({ orgId }: DocumentIngestionTabProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [documentToDelete, setDocumentToDelete] = useState<Doc<"kbDocuments"> | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const documents = useQuery(api.kbDocuments.list, { orgId });
  const generateUploadUrl = useMutation(api.kbDocuments.generateUploadUrl);
  const createDocument = useMutation(api.kbDocuments.create);
  const removeDocument = useMutation(api.kbDocuments.remove);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    setUploadError(null);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadProgress(`Uploading ${file.name} (${i + 1}/${files.length})...`);

      try {
        // 1. Get signed Convex upload URL
        const uploadUrl = await generateUploadUrl();

        // 2. Post file directly to Convex storage
        const response = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type || "application/octet-stream" },
          body: file,
        });

        if (!response.ok) {
          throw new Error(`Upload failed with status: ${response.status}`);
        }

        const { storageId } = (await response.json()) as {
          storageId: Id<"_storage">;
        };

        // 3. Register document in Convex
        await createDocument({
          orgId,
          name: file.name,
          fileId: storageId,
          mimeType: file.type || "text/plain",
          sizeBytes: file.size,
        });
      } catch (err: any) {
        console.error("Upload error:", err);
        setUploadError(
          `Failed to upload "${file.name}": ${err?.message || "Unknown error"}`
        );
      }
    }

    setIsUploading(false);
    setUploadProgress(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const handleDelete = async () => {
    if (!documentToDelete) return;
    setIsDeleting(true);
    try {
      await removeDocument({ id: documentToDelete._id });
      setDocumentToDelete(null);
    } catch (err) {
      console.error("Failed to delete document:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed transition-all cursor-pointer ${
          isDragging
            ? "border-primary bg-primary/5 scale-[0.99]"
            : "border-border/80 bg-card hover:border-primary/50 hover:bg-muted/30"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".md,.markdown,.txt,.pdf,.json,.csv"
          className="hidden"
          onChange={(e) => handleFileUpload(e.target.files)}
          disabled={isUploading}
        />

        <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
          {isUploading ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <UploadCloud className="h-6 w-6" />
          )}
        </div>

        <h3 className="text-sm font-semibold text-foreground mb-1">
          {isUploading
            ? uploadProgress || "Uploading & indexing document..."
            : "Drop files here or click to browse"}
        </h3>
        <p className="text-xs text-muted-foreground text-center max-w-md mb-2">
          Upload product documentation, FAQs, policies, or manuals (.md, .txt, .pdf).
        </p>
        <span className="text-[11px] text-muted-foreground/80 font-mono">
          Automatic chunking & 768-dim Gemini text-embedding-004 indexing
        </span>
      </div>

      {uploadError && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Info Card */}
      <div className="flex items-start gap-3 p-4 rounded-xl border bg-primary/5 border-primary/20">
        <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <div className="text-xs text-foreground/90 space-y-1">
          <p className="font-semibold text-foreground">
            How RAG Document Ingestion Works
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Uploaded files are stored in Convex storage and automatically partitioned into overlapping 800-character chunks. Each chunk is embedded into a 768-dimensional vector using Google Gemini <code className="font-mono text-primary font-medium">text-embedding-004</code>. When visitors ask questions, semantic vector search instantly retrieves relevant passages with accurate citations.
          </p>
        </div>
      </div>

      {/* Documents Table */}
      <div className="border rounded-xl bg-card overflow-hidden">
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">
              Ingested Source Documents
            </h3>
          </div>
          <span className="text-xs text-muted-foreground">
            {documents ? `${documents.length} document${documents.length === 1 ? "" : "s"}` : "Loading..."}
          </span>
        </div>

        {documents === undefined ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            Loading documents...
          </div>
        ) : documents.length === 0 ? (
          <div className="py-12 text-center text-xs text-muted-foreground">
            No source documents uploaded yet. Upload .md, .txt, or .pdf files to expand your AI support intelligence.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 border-b text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-medium">File Name</th>
                  <th className="px-4 py-3 font-medium">Size</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Chunks</th>
                  <th className="px-4 py-3 font-medium">Uploaded</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {documents.map((doc) => (
                  <tr key={doc._id} className="hover:bg-muted/20 transition-colors">
                    {/* Name */}
                    <td className="px-5 py-3 font-medium text-foreground">
                      <div className="flex items-center gap-2.5 max-w-xs md:max-w-md truncate">
                        {getFileIcon(doc.name, doc.mimeType)}
                        <span className="truncate" title={doc.name}>
                          {doc.name}
                        </span>
                      </div>
                    </td>

                    {/* Size */}
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {formatBytes(doc.sizeBytes)}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      {doc.status === "ready" && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="h-3 w-3" /> Ready
                        </span>
                      )}
                      {doc.status === "processing" && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">
                          <Loader2 className="h-3 w-3 animate-spin" /> Chunking & Embedding
                        </span>
                      )}
                      {doc.status === "pending" && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                          <Clock className="h-3 w-3" /> Queued
                        </span>
                      )}
                      {doc.status === "error" && (
                        <span
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-destructive bg-destructive/10 px-2 py-0.5 rounded-full"
                          title={doc.errorMessage || "Processing failed"}
                        >
                          <AlertCircle className="h-3 w-3" /> Error
                        </span>
                      )}
                    </td>

                    {/* Chunks */}
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {doc.chunkCount !== undefined ? (
                        <Badge variant="outline" className="text-[11px] font-mono">
                          {doc.chunkCount} chunk{doc.chunkCount === 1 ? "" : "s"}
                        </Badge>
                      ) : (
                        "-"
                      )}
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {new Date(doc._creationTime).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => setDocumentToDelete(doc)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        title="Delete document and chunks"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {documentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-card border rounded-xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-semibold text-foreground">
              Delete Document
            </h3>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete &ldquo;{documentToDelete.name}&rdquo;? This will remove the file from storage and delete all {documentToDelete.chunkCount ?? 0} indexed vector chunks.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setDocumentToDelete(null)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete Document"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

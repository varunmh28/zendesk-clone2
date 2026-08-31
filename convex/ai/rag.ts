import { action, internalAction, internalQuery } from "../_generated/server";
import { internal } from "../_generated/api";
import { v } from "convex/values";
import { embedText } from "./embed";
import { Id } from "../_generated/dataModel";

export type SearchResult = {
  chunkId: Id<"kbChunks">;
  articleId?: Id<"articles">;
  documentId?: Id<"kbDocuments">;
  title: string;
  excerpt: string;
  content: string;
  score: number;
};

/**
 * Hydrate vector search chunk hits with parent article/document titles
 */
export const hydrateChunks = internalQuery({
  args: {
    hits: v.array(
      v.object({
        _id: v.id("kbChunks"),
        _score: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const results: SearchResult[] = [];

    for (const hit of args.hits) {
      const chunk = await ctx.db.get(hit._id);
      if (!chunk) continue;

      let title = "Knowledge Base Source";

      if (chunk.articleId) {
        const article = await ctx.db.get(chunk.articleId);
        if (article) {
          title = article.title;
        }
      } else if (chunk.documentId) {
        const doc = await ctx.db.get(chunk.documentId);
        if (doc) {
          title = doc.name;
        }
      }

      const excerpt =
        chunk.content.length > 200
          ? `${chunk.content.slice(0, 197)}...`
          : chunk.content;

      results.push({
        chunkId: chunk._id,
        articleId: chunk.articleId,
        documentId: chunk.documentId,
        title,
        excerpt,
        content: chunk.content,
        score: hit._score,
      });
    }

    return results;
  },
});

/**
 * Perform RAG vector search against kbChunks for an organization
 */
export const searchKnowledgeBase = action({
  args: {
    orgId: v.string(),
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<SearchResult[]> => {
    const cleanQuery = args.query.trim();
    if (!cleanQuery) return [];

    // 1. Generate query embedding (768-dim)
    const queryEmbedding = await embedText(cleanQuery);

    // 2. Perform vector search in Convex
    const vectorHits = await ctx.vectorSearch("kbChunks", "by_embedding", {
      vector: queryEmbedding,
      limit: args.limit ?? 4,
      filter: (q) => q.eq("orgId", args.orgId),
    });

    if (vectorHits.length === 0) {
      return [];
    }

    // 3. Hydrate matching chunks with document/article metadata
    const hydrated: SearchResult[] = await ctx.runQuery(
      internal.ai.rag.hydrateChunks,
      { hits: vectorHits }
    );

    return hydrated;
  },
});

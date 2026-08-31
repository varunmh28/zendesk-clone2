import {
  mutation,
  query,
  internalMutation,
  internalAction,
} from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { chunkText } from "./ai/chunking";
import { embedBatch } from "./ai/embed";
import { Id } from "./_generated/dataModel";

/**
 * List articles for an organization with optional category and search filter
 */
export const list = query({
  args: {
    orgId: v.string(),
    category: v.optional(v.string()),
    search: v.optional(v.string()),
    publishedOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let articles = await ctx.db
      .query("articles")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .order("desc")
      .take(200);

    if (args.publishedOnly) {
      articles = articles.filter((a) => a.isPublished);
    }

    if (args.category && args.category !== "all") {
      articles = articles.filter(
        (a) => a.category.toLowerCase() === args.category!.toLowerCase()
      );
    }

    if (args.search && args.search.trim()) {
      const q = args.search.toLowerCase().trim();
      articles = articles.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.slug.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q) ||
          a.content.toLowerCase().includes(q)
      );
    }

    return articles;
  },
});

/**
 * Get single article by ID or slug
 */
export const get = query({
  args: {
    id: v.optional(v.id("articles")),
    slug: v.optional(v.string()),
    orgId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.id) {
      return await ctx.db.get(args.id);
    }
    if (args.slug && args.orgId) {
      const articles = await ctx.db
        .query("articles")
        .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId!))
        .filter((q) => q.eq(q.field("slug"), args.slug!))
        .first();
      return articles;
    }
    return null;
  },
});

/**
 * List unique categories for an org
 */
export const listCategories = query({
  args: { orgId: v.string() },
  handler: async (ctx, args) => {
    const articles = await ctx.db
      .query("articles")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .take(500);

    const categories = Array.from(
      new Set(articles.map((a) => a.category).filter(Boolean))
    ).sort();

    return categories;
  },
});

/**
 * Create article and optionally sync embeddings to kbChunks
 */
export const create = mutation({
  args: {
    orgId: v.string(),
    title: v.string(),
    slug: v.string(),
    content: v.string(),
    category: v.string(),
    coverImageId: v.optional(v.id("_storage")),
    isPublished: v.boolean(),
    isPopular: v.boolean(),
    authorId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    let authorId = args.authorId;

    if (!authorId) {
      const identity = await ctx.auth.getUserIdentity();
      if (identity) {
        const user = await ctx.db
          .query("users")
          .withIndex("by_tokenIdentifier", (q) =>
            q.eq("tokenIdentifier", identity.tokenIdentifier)
          )
          .unique();
        if (user) {
          authorId = user._id;
        }
      }
    }

    if (!authorId) {
      // Fallback: lookup any user in the org or create a system user
      const existingUser = await ctx.db
        .query("users")
        .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
        .first();
      if (existingUser) {
        authorId = existingUser._id;
      } else {
        authorId = await ctx.db.insert("users", {
          orgId: args.orgId,
          clerkUserId: "system",
          tokenIdentifier: `${args.orgId}|system`,
          name: "Workspace Admin",
          email: "admin@workspace.local",
          role: "admin",
          isActive: true,
        });
      }
    }

    const articleId = await ctx.db.insert("articles", {
      orgId: args.orgId,
      title: args.title,
      slug: args.slug,
      content: args.content,
      category: args.category,
      coverImageId: args.coverImageId,
      isPublished: args.isPublished,
      isPopular: args.isPopular,
      authorId: authorId as Id<"users">,
      viewCount: 0,
    });

    if (args.isPublished && args.content.trim()) {
      await ctx.scheduler.runAfter(0, internal.articles.syncArticleChunksAction, {
        articleId,
        orgId: args.orgId,
        content: args.content,
      });
    }

    return articleId;
  },
});

/**
 * Update article and synchronize embeddings
 */
export const update = mutation({
  args: {
    id: v.id("articles"),
    title: v.optional(v.string()),
    slug: v.optional(v.string()),
    content: v.optional(v.string()),
    category: v.optional(v.string()),
    coverImageId: v.optional(v.id("_storage")),
    isPublished: v.optional(v.boolean()),
    isPopular: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const article = await ctx.db.get(args.id);
    if (!article) throw new Error("Article not found");

    const updates: Partial<{
      title: string;
      slug: string;
      content: string;
      category: string;
      coverImageId: Id<"_storage">;
      isPublished: boolean;
      isPopular: boolean;
    }> = {};

    if (args.title !== undefined) updates.title = args.title;
    if (args.slug !== undefined) updates.slug = args.slug;
    if (args.content !== undefined) updates.content = args.content;
    if (args.category !== undefined) updates.category = args.category;
    if (args.coverImageId !== undefined) updates.coverImageId = args.coverImageId;
    if (args.isPublished !== undefined) updates.isPublished = args.isPublished;
    if (args.isPopular !== undefined) updates.isPopular = args.isPopular;

    await ctx.db.patch(args.id, updates);

    const isPublished = args.isPublished !== undefined ? args.isPublished : article.isPublished;
    const content = args.content !== undefined ? args.content : article.content;

    if (isPublished) {
      await ctx.scheduler.runAfter(0, internal.articles.syncArticleChunksAction, {
        articleId: args.id,
        orgId: article.orgId,
        content,
      });
    } else {
      await ctx.scheduler.runAfter(0, internal.articles.deleteArticleChunks, {
        articleId: args.id,
      });
    }

    return args.id;
  },
});

/**
 * Delete article and clean up kbChunks
 */
export const remove = mutation({
  args: { id: v.id("articles") },
  handler: async (ctx, args) => {
    const article = await ctx.db.get(args.id);
    if (!article) return;

    // Delete chunks
    const chunks = await ctx.db
      .query("kbChunks")
      .withIndex("by_article", (q) => q.eq("articleId", args.id))
      .collect();

    for (const chunk of chunks) {
      await ctx.db.delete(chunk._id);
    }

    await ctx.db.delete(args.id);
  },
});

/**
 * Increment view count
 */
export const incrementView = mutation({
  args: { id: v.id("articles") },
  handler: async (ctx, args) => {
    const article = await ctx.db.get(args.id);
    if (!article) return;
    await ctx.db.patch(args.id, {
      viewCount: (article.viewCount ?? 0) + 1,
    });
  },
});

/**
 * Internal action to chunk content and generate embeddings
 */
export const syncArticleChunksAction = internalAction({
  args: {
    articleId: v.id("articles"),
    orgId: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const chunks = chunkText(args.content);
    if (chunks.length === 0) {
      await ctx.runMutation(internal.articles.deleteArticleChunks, {
        articleId: args.articleId,
      });
      return;
    }

    const embeddings = await embedBatch(chunks);

    const chunkRecords = chunks.map((text, idx) => ({
      content: text,
      embedding: embeddings[idx] || new Array(768).fill(0),
      tokenCount: Math.ceil(text.length / 4),
      chunkIndex: idx,
    }));

    await ctx.runMutation(internal.articles.saveArticleChunks, {
      articleId: args.articleId,
      orgId: args.orgId,
      chunks: chunkRecords,
    });
  },
});

/**
 * Internal mutation to save article chunks
 */
export const saveArticleChunks = internalMutation({
  args: {
    articleId: v.id("articles"),
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
      .withIndex("by_article", (q) => q.eq("articleId", args.articleId))
      .collect();

    for (const item of existing) {
      await ctx.db.delete(item._id);
    }

    // Insert new chunks
    for (const chunk of args.chunks) {
      await ctx.db.insert("kbChunks", {
        orgId: args.orgId,
        articleId: args.articleId,
        content: chunk.content,
        embedding: chunk.embedding,
        tokenCount: chunk.tokenCount,
        chunkIndex: chunk.chunkIndex,
      });
    }
  },
});

/**
 * Internal mutation to delete article chunks
 */
export const deleteArticleChunks = internalMutation({
  args: { articleId: v.id("articles") },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("kbChunks")
      .withIndex("by_article", (q) => q.eq("articleId", args.articleId))
      .collect();

    for (const item of existing) {
      await ctx.db.delete(item._id);
    }
  },
});

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .order("asc")
      .take(500);

    return await Promise.all(
      messages.map(async (msg) => {
        const author = msg.authorId ? await ctx.db.get(msg.authorId) : null;
        return {
          ...msg,
          author: author
            ? {
                _id: author._id,
                name: author.name,
                email: author.email,
                avatarUrl: author.avatarUrl,
                role: author.role,
              }
            : null,
        };
      })
    );
  },
});

export const send = mutation({
  args: {
    orgId: v.string(),
    conversationId: v.id("conversations"),
    role: v.union(v.literal("agent"), v.literal("visitor"), v.literal("ai")),
    content: v.string(),
    authorId: v.optional(v.id("users")),
    isInternalNote: v.optional(v.boolean()),
    citations: v.optional(
      v.array(
        v.object({
          articleId: v.optional(v.id("articles")),
          chunkId: v.optional(v.id("kbChunks")),
          title: v.string(),
          excerpt: v.string(),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    let resolvedAuthorId = args.authorId;

    if (args.role === "agent" && !resolvedAuthorId) {
      const identity = await ctx.auth.getUserIdentity();
      if (identity) {
        const user = await ctx.db
          .query("users")
          .withIndex("by_tokenIdentifier", (q) =>
            q.eq("tokenIdentifier", identity.tokenIdentifier)
          )
          .unique();
        if (user) {
          resolvedAuthorId = user._id;
        }
      }
    }

    const messageId = await ctx.db.insert("messages", {
      orgId: args.orgId,
      conversationId: args.conversationId,
      role: args.role,
      content: args.content,
      authorId: resolvedAuthorId,
      isInternalNote: args.isInternalNote ?? false,
      citations: args.citations,
    });

    const conv = await ctx.db.get(args.conversationId);
    if (conv) {
      if (args.role === "agent") {
        await ctx.db.patch(args.conversationId, {
          isRead: true,
        });
      } else if (args.role === "visitor") {
        await ctx.db.patch(args.conversationId, {
          isRead: false,
        });
      }
    }

    return messageId;
  },
});

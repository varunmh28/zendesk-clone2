import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const heartbeat = mutation({
  args: {
    orgId: v.string(),
    conversationId: v.id("conversations"),
    userId: v.optional(v.id("users")),
    visitorName: v.optional(v.string()),
    role: v.optional(v.union(v.literal("agent"), v.literal("visitor"))),
    sessionId: v.string(),
    isTyping: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("presenceSessions")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .first();

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        orgId: args.orgId,
        conversationId: args.conversationId,
        userId: args.userId,
        visitorName: args.visitorName ?? existing.visitorName,
        role: args.role ?? existing.role,
        isTyping: args.isTyping !== undefined ? args.isTyping : existing.isTyping,
        lastHeartbeat: now,
      });
      return existing._id;
    }

    return await ctx.db.insert("presenceSessions", {
      orgId: args.orgId,
      conversationId: args.conversationId,
      userId: args.userId,
      visitorName: args.visitorName,
      role: args.role ?? "agent",
      sessionId: args.sessionId,
      isTyping: args.isTyping ?? false,
      lastHeartbeat: now,
    });
  },
});

export const listPresence = query({
  args: {
    conversationId: v.id("conversations"),
    now: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const cutoff = (args.now ?? Date.now()) - 15000;

    const sessions = await ctx.db
      .query("presenceSessions")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .take(50);

    const activeSessions = sessions.filter((s) => s.lastHeartbeat > cutoff);

    return await Promise.all(
      activeSessions.map(async (s) => {
        const user = s.userId ? await ctx.db.get(s.userId) : null;
        return {
          sessionId: s.sessionId,
          userId: s.userId,
          role: s.role ?? (s.userId ? "agent" : "visitor"),
          visitorName: s.visitorName,
          conversationId: s.conversationId,
          isTyping: s.isTyping,
          lastHeartbeat: s.lastHeartbeat,
          user: user
            ? {
                _id: user._id,
                name: user.name,
                email: user.email,
                avatarUrl: user.avatarUrl,
                role: user.role,
              }
            : null,
        };
      })
    );
  },
});

export const setTyping = mutation({
  args: {
    sessionId: v.string(),
    isTyping: v.boolean(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("presenceSessions")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .first();

    if (session) {
      await ctx.db.patch(session._id, {
        isTyping: args.isTyping,
        lastHeartbeat: Date.now(),
      });
    }
  },
});

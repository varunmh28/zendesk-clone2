import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    orgId: v.string(),
    status: v.optional(v.union(v.literal("open"), v.literal("closed"))),
    assignment: v.optional(
      v.union(v.literal("all"), v.literal("unassigned"), v.literal("mine"))
    ),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    let convQuery = args.status
      ? ctx.db
          .query("conversations")
          .withIndex("by_orgId_and_status", (q) =>
            q.eq("orgId", args.orgId).eq("status", args.status!)
          )
      : ctx.db
          .query("conversations")
          .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId));

    const conversations = await convQuery.order("desc").take(100);

    const assignmentFilter = args.assignment ?? "all";
    const searchQuery = args.search?.trim().toLowerCase() ?? "";

    const filtered = conversations.filter((conv) => {
      // Assignment filter
      if (assignmentFilter === "unassigned" && conv.assigneeId) {
        return false;
      }
      if (assignmentFilter === "mine") {
        if (!currentUser || conv.assigneeId !== currentUser._id) {
          return false;
        }
      }

      // Search filter
      if (searchQuery) {
        const name = (conv.visitorName ?? "").toLowerCase();
        const email = (conv.visitorEmail ?? "").toLowerCase();
        const subject = (conv.subject ?? "").toLowerCase();
        const matches =
          name.includes(searchQuery) ||
          email.includes(searchQuery) ||
          subject.includes(searchQuery);
        if (!matches) return false;
      }

      return true;
    });

    // Hydrate latest message and assignee for each conversation
    return await Promise.all(
      filtered.map(async (conv) => {
        const latestMsg = await ctx.db
          .query("messages")
          .withIndex("by_conversation", (q) => q.eq("conversationId", conv._id))
          .order("desc")
          .first();

        const assignee = conv.assigneeId
          ? await ctx.db.get(conv.assigneeId)
          : null;

        return {
          ...conv,
          latestMessage: latestMsg
            ? {
                content: latestMsg.content,
                _creationTime: latestMsg._creationTime,
                role: latestMsg.role,
                isInternalNote: latestMsg.isInternalNote,
              }
            : null,
          assignee: assignee
            ? {
                _id: assignee._id,
                name: assignee.name,
                email: assignee.email,
                avatarUrl: assignee.avatarUrl,
                role: assignee.role,
              }
            : null,
        };
      })
    );
  },
});

export const get = query({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) return null;

    const assignee = conversation.assigneeId
      ? await ctx.db.get(conversation.assigneeId)
      : null;

    return {
      ...conversation,
      assignee: assignee
        ? {
            _id: assignee._id,
            name: assignee.name,
            email: assignee.email,
            avatarUrl: assignee.avatarUrl,
            role: assignee.role,
          }
        : null,
    };
  },
});

export const getStats = query({
  args: {
    orgId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique();

    const allConversations = await ctx.db
      .query("conversations")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .take(500);

    let open = 0;
    let unassigned = 0;
    let assignedToMe = 0;
    let unread = 0;

    for (const conv of allConversations) {
      if (conv.status === "open") {
        open++;
        if (!conv.assigneeId) {
          unassigned++;
        }
        if (currentUser && conv.assigneeId === currentUser._id) {
          assignedToMe++;
        }
        if (!conv.isRead) {
          unread++;
        }
      }
    }

    return {
      open,
      unassigned,
      assignedToMe,
      unread,
    };
  },
});

export const create = mutation({
  args: {
    orgId: v.string(),
    visitorId: v.string(),
    visitorName: v.optional(v.string()),
    visitorEmail: v.optional(v.string()),
    visitorPhone: v.optional(v.string()),
    subject: v.optional(v.string()),
    source: v.optional(v.union(v.literal("widget"), v.literal("api"))),
    handedToHuman: v.optional(v.boolean()),
    status: v.optional(v.union(v.literal("open"), v.literal("closed"))),
    assigneeId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("conversations", {
      orgId: args.orgId,
      visitorId: args.visitorId,
      visitorName: args.visitorName,
      visitorEmail: args.visitorEmail,
      visitorPhone: args.visitorPhone,
      subject: args.subject,
      source: args.source ?? "widget",
      status: args.status ?? "open",
      handedToHuman: args.handedToHuman ?? false,
      isRead: true,
      assigneeId: args.assigneeId,
    });
  },
});

export const assign = mutation({
  args: {
    conversationId: v.id("conversations"),
    assigneeId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const conv = await ctx.db.get(args.conversationId);
    if (!conv) throw new Error("Conversation not found");

    await ctx.db.patch(args.conversationId, {
      assigneeId: args.assigneeId,
    });
  },
});

export const setStatus = mutation({
  args: {
    conversationId: v.id("conversations"),
    status: v.union(v.literal("open"), v.literal("closed")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const conv = await ctx.db.get(args.conversationId);
    if (!conv) throw new Error("Conversation not found");

    await ctx.db.patch(args.conversationId, {
      status: args.status,
    });
  },
});

export const setHandedToHuman = mutation({
  args: {
    conversationId: v.id("conversations"),
    handedToHuman: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const conv = await ctx.db.get(args.conversationId);
    if (!conv) throw new Error("Conversation not found");

    await ctx.db.patch(args.conversationId, {
      handedToHuman: args.handedToHuman,
    });
  },
});

export const markAsRead = mutation({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const conv = await ctx.db.get(args.conversationId);
    if (!conv) throw new Error("Conversation not found");

    await ctx.db.patch(args.conversationId, {
      isRead: true,
    });
  },
});

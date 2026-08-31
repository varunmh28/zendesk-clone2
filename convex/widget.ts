import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getWidgetConfig = query({
  args: {
    publicKey: v.string(),
  },
  handler: async (ctx, args) => {
    const workspace = await ctx.db
      .query("workspaces")
      .withIndex("by_publicKey", (q) => q.eq("publicKey", args.publicKey))
      .unique();

    if (!workspace) return null;

    const widgetSettings = await ctx.db
      .query("widgetSettings")
      .withIndex("by_orgId", (q) => q.eq("orgId", workspace.orgId))
      .unique();

    return {
      workspace: {
        name: workspace.name,
        slug: workspace.slug,
        plan: workspace.plan,
        orgId: workspace.orgId,
      },
      widgetSettings,
    };
  },
});

export const initVisitorSession = mutation({
  args: {
    publicKey: v.string(),
    visitorId: v.string(),
    visitorName: v.optional(v.string()),
    visitorEmail: v.optional(v.string()),
    visitorPhone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const workspace = await ctx.db
      .query("workspaces")
      .withIndex("by_publicKey", (q) => q.eq("publicKey", args.publicKey))
      .unique();

    if (!workspace) throw new Error("Invalid public key");

    // Look for an existing open conversation for this visitor
    const existing = await ctx.db
      .query("conversations")
      .withIndex("by_visitorId", (q) =>
        q.eq("orgId", workspace.orgId).eq("visitorId", args.visitorId)
      )
      .order("desc")
      .first();

    if (existing && existing.status === "open") {
      const updates: {
        visitorName?: string;
        visitorEmail?: string;
        visitorPhone?: string;
      } = {};
      if (args.visitorName && !existing.visitorName) updates.visitorName = args.visitorName;
      if (args.visitorEmail && !existing.visitorEmail) updates.visitorEmail = args.visitorEmail;
      if (args.visitorPhone && !existing.visitorPhone) updates.visitorPhone = args.visitorPhone;

      if (Object.keys(updates).length > 0) {
        await ctx.db.patch(existing._id, updates);
      }
      return existing._id;
    }

    return await ctx.db.insert("conversations", {
      orgId: workspace.orgId,
      visitorId: args.visitorId,
      visitorName: args.visitorName,
      visitorEmail: args.visitorEmail,
      visitorPhone: args.visitorPhone,
      status: "open",
      handedToHuman: false,
      isRead: false,
      source: "widget",
    });
  },
});

export const sendVisitorMessage = mutation({
  args: {
    publicKey: v.string(),
    visitorId: v.string(),
    conversationId: v.id("conversations"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const workspace = await ctx.db
      .query("workspaces")
      .withIndex("by_publicKey", (q) => q.eq("publicKey", args.publicKey))
      .unique();

    if (!workspace) throw new Error("Invalid public key");

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) throw new Error("Conversation not found");

    if (
      conversation.orgId !== workspace.orgId ||
      conversation.visitorId !== args.visitorId
    ) {
      throw new Error("Unauthorized conversation access");
    }

    const messageId = await ctx.db.insert("messages", {
      orgId: workspace.orgId,
      conversationId: args.conversationId,
      role: "visitor",
      content: args.content,
      isInternalNote: false,
    });

    await ctx.db.patch(args.conversationId, {
      isRead: false,
      status: "open",
    });

    return messageId;
  },
});

export const getVisitorMessages = query({
  args: {
    publicKey: v.string(),
    visitorId: v.string(),
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const workspace = await ctx.db
      .query("workspaces")
      .withIndex("by_publicKey", (q) => q.eq("publicKey", args.publicKey))
      .unique();

    if (!workspace) return [];

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) return [];

    if (
      conversation.orgId !== workspace.orgId ||
      conversation.visitorId !== args.visitorId
    ) {
      return [];
    }

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .order("asc")
      .take(500);

    // Strip internal notes and sensitive author details for visitor
    return messages
      .filter((m) => !m.isInternalNote)
      .map((m) => ({
        _id: m._id,
        _creationTime: m._creationTime,
        role: m.role,
        content: m.content,
        citations: m.citations,
      }));
  },
});

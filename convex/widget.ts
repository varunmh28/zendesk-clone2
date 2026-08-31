import { mutation, query } from "./_generated/server";
import { api } from "./_generated/api";
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

    let logoUrl: string | null = null;
    if (widgetSettings?.logoId) {
      logoUrl = await ctx.storage.getUrl(widgetSettings.logoId);
    }

    const resolvedSettings = {
      primaryColor: widgetSettings?.primaryColor ?? "#2563eb",
      borderRadius: widgetSettings?.borderRadius ?? "16px",
      position: widgetSettings?.position ?? "bottom-right",
      title: widgetSettings?.title ?? workspace.name ?? "Customer Support",
      subtitle: widgetSettings?.subtitle ?? "We typically reply in a few minutes",
      leadCaptureMode: widgetSettings?.leadCaptureMode ?? "optional",
      proactiveEnabled: widgetSettings?.proactiveEnabled ?? true,
      proactiveDelaySeconds: widgetSettings?.proactiveDelaySeconds ?? 5,
      proactiveMessage:
        widgetSettings?.proactiveMessage ?? "Hi there! 👋 How can we help you today?",
      soundEnabled: widgetSettings?.soundEnabled ?? true,
      faqItems: widgetSettings?.faqItems ?? [],
      logoUrl,
    };

    return {
      workspace: {
        name: workspace.name,
        slug: workspace.slug,
        plan: workspace.plan,
        orgId: workspace.orgId,
      },
      widgetSettings: resolvedSettings,
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

    // If human agent has not taken over, trigger AI reply
    if (!conversation.handedToHuman) {
      await ctx.scheduler.runAfter(0, api.ai.agent.generateAiReply, {
        conversationId: args.conversationId,
        userMessage: args.content,
      });
    }

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

export const visitorHeartbeat = mutation({
  args: {
    publicKey: v.string(),
    conversationId: v.id("conversations"),
    sessionId: v.string(),
    visitorName: v.optional(v.string()),
    isTyping: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const workspace = await ctx.db
      .query("workspaces")
      .withIndex("by_publicKey", (q) => q.eq("publicKey", args.publicKey))
      .unique();

    if (!workspace) return null;

    const now = Date.now();
    const existing = await ctx.db
      .query("presenceSessions")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        conversationId: args.conversationId,
        visitorName: args.visitorName ?? existing.visitorName,
        role: "visitor",
        isTyping: args.isTyping !== undefined ? args.isTyping : existing.isTyping,
        lastHeartbeat: now,
      });
      return existing._id;
    }

    return await ctx.db.insert("presenceSessions", {
      orgId: workspace.orgId,
      conversationId: args.conversationId,
      sessionId: args.sessionId,
      visitorName: args.visitorName,
      role: "visitor",
      isTyping: args.isTyping ?? false,
      lastHeartbeat: now,
    });
  },
});

export const getWidgetPresence = query({
  args: {
    publicKey: v.string(),
    conversationId: v.id("conversations"),
    now: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const workspace = await ctx.db
      .query("workspaces")
      .withIndex("by_publicKey", (q) => q.eq("publicKey", args.publicKey))
      .unique();

    if (!workspace) return { agentTyping: false, activeAgent: null, isOnline: true };

    const cutoff = (args.now ?? Date.now()) - 15000;
    const sessions = await ctx.db
      .query("presenceSessions")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
      .take(20);

    const activeAgentSessions = sessions.filter(
      (s) => s.lastHeartbeat > cutoff && s.role === "agent" && s.userId
    );

    const isTyping = activeAgentSessions.some((s) => s.isTyping);
    const firstAgent =
      activeAgentSessions.length > 0 && activeAgentSessions[0].userId
        ? await ctx.db.get(activeAgentSessions[0].userId)
        : null;

    return {
      agentTyping: isTyping,
      activeAgent: firstAgent
        ? {
            name: firstAgent.name,
            avatarUrl: firstAgent.avatarUrl,
          }
        : null,
      isOnline: true,
    };
  },
});

export const getHelpArticles = query({
  args: {
    publicKey: v.string(),
    search: v.optional(v.string()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const workspace = await ctx.db
      .query("workspaces")
      .withIndex("by_publicKey", (q) => q.eq("publicKey", args.publicKey))
      .unique();

    if (!workspace) return [];

    let articles = await ctx.db
      .query("articles")
      .withIndex("by_orgId_and_published", (q) =>
        q.eq("orgId", workspace.orgId).eq("isPublished", true)
      )
      .take(100);

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
          a.category.toLowerCase().includes(q) ||
          a.content.toLowerCase().includes(q)
      );
    }

    return articles.map((a) => ({
      _id: a._id,
      title: a.title,
      slug: a.slug,
      category: a.category,
      isPopular: a.isPopular,
      excerpt: a.content.slice(0, 160) + (a.content.length > 160 ? "..." : ""),
    }));
  },
});

export const getHelpArticle = query({
  args: {
    publicKey: v.string(),
    articleId: v.id("articles"),
  },
  handler: async (ctx, args) => {
    const workspace = await ctx.db
      .query("workspaces")
      .withIndex("by_publicKey", (q) => q.eq("publicKey", args.publicKey))
      .unique();

    if (!workspace) return null;

    const article = await ctx.db.get(args.articleId);
    if (!article || article.orgId !== workspace.orgId || !article.isPublished) {
      return null;
    }

    return {
      _id: article._id,
      title: article.title,
      category: article.category,
      content: article.content,
      _creationTime: article._creationTime,
    };
  },
});

export const submitLead = mutation({
  args: {
    publicKey: v.string(),
    visitorId: v.string(),
    conversationId: v.optional(v.id("conversations")),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const workspace = await ctx.db
      .query("workspaces")
      .withIndex("by_publicKey", (q) => q.eq("publicKey", args.publicKey))
      .unique();

    if (!workspace) throw new Error("Invalid public key");

    if (args.conversationId) {
      const conv = await ctx.db.get(args.conversationId);
      if (conv && conv.orgId === workspace.orgId) {
        const updates: {
          visitorName?: string;
          visitorEmail?: string;
          visitorPhone?: string;
        } = {};
        if (args.name) updates.visitorName = args.name;
        if (args.email) updates.visitorEmail = args.email;
        if (args.phone) updates.visitorPhone = args.phone;
        if (Object.keys(updates).length > 0) {
          await ctx.db.patch(args.conversationId, updates);
        }
      }
    }

    const existingLead = await ctx.db
      .query("leads")
      .withIndex("by_visitorId", (q) =>
        q.eq("orgId", workspace.orgId).eq("visitorId", args.visitorId)
      )
      .first();

    if (existingLead) {
      await ctx.db.patch(existingLead._id, {
        name: args.name ?? existingLead.name,
        email: args.email ?? existingLead.email,
        phone: args.phone ?? existingLead.phone,
        conversationId: args.conversationId ?? existingLead.conversationId,
        notes: args.notes ?? existingLead.notes,
      });
      return existingLead._id;
    }

    return await ctx.db.insert("leads", {
      orgId: workspace.orgId,
      visitorId: args.visitorId,
      conversationId: args.conversationId,
      name: args.name,
      email: args.email,
      phone: args.phone,
      status: "new",
      source: "widget",
      notes: args.notes,
    });
  },
});


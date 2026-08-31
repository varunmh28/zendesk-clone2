import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const PLAN_CONFIGS = {
  free: {
    name: "Free",
    price: "$0",
    interval: "forever",
    description: "For small teams and side projects testing out customer support.",
    aiMessageLimit: 100,
    kbDocumentLimit: 10,
    seatLimit: 1,
    features: [
      "1 agent seat",
      "100 AI messages / month",
      "10 KB documents",
      "Basic embeddable widget",
      "Community support",
    ],
  },
  pro: {
    name: "Pro",
    price: "$49",
    interval: "/month",
    description: "For growing businesses needing automated AI resolution and custom branding.",
    aiMessageLimit: 5000,
    kbDocumentLimit: 100,
    seatLimit: 5,
    features: [
      "5 agent seats",
      "5,000 AI messages / month",
      "100 KB documents",
      "Full widget customization",
      "Analytics & reporting",
      "Standard email support",
    ],
  },
  enterprise: {
    name: "Enterprise",
    price: "$199",
    interval: "/month",
    description: "For scaling enterprises with high volume support and bespoke requirements.",
    aiMessageLimit: 999999,
    kbDocumentLimit: 999999,
    seatLimit: 999999,
    features: [
      "Unlimited agent seats",
      "Unlimited AI messages",
      "Unlimited KB documents",
      "White-label branding",
      "Dedicated account manager",
      "24/7 Priority support & SLA",
    ],
  },
} as const;

/**
 * Query workspace plan details, current limits, seat count, AI message usage,
 * and KB document count for orgId.
 */
export const getBillingDetails = query({
  args: {
    orgId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const workspace = await ctx.db
      .query("workspaces")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .unique();

    if (!workspace) {
      return null;
    }

    // Active seats in workspace
    const users = await ctx.db
      .query("users")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .collect();
    const activeSeats = users.filter((u) => u.isActive !== false).length;

    // Knowledge base documents count
    const kbDocuments = await ctx.db
      .query("kbDocuments")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .collect();
    const kbDocsCount = kbDocuments.length;

    // Current month usage metrics
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const usage = await ctx.db
      .query("usageMetrics")
      .withIndex("by_orgId_and_period", (q) =>
        q.eq("orgId", args.orgId).eq("periodStart", periodStart)
      )
      .unique();

    const aiMessagesUsed = usage?.aiMessagesUsed ?? 0;

    return {
      workspace: {
        _id: workspace._id,
        orgId: workspace.orgId,
        name: workspace.name,
        slug: workspace.slug,
        plan: workspace.plan,
        publicKey: workspace.publicKey,
      },
      plan: workspace.plan,
      limits: {
        aiMessageLimit: workspace.aiMessageLimit,
        kbDocumentLimit: workspace.kbDocumentLimit,
        seatLimit: workspace.seatLimit,
      },
      usage: {
        aiMessagesUsed,
        kbDocumentsTotal: kbDocsCount,
        seatsUsed: activeSeats,
        periodStart,
      },
      seatsCount: activeSeats,
      kbDocsCount,
      aiMessagesUsed,
      aiMessageLimit: workspace.aiMessageLimit,
      kbDocumentLimit: workspace.kbDocumentLimit,
      seatLimit: workspace.seatLimit,
    };
  },
});

/**
 * Public mutation to update workspace plan tier and adjust limits.
 */
export const updateWorkspacePlan = mutation({
  args: {
    orgId: v.string(),
    plan: v.union(v.literal("free"), v.literal("pro"), v.literal("enterprise")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const workspace = await ctx.db
      .query("workspaces")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .unique();

    if (!workspace) {
      throw new Error(`Workspace not found for orgId: ${args.orgId}`);
    }

    const config = PLAN_CONFIGS[args.plan];

    await ctx.db.patch("workspaces", workspace._id, {
      plan: args.plan,
      aiMessageLimit: config.aiMessageLimit,
      kbDocumentLimit: config.kbDocumentLimit,
      seatLimit: config.seatLimit,
    });

    return {
      success: true,
      plan: args.plan,
      limits: {
        aiMessageLimit: config.aiMessageLimit,
        kbDocumentLimit: config.kbDocumentLimit,
        seatLimit: config.seatLimit,
      },
    };
  },
});

/**
 * Internal mutation to update workspace plan tier and adjust limits (for webhooks / backend cron).
 */
export const updateWorkspacePlanInternal = internalMutation({
  args: {
    orgId: v.string(),
    plan: v.union(v.literal("free"), v.literal("pro"), v.literal("enterprise")),
  },
  handler: async (ctx, args) => {
    const workspace = await ctx.db
      .query("workspaces")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .unique();

    if (!workspace) {
      throw new Error(`Workspace not found for orgId: ${args.orgId}`);
    }

    const config = PLAN_CONFIGS[args.plan];

    await ctx.db.patch("workspaces", workspace._id, {
      plan: args.plan,
      aiMessageLimit: config.aiMessageLimit,
      kbDocumentLimit: config.kbDocumentLimit,
      seatLimit: config.seatLimit,
    });

    return {
      success: true,
      plan: args.plan,
      limits: {
        aiMessageLimit: config.aiMessageLimit,
        kbDocumentLimit: config.kbDocumentLimit,
        seatLimit: config.seatLimit,
      },
    };
  },
});

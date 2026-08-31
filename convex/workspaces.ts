import { internalMutation, query } from "./_generated/server";
import { v } from "convex/values";
import { nanoid } from "nanoid";

/** Called from Clerk webhook when organization.created fires. Idempotent. */
export const provisionWorkspace = internalMutation({
  args: {
    orgId: v.string(),
    name: v.string(),
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("workspaces")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .unique();
    if (existing) return existing._id;

    const workspaceId = await ctx.db.insert("workspaces", {
      orgId: args.orgId,
      name: args.name,
      slug: args.slug,
      plan: "free",
      aiMessageLimit: 100,
      kbDocumentLimit: 10,
      seatLimit: 1,
      publicKey: `wk_${nanoid(24)}`,
    });

    // Seed default widget settings
    await ctx.db.insert("widgetSettings", {
      orgId: args.orgId,
      primaryColor: "#6366f1",
      borderRadius: "12px",
      position: "bottom-right",
      title: "Support",
      leadCaptureMode: "optional",
      proactiveEnabled: false,
      proactiveDelaySeconds: 30,
      soundEnabled: true,
      faqItems: [],
    });

    // Seed initial usage metrics for current month
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    await ctx.db.insert("usageMetrics", {
      orgId: args.orgId,
      periodStart,
      aiMessagesUsed: 0,
      kbDocumentsTotal: 0,
      seatsUsed: 1,
    });

    return workspaceId;
  },
});

export const getByOrgId = query({
  args: { orgId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    return ctx.db
      .query("workspaces")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .unique();
  },
});

export const getByPublicKey = query({
  args: { publicKey: v.string() },
  handler: async (ctx, args) => {
    return ctx.db
      .query("workspaces")
      .withIndex("by_publicKey", (q) => q.eq("publicKey", args.publicKey))
      .unique();
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");
    return ctx.db
      .query("workspaces")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
  },
});

export const updatePlan = internalMutation({
  args: {
    orgId: v.string(),
    plan: v.union(v.literal("free"), v.literal("pro"), v.literal("enterprise")),
  },
  handler: async (ctx, args) => {
    const workspace = await ctx.db
      .query("workspaces")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .unique();
    if (!workspace) throw new Error(`Workspace not found for orgId: ${args.orgId}`);

    const limits = {
      free:       { aiMessageLimit: 100,    kbDocumentLimit: 10,     seatLimit: 1      },
      pro:        { aiMessageLimit: 5000,   kbDocumentLimit: 100,    seatLimit: 5      },
      enterprise: { aiMessageLimit: 999999, kbDocumentLimit: 999999, seatLimit: 999999 },
    };

    await ctx.db.patch("workspaces", workspace._id, {
      plan: args.plan,
      ...limits[args.plan],
    });
  },
});

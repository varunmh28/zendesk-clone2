import { internalMutation, mutation, query, QueryCtx, MutationCtx } from "./_generated/server";
import { components } from "./_generated/api";
import { v } from "convex/values";
import { RateLimiter, MINUTE, HOUR } from "@convex-dev/rate-limiter";

export function getCurrentPeriodStart(): number {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).getTime();
}

/**
 * Query current month usage record from usageMetrics table (or fallback if not present).
 */
export const getUsageMetrics = query({
  args: {
    orgId: v.string(),
    periodStart: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const period = args.periodStart ?? getCurrentPeriodStart();

    const record = await ctx.db
      .query("usageMetrics")
      .withIndex("by_orgId_and_period", (q) =>
        q.eq("orgId", args.orgId).eq("periodStart", period)
      )
      .unique();

    if (record) {
      return record;
    }

    // Fallback: calculate current documents and active seats
    const users = await ctx.db
      .query("users")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .collect();
    const seatsUsed = users.filter((u) => u.isActive !== false).length;

    const kbDocuments = await ctx.db
      .query("kbDocuments")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .collect();
    const kbDocumentsTotal = kbDocuments.length;

    return {
      orgId: args.orgId,
      periodStart: period,
      aiMessagesUsed: 0,
      kbDocumentsTotal,
      seatsUsed: Math.max(seatsUsed, 1),
    };
  },
});

/**
 * Internal mutation to increment aiMessagesUsed in usageMetrics.
 */
export const incrementAiUsage = internalMutation({
  args: {
    orgId: v.string(),
    count: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const amount = args.count ?? 1;
    const periodStart = getCurrentPeriodStart();

    const record = await ctx.db
      .query("usageMetrics")
      .withIndex("by_orgId_and_period", (q) =>
        q.eq("orgId", args.orgId).eq("periodStart", periodStart)
      )
      .unique();

    if (record) {
      const updatedCount = record.aiMessagesUsed + amount;
      await ctx.db.patch("usageMetrics", record._id, {
        aiMessagesUsed: updatedCount,
      });
      return updatedCount;
    } else {
      const users = await ctx.db
        .query("users")
        .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
        .collect();
      const seatsUsed = users.filter((u) => u.isActive !== false).length;

      const kbDocuments = await ctx.db
        .query("kbDocuments")
        .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
        .collect();

      await ctx.db.insert("usageMetrics", {
        orgId: args.orgId,
        periodStart,
        aiMessagesUsed: amount,
        kbDocumentsTotal: kbDocuments.length,
        seatsUsed: Math.max(seatsUsed, 1),
      });

      return amount;
    }
  },
});

/**
 * Public mutation to record AI usage (useful for test suites and client simulations).
 */
export const recordAiUsage = mutation({
  args: {
    orgId: v.string(),
    count: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const amount = args.count ?? 1;
    const periodStart = getCurrentPeriodStart();

    const record = await ctx.db
      .query("usageMetrics")
      .withIndex("by_orgId_and_period", (q) =>
        q.eq("orgId", args.orgId).eq("periodStart", periodStart)
      )
      .unique();

    if (record) {
      const updatedCount = record.aiMessagesUsed + amount;
      await ctx.db.patch("usageMetrics", record._id, {
        aiMessagesUsed: updatedCount,
      });
      return updatedCount;
    } else {
      const users = await ctx.db
        .query("users")
        .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
        .collect();
      const seatsUsed = users.filter((u) => u.isActive !== false).length;

      const kbDocuments = await ctx.db
        .query("kbDocuments")
        .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
        .collect();

      await ctx.db.insert("usageMetrics", {
        orgId: args.orgId,
        periodStart,
        aiMessagesUsed: amount,
        kbDocumentsTotal: kbDocuments.length,
        seatsUsed: Math.max(seatsUsed, 1),
      });

      return amount;
    }
  },
});

/**
 * Helper to check AI quota directly inside server functions.
 */
export async function checkAiQuotaHelper(
  ctx: QueryCtx | MutationCtx,
  orgId: string
) {
  const workspace = await ctx.db
    .query("workspaces")
    .withIndex("by_orgId", (q) => q.eq("orgId", orgId))
    .unique();

  if (!workspace) {
    return {
      allowed: false,
      used: 0,
      limit: 0,
      remaining: 0,
      plan: "free" as const,
      percentage: 100,
    };
  }

  const periodStart = getCurrentPeriodStart();
  const record = await ctx.db
    .query("usageMetrics")
    .withIndex("by_orgId_and_period", (q) =>
      q.eq("orgId", orgId).eq("periodStart", periodStart)
    )
    .unique();

  const used = record?.aiMessagesUsed ?? 0;
  const limit = workspace.aiMessageLimit;
  const isEnterprise = workspace.plan === "enterprise";
  const allowed = isEnterprise || used < limit;
  const remaining = isEnterprise ? 999999 : Math.max(0, limit - used);
  const percentage =
    isEnterprise || limit <= 0 ? 0 : Math.min(100, Math.round((used / limit) * 100));

  return {
    allowed,
    used,
    limit,
    remaining,
    plan: workspace.plan,
    percentage,
  };
}

/**
 * Query to verify if AI message count is within limit.
 */
export const checkAiQuota = query({
  args: {
    orgId: v.string(),
  },
  handler: async (ctx, args) => {
    return checkAiQuotaHelper(ctx, args.orgId);
  },
});

/**
 * Helper to check KB quota directly inside server functions.
 */
export async function checkKbQuotaHelper(
  ctx: QueryCtx | MutationCtx,
  orgId: string
) {
  const workspace = await ctx.db
    .query("workspaces")
    .withIndex("by_orgId", (q) => q.eq("orgId", orgId))
    .unique();

  if (!workspace) {
    return {
      allowed: false,
      used: 0,
      limit: 0,
      remaining: 0,
      plan: "free" as const,
      percentage: 100,
    };
  }

  const kbDocuments = await ctx.db
    .query("kbDocuments")
    .withIndex("by_orgId", (q) => q.eq("orgId", orgId))
    .collect();

  const used = kbDocuments.length;
  const limit = workspace.kbDocumentLimit;
  const isEnterprise = workspace.plan === "enterprise";
  const allowed = isEnterprise || used < limit;
  const remaining = isEnterprise ? 999999 : Math.max(0, limit - used);
  const percentage =
    isEnterprise || limit <= 0 ? 0 : Math.min(100, Math.round((used / limit) * 100));

  return {
    allowed,
    used,
    limit,
    remaining,
    plan: workspace.plan,
    percentage,
  };
}

/**
 * Query to verify if KB document count is within limit.
 */
export const checkKbQuota = query({
  args: {
    orgId: v.string(),
  },
  handler: async (ctx, args) => {
    return checkKbQuotaHelper(ctx, args.orgId);
  },
});

/**
 * Helper to check team seats quota directly inside server functions.
 */
export async function checkSeatQuotaHelper(
  ctx: QueryCtx | MutationCtx,
  orgId: string
) {
  const workspace = await ctx.db
    .query("workspaces")
    .withIndex("by_orgId", (q) => q.eq("orgId", orgId))
    .unique();

  if (!workspace) {
    return {
      allowed: false,
      used: 0,
      limit: 0,
      remaining: 0,
      plan: "free" as const,
      percentage: 100,
    };
  }

  const users = await ctx.db
    .query("users")
    .withIndex("by_orgId", (q) => q.eq("orgId", orgId))
    .collect();

  const used = users.filter((u) => u.isActive !== false).length;
  const limit = workspace.seatLimit;
  const isEnterprise = workspace.plan === "enterprise";
  const allowed = isEnterprise || used < limit;
  const remaining = isEnterprise ? 999999 : Math.max(0, limit - used);
  const percentage =
    isEnterprise || limit <= 0 ? 0 : Math.min(100, Math.round((used / limit) * 100));

  return {
    allowed,
    used: Math.max(used, 1),
    limit,
    remaining,
    plan: workspace.plan,
    percentage,
  };
}

/**
 * Query to verify if team seat count is within limit.
 */
export const checkSeatQuota = query({
  args: {
    orgId: v.string(),
  },
  handler: async (ctx, args) => {
    return checkSeatQuotaHelper(ctx, args.orgId);
  },
});

/**
 * RateLimiter instance using @convex-dev/rate-limiter component
 */
export const rateLimiter = new RateLimiter(components.rateLimiter, {
  // Per-org AI message generation burst protection (e.g. 60/min)
  aiMessageRate: { kind: "token bucket", rate: 60, period: MINUTE, capacity: 10 },
  // Per-org Knowledge base uploads (e.g. 20/hr)
  kbUploadRate: { kind: "token bucket", rate: 20, period: HOUR, capacity: 5 },
  // General API/widget requests (e.g. 120/min)
  apiRate: { kind: "token bucket", rate: 120, period: MINUTE, capacity: 20 },
});

/**
 * Mutation to check or consume rate limit tokens for an organization
 */
export const checkRateLimit = mutation({
  args: {
    orgId: v.string(),
    actionName: v.union(
      v.literal("aiMessageRate"),
      v.literal("kbUploadRate"),
      v.literal("apiRate")
    ),
  },
  handler: async (ctx, args) => {
    return await rateLimiter.limit(ctx, args.actionName, { key: args.orgId });
  },
});

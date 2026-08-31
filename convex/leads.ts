import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    orgId: v.string(),
    status: v.optional(
      v.union(
        v.literal("new"),
        v.literal("contacted"),
        v.literal("qualified"),
        v.literal("closed")
      )
    ),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let leadsQuery = args.status
      ? ctx.db
          .query("leads")
          .withIndex("by_orgId_and_status", (q) =>
            q.eq("orgId", args.orgId).eq("status", args.status!)
          )
      : ctx.db
          .query("leads")
          .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId));

    let leads = await leadsQuery.order("desc").take(200);

    if (args.search && args.search.trim()) {
      const q = args.search.toLowerCase().trim();
      leads = leads.filter(
        (l) =>
          (l.name && l.name.toLowerCase().includes(q)) ||
          (l.email && l.email.toLowerCase().includes(q)) ||
          (l.phone && l.phone.toLowerCase().includes(q)) ||
          (l.notes && l.notes.toLowerCase().includes(q))
      );
    }

    return leads;
  },
});

export const updateStatus = mutation({
  args: {
    leadId: v.id("leads"),
    status: v.union(
      v.literal("new"),
      v.literal("contacted"),
      v.literal("qualified"),
      v.literal("closed")
    ),
  },
  handler: async (ctx, args) => {
    const lead = await ctx.db.get(args.leadId);
    if (!lead) throw new Error("Lead not found");

    await ctx.db.patch(args.leadId, {
      status: args.status,
    });
  },
});

export const getStats = query({
  args: { orgId: v.string() },
  handler: async (ctx, args) => {
    const leads = await ctx.db
      .query("leads")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .take(500);

    const counts = {
      total: leads.length,
      new: 0,
      contacted: 0,
      qualified: 0,
      closed: 0,
    };

    for (const lead of leads) {
      if (lead.status in counts) {
        counts[lead.status]++;
      }
    }

    return counts;
  },
});

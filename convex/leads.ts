import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    orgId: v.string(),
    status: v.optional(
      v.union(
        v.literal("all"),
        v.literal("new"),
        v.literal("contacted"),
        v.literal("qualified"),
        v.literal("closed")
      )
    ),
    source: v.optional(v.string()),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const effectiveStatus =
      args.status && args.status !== "all" ? args.status : undefined;

    const leadsQuery = effectiveStatus
      ? ctx.db
          .query("leads")
          .withIndex("by_orgId_and_status", (q) =>
            q.eq("orgId", args.orgId).eq("status", effectiveStatus as "new" | "contacted" | "qualified" | "closed")
          )
      : ctx.db
          .query("leads")
          .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId));

    let leads = await leadsQuery.order("desc").take(500);

    if (args.source && args.source !== "all" && args.source.trim()) {
      const src = args.source.toLowerCase().trim();
      leads = leads.filter(
        (l) => l.source && l.source.toLowerCase() === src
      );
    }

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

export const get = query({
  args: {
    leadId: v.id("leads"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    return await ctx.db.get(args.leadId);
  },
});

export const getStats = query({
  args: { orgId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return {
        total: 0,
        newCount: 0,
        contactedCount: 0,
        qualifiedCount: 0,
        closedCount: 0,
        new: 0,
        contacted: 0,
        qualified: 0,
        closed: 0,
      };
    }

    const leads = await ctx.db
      .query("leads")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .take(1000);

    const counts = {
      total: leads.length,
      newCount: 0,
      contactedCount: 0,
      qualifiedCount: 0,
      closedCount: 0,
      new: 0,
      contacted: 0,
      qualified: 0,
      closed: 0,
    };

    for (const lead of leads) {
      if (lead.status === "new") {
        counts.newCount++;
        counts.new++;
      } else if (lead.status === "contacted") {
        counts.contactedCount++;
        counts.contacted++;
      } else if (lead.status === "qualified") {
        counts.qualifiedCount++;
        counts.qualified++;
      } else if (lead.status === "closed") {
        counts.closedCount++;
        counts.closed++;
      }
    }

    return counts;
  },
});

export const create = mutation({
  args: {
    orgId: v.string(),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    notes: v.optional(v.string()),
    source: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("new"),
        v.literal("contacted"),
        v.literal("qualified"),
        v.literal("closed")
      )
    ),
    visitorId: v.optional(v.string()),
    conversationId: v.optional(v.id("conversations")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const visitorId =
      args.visitorId || `manual_${Math.random().toString(36).slice(2, 10)}_${Date.now()}`;

    const leadId = await ctx.db.insert("leads", {
      orgId: args.orgId,
      name: args.name?.trim() || undefined,
      email: args.email?.trim() || undefined,
      phone: args.phone?.trim() || undefined,
      notes: args.notes?.trim() || undefined,
      source: args.source || "manual",
      status: args.status || "new",
      visitorId,
      conversationId: args.conversationId,
    });

    return leadId;
  },
});

export const update = mutation({
  args: {
    leadId: v.id("leads"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    notes: v.optional(v.string()),
    source: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("new"),
        v.literal("contacted"),
        v.literal("qualified"),
        v.literal("closed")
      )
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const lead = await ctx.db.get(args.leadId);
    if (!lead) throw new Error("Lead not found");

    const patch: {
      name?: string;
      email?: string;
      phone?: string;
      notes?: string;
      source?: string;
      status?: "new" | "contacted" | "qualified" | "closed";
    } = {};

    if (args.name !== undefined) patch.name = args.name;
    if (args.email !== undefined) patch.email = args.email;
    if (args.phone !== undefined) patch.phone = args.phone;
    if (args.notes !== undefined) patch.notes = args.notes;
    if (args.source !== undefined) patch.source = args.source;
    if (args.status !== undefined) patch.status = args.status;

    await ctx.db.patch(args.leadId, patch);
    return args.leadId;
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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const lead = await ctx.db.get(args.leadId);
    if (!lead) throw new Error("Lead not found");

    await ctx.db.patch(args.leadId, {
      status: args.status,
    });
    return args.leadId;
  },
});

export const remove = mutation({
  args: {
    leadId: v.id("leads"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const lead = await ctx.db.get(args.leadId);
    if (!lead) throw new Error("Lead not found");

    await ctx.db.delete(args.leadId);
    return { success: true };
  },
});

export const exportLeads = query({
  args: {
    orgId: v.string(),
    status: v.optional(v.string()),
    source: v.optional(v.string()),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const effectiveStatus =
      args.status && args.status !== "all"
        ? (args.status as "new" | "contacted" | "qualified" | "closed")
        : undefined;

    const leadsQuery = effectiveStatus
      ? ctx.db
          .query("leads")
          .withIndex("by_orgId_and_status", (q) =>
            q.eq("orgId", args.orgId).eq("status", effectiveStatus)
          )
      : ctx.db
          .query("leads")
          .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId));

    let leads = await leadsQuery.order("desc").take(1000);

    if (args.source && args.source !== "all" && args.source.trim()) {
      const src = args.source.toLowerCase().trim();
      leads = leads.filter(
        (l) => l.source && l.source.toLowerCase() === src
      );
    }

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

    return leads.map((lead) => ({
      id: lead._id,
      name: lead.name ?? "",
      email: lead.email ?? "",
      phone: lead.phone ?? "",
      status: lead.status,
      source: lead.source,
      notes: lead.notes ?? "",
      createdAt: new Date(lead._creationTime).toISOString(),
      createdDate: new Date(lead._creationTime).toLocaleDateString(),
    }));
  },
});

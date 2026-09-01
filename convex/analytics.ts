import { query } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentPeriodStart } from "./usage";

export const getOverviewStats = query({
  args: {
    orgId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return {
        totalConversations: 0,
        conversationsThisMonth: 0,
        openConversations: 0,
        closedConversations: 0,
        handedToHumanCount: 0,
        aiResolvedCount: 0,
        aiResolutionRate: 100,
        totalLeads: 0,
        leadsThisMonth: 0,
        leadConversionRate: 0,
        leadsByStatus: {
          new: 0,
          contacted: 0,
          qualified: 0,
          closed: 0,
        },
        kbTotalArticles: 0,
        topArticles: [],
        topCategories: [],
        recentActivity: [],
        dailyTrend: [],
      };
    }

    const periodStart = getCurrentPeriodStart();
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

    // 1. Query conversations for this organization
    const conversations = await ctx.db
      .query("conversations")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .order("desc")
      .take(500);

    const totalConversations = conversations.length;
    let conversationsThisMonth = 0;
    let openConversations = 0;
    let closedConversations = 0;
    let handedToHumanCount = 0;

    // Map for 7-day daily trend
    const daysMap: Record<
      string,
      { date: string; total: number; aiResolved: number; handovers: number }
    > = {};

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now - i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().slice(5, 10); // MM-DD
      daysMap[key] = { date: key, total: 0, aiResolved: 0, handovers: 0 };
    }

    for (const conv of conversations) {
      if (conv._creationTime >= periodStart) {
        conversationsThisMonth++;
      }
      if (conv.status === "open") {
        openConversations++;
      } else {
        closedConversations++;
      }
      if (conv.handedToHuman) {
        handedToHumanCount++;
      }

      if (conv._creationTime >= sevenDaysAgo) {
        const key = new Date(conv._creationTime).toISOString().slice(5, 10);
        if (daysMap[key]) {
          daysMap[key].total++;
          if (conv.handedToHuman) {
            daysMap[key].handovers++;
          } else {
            daysMap[key].aiResolved++;
          }
        }
      }
    }

    const aiResolvedCount = Math.max(0, totalConversations - handedToHumanCount);
    const aiResolutionRate =
      totalConversations > 0
        ? Math.round((aiResolvedCount / totalConversations) * 100)
        : 100;

    // 2. Query leads for this organization
    const leads = await ctx.db
      .query("leads")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .order("desc")
      .take(500);

    const totalLeads = leads.length;
    let leadsThisMonth = 0;
    const leadsByStatus = {
      new: 0,
      contacted: 0,
      qualified: 0,
      closed: 0,
    };

    for (const lead of leads) {
      if (lead._creationTime >= periodStart) {
        leadsThisMonth++;
      }
      if (lead.status in leadsByStatus) {
        leadsByStatus[lead.status]++;
      }
    }

    const convertedLeads = leadsByStatus.qualified + leadsByStatus.closed;
    const leadConversionRate =
      totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;

    // 3. Query knowledge base articles
    const articles = await ctx.db
      .query("articles")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .take(200);

    const publishedArticles = articles.filter((a) => a.isPublished);
    const kbTotalArticles = publishedArticles.length;

    // Top articles by view count or popular
    const topArticles = [...publishedArticles]
      .sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0))
      .slice(0, 5)
      .map((a) => ({
        id: a._id,
        title: a.title,
        category: a.category,
        viewCount: a.viewCount ?? 0,
        isPopular: a.isPopular,
      }));

    // Top categories
    const categoryCounts: Record<string, number> = {};
    for (const a of publishedArticles) {
      const cat = a.category || "General";
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    }

    const topCategories = Object.entries(categoryCounts)
      .map(([name, count]) => ({
        name,
        count,
        percentage:
          kbTotalArticles > 0
            ? Math.round((count / kbTotalArticles) * 100)
            : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // 4. Query recent messages & activity
    const recentMessages = await ctx.db
      .query("messages")
      .withIndex("by_orgId", (q) => q.eq("orgId", args.orgId))
      .order("desc")
      .take(15);

    const recentActivity = recentMessages.map((m) => {
      let type: "visitor" | "ai" | "agent" | "system" = "visitor";
      let title = "Visitor Message";
      if (m.role === "ai") {
        type = "ai";
        title = "AI Support Automated Reply";
      } else if (m.role === "agent") {
        type = "agent";
        title = m.isInternalNote ? "Internal Agent Note" : "Agent Response";
      }

      return {
        id: m._id,
        timestamp: m._creationTime,
        type,
        title,
        description:
          m.content.length > 90 ? `${m.content.slice(0, 87)}...` : m.content,
        conversationId: m.conversationId,
        hasCitations: !!(m.citations && m.citations.length > 0),
      };
    });

    return {
      totalConversations,
      conversationsThisMonth,
      openConversations,
      closedConversations,
      handedToHumanCount,
      aiResolvedCount,
      aiResolutionRate,
      totalLeads,
      leadsThisMonth,
      leadConversionRate,
      leadsByStatus,
      kbTotalArticles,
      topArticles,
      topCategories,
      recentActivity,
      dailyTrend: Object.values(daysMap),
    };
  },
});

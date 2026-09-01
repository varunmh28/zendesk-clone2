"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  MessageSquare,
  Sparkles,
  Headphones,
  UserCheck,
  BookOpen,
  TrendingUp,
  Bot,
  Activity,
  Calendar,
  CheckCircle2,
  FileText,
  BarChart3,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface AnalyticsViewProps {
  orgId: string;
}

interface DailyTrendItem {
  date: string;
  total: number;
  aiResolved: number;
  handovers: number;
}

interface TopArticleItem {
  id: string;
  title: string;
  category: string;
  viewCount: number;
  isPopular?: boolean;
}

interface TopCategoryItem {
  name: string;
  count: number;
  percentage: number;
}

interface RecentActivityItem {
  id: string;
  timestamp: number;
  type: "visitor" | "ai" | "agent" | "system";
  title: string;
  description: string;
  conversationId: string;
  hasCitations?: boolean;
}

export function AnalyticsView({ orgId }: AnalyticsViewProps) {
  const stats = useQuery(api.analytics.getOverviewStats, { orgId });
  const quota = useQuery(api.usage.checkAiQuota, { orgId });

  if (stats === undefined) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)] text-muted-foreground gap-2">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="text-sm">Loading support analytics...</span>
      </div>
    );
  }

  const {
    totalConversations,
    conversationsThisMonth,
    openConversations,
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
    dailyTrend,
  } = stats;

  const humanTakeoverRate = Math.round((handedToHumanCount / Math.max(1, totalConversations)) * 100);

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Support Analytics & AI Insights</h1>
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-xs">
              Live Real-Time
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor automated AI resolution, human support handovers, knowledge base usage, and captured leads.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border bg-card text-xs font-medium text-muted-foreground shadow-2xs">
            <Calendar className="h-3.5 w-3.5 text-primary" />
            <span>This Month</span>
          </div>
          {quota && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border bg-card text-xs font-medium text-muted-foreground shadow-2xs">
              <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
              <span>
                Plan: <strong className="capitalize text-foreground">{quota.plan}</strong> ({quota.used} / {quota.limit > 0 ? quota.limit : "Unlimited"} msgs)
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Top Level KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Conversations */}
        <Card className="shadow-xs hover:shadow-sm transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Conversations
            </CardTitle>
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600">
              <MessageSquare className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalConversations}</div>
            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                {conversationsThisMonth} this month
              </span>
              <span>•</span>
              <span>{openConversations} active open</span>
            </div>
          </CardContent>
        </Card>

        {/* AI Resolution Rate */}
        <Card className="shadow-xs hover:shadow-sm transition-shadow border-indigo-100 dark:border-indigo-950/60 bg-gradient-to-br from-indigo-50/20 via-card to-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              AI Resolution Rate
            </CardTitle>
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600">
              <Sparkles className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {aiResolutionRate}%
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
              <span className="font-medium text-emerald-600 flex items-center">
                <TrendingUp className="h-3 w-3 mr-0.5" />
                {aiResolvedCount} automated
              </span>
              <span>•</span>
              <span>Zero-touch support</span>
            </div>
          </CardContent>
        </Card>

        {/* Human Handovers */}
        <Card className="shadow-xs hover:shadow-sm transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Human Handovers
            </CardTitle>
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600">
              <Headphones className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{handedToHumanCount}</div>
            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
              <span className="font-medium text-amber-600 dark:text-amber-400">
                {humanTakeoverRate}% escalation rate
              </span>
              <span>•</span>
              <span>Agent assisted</span>
            </div>
          </CardContent>
        </Card>

        {/* Total Leads Captured */}
        <Card className="shadow-xs hover:shadow-sm transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Leads Captured
            </CardTitle>
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600">
              <UserCheck className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLeads}</div>
            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
              <span className="font-medium text-emerald-600 dark:text-emerald-400">
                {leadConversionRate}% qualified/closed
              </span>
              <span>•</span>
              <span>{leadsThisMonth} this month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Resolution Breakdown & Daily Trend Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Resolution Breakdown Progress Card */}
        <Card className="lg:col-span-1 shadow-xs">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Bot className="h-4 w-4 text-indigo-500" />
              <span>AI vs. Human Resolution</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Breakdown of conversations resolved autonomously by Gemini AI versus human takeover.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium">
                <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                  <Sparkles className="h-3.5 w-3.5" /> AI Autonomous ({aiResolutionRate}%)
                </span>
                <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                  <Headphones className="h-3.5 w-3.5" /> Human Takeover ({humanTakeoverRate}%)
                </span>
              </div>
              <Progress
                value={aiResolutionRate}
                className="h-3 bg-amber-100 dark:bg-amber-950"
                indicatorClassName="bg-indigo-600 dark:bg-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t text-center">
              <div className="p-3 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40">
                <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{aiResolvedCount}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">AI Resolved</p>
              </div>
              <div className="p-3 rounded-lg bg-amber-50/50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40">
                <p className="text-xl font-bold text-amber-600 dark:text-amber-400">{handedToHumanCount}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Human Handover</p>
              </div>
            </div>

            <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground space-y-1.5">
              <div className="flex items-center justify-between">
                <span>Estimated Hours Saved:</span>
                <span className="font-semibold text-foreground">
                  ~{(aiResolvedCount * 0.25).toFixed(1)} hrs
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Avg AI Response Time:</span>
                <span className="font-semibold text-emerald-600">~1.2s</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 7-Day Conversation Activity Trend */}
        <Card className="lg:col-span-2 shadow-xs">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  <span>7-Day Conversation & Resolution Activity</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Daily incoming volume, automated AI replies, and support escalations over the last 7 days.
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-xs">
                Last 7 Days
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {dailyTrend && dailyTrend.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-7 gap-2 pt-4">
                  {dailyTrend.map((day: DailyTrendItem, idx: number) => {
                    const maxVal = Math.max(...dailyTrend.map((d: DailyTrendItem) => d.total), 5);
                    const barHeightPct = Math.max(12, Math.round((day.total / maxVal) * 100));

                    return (
                      <div key={idx} className="flex flex-col items-center gap-2">
                        <div className="w-full h-36 bg-muted/30 rounded-lg flex flex-col justify-end p-1.5 relative group border border-border/40 hover:border-primary/40 transition-colors">
                          <div
                            className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-md transition-all duration-300 relative"
                            style={{ height: `${barHeightPct}%` }}
                          >
                            {day.total > 0 && (
                              <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[11px] font-bold text-foreground">
                                {day.total}
                              </span>
                            )}
                          </div>

                          {/* Hover Tooltip Details */}
                          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col bg-popover text-popover-foreground border shadow-md p-2 rounded text-[10px] whitespace-nowrap z-20 pointer-events-none">
                            <span className="font-semibold text-foreground">{day.date}</span>
                            <span>Total: {day.total}</span>
                            <span className="text-indigo-500">AI: {day.aiResolved}</span>
                            <span className="text-amber-500">Human: {day.handovers}</span>
                          </div>
                        </div>
                        <span className="text-[11px] font-medium text-muted-foreground">{day.date}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground pt-4 border-t">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-indigo-500"></span>
                    <span>AI Resolved Volume</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500"></span>
                    <span>Human Escalations</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-48 text-muted-foreground text-xs">
                No conversation activity recorded for this period yet.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Knowledge Base Performance & Lead Funnel Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Knowledge Base Articles & Topics */}
        <Card className="shadow-xs">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-emerald-600" />
                  <span>Knowledge Base & Citation Performance</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Most referenced articles and content categories grounding AI answers.
                </CardDescription>
              </div>
              <Badge variant="secondary" className="text-xs">
                {kbTotalArticles} Published Articles
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {topArticles.length > 0 ? (
              <div className="space-y-2.5">
                {topArticles.map((art: TopArticleItem, idx: number) => (
                  <div
                    key={art.id}
                    className="flex items-center justify-between p-2.5 rounded-lg border bg-card hover:bg-muted/30 transition-colors text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="font-bold text-muted-foreground text-[11px] w-4 text-center">
                        #{idx + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground truncate">{art.title}</p>
                        <span className="text-[10px] text-muted-foreground capitalize">
                          {art.category}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {art.isPopular && (
                        <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-700 border-amber-200">
                          Popular
                        </Badge>
                      )}
                      <span className="text-[11px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded">
                        {art.viewCount} views
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-6 text-center text-muted-foreground text-xs">
                <FileText className="h-8 w-8 text-muted-foreground/50 mb-1" />
                <p>No articles published yet.</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Publish help center articles in Knowledge Base to power AI RAG answers.
                </p>
              </div>
            )}

            {/* Category breakdown chips */}
            {topCategories.length > 0 && (
              <div className="pt-3 border-t">
                <p className="text-[11px] font-semibold text-muted-foreground mb-2">Category Distribution</p>
                <div className="flex flex-wrap gap-1.5">
                  {topCategories.map((cat: TopCategoryItem, idx: number) => (
                    <Badge key={idx} variant="secondary" className="text-[11px] font-normal py-1 px-2.5">
                      {cat.name}: <strong className="ml-1 text-foreground">{cat.count} ({cat.percentage}%)</strong>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lead Capture Funnel */}
        <Card className="shadow-xs">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-primary" />
                  <span>Lead Pipeline & Conversion</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Visitor lead capture conversion and CRM pipeline status stages.
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
                {leadConversionRate}% Conversion
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {/* New Leads */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-muted-foreground">New Prospect Leads</span>
                  <span className="font-semibold text-foreground">{leadsByStatus.new}</span>
                </div>
                <Progress
                  value={totalLeads > 0 ? (leadsByStatus.new / totalLeads) * 100 : 0}
                  className="h-2 bg-muted"
                  indicatorClassName="bg-blue-500"
                />
              </div>

              {/* Contacted */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-muted-foreground">Contacted in Outreach</span>
                  <span className="font-semibold text-foreground">{leadsByStatus.contacted}</span>
                </div>
                <Progress
                  value={totalLeads > 0 ? (leadsByStatus.contacted / totalLeads) * 100 : 0}
                  className="h-2 bg-muted"
                  indicatorClassName="bg-amber-500"
                />
              </div>

              {/* Qualified */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-muted-foreground">Qualified Opportunity</span>
                  <span className="font-semibold text-foreground">{leadsByStatus.qualified}</span>
                </div>
                <Progress
                  value={totalLeads > 0 ? (leadsByStatus.qualified / totalLeads) * 100 : 0}
                  className="h-2 bg-muted"
                  indicatorClassName="bg-indigo-500"
                />
              </div>

              {/* Closed */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-muted-foreground">Closed / Won Customers</span>
                  <span className="font-semibold text-emerald-600">{leadsByStatus.closed}</span>
                </div>
                <Progress
                  value={totalLeads > 0 ? (leadsByStatus.closed / totalLeads) * 100 : 0}
                  className="h-2 bg-muted"
                  indicatorClassName="bg-emerald-500"
                />
              </div>
            </div>

            <div className="p-3 rounded-lg bg-muted/40 border border-border/50 text-xs text-muted-foreground flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Total Active Leads:</span>
              </div>
              <span className="font-bold text-foreground text-sm">{totalLeads}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Real-Time Activity Feed Timeline */}
      <Card className="shadow-xs">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                <span>Recent Support Activity Feed</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Real-time stream of incoming visitor inquiries, Gemini AI automated answers, and agent interactions.
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-xs">
              Live Stream
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {recentActivity && recentActivity.length > 0 ? (
            <div className="divide-y divide-border/60">
              {recentActivity.map((event: RecentActivityItem) => {
                const isAI = event.type === "ai";
                const isVisitor = event.type === "visitor";
                const isAgent = event.type === "agent";

                return (
                  <div key={event.id} className="py-3 flex items-start gap-3 text-xs first:pt-0 last:pb-0">
                    <div
                      className={cn(
                        "p-1.5 rounded-lg shrink-0 mt-0.5",
                        isAI
                          ? "bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400"
                          : isAgent
                          ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400"
                          : "bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400"
                      )}
                    >
                      {isAI ? (
                        <Sparkles className="h-3.5 w-3.5" />
                      ) : isAgent ? (
                        <Headphones className="h-3.5 w-3.5" />
                      ) : (
                        <MessageSquare className="h-3.5 w-3.5" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">{event.title}</span>
                          {event.hasCitations && (
                            <Badge variant="outline" className="text-[10px] py-0 px-1 text-primary border-primary/30">
                              Grounding Cited
                            </Badge>
                          )}
                        </div>
                        <span className="text-[10px] text-muted-foreground shrink-0">
                          {new Date(event.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="text-muted-foreground mt-0.5 leading-relaxed truncate">
                        {event.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center p-8 text-center text-muted-foreground text-xs">
              No recent support activity yet.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

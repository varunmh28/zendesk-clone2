"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ArticleListTab } from "@/components/kb/article-list-tab";
import { DocumentIngestionTab } from "@/components/kb/document-ingestion-tab";
import {
  BookOpen,
  FileText,
  Sparkles,
  Database,
  CheckCircle2,
  Layers,
  Search,
} from "lucide-react";

export default function KBPage() {
  const params = useParams();
  const slug = (params?.slug as string) || "";
  const { orgId: clerkOrgId } = useAuth();

  const [activeTab, setActiveTab] = useState<"articles" | "documents">("articles");

  // Lookup workspace by slug or clerk orgId
  const workspaceBySlug = useQuery(api.workspaces.getBySlug, { slug });
  const workspaceByOrgId = useQuery(
    api.workspaces.getByOrgId,
    clerkOrgId ? { orgId: clerkOrgId } : "skip"
  );

  const workspace = workspaceBySlug || workspaceByOrgId;
  const effectiveOrgId = workspace?.orgId || clerkOrgId || slug;

  const articles = useQuery(
    api.articles.list,
    effectiveOrgId ? { orgId: effectiveOrgId } : "skip"
  );
  const documents = useQuery(
    api.kbDocuments.list,
    effectiveOrgId ? { orgId: effectiveOrgId } : "skip"
  );

  // Compute stats
  const totalArticles = articles?.length ?? 0;
  const publishedArticles = articles?.filter((a) => a.isPublished).length ?? 0;
  const totalDocuments = documents?.length ?? 0;
  const readyChunks =
    (documents?.reduce((sum, d) => sum + (d.chunkCount ?? 0), 0) ?? 0) +
    publishedArticles * 2; // approximation for display

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Knowledge Base
            </h1>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              <Sparkles className="h-3 w-3" /> RAG & Gemini AI
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Manage human-written help center articles and upload raw source documents to train your AI support agent.
          </p>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border bg-card shadow-xs flex items-center gap-3.5">
          <div className="h-10 w-10 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground font-medium">
              Total Articles
            </div>
            <div className="text-xl font-bold text-foreground mt-0.5">
              {totalArticles}
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl border bg-card shadow-xs flex items-center gap-3.5">
          <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground font-medium">
              Published (AI Active)
            </div>
            <div className="text-xl font-bold text-foreground mt-0.5">
              {publishedArticles}
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl border bg-card shadow-xs flex items-center gap-3.5">
          <div className="h-10 w-10 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground font-medium">
              Source Documents
            </div>
            <div className="text-xl font-bold text-foreground mt-0.5">
              {totalDocuments}
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl border bg-card shadow-xs flex items-center gap-3.5">
          <div className="h-10 w-10 rounded-lg bg-violet-500/10 text-violet-500 flex items-center justify-center shrink-0">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground font-medium">
              Vector Chunks
            </div>
            <div className="text-xl font-bold text-foreground mt-0.5 font-mono">
              {readyChunks}
            </div>
          </div>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="space-y-6">
        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab("articles")}
            className={`pb-3 px-4 text-sm font-semibold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === "articles"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <BookOpen className="h-4 w-4" />
            Articles
            <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
              {totalArticles}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("documents")}
            className={`pb-3 px-4 text-sm font-semibold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === "documents"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <FileText className="h-4 w-4" />
            Documents (Source Ingestion)
            <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
              {totalDocuments}
            </span>
          </button>
        </div>

        {/* Tab Content */}
        {effectiveOrgId ? (
          <div>
            {activeTab === "articles" ? (
              <ArticleListTab orgId={effectiveOrgId} />
            ) : (
              <DocumentIngestionTab orgId={effectiveOrgId} />
            )}
          </div>
        ) : (
          <div className="py-12 text-center text-sm text-muted-foreground">
            Loading workspace details...
          </div>
        )}
      </div>
    </div>
  );
}
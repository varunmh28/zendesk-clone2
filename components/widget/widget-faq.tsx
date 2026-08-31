"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Search, HelpCircle, ChevronRight, ArrowLeft, BookOpen, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface FaqItemConfig {
  question: string;
  articleId?: Id<"articles">;
}

interface WidgetFaqProps {
  publicKey: string;
  faqItems: FaqItemConfig[];
  primaryColor: string;
  selectedArticleId: Id<"articles"> | null;
  onSelectArticle: (articleId: Id<"articles"> | null) => void;
  onAskInChat: (question: string) => void;
}

export function WidgetFaq({
  publicKey,
  faqItems,
  primaryColor,
  selectedArticleId,
  onSelectArticle,
  onAskInChat,
}: WidgetFaqProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Search published articles
  const helpArticles = useQuery(api.widget.getHelpArticles, {
    publicKey,
    search: searchQuery.trim() || undefined,
  });

  // Selected single article
  const activeArticle = useQuery(
    api.widget.getHelpArticle,
    selectedArticleId
      ? { publicKey, articleId: selectedArticleId }
      : "skip"
  );

  // If viewing an article, render full article reader view
  if (selectedArticleId) {
    return (
      <div className="flex-1 flex flex-col h-full bg-white dark:bg-slate-950 overflow-hidden">
        {/* Back navigation bar */}
        <div className="flex items-center justify-between p-3 border-b bg-slate-50 dark:bg-slate-900 shrink-0">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onSelectArticle(null)}
            className="gap-1.5 text-xs h-8 -ml-1 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to FAQs</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              if (activeArticle) {
                onAskInChat(`I have a question regarding the article: "${activeArticle.title}"`);
              }
            }}
            className="text-xs h-7 px-2"
          >
            Ask in chat
          </Button>
        </div>

        {/* Article content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {!activeArticle ? (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground text-xs gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Loading article...</span>
            </div>
          ) : (
            <article className="prose prose-sm dark:prose-invert max-w-none">
              {activeArticle.category && (
                <Badge variant="secondary" className="mb-2 text-[10px]">
                  {activeArticle.category}
                </Badge>
              )}
              <h1 className="text-lg sm:text-xl font-bold text-foreground mb-3 leading-snug">
                {activeArticle.title}
              </h1>
              <div className="text-xs sm:text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                {activeArticle.content}
              </div>
            </article>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Search Bar */}
      <div className="p-3.5 border-b bg-white dark:bg-slate-900 shrink-0">
        <div className="relative flex items-center">
          <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search articles and FAQs..."
            className="w-full rounded-xl border bg-slate-50 dark:bg-slate-950 pl-9 pr-8 py-2 text-xs sm:text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* List content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Curated Frequently Asked Questions */}
        {!searchQuery && faqItems.length > 0 && (
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-1">
              Top Questions
            </h2>
            <div className="rounded-xl border bg-white dark:bg-slate-900 divide-y divide-border/60 shadow-2xs overflow-hidden">
              {faqItems.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    if (item.articleId) {
                      onSelectArticle(item.articleId);
                    } else {
                      onAskInChat(item.question);
                    }
                  }}
                  className="flex items-center justify-between gap-3 w-full p-3 text-left text-xs sm:text-sm hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                >
                  <span className="font-medium text-foreground">{item.question}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Published Knowledge Base Articles */}
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-1">
            {searchQuery ? "Search Results" : "Help Articles"}
          </h2>

          {helpArticles === undefined ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
              <span>Searching knowledge base...</span>
            </div>
          ) : helpArticles.length === 0 ? (
            <div className="rounded-xl border bg-white dark:bg-slate-900 p-6 text-center text-xs text-muted-foreground shadow-2xs">
              <BookOpen className="h-6 w-6 mx-auto mb-2 opacity-30" />
              <p className="font-medium text-foreground">No articles found</p>
              <p className="mt-1">
                {searchQuery
                  ? "Try searching for different keywords or ask us directly in the chat tab."
                  : "No published help articles available yet."}
              </p>
              {searchQuery && (
                <Button
                  size="sm"
                  onClick={() => onAskInChat(searchQuery)}
                  className="mt-3 text-xs text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  Ask &ldquo;{searchQuery}&rdquo; in chat
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-xl border bg-white dark:bg-slate-900 divide-y divide-border/60 shadow-2xs overflow-hidden">
              {helpArticles.map((article) => (
                <button
                  key={article._id}
                  type="button"
                  onClick={() => onSelectArticle(article._id)}
                  className="flex flex-col gap-1 w-full p-3.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-foreground text-xs sm:text-sm">
                      {article.title}
                    </span>
                    {article.category && (
                      <Badge variant="outline" className="text-[10px] py-0 px-1.5">
                        {article.category}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {article.excerpt}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

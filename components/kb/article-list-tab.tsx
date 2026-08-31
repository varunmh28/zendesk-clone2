"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArticleEditorDialog } from "./article-editor-dialog";
import {
  Plus,
  Search,
  BookOpen,
  Eye,
  Star,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  FolderOpen,
} from "lucide-react";

type ArticleWithCover = Doc<"articles"> & { coverImageUrl?: string | null };

interface ArticleListTabProps {
  orgId: string;
}

export function ArticleListTab({ orgId }: ArticleListTabProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [articleToEdit, setArticleToEdit] = useState<ArticleWithCover | null>(null);
  const [articleToDelete, setArticleToDelete] = useState<ArticleWithCover | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const categories = useQuery(api.articles.listCategories, { orgId }) || [];
  const articles = useQuery(api.articles.list, {
    orgId,
    category: selectedCategory === "all" ? undefined : selectedCategory,
    search: searchQuery.trim() || undefined,
  });

  const removeArticle = useMutation(api.articles.remove);

  const handleDelete = async () => {
    if (!articleToDelete) return;
    setIsDeleting(true);
    try {
      await removeArticle({ id: articleToDelete._id });
      setArticleToDelete(null);
    } catch (err) {
      console.error("Failed to delete article:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Filter & Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search articles by title, keyword, or category..."
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          )}
        </div>

        {/* New Article Action */}
        <Button onClick={() => setIsCreateOpen(true)} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          New Article
        </Button>
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-border/50 text-sm">
        <button
          onClick={() => setSelectedCategory("all")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            selectedCategory === "all"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <Layers className="h-3.5 w-3.5" />
          All Categories
        </button>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              selectedCategory === category
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <FolderOpen className="h-3.5 w-3.5" />
            {category}
          </button>
        ))}
      </div>

      {/* Articles Grid / Table */}
      {articles === undefined ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">
          Loading knowledge base articles...
        </div>
      ) : articles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center border rounded-xl bg-card border-dashed">
          <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
            <BookOpen className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-foreground mb-1">
            {searchQuery || selectedCategory !== "all"
              ? "No matching articles found"
              : "No knowledge base articles yet"}
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mb-5">
            {searchQuery || selectedCategory !== "all"
              ? "Try changing your search keywords or switching category filters."
              : "Create human-written help articles that customer support agents and AI can use to answer questions."}
          </p>
          <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Your First Article
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {articles.map((article) => (
            <div
              key={article._id}
              className="flex flex-col justify-between rounded-xl border bg-card hover:border-primary/40 transition-all shadow-xs group overflow-hidden"
            >
              {article.coverImageUrl && (
                <div className="h-32 w-full overflow-hidden bg-muted/40 border-b relative">
                  <img
                    src={article.coverImageUrl}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <div className="p-5 flex-1 flex flex-col">
                {/* Header tags */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <Badge variant="secondary" className="text-[11px] font-medium">
                    {article.category}
                  </Badge>
                  <div className="flex items-center gap-1.5">
                    {article.isPopular && (
                      <span
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded"
                        title="Popular Article"
                      >
                        <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                        Popular
                      </span>
                    )}
                    {article.isPublished ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                        <CheckCircle2 className="h-3 w-3" /> Published
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                        <Clock className="h-3 w-3" /> Draft
                      </span>
                    )}
                  </div>
                </div>

                {/* Article Title */}
                <h4 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-1.5">
                  {article.title}
                </h4>

                {/* Excerpt */}
                <p className="text-xs text-muted-foreground line-clamp-3 mb-4 leading-relaxed flex-1">
                  {article.content.replace(/[#*`_\[\]]/g, "").slice(0, 160)}
                </p>
              </div>

              {/* Footer info & actions */}
              <div className="px-5 py-3 border-t bg-muted/10 flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5" />
                    {article.viewCount ?? 0} views
                  </span>
                  <span className="text-[10px] bg-muted/60 px-1.5 py-0.5 rounded font-mono">
                    /{article.slug}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => setArticleToEdit(article)}
                    title="Edit article"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => setArticleToDelete(article)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    title="Delete article"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Article Dialog */}
      {(isCreateOpen || articleToEdit) && (
        <ArticleEditorDialog
          isOpen={isCreateOpen || !!articleToEdit}
          onClose={() => {
            setIsCreateOpen(false);
            setArticleToEdit(null);
          }}
          orgId={orgId}
          articleToEdit={articleToEdit}
          existingCategories={categories}
        />
      )}

      {/* Delete Confirmation Modal */}
      {articleToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-card border rounded-xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-semibold text-foreground">
              Delete Article
            </h3>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete &ldquo;{articleToDelete.title}&rdquo;? This will permanently remove the article and all its associated AI knowledge chunks.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setArticleToDelete(null)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete Article"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id, Doc } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { MarkdownPreview } from "./markdown-preview";
import {
  X,
  Sparkles,
  Bold,
  Italic,
  Heading1,
  Heading2,
  List,
  Code,
  Quote,
  Link as LinkIcon,
  Columns,
  Eye,
  Edit3,
  Loader2,
  Star,
  CheckCircle2,
} from "lucide-react";

interface ArticleEditorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  orgId: string;
  articleToEdit?: Doc<"articles"> | null;
  existingCategories?: string[];
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function ArticleEditorDialog({
  isOpen,
  onClose,
  orgId,
  articleToEdit,
  existingCategories = [],
}: ArticleEditorDialogProps) {
  const createArticle = useMutation(api.articles.create);
  const updateArticle = useMutation(api.articles.update);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [category, setCategory] = useState("General");
  const [content, setContent] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [isPopular, setIsPopular] = useState(false);
  const [viewMode, setViewMode] = useState<"split" | "edit" | "preview">("split");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (articleToEdit) {
      setTitle(articleToEdit.title);
      setSlug(articleToEdit.slug);
      setSlugManuallyEdited(true);
      setCategory(articleToEdit.category);
      setContent(articleToEdit.content);
      setIsPublished(articleToEdit.isPublished);
      setIsPopular(articleToEdit.isPopular);
    } else {
      setTitle("");
      setSlug("");
      setSlugManuallyEdited(false);
      setCategory(existingCategories[0] || "General");
      setContent("");
      setIsPublished(true);
      setIsPopular(false);
    }
    setError(null);
  }, [articleToEdit, isOpen, existingCategories]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (!slugManuallyEdited) {
      setSlug(slugify(val));
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlugManuallyEdited(true);
    setSlug(slugify(e.target.value));
  };

  const insertMarkdown = (prefix: string, suffix: string = "") => {
    const textarea = document.getElementById("article-content-textarea") as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end);
    const replacement = `${prefix}${selected || "text"}${suffix}`;

    const newContent =
      content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + (selected.length || 4)
      );
    }, 10);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please provide an article title");
      return;
    }
    if (!slug.trim()) {
      setError("Please provide a URL slug");
      return;
    }
    if (!content.trim()) {
      setError("Please provide article content");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (articleToEdit) {
        await updateArticle({
          id: articleToEdit._id,
          title: title.trim(),
          slug: slug.trim(),
          category: category.trim() || "General",
          content: content.trim(),
          isPublished,
          isPopular,
        });
      } else {
        await createArticle({
          orgId,
          title: title.trim(),
          slug: slug.trim(),
          category: category.trim() || "General",
          content: content.trim(),
          isPublished,
          isPopular,
        });
      }
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to save article. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-card border rounded-xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-muted/30">
          <div>
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Edit3 className="h-5 w-5 text-primary" />
              {articleToEdit ? "Edit Article" : "Create New Knowledge Base Article"}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Articles will be indexed into knowledge chunks and embedded for AI customer support.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Error message banner */}
        {error && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
            {error}
          </div>
        )}

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="p-6 space-y-4 overflow-y-auto flex-1">
            {/* Title & Slug */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  Article Title <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={handleTitleChange}
                  placeholder="e.g., How to reset your workspace password"
                  className="w-full px-3 py-2 text-sm rounded-lg border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  URL Slug <span className="text-destructive">*</span>
                </label>
                <div className="flex items-center rounded-lg border bg-background overflow-hidden focus-within:ring-2 focus-within:ring-primary/40">
                  <span className="px-2.5 text-xs text-muted-foreground bg-muted/40 border-r py-2">
                    /help/
                  </span>
                  <input
                    type="text"
                    value={slug}
                    onChange={handleSlugChange}
                    placeholder="reset-workspace-password"
                    className="w-full px-3 py-2 text-sm bg-transparent text-foreground focus:outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Category & Metadata Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  Category <span className="text-destructive">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    list="category-suggestions"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. Authentication"
                    className="w-full px-3 py-2 text-sm rounded-lg border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                  <datalist id="category-suggestions">
                    {existingCategories.map((cat) => (
                      <option key={cat} value={cat} />
                    ))}
                    <option value="Getting Started" />
                    <option value="Billing & Plans" />
                    <option value="Troubleshooting" />
                    <option value="Integrations" />
                  </datalist>
                </div>
              </div>

              {/* Published Toggle */}
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  Visibility Status
                </label>
                <label className="flex items-center gap-2.5 px-3 py-2 rounded-lg border bg-background cursor-pointer hover:bg-muted/30 transition-colors">
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                  />
                  <span className="text-xs font-medium text-foreground">
                    {isPublished ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Published (Embed in AI)
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Draft (Private)</span>
                    )}
                  </span>
                </label>
              </div>

              {/* Popular Toggle */}
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  Featured Article
                </label>
                <label className="flex items-center gap-2.5 px-3 py-2 rounded-lg border bg-background cursor-pointer hover:bg-muted/30 transition-colors">
                  <input
                    type="checkbox"
                    checked={isPopular}
                    onChange={(e) => setIsPopular(e.target.checked)}
                    className="rounded border-border text-amber-500 focus:ring-amber-500 h-4 w-4"
                  />
                  <span className="text-xs font-medium text-foreground flex items-center gap-1">
                    <Star className={`h-3.5 w-3.5 ${isPopular ? "fill-amber-500 text-amber-500" : "text-muted-foreground"}`} />
                    {isPopular ? "Featured on Help Center" : "Standard Article"}
                  </span>
                </label>
              </div>
            </div>

            {/* Markdown Content Editor & Preview */}
            <div className="flex flex-col border rounded-xl overflow-hidden bg-background">
              {/* Toolbar */}
              <div className="flex flex-wrap items-center justify-between px-3 py-2 border-b bg-muted/40 gap-2">
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => insertMarkdown("**", "**")}
                    title="Bold"
                  >
                    <Bold className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => insertMarkdown("*", "*")}
                    title="Italic"
                  >
                    <Italic className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => insertMarkdown("# ")}
                    title="Heading 1"
                  >
                    <Heading1 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => insertMarkdown("## ")}
                    title="Heading 2"
                  >
                    <Heading2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => insertMarkdown("- ")}
                    title="Bullet List"
                  >
                    <List className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => insertMarkdown("> ")}
                    title="Quote"
                  >
                    <Quote className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => insertMarkdown("```\n", "\n```")}
                    title="Code Block"
                  >
                    <Code className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => insertMarkdown("[", "](https://)")}
                    title="Link"
                  >
                    <LinkIcon className="h-3.5 w-3.5" />
                  </Button>
                </div>

                {/* View toggles */}
                <div className="flex items-center rounded-lg border bg-muted/60 p-0.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setViewMode("edit")}
                    className={`px-2 py-1 rounded-md font-medium transition-colors flex items-center gap-1 ${
                      viewMode === "edit"
                        ? "bg-background text-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Edit3 className="h-3 w-3" /> Write
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("preview")}
                    className={`px-2 py-1 rounded-md font-medium transition-colors flex items-center gap-1 ${
                      viewMode === "preview"
                        ? "bg-background text-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Eye className="h-3 w-3" /> Preview
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("split")}
                    className={`px-2 py-1 rounded-md font-medium transition-colors hidden md:flex items-center gap-1 ${
                      viewMode === "split"
                        ? "bg-background text-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Columns className="h-3 w-3" /> Split
                  </button>
                </div>
              </div>

              {/* Editor Workspace */}
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x h-80">
                {/* Editor textarea */}
                {(viewMode === "edit" || viewMode === "split") && (
                  <div className={`p-3 flex flex-col ${viewMode === "edit" ? "col-span-2" : ""}`}>
                    <textarea
                      id="article-content-textarea"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Write your article content using Markdown formatting..."
                      className="w-full h-full p-2 text-sm font-mono bg-transparent border-0 focus:outline-none resize-none"
                      required
                    />
                  </div>
                )}

                {/* Live Preview */}
                {(viewMode === "preview" || viewMode === "split") && (
                  <div
                    className={`p-4 overflow-y-auto bg-muted/10 ${
                      viewMode === "preview" ? "col-span-2" : ""
                    }`}
                  >
                    <div className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase mb-2">
                      Live Preview
                    </div>
                    <MarkdownPreview content={content} />
                  </div>
                )}
              </div>

              {/* Status bar */}
              <div className="px-4 py-2 border-t bg-muted/20 text-xs text-muted-foreground flex justify-between items-center">
                <span>Markdown supported</span>
                <span>
                  {content.trim().length} characters &bull; {content.trim().split(/\s+/).filter(Boolean).length} words
                </span>
              </div>
            </div>
          </div>

          {/* Footer actions */}
          <div className="px-6 py-4 border-t bg-muted/30 flex items-center justify-between">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="gap-1.5">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving & Chunking...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  {articleToEdit ? "Update Article" : "Create & Index Article"}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

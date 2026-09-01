"use client";

import React, { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import {
  HelpCircle,
  Plus,
  Trash2,
  Edit3,
  ArrowUp,
  ArrowDown,
  BookOpen,
  X,
  Check,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface FaqItem {
  question: string;
  articleId?: Id<"articles">;
  answer?: string;
}

interface FaqManagerTabProps {
  orgId: string;
  faqItems: FaqItem[];
  onChangeFaqItems: (items: FaqItem[]) => void;
}

export function FaqManagerTab({
  orgId,
  faqItems,
  onChangeFaqItems,
}: FaqManagerTabProps) {
  const articles = useQuery(
    api.articles.list,
    orgId ? { orgId } : "skip"
  );

  const publishedArticles = articles?.filter((a) => a.isPublished) || [];

  // Editing state
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [selectedArticleId, setSelectedArticleId] = useState<string>("");

  const handleStartAdd = () => {
    setQuestion("");
    setAnswer("");
    setSelectedArticleId("");
    setEditingIndex(null);
    setIsAdding(true);
  };

  const handleStartEdit = (idx: number) => {
    const item = faqItems[idx];
    setQuestion(item.question);
    setAnswer(item.answer || "");
    setSelectedArticleId(item.articleId || "");
    setEditingIndex(idx);
    setIsAdding(false);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    const newItem: FaqItem = {
      question: question.trim(),
      answer: answer.trim() || undefined,
      articleId: selectedArticleId ? (selectedArticleId as Id<"articles">) : undefined,
    };

    if (editingIndex !== null) {
      const updated = [...faqItems];
      updated[editingIndex] = newItem;
      onChangeFaqItems(updated);
      setEditingIndex(null);
    } else {
      onChangeFaqItems([...faqItems, newItem]);
      setIsAdding(false);
    }

    setQuestion("");
    setAnswer("");
    setSelectedArticleId("");
  };

  const handleDeleteItem = (idx: number) => {
    const updated = faqItems.filter((_, i) => i !== idx);
    onChangeFaqItems(updated);
    if (editingIndex === idx) setEditingIndex(null);
  };

  const handleMoveUp = (idx: number) => {
    if (idx <= 0) return;
    const updated = [...faqItems];
    const temp = updated[idx];
    updated[idx] = updated[idx - 1];
    updated[idx - 1] = temp;
    onChangeFaqItems(updated);
  };

  const handleMoveDown = (idx: number) => {
    if (idx >= faqItems.length - 1) return;
    const updated = [...faqItems];
    const temp = updated[idx];
    updated[idx] = updated[idx + 1];
    updated[idx + 1] = temp;
    onChangeFaqItems(updated);
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <HelpCircle className="h-4 w-4 text-primary" /> Curated Top Questions & FAQs
          </label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Highlighted at the top of the widget Help & FAQs tab for instant one-click answers.
          </p>
        </div>

        {!isAdding && editingIndex === null && (
          <Button
            type="button"
            size="sm"
            onClick={handleStartAdd}
            className="text-xs rounded-xl gap-1.5 h-8.5 shrink-0"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add FAQ Question</span>
          </Button>
        )}
      </div>

      {/* Add / Edit Form Card */}
      {(isAdding || editingIndex !== null) && (
        <form
          onSubmit={handleSaveItem}
          className="p-5 rounded-2xl border-2 border-primary/30 bg-primary/5 space-y-4 animate-in fade-in duration-150"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-primary uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              {editingIndex !== null ? "Edit FAQ Item" : "Create New FAQ Item"}
            </h4>
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setEditingIndex(null);
              }}
              className="text-muted-foreground hover:text-foreground p-1 rounded-md"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Question Title <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. How do I reset my password?"
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Link to KB article */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5 text-primary" /> Link to Article (Optional)
              </label>
              <select
                value={selectedArticleId}
                onChange={(e) => setSelectedArticleId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="">No linked article (Ask in Chat)</option>
                {publishedArticles.map((art) => (
                  <option key={art._id} value={art._id}>
                    {art.title} ({art.category})
                  </option>
                ))}
              </select>
            </div>

            {/* Direct answer or chat prompt */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                Fallback Summary / Prompt
              </label>
              <input
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Optional quick answer or chat prompt"
                className="w-full px-3 py-2 text-xs rounded-xl border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-primary/10">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setIsAdding(false);
                setEditingIndex(null);
              }}
              className="text-xs rounded-xl h-8 px-3"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="text-xs rounded-xl h-8 px-4 gap-1.5"
            >
              <Check className="h-3.5 w-3.5" />
              {editingIndex !== null ? "Save Changes" : "Add FAQ"}
            </Button>
          </div>
        </form>
      )}

      {/* FAQ Items List */}
      <div className="space-y-2.5">
        {faqItems.length === 0 ? (
          <div className="p-8 rounded-2xl border border-dashed text-center bg-card">
            <HelpCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-40" />
            <h4 className="text-xs font-semibold text-foreground">No Top FAQs Added</h4>
            <p className="text-[11px] text-muted-foreground mt-1 max-w-sm mx-auto">
              Add common questions here so visitors can quickly tap them in the widget to view answers or ask in chat.
            </p>
            {!isAdding && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleStartAdd}
                className="mt-3 text-xs rounded-xl gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Your First FAQ
              </Button>
            )}
          </div>
        ) : (
          faqItems.map((item, idx) => {
            const linkedArticle = publishedArticles.find((a) => a._id === item.articleId);

            return (
              <div
                key={idx}
                className="p-3.5 rounded-xl border bg-card flex items-center justify-between gap-3 group hover:border-border/80 transition-all shadow-2xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex flex-col gap-0.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleMoveUp(idx)}
                      disabled={idx === 0}
                      className="text-muted-foreground hover:text-foreground disabled:opacity-20 p-0.5"
                      title="Move Up"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveDown(idx)}
                      disabled={idx === faqItems.length - 1}
                      className="text-muted-foreground hover:text-foreground disabled:opacity-20 p-0.5"
                      title="Move Down"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="min-w-0 space-y-0.5">
                    <div className="text-xs sm:text-sm font-semibold text-foreground truncate">
                      {item.question}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground flex-wrap">
                      {linkedArticle ? (
                        <span className="inline-flex items-center gap-1 text-primary font-medium">
                          <BookOpen className="h-3 w-3" /> Linked to: {linkedArticle.title}
                        </span>
                      ) : (
                        <span>Opens chat query</span>
                      )}
                      {item.answer && <span>&bull; {item.answer}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => handleStartEdit(idx)}
                    title="Edit Item"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => handleDeleteItem(idx)}
                    title="Delete Item"
                    className="text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

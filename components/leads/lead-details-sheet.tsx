"use client";

import React, { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  X,
  User,
  Mail,
  Phone,
  Calendar,
  MessageSquare,
  FileText,
  Save,
  CheckCircle2,
  ExternalLink,
  Edit3,
  Trash2,
  Loader2,
  Tag,
  Clock,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LeadDetailsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Doc<"leads"> | null;
  orgSlug: string;
  onEdit: (lead: Doc<"leads">) => void;
  onDelete: (lead: Doc<"leads">) => void;
}

export function LeadDetailsSheet({
  isOpen,
  onClose,
  lead,
  orgSlug,
  onEdit,
  onDelete,
}: LeadDetailsSheetProps) {
  const updateLead = useMutation(api.leads.update);
  const updateStatusMutation = useMutation(api.leads.updateStatus);

  const [notes, setNotes] = useState("");
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync notes when lead changes
  useEffect(() => {
    if (lead) {
      setNotes(lead.notes || "");
      setSaveSuccess(false);
    }
  }, [lead]);

  // Optional: fetch linked conversation if available
  const conversation = useQuery(
    api.conversations.get,
    lead?.conversationId ? { conversationId: lead.conversationId } : "skip"
  );

  if (!isOpen || !lead) return null;

  const handleSaveNotes = async () => {
    setIsSavingNotes(true);
    try {
      await updateLead({
        leadId: lead._id,
        notes: notes.trim() || undefined,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error("Failed to save notes:", err);
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleStatusChange = async (
    newStatus: "new" | "contacted" | "qualified" | "closed"
  ) => {
    try {
      await updateStatusMutation({
        leadId: lead._id,
        status: newStatus,
      });
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const statusColors: Record<string, string> = {
    new: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400",
    contacted: "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400",
    qualified: "bg-purple-500/10 text-purple-600 border-purple-500/20 dark:text-purple-400",
    closed: "bg-slate-500/10 text-slate-600 border-slate-500/20 dark:text-slate-400",
  };

  const sourceLabels: Record<string, string> = {
    widget_chat: "Widget Chat",
    widget_form: "Widget Form",
    widget: "Support Widget",
    manual: "Manual Entry",
    referral: "Referral",
    outbound: "Outbound",
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-in fade-in-0 duration-200">
      <div className="w-full max-w-xl bg-card h-full shadow-2xl border-l flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-6 border-b bg-muted/20 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg shrink-0">
              {lead.name ? lead.name.slice(0, 2).toUpperCase() : <User className="h-6 w-6" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground leading-snug">
                {lead.name || "Anonymous Contact"}
              </h2>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span
                  className={cn(
                    "text-xs font-semibold px-2.5 py-0.5 rounded-full border capitalize",
                    statusColors[lead.status] || "bg-muted text-muted-foreground"
                  )}
                >
                  {lead.status}
                </span>
                <span className="text-xs text-muted-foreground">
                  Added on {new Date(lead._creationTime).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onEdit(lead)}
              title="Edit Lead"
              className="text-muted-foreground hover:text-foreground"
            >
              <Edit3 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onDelete(lead)}
              title="Delete Lead"
              className="text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground ml-1"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Body content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Status Pipeline Selector */}
          <div className="p-4 rounded-xl border bg-muted/20 space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
              Pipeline Stage
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(["new", "contacted", "qualified", "closed"] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => handleStatusChange(st)}
                  className={cn(
                    "py-2 px-2.5 rounded-lg text-xs font-semibold capitalize transition-all border text-center cursor-pointer",
                    lead.status === st
                      ? statusColors[st] + " ring-1 ring-current shadow-xs"
                      : "bg-background border-border/60 text-muted-foreground hover:border-border hover:text-foreground"
                  )}
                >
                  {st === "closed" ? "Closed" : st}
                </button>
              ))}
            </div>
          </div>

          {/* Contact Details Card */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Contact Information
            </h3>
            <div className="rounded-xl border bg-card divide-y divide-border/60 overflow-hidden shadow-2xs">
              <div className="p-3.5 flex items-center justify-between gap-3 text-xs sm:text-sm">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" /> Email
                </span>
                {lead.email ? (
                  <a
                    href={`mailto:${lead.email}`}
                    className="font-medium text-foreground hover:text-primary transition-colors truncate max-w-[260px]"
                  >
                    {lead.email}
                  </a>
                ) : (
                  <span className="text-muted-foreground italic">Not provided</span>
                )}
              </div>

              <div className="p-3.5 flex items-center justify-between gap-3 text-xs sm:text-sm">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary" /> Phone
                </span>
                {lead.phone ? (
                  <a
                    href={`tel:${lead.phone}`}
                    className="font-medium text-foreground hover:text-primary transition-colors"
                  >
                    {lead.phone}
                  </a>
                ) : (
                  <span className="text-muted-foreground italic">Not provided</span>
                )}
              </div>

              <div className="p-3.5 flex items-center justify-between gap-3 text-xs sm:text-sm">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Tag className="h-4 w-4 text-primary" /> Source
                </span>
                <span className="font-medium text-foreground capitalize">
                  {sourceLabels[lead.source] || lead.source}
                </span>
              </div>

              <div className="p-3.5 flex items-center justify-between gap-3 text-xs sm:text-sm">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" /> Visitor ID
                </span>
                <span className="font-mono text-xs text-muted-foreground truncate max-w-[200px]">
                  {lead.visitorId}
                </span>
              </div>
            </div>
          </div>

          {/* Linked Conversation */}
          {lead.conversationId && (
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Linked Chat Session
              </h3>
              <div className="p-4 rounded-xl border bg-primary/5 border-primary/20 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">
                      Widget Conversation
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Status: {conversation?.status || "open"}
                    </div>
                  </div>
                </div>

                <Link
                  href={`/orgs/${orgSlug}/inbox?conversationId=${lead.conversationId}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
                >
                  <span>Open in Inbox</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          )}

          {/* CRM Notes */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-primary" /> Notes & Activity
              </h3>
              {saveSuccess && (
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1 animate-in fade-in">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Notes saved!
                </span>
              )}
            </div>

            <div className="rounded-xl border bg-card p-3 space-y-3 shadow-2xs">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Write background notes, call summaries, meeting outcomes, or next steps..."
                rows={5}
                className="w-full text-xs sm:text-sm bg-transparent border-0 focus:outline-none resize-none leading-relaxed text-foreground placeholder:text-muted-foreground"
              />
              <div className="flex justify-end pt-2 border-t">
                <Button
                  size="sm"
                  onClick={handleSaveNotes}
                  disabled={isSavingNotes}
                  className="text-xs rounded-lg gap-1.5"
                >
                  {isSavingNotes ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-3.5 w-3.5" /> Save Notes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-muted/20 flex items-center justify-between text-xs text-muted-foreground">
          <span>Created: {new Date(lead._creationTime).toLocaleString()}</span>
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs rounded-lg">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

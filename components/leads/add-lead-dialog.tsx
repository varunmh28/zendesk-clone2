"use client";

import React, { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { X, UserPlus, Loader2 } from "lucide-react";

interface AddLeadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  orgId: string;
}

export function AddLeadDialog({ isOpen, onClose, orgId }: AddLeadDialogProps) {
  const createLead = useMutation(api.leads.create);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"new" | "contacted" | "qualified" | "closed">("new");
  const [source, setSource] = useState("manual");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() && !email.trim() && !phone.trim()) {
      setError("Please provide at least a Name, Email, or Phone number.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await createLead({
        orgId,
        name: name.trim() || undefined,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        status,
        source: source.trim() || "manual",
        notes: notes.trim() || undefined,
      });

      setName("");
      setEmail("");
      setPhone("");
      setStatus("new");
      setSource("manual");
      setNotes("");
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to create lead. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-card border rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in-0 zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-muted/30">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">Add New Lead</h2>
              <p className="text-xs text-muted-foreground">
                Manually record a prospect or customer contact.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Contact Name <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sarah Connor"
              className="w-full px-3 py-2 text-sm rounded-xl border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sarah@example.com"
                className="w-full px-3 py-2 text-sm rounded-xl border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full px-3 py-2 text-sm rounded-xl border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Pipeline Status</label>
              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as "new" | "contacted" | "qualified" | "closed")
                }
                className="w-full px-3 py-2 text-sm rounded-xl border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="closed">Closed / Won</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Lead Source</label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="manual">Manual Entry</option>
                <option value="widget_chat">Widget Chat</option>
                <option value="widget_form">Widget Form</option>
                <option value="referral">Referral</option>
                <option value="outbound">Outbound Campaign</option>
                <option value="events">Event / Conference</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Notes & Background</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add conversation summary, company info, budget, or next steps..."
              rows={3}
              className="w-full px-3 py-2 text-sm rounded-xl border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-9 px-4 rounded-xl text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-9 px-5 rounded-xl text-xs gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <UserPlus className="h-3.5 w-3.5" />
                  Create Lead
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { X, Trash2, AlertTriangle, Loader2 } from "lucide-react";

interface DeleteLeadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Doc<"leads"> | null;
}

export function DeleteLeadDialog({ isOpen, onClose, lead }: DeleteLeadDialogProps) {
  const removeLead = useMutation(api.leads.remove);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !lead) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      await removeLead({ leadId: lead._id });
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to delete lead.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-md bg-card border rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in-0 zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-muted/30">
          <div className="flex items-center gap-2.5 text-destructive">
            <div className="h-9 w-9 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <h2 className="text-base font-semibold text-foreground">Delete Lead</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-3">
          <p className="text-sm text-foreground">
            Are you sure you want to permanently delete the lead for{" "}
            <span className="font-semibold text-foreground">
              {lead.name || lead.email || "this contact"}
            </span>
            ?
          </p>
          <p className="text-xs text-muted-foreground">
            This action cannot be undone. Any recorded notes and CRM pipeline status for this lead will be removed.
          </p>

          {error && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs">
              {error}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t bg-muted/20">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
            className="h-9 px-4 rounded-xl text-xs"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="h-9 px-5 rounded-xl text-xs gap-1.5"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-3.5 w-3.5" />
                Delete Permanently
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

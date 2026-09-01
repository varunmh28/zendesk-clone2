"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { LeadsStats } from "@/components/leads/leads-stats";
import { LeadsTable } from "@/components/leads/leads-table";
import { AddLeadDialog } from "@/components/leads/add-lead-dialog";
import { EditLeadDialog } from "@/components/leads/edit-lead-dialog";
import { LeadDetailsSheet } from "@/components/leads/lead-details-sheet";
import { DeleteLeadDialog } from "@/components/leads/delete-lead-dialog";
import { Users, UserPlus, Sparkles, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LeadsClientPage({ slug, orgId }: { slug: string; orgId: string }) {
  const { orgId: clerkOrgId } = useAuth();

  // Lookup workspace by slug or clerk orgId
  const workspaceBySlug = useQuery(api.workspaces.getBySlug, { slug });
  const workspaceByOrgId = useQuery(
    api.workspaces.getByOrgId,
    clerkOrgId ? { orgId: clerkOrgId } : "skip"
  );

  const workspace = workspaceBySlug || workspaceByOrgId;
  const effectiveOrgId = workspace?.orgId || clerkOrgId || slug;

  // Selected status filter for top stat cards sync
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // Dialog & Sheet states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [viewingLead, setViewingLead] = useState<Doc<"leads"> | null>(null);
  const [editingLead, setEditingLead] = useState<Doc<"leads"> | null>(null);
  const [deletingLead, setDeletingLead] = useState<Doc<"leads"> | null>(null);

  // Queries
  const leads = useQuery(
    api.leads.list,
    effectiveOrgId
      ? {
          orgId: effectiveOrgId,
          status: selectedStatus !== "all" ? (selectedStatus as any) : undefined,
        }
      : "skip"
  );

  const stats = useQuery(
    api.leads.getStats,
    effectiveOrgId ? { orgId: effectiveOrgId } : "skip"
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Leads & CRM Pipeline
            </h1>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              <Sparkles className="h-3 w-3" /> Live Capture
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Track, qualify, and manage leads captured from your live chat support widget and marketing campaigns.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={() => setIsAddOpen(true)}
            className="rounded-xl text-xs gap-1.5 h-9"
          >
            <UserPlus className="h-4 w-4" />
            <span>Add Lead</span>
          </Button>
        </div>
      </div>

      {/* Top Metric Stat Cards */}
      <LeadsStats
        stats={stats}
        selectedStatus={selectedStatus}
        onSelectStatus={(status) => setSelectedStatus(status)}
      />

      {/* Main Leads Table & Filters */}
      <LeadsTable
        leads={leads}
        orgSlug={slug}
        selectedStatus={selectedStatus}
        onSelectStatus={setSelectedStatus}
        onAddLead={() => setIsAddOpen(true)}
        onViewLead={(lead) => setViewingLead(lead)}
        onEditLead={(lead) => setEditingLead(lead)}
        onDeleteLead={(lead) => setDeletingLead(lead)}
      />

      {/* Add Lead Dialog */}
      {effectiveOrgId && (
        <AddLeadDialog
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          orgId={effectiveOrgId}
        />
      )}

      {/* Edit Lead Dialog */}
      <EditLeadDialog
        isOpen={!!editingLead}
        onClose={() => setEditingLead(null)}
        lead={editingLead}
      />

      {/* Lead Details Drawer Sheet */}
      <LeadDetailsSheet
        isOpen={!!viewingLead}
        onClose={() => setViewingLead(null)}
        lead={viewingLead}
        orgSlug={slug}
        onEdit={(lead) => {
          setViewingLead(null);
          setEditingLead(lead);
        }}
        onDelete={(lead) => {
          setViewingLead(null);
          setDeletingLead(lead);
        }}
      />

      {/* Delete Lead Dialog */}
      <DeleteLeadDialog
        isOpen={!!deletingLead}
        onClose={() => setDeletingLead(null)}
        lead={deletingLead}
      />
    </div>
  );
}
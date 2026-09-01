"use client";

import React, { useState, useMemo } from "react";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Filter,
  Download,
  Plus,
  User,
  Mail,
  Phone,
  Calendar,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit3,
  Trash2,
  FileSpreadsheet,
  ArrowUpDown,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { exportLeadsToCsv } from "./leads-csv-export";

interface LeadsTableProps {
  leads: Doc<"leads">[] | undefined;
  orgSlug: string;
  onAddLead: () => void;
  onViewLead: (lead: Doc<"leads">) => void;
  onEditLead: (lead: Doc<"leads">) => void;
  onDeleteLead: (lead: Doc<"leads">) => void;
  selectedStatus: string;
  onSelectStatus: (status: string) => void;
}

export function LeadsTable({
  leads,
  orgSlug,
  onAddLead,
  onViewLead,
  onEditLead,
  onDeleteLead,
  selectedStatus,
  onSelectStatus,
}: LeadsTableProps) {
  const updateStatusMutation = useMutation(api.leads.updateStatus);

  // Filters and search
  const [searchQuery, setSearchQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [sortField, setSortField] = useState<"name" | "status" | "createdAt">("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Active action menu row ID
  const [activeMenuId, setActiveMenuId] = useState<Id<"leads"> | null>(null);

  // Filter and sort leads
  const filteredLeads = useMemo(() => {
    if (!leads) return [];

    let list = [...leads];

    // Status filter
    if (selectedStatus && selectedStatus !== "all") {
      list = list.filter((l) => l.status === selectedStatus);
    }

    // Source filter
    if (sourceFilter && sourceFilter !== "all") {
      list = list.filter((l) => (l.source || "manual").toLowerCase() === sourceFilter.toLowerCase());
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (l) =>
          (l.name && l.name.toLowerCase().includes(q)) ||
          (l.email && l.email.toLowerCase().includes(q)) ||
          (l.phone && l.phone.toLowerCase().includes(q)) ||
          (l.notes && l.notes.toLowerCase().includes(q))
      );
    }

    // Sorting
    list.sort((a, b) => {
      let comparison = 0;
      if (sortField === "name") {
        comparison = (a.name || "").localeCompare(b.name || "");
      } else if (sortField === "status") {
        comparison = (a.status || "").localeCompare(b.status || "");
      } else {
        comparison = a._creationTime - b._creationTime;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return list;
  }, [leads, selectedStatus, sourceFilter, searchQuery, sortField, sortOrder]);

  // Paginated slice
  const totalPages = Math.max(1, Math.ceil(filteredLeads.length / pageSize));
  const paginatedLeads = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLeads.slice(start, start + pageSize);
  }, [filteredLeads, currentPage, pageSize]);

  const handleSort = (field: "name" | "status" | "createdAt") => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const handleStatusChange = async (
    leadId: Id<"leads">,
    newStatus: "new" | "contacted" | "qualified" | "closed"
  ) => {
    try {
      await updateStatusMutation({
        leadId,
        status: newStatus,
      });
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const handleExportCsv = () => {
    if (!filteredLeads.length) return;
    const formatted = filteredLeads.map((l) => ({
      id: l._id,
      name: l.name,
      email: l.email,
      phone: l.phone,
      status: l.status,
      source: l.source,
      notes: l.notes,
      createdAt: new Date(l._creationTime).toISOString(),
      createdDate: new Date(l._creationTime).toLocaleDateString(),
    }));
    exportLeadsToCsv(formatted, orgSlug);
  };

  const statusColors: Record<string, string> = {
    new: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400",
    contacted: "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400",
    qualified: "bg-purple-500/10 text-purple-600 border-purple-500/20 dark:text-purple-400",
    closed: "bg-slate-500/10 text-slate-600 border-slate-500/20 dark:text-slate-400",
  };

  const sourceBadges: Record<string, { label: string; className: string }> = {
    widget_chat: {
      label: "Widget Chat",
      className: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    },
    widget_form: {
      label: "Widget Form",
      className: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
    },
    widget: {
      label: "Widget",
      className: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    },
    manual: {
      label: "Manual",
      className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    },
    referral: {
      label: "Referral",
      className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    },
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-card p-3.5 rounded-xl border">
        {/* Search & Filters */}
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search leads by name, email, phone, or notes..."
              className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm rounded-lg border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          {/* Status filter dropdown */}
          <select
            value={selectedStatus}
            onChange={(e) => {
              onSelectStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 text-xs sm:text-sm rounded-lg border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="all">All Statuses</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="closed">Closed</option>
          </select>

          {/* Source filter */}
          <select
            value={sourceFilter}
            onChange={(e) => {
              setSourceFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 text-xs sm:text-sm rounded-lg border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="all">All Sources</option>
            <option value="widget_chat">Widget Chat</option>
            <option value="widget_form">Widget Form</option>
            <option value="widget">Widget (General)</option>
            <option value="manual">Manual</option>
            <option value="referral">Referral</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            disabled={!filteredLeads.length}
            className="text-xs rounded-lg gap-1.5 h-8.5"
            title="Download formatted CSV spreadsheet"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </Button>

          <Button
            size="sm"
            onClick={onAddLead}
            className="text-xs rounded-lg gap-1.5 h-8.5"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Lead</span>
          </Button>
        </div>
      </div>

      {/* Leads Table Card */}
      <div className="rounded-xl border bg-card overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="border-b bg-muted/40 text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                <th
                  onClick={() => handleSort("name")}
                  className="py-3 px-4 cursor-pointer hover:text-foreground transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Contact</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Source</th>
                <th
                  onClick={() => handleSort("status")}
                  className="py-3 px-4 cursor-pointer hover:text-foreground transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Pipeline Status</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("createdAt")}
                  className="py-3 px-4 cursor-pointer hover:text-foreground transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Captured Date</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border/60">
              {leads === undefined ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground text-xs">
                    Loading CRM leads...
                  </td>
                </tr>
              ) : paginatedLeads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto space-y-2">
                      <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-1">
                        <User className="h-5 w-5" />
                      </div>
                      <h4 className="text-sm font-semibold text-foreground">No leads found</h4>
                      <p className="text-xs text-muted-foreground">
                        {searchQuery || selectedStatus !== "all" || sourceFilter !== "all"
                          ? "No leads matched your filter criteria. Try clearing search filters."
                          : "Start capturing leads directly through your support chat widget or add one manually."}
                      </p>
                      <Button
                        size="sm"
                        onClick={onAddLead}
                        className="mt-3 text-xs rounded-lg gap-1.5"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add First Lead
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedLeads.map((lead) => {
                  const sourceConfig = sourceBadges[lead.source] || {
                    label: lead.source || "Manual",
                    className: "bg-muted text-muted-foreground border-border",
                  };

                  return (
                    <tr
                      key={lead._id}
                      className="hover:bg-muted/30 transition-colors group cursor-pointer"
                      onClick={() => onViewLead(lead)}
                    >
                      {/* Name */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                            {lead.name ? lead.name.slice(0, 2).toUpperCase() : <User className="h-4 w-4" />}
                          </div>
                          <div>
                            <div className="font-semibold text-foreground">
                              {lead.name || "Anonymous Contact"}
                            </div>
                            {lead.notes && (
                              <div className="text-[11px] text-muted-foreground line-clamp-1 max-w-[180px]">
                                {lead.notes}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-3 px-4">
                        {lead.email ? (
                          <span className="text-foreground font-medium">{lead.email}</span>
                        ) : (
                          <span className="text-muted-foreground italic text-xs">-</span>
                        )}
                      </td>

                      {/* Phone */}
                      <td className="py-3 px-4">
                        {lead.phone ? (
                          <span className="text-foreground font-mono text-xs">{lead.phone}</span>
                        ) : (
                          <span className="text-muted-foreground italic text-xs">-</span>
                        )}
                      </td>

                      {/* Source */}
                      <td className="py-3 px-4">
                        <span
                          className={cn(
                            "inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full border",
                            sourceConfig.className
                          )}
                        >
                          {sourceConfig.label}
                        </span>
                      </td>

                      {/* Status Dropdown (inline mutation) */}
                      <td
                        className="py-3 px-4"
                        onClick={(e) => e.stopPropagation()} // Prevent row click
                      >
                        <select
                          value={lead.status}
                          onChange={(e) =>
                            handleStatusChange(
                              lead._id,
                              e.target.value as "new" | "contacted" | "qualified" | "closed"
                            )
                          }
                          className={cn(
                            "text-xs font-semibold px-2.5 py-1 rounded-lg border capitalize focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer",
                            statusColors[lead.status] || "bg-muted text-muted-foreground"
                          )}
                        >
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="qualified">Qualified</option>
                          <option value="closed">Closed</option>
                        </select>
                      </td>

                      {/* Created Date */}
                      <td className="py-3 px-4 text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(lead._creationTime).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>

                      {/* Actions */}
                      <td
                        className="py-3 px-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => onViewLead(lead)}
                            title="View Lead Details & Notes"
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => onEditLead(lead)}
                            title="Edit Contact"
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => onDeleteLead(lead)}
                            title="Delete Lead"
                            className="text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        {filteredLeads.length > 0 && (
          <div className="p-3.5 border-t bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 rounded-md border bg-background text-foreground text-xs"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span className="hidden sm:inline">
                &bull; Showing {(currentPage - 1) * pageSize + 1} to{" "}
                {Math.min(currentPage * pageSize, filteredLeads.length)} of {filteredLeads.length} leads
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-medium">
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon-xs"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon-xs"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

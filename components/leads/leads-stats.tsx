"use client";

import React from "react";
import { Users, UserPlus, PhoneCall, CheckCircle, Archive } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeadsStatsProps {
  stats?: {
    total: number;
    newCount: number;
    contactedCount: number;
    qualifiedCount: number;
    closedCount: number;
  };
  selectedStatus?: string;
  onSelectStatus?: (status: string) => void;
}

export function LeadsStats({
  stats = { total: 0, newCount: 0, contactedCount: 0, qualifiedCount: 0, closedCount: 0 },
  selectedStatus = "all",
  onSelectStatus,
}: LeadsStatsProps) {
  const cards = [
    {
      id: "all",
      label: "Total Leads",
      count: stats.total,
      icon: Users,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-950/40",
      borderColor: "border-blue-200 dark:border-blue-900",
      activeRing: "ring-2 ring-blue-500",
    },
    {
      id: "new",
      label: "New Leads",
      count: stats.newCount,
      icon: UserPlus,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-950/40",
      borderColor: "border-emerald-200 dark:border-emerald-900",
      activeRing: "ring-2 ring-emerald-500",
    },
    {
      id: "contacted",
      label: "Contacted",
      count: stats.contactedCount,
      icon: PhoneCall,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-950/40",
      borderColor: "border-amber-200 dark:border-amber-900",
      activeRing: "ring-2 ring-amber-500",
    },
    {
      id: "qualified",
      label: "Qualified",
      count: stats.qualifiedCount,
      icon: CheckCircle,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-50 dark:bg-purple-950/40",
      borderColor: "border-purple-200 dark:border-purple-900",
      activeRing: "ring-2 ring-purple-500",
    },
    {
      id: "closed",
      label: "Closed / Won",
      count: stats.closedCount,
      icon: Archive,
      color: "text-slate-600 dark:text-slate-400",
      bg: "bg-slate-100 dark:bg-slate-900/60",
      borderColor: "border-slate-200 dark:border-slate-800",
      activeRing: "ring-2 ring-slate-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
      {cards.map((card) => {
        const Icon = card.icon;
        const isSelected = selectedStatus === card.id;

        return (
          <button
            key={card.id}
            type="button"
            onClick={() => onSelectStatus?.(card.id)}
            className={cn(
              "p-4 rounded-xl border bg-card text-left transition-all hover:shadow-sm cursor-pointer relative overflow-hidden",
              isSelected ? `${card.activeRing} shadow-sm` : "border-border/60 hover:border-border"
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">{card.label}</span>
              <div className={cn("p-2 rounded-lg shrink-0", card.bg, card.color)}>
                <Icon className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-bold tracking-tight text-foreground">
              {card.count}
            </div>
          </button>
        );
      })}
    </div>
  );
}

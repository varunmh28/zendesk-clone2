"use client";

import { useState } from "react";
import { Search, X, Inbox, InboxIcon, MessageSquare, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ConversationCard, ConversationItem } from "./conversation-card";
import { cn } from "@/lib/utils";

export type FilterTab = "all" | "unassigned" | "mine" | "closed";

interface ConversationListProps {
  conversations: ConversationItem[];
  selectedConversationId?: string;
  onSelectConversation: (conv: ConversationItem) => void;
  currentFilter: FilterTab;
  onFilterChange: (filter: FilterTab) => void;
  searchQuery: string;
  onSearchChange: (search: string) => void;
  stats?: {
    open: number;
    unassigned: number;
    assignedToMe: number;
    unread: number;
  };
  isLoading?: boolean;
}

export function ConversationList({
  conversations,
  selectedConversationId,
  onSelectConversation,
  currentFilter,
  onFilterChange,
  searchQuery,
  onSearchChange,
  stats,
  isLoading,
}: ConversationListProps) {
  const tabs: Array<{ id: FilterTab; label: string; count?: number }> = [
    { id: "all", label: "Open", count: stats?.open },
    { id: "unassigned", label: "Unassigned", count: stats?.unassigned },
    { id: "mine", label: "Mine", count: stats?.assignedToMe },
    { id: "closed", label: "Closed" },
  ];

  return (
    <div className="flex flex-col h-full bg-card border-r w-full md:w-80 lg:w-96 shrink-0">
      {/* Top Header with Live Badge counts */}
      <div className="p-3.5 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="font-semibold text-base text-foreground">Inbox</h1>
          {stats && stats.unread > 0 && (
            <Badge
              variant="default"
              className="bg-blue-600 hover:bg-blue-600 text-white text-[11px] h-5 px-1.5"
            >
              {stats.unread} new
            </Badge>
          )}
        </div>

        {stats && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span>{stats.open} open</span>
          </div>
        )}
      </div>

      {/* Search Bar */}
      <div className="p-3 border-b bg-muted/20">
        <div className="relative flex items-center">
          <Search className="absolute left-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search visitor, email, subject..."
            className="w-full rounded-md border bg-background pl-8 pr-8 py-1.5 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center px-2 py-1.5 border-b bg-muted/10 gap-1 overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = currentFilter === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onFilterChange(tab.id)}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all whitespace-nowrap",
                isActive
                  ? "bg-background text-foreground shadow-xs border"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span
                  className={cn(
                    "text-[10px] px-1 rounded-full",
                    isActive
                      ? "bg-primary/10 text-primary font-bold"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto divide-y divide-border/40">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-muted-foreground">
            Loading conversations...
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground text-xs h-64">
            <Inbox className="h-8 w-8 mb-2 opacity-30" />
            <p className="font-medium text-foreground text-sm">No conversations</p>
            <p className="mt-1 max-w-[200px]">
              {searchQuery
                ? "No conversations match your search filter."
                : currentFilter === "closed"
                ? "No closed conversations."
                : currentFilter === "unassigned"
                ? "No unassigned conversations."
                : currentFilter === "mine"
                ? "No conversations assigned to you."
                : "No open conversations in inbox."}
            </p>
          </div>
        ) : (
          conversations.map((conv) => (
            <ConversationCard
              key={conv._id}
              conversation={conv}
              isSelected={selectedConversationId === conv._id}
              onSelect={onSelectConversation}
            />
          ))
        )}
      </div>
    </div>
  );
}

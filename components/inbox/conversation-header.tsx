"use client";

import { useState } from "react";
import {
  User,
  Mail,
  Phone,
  CheckCircle2,
  XCircle,
  UserCheck,
  UserX,
  ChevronDown,
  ShieldAlert,
  Bot,
  UserPlus,
  RefreshCw,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Id, Doc } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";

interface ConversationHeaderProps {
  conversation: {
    _id: Id<"conversations">;
    orgId: string;
    visitorId: string;
    visitorName?: string;
    visitorEmail?: string;
    visitorPhone?: string;
    subject?: string;
    status: "open" | "closed";
    assigneeId?: Id<"users">;
    handedToHuman: boolean;
    isRead: boolean;
    assignee?: {
      _id: Id<"users">;
      name: string;
      email: string;
      avatarUrl?: string;
      role: string;
    } | null;
  };
  orgUsers: Array<Doc<"users">>;
  onAssign: (assigneeId?: Id<"users">) => Promise<void>;
  onSetStatus: (status: "open" | "closed") => Promise<void>;
  onSetHandedToHuman: (handedToHuman: boolean) => Promise<void>;
}

export function ConversationHeader({
  conversation,
  orgUsers,
  onAssign,
  onSetStatus,
  onSetHandedToHuman,
}: ConversationHeaderProps) {
  const [isAssigneeMenuOpen, setIsAssigneeMenuOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const visitorName = conversation.visitorName || "Anonymous Visitor";
  const visitorInitials = visitorName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleAssign = async (userId?: Id<"users">) => {
    setIsAssigneeMenuOpen(false);
    setIsUpdating(true);
    try {
      await onAssign(userId);
    } finally {
      setIsUpdating(false);
    }
  };

  const toggleStatus = async () => {
    setIsUpdating(true);
    try {
      await onSetStatus(conversation.status === "open" ? "closed" : "open");
    } finally {
      setIsUpdating(false);
    }
  };

  const toggleHandedToHuman = async () => {
    setIsUpdating(true);
    try {
      await onSetHandedToHuman(!conversation.handedToHuman);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b bg-card px-4 py-3 gap-3">
      {/* Visitor Profile & Meta */}
      <div className="flex items-center gap-3 min-w-0">
        <Avatar size="lg" className="border">
          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
            {visitorInitials || <User className="h-4 w-4" />}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="font-semibold text-foreground text-sm sm:text-base truncate">
              {visitorName}
            </h2>
            <Badge
              variant={conversation.status === "open" ? "default" : "secondary"}
              className={cn(
                "capitalize text-[11px] font-medium",
                conversation.status === "open"
                  ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/20"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {conversation.status === "open" ? "Open" : "Closed"}
            </Badge>

            {conversation.handedToHuman ? (
              <Badge
                variant="outline"
                className="bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[11px] gap-1"
              >
                <UserCheck className="h-3 w-3" />
                Human Handover
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30 text-[11px] gap-1"
              >
                <Bot className="h-3 w-3" />
                AI Active
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5 flex-wrap">
            {conversation.visitorEmail && (
              <span className="flex items-center gap-1">
                <Mail className="h-3 w-3" />
                <span className="truncate max-w-[180px]">
                  {conversation.visitorEmail}
                </span>
              </span>
            )}
            {conversation.visitorPhone && (
              <span className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                <span>{conversation.visitorPhone}</span>
              </span>
            )}
            <span className="text-[11px] text-muted-foreground/70">
              ID: {conversation.visitorId.slice(0, 10)}...
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
        {/* Assignee Selector Dropdown */}
        <div className="relative">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsAssigneeMenuOpen(!isAssigneeMenuOpen)}
            disabled={isUpdating}
            className="gap-1.5 text-xs h-8 border-dashed"
          >
            {conversation.assignee ? (
              <>
                <Avatar size="sm" className="size-4">
                  {conversation.assignee.avatarUrl && (
                    <AvatarImage
                      src={conversation.assignee.avatarUrl}
                      alt={conversation.assignee.name}
                    />
                  )}
                  <AvatarFallback className="text-[9px]">
                    {conversation.assignee.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="max-w-[100px] truncate">
                  {conversation.assignee.name}
                </span>
              </>
            ) : (
              <>
                <UserPlus className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Unassigned</span>
              </>
            )}
            <ChevronDown className="h-3 w-3 opacity-60 ml-0.5" />
          </Button>

          {isAssigneeMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsAssigneeMenuOpen(false)}
              />
              <div className="absolute right-0 mt-1 w-52 rounded-lg border bg-popover p-1 shadow-lg z-50 text-popover-foreground animate-in fade-in-50 zoom-in-95">
                <div className="px-2 py-1.5 text-[11px] font-semibold text-muted-foreground">
                  Assign to Agent
                </div>
                <div className="h-px bg-border my-1" />
                <button
                  type="button"
                  onClick={() => handleAssign(undefined)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors hover:bg-accent",
                    !conversation.assigneeId ? "font-semibold bg-muted/60" : ""
                  )}
                >
                  <UserX className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Unassigned</span>
                </button>
                <div className="max-h-48 overflow-y-auto space-y-0.5 mt-0.5">
                  {orgUsers.map((user) => (
                    <button
                      key={user._id}
                      type="button"
                      onClick={() => handleAssign(user._id)}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors hover:bg-accent",
                        conversation.assigneeId === user._id
                          ? "font-semibold bg-muted/60"
                          : ""
                      )}
                    >
                      <Avatar size="sm" className="size-4">
                        {user.avatarUrl && (
                          <AvatarImage src={user.avatarUrl} alt={user.name} />
                        )}
                        <AvatarFallback className="text-[9px]">
                          {user.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="truncate">{user.name}</span>
                      {conversation.assigneeId === user._id && (
                        <span className="ml-auto text-primary text-xs">&bull;</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Handover Toggle */}
        <Button
          size="sm"
          variant={conversation.handedToHuman ? "secondary" : "outline"}
          onClick={toggleHandedToHuman}
          disabled={isUpdating}
          title={
            conversation.handedToHuman
              ? "Re-enable AI automated responses"
              : "Hand over to human agent"
          }
          className="text-xs h-8 gap-1.5"
        >
          {conversation.handedToHuman ? (
            <>
              <Bot className="h-3.5 w-3.5 text-indigo-500" />
              <span className="hidden md:inline">Return to AI</span>
            </>
          ) : (
            <>
              <UserCheck className="h-3.5 w-3.5 text-amber-600" />
              <span className="hidden md:inline">Take Over</span>
            </>
          )}
        </Button>

        {/* Status Toggle (Close / Reopen) */}
        <Button
          size="sm"
          variant={conversation.status === "open" ? "default" : "outline"}
          onClick={toggleStatus}
          disabled={isUpdating}
          className={cn(
            "text-xs h-8 gap-1.5",
            conversation.status === "open"
              ? "bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900"
              : "border-dashed"
          )}
        >
          {conversation.status === "open" ? (
            <>
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Close</span>
            </>
          ) : (
            <>
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Reopen</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

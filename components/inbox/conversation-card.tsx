"use client";

import { User, Lock, Bot, UserCheck } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatTimeAgo } from "./presence-utils";
import { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";

export interface ConversationItem {
  _id: Id<"conversations">;
  _creationTime: number;
  orgId: string;
  visitorId: string;
  visitorName?: string;
  visitorEmail?: string;
  visitorPhone?: string;
  status: "open" | "closed";
  assigneeId?: Id<"users">;
  handedToHuman: boolean;
  isRead: boolean;
  subject?: string;
  source: "widget" | "api";
  latestMessage?: {
    content: string;
    _creationTime: number;
    role: "visitor" | "agent" | "ai";
    isInternalNote: boolean;
  } | null;
  assignee?: {
    _id: Id<"users">;
    name: string;
    email: string;
    avatarUrl?: string;
    role: string;
  } | null;
}

interface ConversationCardProps {
  conversation: ConversationItem;
  isSelected: boolean;
  onSelect: (conv: ConversationItem) => void;
}

export function ConversationCard({
  conversation,
  isSelected,
  onSelect,
}: ConversationCardProps) {
  const visitorName = conversation.visitorName || "Visitor";
  const visitorInitials = visitorName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const timestamp = conversation.latestMessage
    ? conversation.latestMessage._creationTime
    : conversation._creationTime;

  const timeAgo = formatTimeAgo(timestamp);

  let messagePreview = conversation.latestMessage?.content || "No messages yet";
  if (conversation.latestMessage?.isInternalNote) {
    messagePreview = `[Internal Note] ${messagePreview}`;
  }

  return (
    <button
      type="button"
      onClick={() => onSelect(conversation)}
      className={cn(
        "flex w-full items-start gap-3 p-3.5 text-left border-b transition-all relative select-none",
        isSelected
          ? "bg-primary/5 border-l-4 border-l-primary"
          : "hover:bg-muted/50 border-l-4 border-l-transparent",
        !conversation.isRead && "bg-blue-500/5 font-medium"
      )}
    >
      {/* Unread dot indicator */}
      {!conversation.isRead && (
        <span className="absolute top-4 right-3.5 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600"></span>
        </span>
      )}

      {/* Avatar */}
      <div className="relative mt-0.5 shrink-0">
        <Avatar size="default" className="border">
          <AvatarFallback
            className={cn(
              "text-xs font-semibold",
              !conversation.isRead
                ? "bg-primary/20 text-primary"
                : "bg-muted text-muted-foreground"
            )}
          >
            {visitorInitials || <User className="h-3.5 w-3.5" />}
          </AvatarFallback>
        </Avatar>

        {conversation.handedToHuman && (
          <span
            className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-white text-[9px] shadow-xs"
            title="Handed over to human"
          >
            <UserCheck className="h-2.5 w-2.5" />
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pr-2">
        <div className="flex items-center justify-between gap-1 mb-1">
          <span
            className={cn(
              "truncate text-sm",
              !conversation.isRead ? "font-semibold text-foreground" : "text-foreground font-medium"
            )}
          >
            {visitorName}
          </span>
          <span className="text-[11px] text-muted-foreground shrink-0">
            {timeAgo}
          </span>
        </div>

        {conversation.subject && (
          <p className="text-xs font-medium text-foreground/90 truncate mb-0.5">
            {conversation.subject}
          </p>
        )}

        <p
          className={cn(
            "text-xs line-clamp-1 break-all",
            conversation.latestMessage?.isInternalNote
              ? "text-amber-600 dark:text-amber-400 font-medium"
              : !conversation.isRead
              ? "text-foreground font-normal"
              : "text-muted-foreground"
          )}
        >
          {messagePreview}
        </p>

        {/* Badges / Assignee footer */}
        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
          {conversation.status === "closed" && (
            <Badge variant="outline" className="text-[10px] h-4.5 px-1.5 py-0 text-muted-foreground">
              Closed
            </Badge>
          )}

          {conversation.assignee ? (
            <div className="flex items-center gap-1 rounded-full bg-muted/80 px-2 py-0.5 text-[10px] text-muted-foreground border">
              <Avatar size="sm" className="size-3.5">
                {conversation.assignee.avatarUrl && (
                  <AvatarImage
                    src={conversation.assignee.avatarUrl}
                    alt={conversation.assignee.name}
                  />
                )}
                <AvatarFallback className="text-[8px]">
                  {conversation.assignee.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="truncate max-w-[80px]">
                {conversation.assignee.name}
              </span>
            </div>
          ) : (
            <span className="text-[10px] text-muted-foreground/70">
              Unassigned
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

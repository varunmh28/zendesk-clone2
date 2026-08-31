"use client";

import { Eye, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Id } from "@/convex/_generated/dataModel";

interface PresenceBarProps {
  currentSessionId: string;
  currentUserId?: Id<"users">;
  presenceSessions: Array<{
    sessionId: string;
    userId: Id<"users">;
    isTyping: boolean;
    lastHeartbeat: number;
    user: {
      _id: Id<"users">;
      name: string;
      email: string;
      avatarUrl?: string;
      role: string;
    } | null;
  }>;
}

export function PresenceBar({
  currentSessionId,
  currentUserId,
  presenceSessions,
}: PresenceBarProps) {
  // Filter other sessions viewing this conversation
  const otherSessions = presenceSessions.filter(
    (s) => s.sessionId !== currentSessionId
  );

  const typingSessions = otherSessions.filter((s) => s.isTyping);
  const viewingSessions = otherSessions.filter((s) => !s.isTyping);

  if (otherSessions.length === 0) {
    return null;
  }

  // Deduplicate by userId for display
  const uniqueTypingUsers = Array.from(
    new Map(
      typingSessions
        .filter((s) => s.user)
        .map((s) => [s.userId, s.user!])
    ).values()
  );

  const uniqueViewingUsers = Array.from(
    new Map(
      viewingSessions
        .filter((s) => s.user)
        .map((s) => [s.userId, s.user!])
    ).values()
  );

  return (
    <div className="flex items-center justify-between px-4 py-1.5 bg-muted/40 border-t border-b text-xs text-muted-foreground transition-all">
      <div className="flex items-center gap-2">
        {uniqueTypingUsers.length > 0 ? (
          <div className="flex items-center gap-1.5 text-primary font-medium">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span>
              {uniqueTypingUsers.map((u) => u.name).join(", ")}{" "}
              {uniqueTypingUsers.length > 1 ? "are" : "is"} typing...
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <Eye className="h-3.5 w-3.5 text-muted-foreground" />
            <span>
              {uniqueViewingUsers.length > 0 ? (
                <>
                  {uniqueViewingUsers.map((u) => u.name).join(", ")}{" "}
                  {uniqueViewingUsers.length > 1 ? "are" : "is"} also viewing
                </>
              ) : (
                "Team member is viewing"
              )}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center -space-x-1.5">
        {otherSessions.map((s) => {
          if (!s.user) return null;
          const initials = s.user.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();

          return (
            <div
              key={s.sessionId}
              title={`${s.user.name} (${s.isTyping ? "Typing..." : "Viewing"})`}
              className="relative"
            >
              <Avatar size="sm" className="ring-1 ring-background border">
                {s.user.avatarUrl && <AvatarImage src={s.user.avatarUrl} alt={s.user.name} />}
                <AvatarFallback className="text-[10px] bg-secondary font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>
              {s.isTyping && (
                <span className="absolute -bottom-0.5 -right-0.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500 ring-1 ring-background"></span>
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

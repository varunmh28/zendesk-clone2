"use client";

import { Lock, Bot, Sparkles, BookOpen, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatExactTime } from "./presence-utils";
import { Id } from "@/convex/_generated/dataModel";

export interface MessageItem {
  _id: Id<"messages">;
  _creationTime: number;
  role: "visitor" | "agent" | "ai";
  content: string;
  isInternalNote: boolean;
  authorId?: Id<"users">;
  author?: {
    _id: Id<"users">;
    name: string;
    email: string;
    avatarUrl?: string;
    role: string;
  } | null;
  citations?: Array<{
    articleId?: Id<"articles">;
    chunkId?: Id<"kbChunks">;
    title: string;
    excerpt: string;
  }>;
}

interface MessageBubbleProps {
  message: MessageItem;
  visitorName?: string;
}

export function MessageBubble({ message, visitorName }: MessageBubbleProps) {
  const isVisitor = message.role === "visitor";
  const isAgent = message.role === "agent";
  const isAI = message.role === "ai";
  const isInternalNote = message.isInternalNote;

  const timeString = formatExactTime(message._creationTime);

  // 1. Internal Note
  if (isInternalNote) {
    const authorName = message.author?.name ?? "Team Member";
    const authorInitials = authorName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    return (
      <div className="flex flex-col my-3 max-w-[85%] mx-auto w-full">
        <div className="rounded-lg border border-amber-500/30 bg-amber-50/80 dark:bg-amber-950/20 p-3.5 shadow-xs text-amber-950 dark:text-amber-100">
          <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-amber-500/20 text-xs text-amber-700 dark:text-amber-300">
            <div className="flex items-center gap-1.5 font-medium">
              <Lock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
              <span>Internal note</span>
              <span className="text-amber-600/60 dark:text-amber-400/60">•</span>
              <span>Only visible to team</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-amber-900 dark:text-amber-200">
                {authorName}
              </span>
              <span>{timeString}</span>
            </div>
          </div>
          <p className="text-sm whitespace-pre-wrap leading-relaxed">
            {message.content}
          </p>
        </div>
      </div>
    );
  }

  // 2. AI Message with Citations
  if (isAI) {
    return (
      <div className="flex items-start gap-3 my-3 max-w-[85%] self-start">
        <Avatar size="default" className="mt-0.5 border border-indigo-200 bg-indigo-50 dark:bg-indigo-950/50">
          <AvatarFallback className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200">
            <Bot className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-col gap-1.5 flex-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-indigo-500" />
              AI Assistant
            </span>
            <span>{timeString}</span>
          </div>

          <div className="rounded-2xl rounded-tl-sm bg-card border px-4 py-3 text-sm leading-relaxed shadow-xs text-card-foreground">
            <p className="whitespace-pre-wrap">{message.content}</p>

            {message.citations && message.citations.length > 0 && (
              <div className="mt-3 pt-2.5 border-t border-border/60 space-y-1.5">
                <div className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                  <BookOpen className="h-3 w-3" />
                  <span>Sources & Citations</span>
                </div>
                <div className="grid gap-1.5">
                  {message.citations.map((c, idx) => (
                    <div
                      key={idx}
                      className="rounded bg-muted/60 p-2 text-xs border border-border/40"
                    >
                      <div className="font-medium text-foreground">{c.title}</div>
                      <div className="text-muted-foreground line-clamp-2 mt-0.5">
                        {c.excerpt}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 3. Agent Message (Right-aligned)
  if (isAgent) {
    const authorName = message.author?.name ?? "Agent";
    const authorInitials = authorName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    return (
      <div className="flex items-start gap-2.5 my-2.5 max-w-[80%] self-end flex-row-reverse">
        <Avatar size="default" className="mt-0.5 shrink-0 border">
          {message.author?.avatarUrl && (
            <AvatarImage src={message.author.avatarUrl} alt={authorName} />
          )}
          <AvatarFallback className="bg-primary/10 text-primary font-medium text-xs">
            {authorInitials}
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground px-1">
            <span className="font-medium text-foreground">{authorName}</span>
            <span>{timeString}</span>
          </div>

          <div className="rounded-2xl rounded-tr-sm bg-primary text-primary-foreground px-4 py-2.5 text-sm leading-relaxed shadow-xs break-words">
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>
        </div>
      </div>
    );
  }

  // 4. Visitor Message (Left-aligned)
  const name = visitorName || "Visitor";
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex items-start gap-2.5 my-2.5 max-w-[80%] self-start">
      <Avatar size="default" className="mt-0.5 shrink-0 border bg-muted">
        <AvatarFallback className="bg-muted-foreground/10 text-muted-foreground font-medium text-xs">
          {initials || <User className="h-3.5 w-3.5" />}
        </AvatarFallback>
      </Avatar>

      <div className="flex flex-col items-start gap-1">
        <div className="flex items-center gap-2 text-xs text-muted-foreground px-1">
          <span className="font-medium text-foreground">{name}</span>
          <span>{timeString}</span>
        </div>

        <div className="rounded-2xl rounded-tl-sm bg-muted/70 text-foreground border border-border/50 px-4 py-2.5 text-sm leading-relaxed shadow-xs break-words">
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    </div>
  );
}

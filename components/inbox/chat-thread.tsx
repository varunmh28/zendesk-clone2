"use client";

import { useEffect, useRef } from "react";
import { MessageBubble, MessageItem } from "./message-bubble";
import { MessageSquare, ShieldCheck, Sparkles } from "lucide-react";

interface ChatThreadProps {
  messages: MessageItem[];
  visitorName?: string;
  visitorEmail?: string;
  subject?: string;
  source?: string;
}

export function ChatThread({
  messages,
  visitorName,
  visitorEmail,
  subject,
  source,
}: ChatThreadProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col justify-start"
    >
      {/* Conversation metadata header card */}
      <div className="mx-auto my-3 w-full max-w-lg rounded-xl border border-dashed bg-muted/30 p-4 text-center text-xs text-muted-foreground">
        <div className="flex items-center justify-center gap-1.5 font-medium text-foreground mb-1">
          <MessageSquare className="h-3.5 w-3.5 text-primary" />
          <span>Conversation Started</span>
        </div>
        {subject && <p className="font-semibold text-foreground text-sm mb-1">{subject}</p>}
        <p>
          Visitor: <span className="font-medium text-foreground">{visitorName || "Anonymous"}</span>
          {visitorEmail && (
            <>
              {" "}
              &bull; <span className="text-muted-foreground">{visitorEmail}</span>
            </>
          )}
        </p>
        <p className="text-[11px] text-muted-foreground/80 mt-1">
          Source: {source || "widget"} &bull; Realtime secure connection
        </p>
      </div>

      {/* Messages */}
      {messages.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground text-sm py-12">
          <MessageSquare className="h-8 w-8 mb-2 opacity-40" />
          <p>No messages in this conversation yet.</p>
        </div>
      ) : (
        <div className="flex flex-col space-y-1">
          {messages.map((message) => (
            <MessageBubble
              key={message._id}
              message={message}
              visitorName={visitorName}
            />
          ))}
        </div>
      )}

      <div ref={bottomRef} className="h-2 shrink-0" />
    </div>
  );
}

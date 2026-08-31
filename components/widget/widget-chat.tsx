"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { Send, Bot, Sparkles, BookOpen, User, CornerDownLeft, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";

export interface VisitorMessage {
  _id: string;
  _creationTime: number;
  role: "visitor" | "agent" | "ai";
  content: string;
  citations?: Array<{
    articleId?: Id<"articles">;
    chunkId?: Id<"kbChunks">;
    title: string;
    excerpt: string;
  }>;
}

interface WidgetChatProps {
  messages: VisitorMessage[];
  onSendMessage: (content: string) => Promise<void>;
  onTyping?: (isTyping: boolean) => void;
  primaryColor: string;
  isAgentTyping?: boolean;
  agentName?: string | null;
  proactiveMessage?: string | null;
  onOpenArticleModal?: (articleId: Id<"articles">) => void;
  showMidChatLeadPrompt?: boolean;
  onRequestLeadCapture?: () => void;
}

export function WidgetChat({
  messages,
  onSendMessage,
  onTyping,
  primaryColor,
  isAgentTyping,
  agentName,
  proactiveMessage,
  onOpenArticleModal,
  showMidChatLeadPrompt,
  onRequestLeadCapture,
}: WidgetChatProps) {
  const [inputContent, setInputContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, isAgentTyping]);

  const handleInputChange = (val: string) => {
    setInputContent(val);
    if (onTyping) {
      if (val.trim().length > 0) {
        onTyping(true);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
          onTyping(false);
        }, 2500);
      } else {
        onTyping(false);
      }
    }
  };

  const handleSend = async () => {
    const text = inputContent.trim();
    if (!text || isSending) return;

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    if (onTyping) onTyping(false);

    try {
      setIsSending(true);
      setInputContent("");
      if (textareaRef.current) textareaRef.current.style.height = "auto";
      await onSendMessage(text);
    } catch (err) {
      console.error("Failed to send visitor message:", err);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Scrollable messages thread */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {/* Welcome greeting / proactive message if no messages yet */}
        {messages.length === 0 && (
          <div className="flex items-start gap-2.5 my-2">
            <Avatar size="default" className="mt-0.5 border border-indigo-100 bg-indigo-50 shrink-0">
              <AvatarFallback className="bg-indigo-50 text-indigo-600">
                <Bot className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div className="rounded-2xl rounded-tl-sm bg-white dark:bg-slate-900 border p-3.5 shadow-xs text-xs sm:text-sm text-foreground max-w-[85%] leading-relaxed">
              <p>{proactiveMessage || "Hello! 👋 Welcome to customer support. Ask us anything, and our AI assistant or a support agent will help you."}</p>
            </div>
          </div>
        )}

        {messages.map((msg) => {
          const isVisitor = msg.role === "visitor";
          const isAI = msg.role === "ai";
          const isAgent = msg.role === "agent";

          if (isVisitor) {
            return (
              <div key={msg._id} className="flex justify-end my-2">
                <div
                  className="rounded-2xl rounded-tr-sm text-white px-4 py-2.5 max-w-[85%] text-xs sm:text-sm leading-relaxed shadow-xs break-words"
                  style={{ backgroundColor: primaryColor }}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            );
          }

          return (
            <div key={msg._id} className="flex items-start gap-2.5 my-2 max-w-[88%]">
              <Avatar size="default" className="mt-0.5 border shrink-0 bg-white dark:bg-slate-900">
                {isAI ? (
                  <AvatarFallback className="bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    <Sparkles className="h-3.5 w-3.5" />
                  </AvatarFallback>
                ) : (
                  <AvatarFallback className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-semibold text-xs">
                    {(agentName || "Agent").slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>

              <div className="flex flex-col gap-1 min-w-0">
                <span className="text-[11px] font-medium text-muted-foreground px-1">
                  {isAI ? "AI Assistant" : agentName || "Support Representative"}
                </span>

                <div className="rounded-2xl rounded-tl-sm bg-white dark:bg-slate-900 border p-3.5 text-xs sm:text-sm leading-relaxed shadow-xs text-foreground">
                  <p className="whitespace-pre-wrap">{msg.content}</p>

                  {/* Citations */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-border/60 space-y-1.5">
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
                        <BookOpen className="h-3 w-3" />
                        <span>Sources & Knowledge Base</span>
                      </div>
                      <div className="grid gap-1">
                        {msg.citations.map((c, i) => (
                          <div
                            key={i}
                            className="rounded-md bg-muted/50 p-2 text-xs border border-border/40"
                          >
                            <div className="font-medium text-foreground flex items-center justify-between">
                              <span>{c.title}</span>
                              {c.articleId && onOpenArticleModal && (
                                <button
                                  type="button"
                                  onClick={() => onOpenArticleModal(c.articleId!)}
                                  className="text-[10px] text-primary hover:underline"
                                >
                                  Read article &rarr;
                                </button>
                              )}
                            </div>
                            <p className="text-muted-foreground text-[11px] mt-0.5 line-clamp-2">
                              {c.excerpt}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Live typing indicator */}
        {isAgentTyping && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground my-2 animate-pulse">
            <Avatar size="sm" className="size-6 border">
              <AvatarFallback className="text-[10px] bg-muted">
                <Bot className="h-3 w-3" />
              </AvatarFallback>
            </Avatar>
            <span>{agentName || "Agent"} is typing...</span>
          </div>
        )}

        {/* Mid-chat Lead Prompt */}
        {showMidChatLeadPrompt && onRequestLeadCapture && (
          <div className="rounded-xl border border-blue-200 bg-blue-50/90 dark:bg-blue-950/30 dark:border-blue-900 p-3 text-xs my-3 text-blue-950 dark:text-blue-100 flex items-center justify-between gap-2 shadow-xs">
            <div>
              <p className="font-medium">Want updates by email or phone?</p>
              <p className="text-blue-700 dark:text-blue-300 text-[11px]">Leave your info so we can reach you if you leave.</p>
            </div>
            <Button
              size="sm"
              onClick={onRequestLeadCapture}
              className="text-xs h-7 px-2.5 bg-blue-600 hover:bg-blue-700 text-white shrink-0"
            >
              Add Info
            </Button>
          </div>
        )}

        <div ref={messagesEndRef} className="h-1" />
      </div>

      {/* Composer */}
      <div className="p-3 border-t bg-white dark:bg-slate-900 shrink-0">
        <div className="flex items-end gap-2 rounded-xl border bg-slate-50 dark:bg-slate-950 px-3 py-2 focus-within:ring-2 focus-within:ring-ring/40 transition-all shadow-2xs">
          <textarea
            ref={textareaRef}
            rows={1}
            value={inputContent}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="flex-1 max-h-32 resize-none bg-transparent text-xs sm:text-sm placeholder:text-muted-foreground focus:outline-none py-1"
          />

          <Button
            size="sm"
            onClick={handleSend}
            disabled={!inputContent.trim() || isSending}
            className="h-8 w-8 p-0 rounded-lg shrink-0 text-white transition-opacity"
            style={{ backgroundColor: primaryColor }}
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

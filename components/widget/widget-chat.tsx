"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import {
  Send,
  Bot,
  Sparkles,
  BookOpen,
  User,
  ChevronDown,
  ChevronUp,
  Headphones,
  FileText,
  Loader2,
  ExternalLink,
  MessageSquarePlus,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

const STARTER_PROMPTS = [
  { label: "🚀 How do I get started?", text: "How do I get started with this service?" },
  { label: "💳 What are your pricing plans?", text: "What pricing plans do you offer?" },
  { label: "👥 Talk to sales / support", text: "Can I connect with your sales or support team?" },
  { label: "⚡ How does the AI assistant work?", text: "How does your AI assistant answer questions?" },
];

interface WidgetChatProps {
  messages: VisitorMessage[];
  onSendMessage: (content: string) => Promise<void>;
  onTyping?: (isTyping: boolean) => void;
  primaryColor: string;
  isAgentTyping?: boolean;
  isAiTyping?: boolean;
  agentName?: string | null;
  isHandedToHuman?: boolean;
  onRequestHumanHandover?: () => Promise<void>;
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
  isAiTyping,
  agentName,
  isHandedToHuman,
  onRequestHumanHandover,
  proactiveMessage,
  onOpenArticleModal,
  showMidChatLeadPrompt,
  onRequestLeadCapture,
}: WidgetChatProps) {
  const [inputContent, setInputContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isHandoverLoading, setIsHandoverLoading] = useState(false);
  const [expandedCitations, setExpandedCitations] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, isAgentTyping, isAiTyping]);

  const toggleCitation = (key: string) => {
    setExpandedCitations((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

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

  const handleSend = async (customText?: string) => {
    const text = (customText ?? inputContent).trim();
    if (!text || isSending) return;

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    if (onTyping) onTyping(false);

    try {
      setIsSending(true);
      if (!customText) {
        setInputContent("");
        if (textareaRef.current) textareaRef.current.style.height = "auto";
      }
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

  const handleHandoverClick = async () => {
    if (!onRequestHumanHandover || isHandoverLoading || isHandedToHuman) return;
    try {
      setIsHandoverLoading(true);
      await onRequestHumanHandover();
    } catch (err) {
      console.error("Failed to request human handover:", err);
    } finally {
      setIsHandoverLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Scrollable messages thread */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {/* Welcome greeting & Quick Starter Prompt Pills */}
        <div className="space-y-3">
          <div className="flex items-start gap-2.5 my-1">
            <Avatar size="default" className="mt-0.5 border border-indigo-100 bg-indigo-50 shrink-0">
              <AvatarFallback className="bg-indigo-50 text-indigo-600">
                <Bot className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div className="rounded-2xl rounded-tl-sm bg-white dark:bg-slate-900 border p-3.5 shadow-xs text-xs sm:text-sm text-foreground max-w-[85%] leading-relaxed">
              <p>
                {proactiveMessage ||
                  "Hello! 👋 Welcome to our support center. Ask us anything, or pick a starter question below to get instant answers from our AI knowledge assistant."}
              </p>
            </div>
          </div>

          {/* Quick starter question pills */}
          {messages.length === 0 && (
            <div className="pl-10 pr-2 pt-1 space-y-1.5 animate-in fade-in-50 duration-300">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground mb-1">
                <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                <span>Suggested Questions</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {STARTER_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSend(prompt.text)}
                    disabled={isSending}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-foreground border border-slate-200 dark:border-slate-800 rounded-full shadow-2xs hover:border-primary/50 transition-all text-left cursor-pointer"
                  >
                    <span>{prompt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Message Feed */}
        {messages.map((msg, index) => {
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
            <div key={msg._id} className="flex items-start gap-2.5 my-2 max-w-[90%] animate-in fade-in duration-200">
              <Avatar size="default" className="mt-0.5 border shrink-0 bg-white dark:bg-slate-900 shadow-2xs">
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

              <div className="flex flex-col gap-1 min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2 px-1">
                  <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
                    {isAI ? (
                      <>
                        <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-normal bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300 border-indigo-200">
                          AI Assistant
                        </Badge>
                      </>
                    ) : (
                      <>
                        <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-normal bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200">
                          {agentName || "Support Representative"}
                        </Badge>
                      </>
                    )}
                  </span>
                </div>

                <div className="rounded-2xl rounded-tl-sm bg-white dark:bg-slate-900 border p-3.5 text-xs sm:text-sm leading-relaxed shadow-xs text-foreground">
                  <p className="whitespace-pre-wrap">{msg.content}</p>

                  {/* Structured Citations with Snippet Popover */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-border/60 space-y-2">
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
                        <BookOpen className="h-3.5 w-3.5 text-primary" />
                        <span>Sources & Grounded Knowledge</span>
                      </div>

                      <div className="grid gap-1.5">
                        {msg.citations.map((c, i) => {
                          const citationKey = `${msg._id}_cite_${i}`;
                          const isExpanded = expandedCitations[citationKey] ?? false;

                          return (
                            <div
                              key={i}
                              className="rounded-lg bg-slate-50 dark:bg-slate-800/60 p-2 text-xs border border-slate-200 dark:border-slate-800 transition-all"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <button
                                  type="button"
                                  onClick={() => toggleCitation(citationKey)}
                                  className="flex items-center gap-1.5 font-medium text-foreground hover:text-primary transition-colors text-left flex-1 min-w-0 cursor-pointer"
                                >
                                  <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                  <span className="truncate">{c.title}</span>
                                  {isExpanded ? (
                                    <ChevronUp className="h-3.5 w-3.5 shrink-0 text-muted-foreground ml-auto" />
                                  ) : (
                                    <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground ml-auto" />
                                  )}
                                </button>

                                {c.articleId && onOpenArticleModal && (
                                  <button
                                    type="button"
                                    onClick={() => onOpenArticleModal(c.articleId!)}
                                    title="View Knowledge Article"
                                    className="text-[10px] text-primary hover:underline flex items-center gap-0.5 shrink-0 ml-1 font-medium cursor-pointer"
                                  >
                                    <span>Read</span>
                                    <ExternalLink className="h-2.5 w-2.5" />
                                  </button>
                                )}
                              </div>

                              {isExpanded ? (
                                <div className="mt-2 pt-1.5 border-t border-border/50 text-[11px] text-muted-foreground leading-relaxed animate-in fade-in-50 duration-150">
                                  <p className="italic bg-background/50 p-2 rounded border border-border/40">
                                    &ldquo;{c.excerpt}&rdquo;
                                  </p>
                                </div>
                              ) : (
                                <p className="text-muted-foreground text-[11px] mt-1 line-clamp-1">
                                  {c.excerpt}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Inline Human Handover Callout on AI message */}
                  {isAI && !isHandedToHuman && onRequestHumanHandover && index === messages.length - 1 && (
                    <div className="mt-3 pt-2 flex items-center justify-between border-t border-dashed border-border/60">
                      <span className="text-[10px] text-muted-foreground">Need a human representative?</span>
                      <button
                        type="button"
                        onClick={handleHandoverClick}
                        disabled={isHandoverLoading}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline cursor-pointer"
                      >
                        {isHandoverLoading ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Headphones className="h-3 w-3" />
                        )}
                        <span>Talk to a human agent</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* AI Typing / Thinking Indicator */}
        {isAiTyping && (
          <div className="flex items-start gap-2.5 my-2 animate-in fade-in duration-300">
            <Avatar size="default" className="mt-0.5 border shrink-0 bg-indigo-50 border-indigo-100">
              <AvatarFallback className="bg-indigo-50 text-indigo-600">
                <Sparkles className="h-3.5 w-3.5 animate-spin text-indigo-500" />
              </AvatarFallback>
            </Avatar>
            <div className="rounded-2xl rounded-tl-sm bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-950 p-3 shadow-xs text-xs text-muted-foreground flex items-center gap-2">
              <div className="flex gap-1 items-center">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.3s]"></span>
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.15s]"></span>
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-bounce"></span>
              </div>
              <span className="text-[11px] text-indigo-700 dark:text-indigo-300 font-medium">
                AI is searching knowledge base & crafting reply...
              </span>
            </div>
          </div>
        )}

        {/* Agent Typing Indicator */}
        {isAgentTyping && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground my-2 animate-pulse pl-2">
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
              <p className="font-medium">Want follow-ups via email or phone?</p>
              <p className="text-blue-700 dark:text-blue-300 text-[11px]">Leave your contact info so we can reach you if you disconnect.</p>
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
        <div className="flex items-end gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 focus-within:ring-2 focus-within:ring-ring/40 transition-all shadow-2xs">
          <textarea
            ref={textareaRef}
            rows={1}
            value={inputContent}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isHandedToHuman ? "Message support agent..." : "Ask a question..."}
            className="flex-1 max-h-32 resize-none bg-transparent text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none py-1"
          />

          <Button
            size="sm"
            onClick={() => handleSend()}
            disabled={!inputContent.trim() || isSending}
            className="h-8 w-8 p-0 rounded-lg shrink-0 text-white transition-opacity cursor-pointer"
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

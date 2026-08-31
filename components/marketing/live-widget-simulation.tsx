"use client";

import { useState, useRef, useEffect } from "react";
import {
  Bot,
  Send,
  User,
  Sparkles,
  Headphones,
  RotateCcw,
  BookOpen,
  CheckCircle2,
  FileText,
  ShieldAlert,
  ArrowUpRight,
  Palette,
  CircleDot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface MessageCitation {
  title: string;
  source: string;
  excerpt: string;
  confidence: number;
}

interface SimulatedMessage {
  id: string;
  role: "visitor" | "ai" | "agent" | "system";
  content: string;
  timestamp: string;
  citations?: MessageCitation[];
  agentName?: string;
  agentAvatar?: string;
}

const DEFAULT_PRESETS = [
  {
    label: "Embed script on website",
    question: "How do I embed SupportHub on my React / Next.js website?",
    aiAnswer:
      "You can embed SupportHub in under 2 minutes! Simply paste the script tag into your application or use our Next.js Script component with your workspace public key. The widget loads asynchronously without affecting your Core Web Vitals.",
    citations: [
      {
        title: "Developer Integration Guide",
        source: "docs/developer/quickstart.md",
        excerpt: "Paste <script src='https://cdn.supporthub.io/widget.js' data-workspace='pk_live_...'></script> into your root layout.",
        confidence: 99,
      },
    ],
  },
  {
    label: "Pricing & AI Quotas",
    question: "What are the AI message limits on the Free vs Pro plans?",
    aiAnswer:
      "The Free plan includes 1 seat and 100 AI messages/month with 5 KB documents. The Pro plan includes 5 seats, 2,000 AI messages/month, and 50 KB documents with unlimited custom branding.",
    citations: [
      {
        title: "Plan Tiers & Quotas",
        source: "docs/billing/plans.md",
        excerpt: "Free tier offers 100 AI queries/mo; Pro unlocks 2,000 queries/mo with automated overage protection.",
        confidence: 97,
      },
    ],
  },
  {
    label: "Request Human Agent",
    question: "I need help with a custom enterprise SLA. Can I speak with a human?",
    aiAnswer:
      "I'll connect you directly with our support team right now. One moment while an agent joins this thread from our shared inbox.",
    citations: [
      {
        title: "Team Escalation Policy",
        source: "knowledge/handoff.md",
        excerpt: "Conversations flagged with SLA or enterprise queries auto-escalate to human on-call agents.",
        confidence: 95,
      },
    ],
    triggerHandoff: true,
  },
];

const THEME_COLORS = [
  { name: "Indigo", bgClass: "bg-indigo-600", borderClass: "border-indigo-600", textClass: "text-indigo-600" },
  { name: "Emerald", bgClass: "bg-emerald-600", borderClass: "border-emerald-600", textClass: "text-emerald-600" },
  { name: "Violet", bgClass: "bg-violet-600", borderClass: "border-violet-600", textClass: "text-violet-600" },
  { name: "Rose", bgClass: "bg-rose-600", borderClass: "border-rose-600", textClass: "text-rose-600" },
];

export function LiveWidgetSimulation() {
  const [messages, setMessages] = useState<SimulatedMessage[]>([
    {
      id: "welcome-1",
      role: "ai",
      content:
        "👋 Hi there! I am SupportHub AI, grounded in our real-time Knowledge Base. Ask me anything about integration, pricing, or our AI architecture!",
      timestamp: "Just now",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isHumanHanded, setIsHumanHanded] = useState(false);
  const [selectedThemeIndex, setSelectedThemeIndex] = useState(0);
  const [selectedCitation, setSelectedCitation] = useState<MessageCitation | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const theme = THEME_COLORS[selectedThemeIndex];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputValue;
    if (!text.trim()) return;

    const userMsg: SimulatedMessage = {
      id: `user-${Date.now()}`,
      role: "visitor",
      content: text.trim(),
      timestamp: "Just now",
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue("");
    setIsTyping(true);

    // Look for matching preset or synthesize smart RAG reply
    const matchedPreset = DEFAULT_PRESETS.find(
      (p) => p.question.toLowerCase().includes(text.toLowerCase()) || text.toLowerCase().includes(p.label.toLowerCase())
    );

    setTimeout(() => {
      setIsTyping(false);

      if (matchedPreset?.triggerHandoff || text.toLowerCase().includes("human") || text.toLowerCase().includes("agent") || text.toLowerCase().includes("person")) {
        // AI handoff message
        const aiMsg: SimulatedMessage = {
          id: `ai-${Date.now()}`,
          role: "ai",
          content:
            "I'm escalating this conversation to our active support queue now. Sarah Chen from Support has been notified.",
          timestamp: "Just now",
          citations: [
            {
              title: "Escalation Routing Rule",
              source: "knowledge/handoff.md",
              excerpt: "Instant human escalation with full conversation context preserved.",
              confidence: 99,
            },
          ],
        };

        const sysMsg: SimulatedMessage = {
          id: `sys-${Date.now() + 1}`,
          role: "system",
          content: "👤 Sarah Chen (Senior Support Specialist) joined the conversation",
          timestamp: "Just now",
        };

        setMessages((prev) => [...prev, aiMsg, sysMsg]);
        setIsHumanHanded(true);

        // Sarah replies shortly
        setTimeout(() => {
          const agentMsg: SimulatedMessage = {
            id: `agent-${Date.now() + 2}`,
            role: "agent",
            agentName: "Sarah Chen",
            agentAvatar: "👩‍💼",
            content:
              "Hello! Sarah here from Customer Success. I reviewed the AI thread and your question. I'd be delighted to assist you directly!",
            timestamp: "Just now",
          };
          setMessages((prev) => [...prev, agentMsg]);
        }, 1200);

        return;
      }

      if (matchedPreset) {
        const aiMsg: SimulatedMessage = {
          id: `ai-${Date.now()}`,
          role: "ai",
          content: matchedPreset.aiAnswer,
          timestamp: "Just now",
          citations: matchedPreset.citations,
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        // Fallback intelligent response
        const fallbackMsg: SimulatedMessage = {
          id: `ai-${Date.now()}`,
          role: "ai",
          content: `Thanks for asking about "${text}". SupportHub leverages Gemini 2.0 with vector embeddings to synthesize accurate, verified answers from your synced documentation articles.`,
          timestamp: "Just now",
          citations: [
            {
              title: "SupportHub RAG Engine",
              source: "docs/architecture/rag.md",
              excerpt: "Semantic search across 768-dimensional text-embedding-004 chunks with zero hallucinations.",
              confidence: 96,
            },
          ],
        };
        setMessages((prev) => [...prev, fallbackMsg]);
      }
    }, 850);
  };

  const handleReset = () => {
    setMessages([
      {
        id: "welcome-1",
        role: "ai",
        content:
          "👋 Hi there! I am SupportHub AI, grounded in our real-time Knowledge Base. Ask me anything about integration, pricing, or our AI architecture!",
        timestamp: "Just now",
      },
    ]);
    setIsHumanHanded(false);
    setSelectedCitation(null);
    setInputValue("");
  };

  const triggerHumanTakeover = () => {
    if (isHumanHanded) return;
    setIsHumanHanded(true);
    const sysMsg: SimulatedMessage = {
      id: `sys-${Date.now()}`,
      role: "system",
      content: "👤 Sarah Chen (Senior Support Specialist) took over the thread",
      timestamp: "Just now",
    };
    const agentMsg: SimulatedMessage = {
      id: `agent-${Date.now() + 1}`,
      role: "agent",
      agentName: "Sarah Chen",
      agentAvatar: "👩‍💼",
      content: "Hi! I just jumped in from the SupportHub shared inbox. How can I help you today?",
      timestamp: "Just now",
    };
    setMessages((prev) => [...prev, sysMsg, agentMsg]);
  };

  return (
    <div className="w-full max-w-5xl mx-auto rounded-2xl border border-border/80 bg-card/60 backdrop-blur-xl shadow-2xl overflow-hidden">
      {/* Simulation Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/70 bg-muted/40 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="size-3 rounded-full bg-red-500/80" />
            <div className="size-3 rounded-full bg-amber-500/80" />
            <div className="size-3 rounded-full bg-emerald-500/80" />
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-foreground tracking-wide flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-primary" /> Live Embed Simulator
            </span>
            <Badge
              variant="outline"
              className={cn(
                "text-[11px] font-medium transition-colors",
                isHumanHanded
                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                  : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
              )}
            >
              <CircleDot className="size-2 mr-1 animate-pulse" />
              {isHumanHanded ? "Human Takeover Active" : "Gemini 2.0 AI Autonomous"}
            </Badge>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          {/* Color theme chooser */}
          <div className="hidden sm:flex items-center gap-1.5">
            <Palette className="size-3.5 text-muted-foreground mr-0.5" />
            {THEME_COLORS.map((t, idx) => (
              <button
                key={t.name}
                onClick={() => setSelectedThemeIndex(idx)}
                className={cn(
                  "size-5 rounded-full transition-transform",
                  t.bgClass,
                  selectedThemeIndex === idx ? "ring-2 ring-foreground ring-offset-2 scale-110" : "opacity-70 hover:opacity-100"
                )}
                title={`Widget Theme: ${t.name}`}
              />
            ))}
          </div>

          <Button
            size="xs"
            variant={isHumanHanded ? "secondary" : "outline"}
            onClick={triggerHumanTakeover}
            disabled={isHumanHanded}
            className="text-xs gap-1.5 font-medium"
          >
            <Headphones className="size-3.5 text-primary" />
            {isHumanHanded ? "Human Connected" : "Simulate Human Takeover"}
          </Button>

          <Button
            size="xs"
            variant="ghost"
            onClick={handleReset}
            className="text-xs text-muted-foreground hover:text-foreground gap-1"
          >
            <RotateCcw className="size-3" />
            Reset
          </Button>
        </div>
      </div>

      {/* Main Simulation Viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[460px]">
        {/* Left Side: Preset Prompts & Inspector */}
        <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-border/70 p-4 sm:p-5 bg-background/50 flex flex-col justify-between gap-4">
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Try Sample Inquiries
            </h4>
            <div className="flex flex-col gap-2">
              {DEFAULT_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => handleSend(preset.question)}
                  className="text-left group relative rounded-xl border border-border/60 bg-card p-3 text-xs transition-all hover:border-primary/50 hover:bg-accent/40 hover:shadow-xs"
                >
                  <div className="flex items-center justify-between font-semibold text-foreground mb-1">
                    <span>{preset.label}</span>
                    <ArrowUpRight className="size-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <p className="text-muted-foreground line-clamp-2 text-[11px] leading-relaxed">
                    "{preset.question}"
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* RAG Citation Preview Box */}
          <div className="rounded-xl border border-border/60 bg-muted/30 p-3.5 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <BookOpen className="size-3.5 text-primary" />
              <span>Grounding & Citations</span>
            </div>
            {selectedCitation ? (
              <div className="space-y-1.5 text-xs animate-fadeIn">
                <div className="flex items-center justify-between text-muted-foreground text-[11px]">
                  <span className="font-mono text-primary truncate max-w-[170px]">{selectedCitation.source}</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{selectedCitation.confidence}% match</span>
                </div>
                <div className="font-medium text-foreground">{selectedCitation.title}</div>
                <p className="text-[11px] text-muted-foreground bg-background/80 p-2 rounded-md border border-border/50 italic">
                  "{selectedCitation.excerpt}"
                </p>
              </div>
            ) : (
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Click any citation tag on an AI reply to inspect the exact knowledge base chunk and match confidence score.
              </p>
            )}
          </div>
        </div>

        {/* Right Side: Simulated Chat Window */}
        <div className="lg:col-span-8 flex flex-col justify-between bg-card/40">
          {/* Chat Header */}
          <div className={cn("px-4 py-3 border-b border-border/60 flex items-center justify-between text-white transition-colors", theme.bgClass)}>
            <div className="flex items-center gap-2.5">
              <div className="flex size-7 items-center justify-center rounded-lg bg-white/20">
                {isHumanHanded ? <Headphones className="size-4" /> : <Bot className="size-4" />}
              </div>
              <div>
                <div className="text-xs font-bold leading-tight flex items-center gap-1.5">
                  {isHumanHanded ? "Sarah Chen • Customer Success" : "SupportHub AI Assistant"}
                </div>
                <div className="text-[10px] text-white/80 flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {isHumanHanded ? "Online in Team Inbox" : "Powered by Gemini 2.0 & Vector RAG"}
                </div>
              </div>
            </div>
            <span className="text-[10px] bg-white/15 px-2 py-0.5 rounded-md font-mono">
              Live Preview
            </span>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 max-h-[360px] min-h-[280px]">
            {messages.map((msg) => {
              if (msg.role === "system") {
                return (
                  <div key={msg.id} className="flex justify-center my-2">
                    <span className="text-[11px] text-muted-foreground bg-muted/60 px-3 py-1 rounded-full border border-border/50">
                      {msg.content}
                    </span>
                  </div>
                );
              }

              const isVisitor = msg.role === "visitor";
              const isAgent = msg.role === "agent";

              return (
                <div
                  key={msg.id}
                  className={cn("flex gap-2.5 max-w-[85%]", isVisitor ? "ml-auto flex-row-reverse" : "mr-auto")}
                >
                  {/* Avatar */}
                  <div
                    className={cn(
                      "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                      isVisitor
                        ? "bg-muted text-foreground border border-border"
                        : isAgent
                        ? "bg-amber-500 text-white"
                        : cn("text-white", theme.bgClass)
                    )}
                  >
                    {isVisitor ? <User className="size-3.5" /> : isAgent ? "SC" : <Bot className="size-3.5" />}
                  </div>

                  {/* Message Bubble */}
                  <div className="space-y-1">
                    <div
                      className={cn(
                        "rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-xs",
                        isVisitor
                          ? cn("text-white rounded-tr-none", theme.bgClass)
                          : isAgent
                          ? "bg-amber-500/10 text-foreground border border-amber-500/20 rounded-tl-none"
                          : "bg-muted/80 text-foreground border border-border/60 rounded-tl-none"
                      )}
                    >
                      {isAgent && (
                        <div className="font-semibold text-amber-700 dark:text-amber-400 text-[10px] mb-1 flex items-center gap-1">
                          <Headphones className="size-3" />
                          {msg.agentName} (Human Support)
                        </div>
                      )}
                      <p className="whitespace-pre-line">{msg.content}</p>
                    </div>

                    {/* Citations block */}
                    {msg.citations && msg.citations.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                        <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                          <CheckCircle2 className="size-2.5 text-emerald-500" />
                          Sources:
                        </span>
                        {msg.citations.map((c, i) => (
                          <button
                            key={i}
                            onClick={() => setSelectedCitation(c)}
                            className="inline-flex items-center gap-1 text-[10px] bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 px-2 py-0.5 rounded-md transition-colors"
                          >
                            <FileText className="size-2.5" />
                            {c.title} ({c.confidence}%)
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex gap-2.5 items-center mr-auto">
                <div className={cn("flex size-7 shrink-0 items-center justify-center rounded-full text-white text-xs", theme.bgClass)}>
                  <Bot className="size-3.5" />
                </div>
                <div className="rounded-2xl rounded-tl-none bg-muted/80 border border-border/60 px-3 py-2 flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                  <span className="size-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                  <span className="size-1.5 rounded-full bg-primary animate-bounce" />
                  <span className="text-[11px] text-muted-foreground ml-1">Searching KB & synthesizing...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <div className="p-3 border-t border-border/60 bg-background/80 flex items-center gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask anything or simulate asking for help..."
              className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none px-2"
            />
            <Button
              size="icon-sm"
              disabled={!inputValue.trim() || isTyping}
              onClick={() => handleSend()}
              className={cn("text-white shrink-0 shadow-xs", theme.bgClass)}
            >
              <Send className="size-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

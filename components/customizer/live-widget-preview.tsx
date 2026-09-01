"use client";

import React, { useState, useEffect } from "react";
import { FaqItem } from "./faq-manager-tab";
import {
  MessageSquare,
  HelpCircle,
  UserPlus,
  Send,
  X,
  Sparkles,
  Bot,
  User,
  Monitor,
  Smartphone,
  RotateCcw,
  CheckCircle2,
  ChevronRight,
  Shield,
  Search,
  ArrowLeft,
  Volume2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LiveWidgetPreviewProps {
  primaryColor: string;
  borderRadius: string;
  position: "bottom-right" | "bottom-left";
  title: string;
  subtitle: string;
  logoUrl?: string | null;
  soundEnabled: boolean;
  proactiveEnabled: boolean;
  proactiveDelaySeconds: number;
  proactiveMessage: string;
  leadCaptureMode: "before_chat" | "mid_chat" | "optional" | "disabled";
  faqItems: FaqItem[];
}

export function LiveWidgetPreview({
  primaryColor,
  borderRadius,
  position,
  title,
  subtitle,
  logoUrl,
  soundEnabled,
  proactiveEnabled,
  proactiveDelaySeconds,
  proactiveMessage,
  leadCaptureMode,
  faqItems,
}: LiveWidgetPreviewProps) {
  // Preview mode toggles
  const [deviceMode, setDeviceMode] = useState<"desktop" | "mobile">("desktop");
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<"chat" | "faq" | "lead">("chat");

  // Chat simulator state
  const [messages, setMessages] = useState<
    Array<{ id: string; role: "visitor" | "ai" | "agent"; content: string }>
  >([
    {
      id: "m1",
      role: "ai",
      content: proactiveMessage || "Hello! 👋 Welcome to our live support. How can we help you today?",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [leadSubmitted, setLeadSubmitted] = useState(false);

  // Form inputs for preview
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");

  // FAQ active article preview
  const [selectedFaq, setSelectedFaq] = useState<FaqItem | null>(null);
  const [faqSearch, setFaqSearch] = useState("");

  // Sync initial message when proactiveMessage changes
  useEffect(() => {
    setMessages((prev) => [
      {
        id: "m1",
        role: "ai",
        content: proactiveMessage || "Hello! 👋 Welcome to our live support. How can we help you today?",
      },
      ...prev.slice(1),
    ]);
  }, [proactiveMessage]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userText = inputMessage.trim();
    setInputMessage("");

    setMessages((prev) => [
      ...prev,
      { id: `vis_${Date.now()}`, role: "visitor", content: userText },
    ]);

    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai_${Date.now()}`,
          role: "ai",
          content: `Thanks for your inquiry about "${userText}". Our team or AI will provide answers right away!`,
        },
      ]);
    }, 1000);
  };

  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLeadSubmitted(true);
    setActiveTab("chat");
    setMessages((prev) => [
      ...prev,
      {
        id: `sys_${Date.now()}`,
        role: "ai",
        content: `Thank you, ${formName || "there"}! We've saved your details (${formEmail || formPhone || "contact info"}) and will stay in touch.`,
      },
    ]);
  };

  const handleReset = () => {
    setMessages([
      {
        id: "m1",
        role: "ai",
        content: proactiveMessage || "Hello! 👋 Welcome to our live support. How can we help you today?",
      },
    ]);
    setLeadSubmitted(false);
    setSelectedFaq(null);
    setFaqSearch("");
    setActiveTab("chat");
  };

  // Determine if gated before chat
  const isBeforeChatGate = leadCaptureMode === "before_chat" && !leadSubmitted && activeTab !== "faq";

  return (
    <div className="flex flex-col h-full bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
      {/* Top Preview Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800 text-xs text-slate-300">
        <div className="flex items-center gap-2 font-medium">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Interactive Live Preview</span>
        </div>

        {/* View toggles */}
        <div className="flex items-center gap-2">
          {/* Device toggle */}
          <div className="flex items-center rounded-lg border border-slate-700 bg-slate-950 p-0.5">
            <button
              type="button"
              onClick={() => setDeviceMode("desktop")}
              className={cn(
                "p-1.5 rounded-md transition-all",
                deviceMode === "desktop" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"
              )}
              title="Desktop View"
            >
              <Monitor className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setDeviceMode("mobile")}
              className={cn(
                "p-1.5 rounded-md transition-all",
                deviceMode === "mobile" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"
              )}
              title="Mobile Device View"
            >
              <Smartphone className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Reset simulation */}
          <button
            type="button"
            onClick={handleReset}
            className="p-1.5 rounded-lg border border-slate-700 bg-slate-950 text-slate-400 hover:text-white transition-colors"
            title="Reset Chat Simulation"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Preview Simulation Stage */}
      <div className="flex-1 bg-slate-900/60 p-4 sm:p-6 overflow-hidden flex items-center justify-center relative min-h-[560px]">
        {/* Mock background website content (desktop mode) */}
        {deviceMode === "desktop" && (
          <div className="absolute inset-4 rounded-xl border border-slate-800 bg-slate-900/80 p-6 overflow-hidden pointer-events-none select-none opacity-40">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
              <div className="h-5 w-28 bg-slate-700 rounded-md"></div>
              <div className="flex gap-4">
                <div className="h-4 w-14 bg-slate-800 rounded"></div>
                <div className="h-4 w-14 bg-slate-800 rounded"></div>
                <div className="h-4 w-14 bg-slate-800 rounded"></div>
              </div>
            </div>
            <div className="space-y-4 max-w-md">
              <div className="h-7 w-3/4 bg-slate-700 rounded-lg"></div>
              <div className="h-4 w-full bg-slate-800 rounded"></div>
              <div className="h-4 w-5/6 bg-slate-800 rounded"></div>
              <div className="h-9 w-32 bg-slate-700 rounded-lg mt-2"></div>
            </div>
          </div>
        )}

        {/* Floating Desktop or Centered Mobile Frame */}
        <div
          className={cn(
            "transition-all duration-300 relative z-10",
            deviceMode === "desktop"
              ? cn(
                  "w-[380px] max-w-full h-[540px] flex flex-col justify-end",
                  position === "bottom-left" ? "self-end mr-auto" : "self-end ml-auto"
                )
              : "w-[340px] h-[560px] border-4 border-slate-700 rounded-[32px] overflow-hidden shadow-2xl p-1 bg-slate-950"
          )}
        >
          {/* If Widget is Closed -> Show Proactive Bubble + Launcher Button */}
          {!isOpen ? (
            <div
              className={cn(
                "flex flex-col gap-3 items-end p-2",
                position === "bottom-left" ? "items-start" : "items-end"
              )}
            >
              {/* Proactive Greeting Popup Preview */}
              {proactiveEnabled && (
                <div className="animate-in slide-in-from-bottom-2 duration-200 max-w-[280px] rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 shadow-xl text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-foreground">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    <span>{title}</span>
                  </div>
                  <p className="text-muted-foreground leading-relaxed text-[11px]">
                    {proactiveMessage || "Hi there! 👋 How can we help you today?"}
                  </p>
                </div>
              )}

              {/* Launcher Button */}
              <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="h-14 w-14 rounded-full text-white shadow-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
                style={{ backgroundColor: primaryColor }}
                title="Open Chat Support"
              >
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="h-7 w-7 rounded-full object-cover" />
                ) : (
                  <MessageSquare className="h-6 w-6" />
                )}
              </button>
            </div>
          ) : (
            /* Opened Widget Window */
            <div
              className="w-full h-full flex flex-col bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
              style={{
                borderRadius: deviceMode === "mobile" ? "24px" : borderRadius,
              }}
            >
              {/* 1. Header */}
              <div
                className="p-4 text-white shrink-0 space-y-3"
                style={{ backgroundColor: primaryColor }}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-9 w-9 rounded-xl bg-white/20 text-white font-bold flex items-center justify-center shrink-0 border border-white/20 overflow-hidden text-sm">
                      {logoUrl ? (
                        <img src={logoUrl} alt={title} className="h-full w-full object-cover" />
                      ) : (
                        title.slice(0, 2).toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-sm leading-tight truncate">{title}</h3>
                      <div className="flex items-center gap-1 text-[11px] text-white/80 mt-0.5 truncate">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                        <span className="truncate">{subtitle || "Online & ready to help"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {leadCaptureMode !== "disabled" && !leadSubmitted && (
                      <button
                        type="button"
                        onClick={() => setActiveTab(activeTab === "lead" ? "chat" : "lead")}
                        className={cn(
                          "px-2 py-1 rounded-lg text-[10px] font-medium border border-white/20 transition-all",
                          activeTab === "lead"
                            ? "bg-white text-slate-900 font-semibold"
                            : "bg-white/10 hover:bg-white/20 text-white"
                        )}
                      >
                        Contact Info
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="p-1 text-white/80 hover:text-white rounded-md transition-colors"
                      title="Minimize Widget"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Tabs bar */}
                <div className="flex rounded-lg bg-black/20 p-0.5 text-xs font-medium backdrop-blur-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("chat");
                      setSelectedFaq(null);
                    }}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-1.5 py-1 rounded-md transition-all text-xs",
                      activeTab === "chat"
                        ? "bg-white text-slate-900 font-semibold shadow-xs"
                        : "text-white/80 hover:text-white"
                    )}
                  >
                    <MessageSquare className="h-3 w-3" />
                    <span>Chat</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("faq")}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-1.5 py-1 rounded-md transition-all text-xs",
                      activeTab === "faq"
                        ? "bg-white text-slate-900 font-semibold shadow-xs"
                        : "text-white/80 hover:text-white"
                    )}
                  >
                    <HelpCircle className="h-3 w-3" />
                    <span>Help & FAQs</span>
                  </button>
                </div>
              </div>

              {/* 2. Body Tabs */}
              <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-slate-50 dark:bg-slate-950">
                {/* Tab: Chat */}
                {activeTab === "chat" && (
                  isBeforeChatGate ? (
                    /* Gated Lead Capture Form View */
                    <div className="flex-1 overflow-y-auto p-5 flex flex-col justify-center space-y-4">
                      <div className="text-center space-y-1">
                        <div
                          className="h-10 w-10 rounded-full text-white mx-auto flex items-center justify-center mb-1"
                          style={{ backgroundColor: primaryColor }}
                        >
                          <Shield className="h-5 w-5" />
                        </div>
                        <h4 className="text-sm font-bold text-foreground">Introduce Yourself</h4>
                        <p className="text-xs text-muted-foreground">
                          Please enter your contact details to begin chatting with our support team.
                        </p>
                      </div>

                      <form onSubmit={handleLeadSubmit} className="space-y-3 pt-1">
                        <input
                          type="text"
                          value={formName}
                          onChange={(e) => setFormName(e.target.value)}
                          placeholder="Your Name *"
                          className="w-full px-3 py-2 text-xs rounded-xl border bg-white dark:bg-slate-900 text-foreground focus:outline-none"
                          required
                        />
                        <input
                          type="email"
                          value={formEmail}
                          onChange={(e) => setFormEmail(e.target.value)}
                          placeholder="Your Email *"
                          className="w-full px-3 py-2 text-xs rounded-xl border bg-white dark:bg-slate-900 text-foreground focus:outline-none"
                          required
                        />
                        <input
                          type="tel"
                          value={formPhone}
                          onChange={(e) => setFormPhone(e.target.value)}
                          placeholder="Phone Number (optional)"
                          className="w-full px-3 py-2 text-xs rounded-xl border bg-white dark:bg-slate-900 text-foreground focus:outline-none"
                        />
                        <button
                          type="submit"
                          className="w-full py-2.5 rounded-xl text-white text-xs font-semibold shadow-sm transition-all hover:opacity-90"
                          style={{ backgroundColor: primaryColor }}
                        >
                          Start Chatting
                        </button>
                      </form>
                    </div>
                  ) : (
                    /* Normal Chat View */
                    <div className="flex-1 flex flex-col h-full overflow-hidden">
                      {/* Messages scroll */}
                      <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {messages.map((m) => (
                          <div
                            key={m.id}
                            className={cn(
                              "flex gap-2 text-xs leading-relaxed max-w-[85%]",
                              m.role === "visitor" ? "ml-auto justify-end" : "mr-auto"
                            )}
                          >
                            {m.role !== "visitor" && (
                              <div
                                className="h-6 w-6 rounded-full text-white flex items-center justify-center shrink-0 mt-0.5 text-[10px]"
                                style={{ backgroundColor: primaryColor }}
                              >
                                <Bot className="h-3.5 w-3.5" />
                              </div>
                            )}
                            <div
                              className={cn(
                                "p-3 rounded-2xl",
                                m.role === "visitor"
                                  ? "text-white rounded-br-none"
                                  : "bg-white dark:bg-slate-900 border text-foreground rounded-bl-none shadow-2xs"
                              )}
                              style={
                                m.role === "visitor"
                                  ? { backgroundColor: primaryColor }
                                  : undefined
                              }
                            >
                              {m.content}
                            </div>
                          </div>
                        ))}

                        {/* Mid-chat Lead Prompt Simulation */}
                        {leadCaptureMode === "mid_chat" &&
                          !leadSubmitted &&
                          messages.length >= 3 && (
                            <div className="p-3 rounded-xl border border-primary/30 bg-primary/5 text-xs space-y-2 animate-in fade-in">
                              <div className="flex items-center gap-1.5 font-semibold text-primary">
                                <Sparkles className="h-3.5 w-3.5" />
                                <span>Leave your contact details</span>
                              </div>
                              <p className="text-[11px] text-muted-foreground">
                                In case we get disconnected, leave your email to get follow-up replies.
                              </p>
                              <button
                                type="button"
                                onClick={() => setActiveTab("lead")}
                                className="px-3 py-1.5 rounded-lg text-white text-[11px] font-medium"
                                style={{ backgroundColor: primaryColor }}
                              >
                                Add Contact Info
                              </button>
                            </div>
                          )}

                        {isTyping && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground p-1">
                            <span className="animate-pulse">&bull;</span>
                            <span className="animate-pulse delay-100">&bull;</span>
                            <span className="animate-pulse delay-200">&bull;</span>
                            <span className="text-[11px] ml-1">{title} is typing...</span>
                          </div>
                        )}
                      </div>

                      {/* Chat Input */}
                      <form
                        onSubmit={handleSendMessage}
                        className="p-3 border-t bg-white dark:bg-slate-900 flex items-center gap-2 shrink-0"
                      >
                        <input
                          type="text"
                          value={inputMessage}
                          onChange={(e) => setInputMessage(e.target.value)}
                          placeholder="Type your message..."
                          className="flex-1 px-3 py-2 text-xs rounded-xl border bg-slate-50 dark:bg-slate-950 text-foreground focus:outline-none"
                        />
                        <button
                          type="submit"
                          disabled={!inputMessage.trim()}
                          className="h-8 w-8 rounded-xl text-white flex items-center justify-center shrink-0 disabled:opacity-40 transition-all hover:opacity-90"
                          style={{ backgroundColor: primaryColor }}
                        >
                          <Send className="h-3.5 w-3.5" />
                        </button>
                      </form>
                    </div>
                  )
                )}

                {/* Tab: Help & FAQs */}
                {activeTab === "faq" && (
                  <div className="flex-1 flex flex-col h-full overflow-hidden p-4 space-y-4">
                    {selectedFaq ? (
                      /* Single FAQ answer view */
                      <div className="space-y-3">
                        <button
                          type="button"
                          onClick={() => setSelectedFaq(null)}
                          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                        >
                          <ArrowLeft className="h-3.5 w-3.5" /> Back to all questions
                        </button>
                        <div className="p-4 rounded-xl border bg-white dark:bg-slate-900 space-y-2">
                          <h4 className="text-sm font-bold text-foreground">
                            {selectedFaq.question}
                          </h4>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {selectedFaq.answer ||
                              "This question is linked to your Knowledge Base article. In the live widget, visitors can read the full article or ask the AI directly."}
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveTab("chat");
                              setInputMessage(`I need help with: ${selectedFaq.question}`);
                            }}
                            className="mt-2 text-xs font-semibold text-primary hover:underline block"
                          >
                            Ask about this in chat &rarr;
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* FAQ list view */
                      <div className="space-y-3 flex-1 overflow-y-auto">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                          <input
                            type="text"
                            value={faqSearch}
                            onChange={(e) => setFaqSearch(e.target.value)}
                            placeholder="Search help topics..."
                            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border bg-white dark:bg-slate-900 text-foreground focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            Top Questions ({faqItems.length})
                          </div>
                          {faqItems.length === 0 ? (
                            <div className="p-6 text-center text-xs text-muted-foreground border rounded-xl bg-white dark:bg-slate-900">
                              No curated FAQs configured yet. Add questions in the FAQs tab!
                            </div>
                          ) : (
                            faqItems
                              .filter((f) =>
                                f.question.toLowerCase().includes(faqSearch.toLowerCase())
                              )
                              .map((f, i) => (
                                <button
                                  key={i}
                                  type="button"
                                  onClick={() => setSelectedFaq(f)}
                                  className="w-full p-3 rounded-xl border bg-white dark:bg-slate-900 flex items-center justify-between text-left text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                >
                                  <span className="font-medium text-foreground truncate pr-2">
                                    {f.question}
                                  </span>
                                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                </button>
                              ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Tab: Lead Capture Form */}
                {activeTab === "lead" && (
                  <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    <div className="text-center space-y-1">
                      <h4 className="text-sm font-bold text-foreground">Leave Your Contact Info</h4>
                      <p className="text-xs text-muted-foreground">
                        Get in touch with our team for questions, product demos, or support inquiries.
                      </p>
                    </div>

                    <form onSubmit={handleLeadSubmit} className="space-y-3">
                      <div>
                        <label className="text-[11px] font-medium text-foreground">Name</label>
                        <input
                          type="text"
                          value={formName}
                          onChange={(e) => setFormName(e.target.value)}
                          placeholder="Your Name"
                          className="w-full px-3 py-2 text-xs rounded-xl border bg-white dark:bg-slate-900 text-foreground focus:outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-medium text-foreground">Email</label>
                        <input
                          type="email"
                          value={formEmail}
                          onChange={(e) => setFormEmail(e.target.value)}
                          placeholder="name@example.com"
                          className="w-full px-3 py-2 text-xs rounded-xl border bg-white dark:bg-slate-900 text-foreground focus:outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-medium text-foreground">Phone</label>
                        <input
                          type="tel"
                          value={formPhone}
                          onChange={(e) => setFormPhone(e.target.value)}
                          placeholder="+1 (555) 000-0000"
                          className="w-full px-3 py-2 text-xs rounded-xl border bg-white dark:bg-slate-900 text-foreground focus:outline-none"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full py-2.5 rounded-xl text-white text-xs font-semibold shadow-sm transition-all hover:opacity-90"
                        style={{ backgroundColor: primaryColor }}
                      >
                        Submit Contact Details
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { MessageSquare, HelpCircle, UserPlus, Headphones, Sparkles, UserCheck } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface WidgetHeaderProps {
  title: string;
  subtitle?: string;
  logoUrl?: string | null;
  primaryColor: string;
  activeTab: "chat" | "faq" | "lead";
  onTabChange: (tab: "chat" | "faq" | "lead") => void;
  isAgentTyping?: boolean;
  isAiTyping?: boolean;
  agentName?: string | null;
  isHandedToHuman?: boolean;
  onRequestHumanHandover?: () => Promise<void>;
  leadCaptured?: boolean;
}

export function WidgetHeader({
  title,
  subtitle,
  logoUrl,
  primaryColor,
  activeTab,
  onTabChange,
  isAgentTyping,
  isAiTyping,
  agentName,
  isHandedToHuman,
  onRequestHumanHandover,
  leadCaptured,
}: WidgetHeaderProps) {
  return (
    <div
      className="text-white p-4 shrink-0 transition-colors shadow-sm"
      style={{ backgroundColor: primaryColor }}
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar size="default" className="border-2 border-white/20 shadow-xs bg-white/10 shrink-0">
            {logoUrl && <AvatarImage src={logoUrl} alt={title} />}
            <AvatarFallback className="bg-white/20 text-white font-bold text-sm">
              {title.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0">
            <h1 className="font-semibold text-base leading-tight truncate">
              {title}
            </h1>
            <div className="flex items-center gap-1.5 text-xs text-white/90 mt-0.5">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
              <span className="truncate">
                {isAgentTyping
                  ? `${agentName || "Agent"} is typing...`
                  : isAiTyping
                  ? "AI Assistant is thinking..."
                  : isHandedToHuman
                  ? agentName
                    ? `Connected to ${agentName}`
                    : "Support Agent Online"
                  : subtitle || "AI Assistant Active"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {!isHandedToHuman && onRequestHumanHandover && (
            <button
              type="button"
              onClick={onRequestHumanHandover}
              title="Request Human Support Agent"
              className="p-2 rounded-full transition-all text-xs flex items-center gap-1 border border-white/20 bg-white/15 hover:bg-white/25 text-white cursor-pointer"
            >
              <Headphones className="h-3.5 w-3.5" />
              <span className="hidden sm:inline text-[11px] font-medium">Human Agent</span>
            </button>
          )}

          {isHandedToHuman && (
            <div
              title="Human Support Active"
              className="px-2 py-1 rounded-full text-xs flex items-center gap-1 bg-white/20 border border-white/30 text-white"
            >
              <UserCheck className="h-3.5 w-3.5 text-emerald-300" />
              <span className="hidden sm:inline text-[11px] font-medium">Human Agent</span>
            </div>
          )}

          {!leadCaptured && (
            <button
              type="button"
              onClick={() => onTabChange(activeTab === "lead" ? "chat" : "lead")}
              title="Leave Contact Details"
              className={cn(
                "p-2 rounded-full transition-all text-xs flex items-center gap-1 border border-white/20 cursor-pointer",
                activeTab === "lead"
                  ? "bg-white text-slate-900 font-medium"
                  : "bg-white/15 hover:bg-white/25 text-white"
              )}
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline text-[11px]">Contact</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex rounded-lg bg-black/20 p-0.5 text-xs font-medium backdrop-blur-xs">
        <button
          type="button"
          onClick={() => onTabChange("chat")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md transition-all cursor-pointer",
            activeTab === "chat"
              ? "bg-white text-slate-900 shadow-xs font-semibold"
              : "text-white/80 hover:text-white hover:bg-white/10"
          )}
        >
          <MessageSquare className="h-3.5 w-3.5" />
          <span>Chat</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange("faq")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md transition-all cursor-pointer",
            activeTab === "faq"
              ? "bg-white text-slate-900 shadow-xs font-semibold"
              : "text-white/80 hover:text-white hover:bg-white/10"
          )}
        >
          <HelpCircle className="h-3.5 w-3.5" />
          <span>Help & FAQs</span>
        </button>
      </div>
    </div>
  );
}

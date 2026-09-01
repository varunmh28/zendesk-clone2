"use client";

import React from "react";
import { UserCheck, Shield, MessageSquare, HelpCircle, Ban, Check } from "lucide-react";
import { cn } from "@/lib/utils";

type LeadCaptureMode = "before_chat" | "mid_chat" | "optional" | "disabled";

interface LeadCaptureTabProps {
  leadCaptureMode: LeadCaptureMode;
  onChangeLeadCaptureMode: (mode: LeadCaptureMode) => void;
}

export function LeadCaptureTab({
  leadCaptureMode,
  onChangeLeadCaptureMode,
}: LeadCaptureTabProps) {
  const options: Array<{
    id: LeadCaptureMode;
    title: string;
    badge: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    recommended?: boolean;
  }> = [
    {
      id: "before_chat",
      title: "Gated Form (Before Chat)",
      badge: "Highest Capture Rate",
      description:
        "Visitors must enter their Name and Email / Phone before sending their first chat message. Best for sales pipelines and high-value lead acquisition.",
      icon: Shield,
    },
    {
      id: "mid_chat",
      title: "Mid-Conversation Prompt",
      badge: "Recommended for Engagement",
      description:
        "Visitors start chatting immediately. After 2 exchanges, the AI assistant politely asks for their contact details to send email follow-ups or connect an agent.",
      icon: MessageSquare,
      recommended: true,
    },
    {
      id: "optional",
      title: "Optional Contact Tab",
      badge: "Frictionless",
      description:
        "Visitors can browse, ask questions, or voluntary click the 'Contact Info' header button to leave their details whenever they wish.",
      icon: UserCheck,
    },
    {
      id: "disabled",
      title: "Disabled (Pure Support)",
      badge: "Zero Gate",
      description:
        "Disable all lead collection forms. Visitors can chat and read knowledge base FAQs without any contact prompts.",
      icon: Ban,
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      <div className="space-y-1">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <UserCheck className="h-4 w-4 text-primary" /> Lead Capture Strategy
        </label>
        <p className="text-xs text-muted-foreground">
          Configure how and when your support chat widget collects visitor contact details into your CRM.
        </p>
      </div>

      <div className="space-y-3">
        {options.map((option) => {
          const Icon = option.icon;
          const isSelected = leadCaptureMode === option.id;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onChangeLeadCaptureMode(option.id)}
              className={cn(
                "w-full p-4 rounded-xl border text-left transition-all flex items-start justify-between gap-4 cursor-pointer relative",
                isSelected
                  ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-xs"
                  : "border-border bg-card hover:border-muted-foreground/40"
              )}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={cn(
                    "p-2.5 rounded-xl shrink-0 mt-0.5",
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-foreground">
                      {option.title}
                    </span>
                    <span
                      className={cn(
                        "text-[10px] font-semibold px-2 py-0.5 rounded-full border",
                        option.recommended
                          ? "bg-primary/10 text-primary border-primary/20"
                          : "bg-muted text-muted-foreground border-border"
                      )}
                    >
                      {option.badge}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {option.description}
                  </p>
                </div>
              </div>

              <div className="shrink-0 pt-1">
                <div
                  className={cn(
                    "h-5 w-5 rounded-full border flex items-center justify-center transition-all",
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-muted-foreground/40 bg-transparent"
                  )}
                >
                  {isSelected && <Check className="h-3 w-3" />}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

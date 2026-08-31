"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FaqItem {
  question: string;
  answer: string;
  category: "Billing" | "AI & Features" | "Security & Seats";
}

const FAQS: FaqItem[] = [
  {
    category: "Billing",
    question: "How do seats and agent invitations work?",
    answer:
      "Seats represent active support team members who can access the realtime shared inbox, reply to tickets, and configure knowledge base sources. The Free plan includes 1 seat, Pro includes 5 seats (with add-ons at $15/seat/month), and Enterprise provides flexible or unlimited seat allocations.",
  },
  {
    category: "AI & Features",
    question: "What happens if we reach our monthly AI message limit?",
    answer:
      "When your workspace hits 100% of its monthly AI message quota, SupportHub seamlessly transitions to Lead Capture & Human Handoff mode. Visitors can still ask questions and leave their email, and your team is immediately notified in the shared inbox. You can upgrade tiers anytime with prorated billing.",
  },
  {
    category: "Billing",
    question: "Can I switch between monthly and annual billing?",
    answer:
      "Yes! You can toggle between monthly and annual billing anytime in your Workspace Settings. Switching to annual billing automatically applies a 20% discount across all included seats and quotas.",
  },
  {
    category: "AI & Features",
    question: "How does human agent handoff work when AI cannot answer?",
    answer:
      "Our Gemini 2.0 agent detects low-confidence queries or direct visitor requests for human assistance. It triggers an instant alert in your Shared Inbox with presence indicators, collision locks, and the full transcript so your agents can take over with zero friction.",
  },
  {
    category: "Security & Seats",
    question: "Can I embed the SupportHub widget on multiple domains?",
    answer:
      "Yes! Each workspace receives a secure public key (`pk_live_...`). You can embed this script tag on your marketing site, web app, documentation subdomain, or CMS without additional charges.",
  },
  {
    category: "Billing",
    question: "Is there a free trial for paid plans, and can I cancel anytime?",
    answer:
      "Every new workspace includes a 14-day free trial of the Pro tier with no credit card required upfront. You can downgrade to the free tier or cancel your subscription anytime with 1 click.",
  },
];

export function PricingFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="text-center space-y-2 mb-8">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <HelpCircle className="size-3.5" /> Frequently Asked Questions
        </div>
        <h3 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Everything you need to know about pricing & limits
        </h3>
        <p className="text-sm text-muted-foreground max-w-xl mx-auto">
          Clear, predictable plans with no per-resolution penalty charges.
        </p>
      </div>

      <div className="space-y-3">
        {FAQS.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className={cn(
                "rounded-xl border transition-all duration-200 overflow-hidden",
                isOpen
                  ? "border-primary/40 bg-card/90 shadow-sm"
                  : "border-border/60 bg-card/40 hover:border-border"
              )}
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="flex w-full items-center justify-between p-4 sm:p-5 text-left text-sm font-semibold text-foreground"
              >
                <span className="flex items-center gap-3">
                  <span className="text-xs font-normal text-muted-foreground uppercase tracking-wider px-2 py-0.5 rounded bg-muted/60">
                    {faq.category}
                  </span>
                  {faq.question}
                </span>
                <ChevronDown
                  className={cn(
                    "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
                    isOpen && "rotate-180 text-primary"
                  )}
                />
              </button>

              {isOpen && (
                <div className="px-4 pb-5 sm:px-5 text-sm text-muted-foreground leading-relaxed border-t border-border/40 pt-3">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

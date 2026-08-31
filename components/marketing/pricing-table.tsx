"use client";

import { Check, Minus, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface FeatureRow {
  name: string;
  free: string | boolean;
  pro: string | boolean;
  enterprise: string | boolean;
  tooltip?: string;
}

interface FeatureSection {
  category: string;
  features: FeatureRow[];
}

const COMPARISON_DATA: FeatureSection[] = [
  {
    category: "Seats & Core Usage",
    features: [
      { name: "Included Team Seats", free: "1 Seat", pro: "5 Seats", enterprise: "Unlimited / 25+" },
      { name: "Additional Seat Add-ons", free: "—", pro: "$15 / seat / mo", enterprise: "Custom volume pricing" },
      { name: "Monthly AI Messages", free: "100 msgs", pro: "2,000 msgs", enterprise: "20,000+ msgs" },
      { name: "Knowledge Base Documents", free: "5 docs", pro: "50 docs", enterprise: "Unlimited" },
      { name: "Document Auto-Chunking (768-dim)", free: true, pro: true, enterprise: true },
    ],
  },
  {
    category: "AI Agent & RAG Intelligence",
    features: [
      { name: "Gemini 2.0 Flash AI Engine", free: true, pro: true, enterprise: true },
      { name: "Grounded Source Citations", free: "Basic", pro: "Full with Excerpts", enterprise: "Full with Custom Filters" },
      { name: "Confidence Scoring & Thresholds", free: false, pro: true, enterprise: true },
      { name: "Custom AI Persona & Guidelines", free: false, pro: true, enterprise: true },
      { name: "Multi-Language Auto-Translation", free: false, pro: true, enterprise: true },
    ],
  },
  {
    category: "Team Inbox & Collaboration",
    features: [
      { name: "Realtime WebSocket Message Sync", free: true, pro: true, enterprise: true },
      { name: "Live Typing & Presence Indicators", free: true, pro: true, enterprise: true },
      { name: "Agent Collision Prevention", free: false, pro: true, enterprise: true },
      { name: "Internal Private Staff Notes", free: true, pro: true, enterprise: true },
      { name: "1-Click Human Agent Takeover", free: true, pro: true, enterprise: true },
    ],
  },
  {
    category: "Embeddable Widget & Customization",
    features: [
      { name: "2-Minute Script Embed Tag", free: true, pro: true, enterprise: true },
      { name: "Custom Brand Colors & Rounding", free: "Basic", pro: "Full Palette & CSS", enterprise: "White-label (No watermark)" },
      { name: "Lead Capture (Pre/Mid-chat)", free: false, pro: true, enterprise: true },
      { name: "Proactive Welcome Messages", free: false, pro: true, enterprise: true },
      { name: "Sound Notifications", free: true, pro: true, enterprise: true },
    ],
  },
  {
    category: "Security, Compliance & Support",
    features: [
      { name: "Clerk Organization RBAC", free: true, pro: true, enterprise: true },
      { name: "Convex Realtime Encryption", free: true, pro: true, enterprise: true },
      { name: "Dedicated Slack Channel Support", free: false, pro: false, enterprise: true },
      { name: "99.9% Guaranteed Uptime SLA", free: false, pro: false, enterprise: true },
      { name: "Custom Invoicing & BACS/ACH", free: false, pro: false, enterprise: true },
    ],
  },
];

export function PricingTable() {
  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md shadow-lg">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border/80 bg-muted/40">
            <th className="py-5 px-6 font-bold text-base text-foreground w-1/3">
              Feature Breakdown
            </th>
            <th className="py-5 px-4 font-semibold text-foreground text-center w-2/9">
              <div className="flex flex-col items-center">
                <span className="text-base font-bold">Free</span>
                <span className="text-xs text-muted-foreground">$0 / month</span>
              </div>
            </th>
            <th className="py-5 px-4 font-semibold text-primary text-center w-2/9 bg-primary/5 border-x border-primary/20 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground text-[10px] px-2 py-0.5 shadow-xs">
                  <Sparkles className="size-2.5 mr-1" /> Most Popular
                </Badge>
              </div>
              <div className="flex flex-col items-center pt-1">
                <span className="text-base font-bold text-foreground">Pro</span>
                <span className="text-xs text-muted-foreground">$49 / month</span>
              </div>
            </th>
            <th className="py-5 px-4 font-semibold text-foreground text-center w-2/9">
              <div className="flex flex-col items-center">
                <span className="text-base font-bold">Enterprise</span>
                <span className="text-xs text-muted-foreground">$199 / month</span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/50">
          {COMPARISON_DATA.map((section, sIdx) => (
            <ReactFragment key={sIdx} category={section.category} features={section.features} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ReactFragment({ category, features }: { category: string; features: FeatureRow[] }) {
  return (
    <>
      <tr className="bg-muted/30">
        <td colSpan={4} className="py-3 px-6 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {category}
        </td>
      </tr>
      {features.map((row, rIdx) => (
        <tr key={rIdx} className="hover:bg-accent/30 transition-colors">
          <td className="py-3.5 px-6 font-medium text-foreground text-xs sm:text-sm">
            {row.name}
          </td>
          <td className="py-3.5 px-4 text-center text-xs sm:text-sm text-muted-foreground">
            {renderCell(row.free)}
          </td>
          <td className="py-3.5 px-4 text-center text-xs sm:text-sm text-foreground bg-primary/[0.03] border-x border-primary/20 font-medium">
            {renderCell(row.pro)}
          </td>
          <td className="py-3.5 px-4 text-center text-xs sm:text-sm text-muted-foreground">
            {renderCell(row.enterprise)}
          </td>
        </tr>
      ))}
    </>
  );
}

function renderCell(val: string | boolean) {
  if (typeof val === "boolean") {
    return val ? (
      <div className="flex justify-center">
        <div className="size-5 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
          <Check className="size-3.5" />
        </div>
      </div>
    ) : (
      <div className="flex justify-center">
        <Minus className="size-4 text-muted-foreground/40" />
      </div>
    );
  }
  return <span>{val}</span>;
}

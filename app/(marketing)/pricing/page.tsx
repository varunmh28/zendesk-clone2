"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth, Show } from "@clerk/nextjs";
import { CheckoutButton } from "@clerk/nextjs/experimental";
import {
  Check,
  Minus,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Bot,
  Building,
  HelpCircle,
  CreditCard,
  Lock,
  Layers,
  Users,
  MessageSquare,
  BookOpen,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PricingFaq } from "@/components/marketing/pricing-faq";
import { cn } from "@/lib/utils";

interface PlanConfig {
  id: string;
  name: string;
  planId: string;
  badge: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  icon: typeof Zap;
  features: string[];
  ctaText: string;
  popular?: boolean;
}

const PLANS: PlanConfig[] = [
  {
    id: "free",
    name: "Free",
    planId: "cplan_free",
    badge: "Free Forever",
    description: "Essential AI customer support for solo builders, side projects, and early evaluation.",
    monthlyPrice: 0,
    annualPrice: 0,
    icon: Bot,
    features: [
      "1 Team Seat included",
      "100 AI Messages / month",
      "5 KB source documents (768-dim embeddings)",
      "Standard Embeddable Chat Widget",
      "Realtime Shared Team Inbox",
      "Community Support & Guides",
    ],
    ctaText: "Start for Free",
    popular: false,
  },
  {
    id: "pro",
    name: "Pro",
    planId: "cplan_pro",
    badge: "Most Popular",
    description: "Complete AI and human support automation for high-growth startups and fast-moving teams.",
    monthlyPrice: 49,
    annualPrice: 39,
    icon: Sparkles,
    features: [
      "5 Team Seats included ($15/seat add-on)",
      "2,000 AI Messages / month",
      "50 Knowledge Base source documents",
      "Gemini 2.0 Flash RAG with Source Citations",
      "Lead Capture Forms (Pre-chat & Mid-chat)",
      "Live Agent Collision Prevention & Presence",
      "Full Widget Customizer & Proactive Greetings",
      "Priority Email & In-App Support",
    ],
    ctaText: "Upgrade to Pro",
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    planId: "cplan_enterprise",
    badge: "Scale & SLA",
    description: "Dedicated AI infrastructure, unlimited seats, custom integrations, and enterprise SLAs.",
    monthlyPrice: 199,
    annualPrice: 159,
    icon: Building,
    features: [
      "Unlimited / 25+ Included Team Seats",
      "20,000+ AI Messages / month",
      "Unlimited Knowledge Base documents",
      "Custom AI Persona & Fine-Tuned Instructions",
      "White-label Widget (Zero branding)",
      "Dedicated Account Manager & Slack Connect",
      "99.9% Guaranteed Uptime SLA",
      "Custom Invoicing, SSO & Webhooks",
    ],
    ctaText: "Upgrade to Enterprise",
    popular: false,
  },
];

interface FeatureRow {
  name: string;
  free: string | boolean;
  pro: string | boolean;
  enterprise: string | boolean;
}

interface FeatureSection {
  category: string;
  icon: typeof Zap;
  features: FeatureRow[];
}

const COMPARISON_DATA: FeatureSection[] = [
  {
    category: "Seats & Monthly Usage",
    icon: Users,
    features: [
      { name: "Included Team Seats", free: "1 Seat", pro: "5 Seats", enterprise: "Unlimited / 25+" },
      { name: "Additional Seat Add-on", free: "—", pro: "$15 / seat / mo", enterprise: "Custom volume" },
      { name: "Monthly AI Messages", free: "100 msgs", pro: "2,000 msgs", enterprise: "20,000+ msgs" },
      { name: "Knowledge Base Documents", free: "5 docs", pro: "50 docs", enterprise: "Unlimited" },
      { name: "Gemini Vector Chunking (768-dim)", free: true, pro: true, enterprise: true },
    ],
  },
  {
    category: "AI Engine & Knowledge Base",
    icon: Bot,
    features: [
      { name: "Gemini 2.0 Flash AI Engine", free: true, pro: true, enterprise: true },
      { name: "Grounded Source Citations & Excerpts", free: "Basic", pro: "Full with Snippets", enterprise: "Full with Custom Scope" },
      { name: "Document Ingestion (.md, .txt, .pdf)", free: true, pro: true, enterprise: true },
      { name: "Custom AI Persona & Prompt Tuning", free: false, pro: true, enterprise: true },
      { name: "Automatic Quota Fallback Routing", free: true, pro: true, enterprise: true },
    ],
  },
  {
    category: "Team Inbox & Collaboration",
    icon: MessageSquare,
    features: [
      { name: "Realtime WebSocket Message Sync", free: true, pro: true, enterprise: true },
      { name: "Live Typing & Viewing Presence", free: true, pro: true, enterprise: true },
      { name: "1-Click Human Agent Takeover", free: true, pro: true, enterprise: true },
      { name: "Internal Private Notes (Staff-only)", free: true, pro: true, enterprise: true },
      { name: "Agent Collision Prevention", free: false, pro: true, enterprise: true },
      { name: "Conversation Assignment & Filters", free: true, pro: true, enterprise: true },
    ],
  },
  {
    category: "Embeddable Widget & Customizer",
    icon: Layers,
    features: [
      { name: "Lightweight Script Embed Loader", free: true, pro: true, enterprise: true },
      { name: "Branding Colors & Corner Radius", free: "Basic Swatches", pro: "Full Color Picker & Radius", enterprise: "White-label (No watermark)" },
      { name: "Lead Capture (Pre-chat / Mid-chat)", free: false, pro: true, enterprise: true },
      { name: "Proactive Welcome Popup & Dwell Delay", free: false, pro: true, enterprise: true },
      { name: "Web Audio Sound Notifications", free: true, pro: true, enterprise: true },
      { name: "In-Widget Help Center & FAQs", free: true, pro: true, enterprise: true },
    ],
  },
  {
    category: "Security, Governance & Support",
    icon: ShieldCheck,
    features: [
      { name: "Clerk Organization RBAC (Admin & Member)", free: true, pro: true, enterprise: true },
      { name: "Convex Realtime Encryption & Isolation", free: true, pro: true, enterprise: true },
      { name: "CSV Lead Export & CRM Pipeline", free: false, pro: true, enterprise: true },
      { name: "Support Response Channel", free: "Community", pro: "Priority Email", enterprise: "Dedicated Slack Connect" },
      { name: "99.9% Uptime Guarantee SLA", free: false, pro: false, enterprise: true },
    ],
  },
];

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");
  const { orgId } = useAuth();

  return (
    <div className="flex flex-col py-12 md:py-20 lg:py-24 space-y-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Pricing Header */}
      <div className="text-center space-y-5 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
          <Zap className="size-3.5" /> Fair, Transparent Pricing
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground">
          Predictable plans for teams of any size
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground">
          Empower your support team with Gemini 2.0 AI RAG, shared inboxes, and live presence. No hidden per-ticket penalties.
        </p>

        {/* Billing Cycle Toggle */}
        <div className="pt-6 flex items-center justify-center gap-3">
          <span
            onClick={() => setBillingCycle("monthly")}
            className={cn(
              "text-xs sm:text-sm font-medium cursor-pointer transition-colors",
              billingCycle === "monthly" ? "text-foreground font-bold" : "text-muted-foreground"
            )}
          >
            Monthly Billing
          </span>
          <button
            type="button"
            onClick={() => setBillingCycle(billingCycle === "monthly" ? "annual" : "monthly")}
            className="relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-muted transition-colors duration-200 ease-in-out focus:outline-none"
            aria-label="Toggle annual billing"
          >
            <span
              className={cn(
                "pointer-events-none inline-block size-6 transform rounded-full bg-primary shadow-lg ring-0 transition duration-200 ease-in-out",
                billingCycle === "annual" ? "translate-x-5" : "translate-x-0"
              )}
            />
          </button>
          <span
            onClick={() => setBillingCycle("annual")}
            className={cn(
              "text-xs sm:text-sm font-medium cursor-pointer transition-colors flex items-center gap-1.5",
              billingCycle === "annual" ? "text-foreground font-bold" : "text-muted-foreground"
            )}
          >
            Annual Billing
            <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] px-2 py-0.5">
              Save 20%
            </Badge>
          </span>
        </div>
      </div>

      {/* Plan Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {PLANS.map((plan) => {
          const price = billingCycle === "annual" ? plan.annualPrice : plan.monthlyPrice;
          const PlanIcon = plan.icon;

          return (
            <div
              key={plan.id}
              className={cn(
                "relative rounded-3xl p-7 sm:p-8 flex flex-col justify-between transition-all duration-200 shadow-md",
                plan.popular
                  ? "border-2 border-primary bg-card/95 shadow-xl ring-4 ring-primary/10"
                  : "border border-border/80 bg-card/60 hover:border-border"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground text-xs px-3 py-1 font-semibold shadow-sm">
                    <Sparkles className="size-3 mr-1" /> {plan.badge}
                  </Badge>
                </div>
              )}

              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={cn(
                        "p-2 rounded-xl",
                        plan.popular ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
                      )}>
                        <PlanIcon className="size-5" />
                      </div>
                      <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                    </div>
                    {!plan.popular && (
                      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-2 py-0.5 rounded bg-muted">
                        {plan.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {plan.description}
                  </p>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-1 pt-2">
                  <span className="text-4xl sm:text-5xl font-black tracking-tight text-foreground">
                    ${price}
                  </span>
                  <span className="text-xs sm:text-sm text-muted-foreground font-medium">
                    / month {billingCycle === "annual" && price > 0 && "(billed annually)"}
                  </span>
                </div>

                {/* Clerk CheckoutButton Action */}
                <div className="pt-2">
                  {plan.id === "free" ? (
                    <Link
                      href="/sign-up"
                      className={cn(
                        buttonVariants({ variant: "outline", size: "lg" }),
                        "w-full font-semibold gap-2 shadow-xs"
                      )}
                    >
                      {plan.ctaText}
                      <ArrowRight className="size-4" />
                    </Link>
                  ) : (
                    <>
                      {/* Authenticated user: Clerk CheckoutButton Drawer */}
                      <Show when="signed-in">
                        <CheckoutButton
                          planId={plan.planId}
                          planPeriod={billingCycle === "annual" ? "annual" : "month"}
                          for={orgId ? "organization" : "user"}
                          newSubscriptionRedirectUrl="/dashboard"
                        >
                          <Button
                            size="lg"
                            className={cn(
                              "w-full font-semibold gap-2 cursor-pointer",
                              plan.popular
                                ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
                                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                            )}
                          >
                            <CreditCard className="size-4" />
                            {plan.ctaText}
                          </Button>
                        </CheckoutButton>
                      </Show>

                      {/* Signed-out user: Direct Sign-Up link */}
                      <Show when="signed-out">
                        <Link
                          href="/sign-up"
                          className={cn(
                            buttonVariants({
                              variant: plan.popular ? "default" : "secondary",
                              size: "lg",
                            }),
                            "w-full font-semibold gap-2 shadow-xs",
                            plan.popular && "shadow-md"
                          )}
                        >
                          <CreditCard className="size-4" />
                          {plan.ctaText}
                        </Link>
                      </Show>
                    </>
                  )}
                </div>

                {/* Feature Highlights */}
                <div className="space-y-3 pt-4 border-t border-border/60">
                  <span className="text-xs font-semibold uppercase tracking-wider text-foreground">
                    Key Highlights:
                  </span>
                  <ul className="space-y-2.5">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-muted-foreground">
                        <div className="size-4 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
                          <Check className="size-3" />
                        </div>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Concise Unified Feature Comparison Table */}
      <div className="space-y-8 pt-6">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Complete Feature Comparison
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Every limit, security standard, and AI capability broken down across tiers.
          </p>
        </div>

        <div className="w-full overflow-x-auto rounded-3xl border border-border/80 bg-card/70 backdrop-blur-md shadow-xl">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-border/80 bg-muted/40">
                <th className="py-5 px-6 font-bold text-base text-foreground w-2/5">
                  Plan Capabilities
                </th>
                <th className="py-5 px-4 font-semibold text-foreground text-center w-1/5">
                  <div className="flex flex-col items-center">
                    <span className="text-base font-bold">Free</span>
                    <span className="text-xs text-muted-foreground">$0 / mo</span>
                  </div>
                </th>
                <th className="py-5 px-4 font-semibold text-primary text-center w-1/5 bg-primary/5 border-x border-primary/20 relative">
                  <div className="flex flex-col items-center">
                    <span className="text-base font-bold text-foreground">Pro</span>
                    <span className="text-xs text-muted-foreground">
                      ${billingCycle === "annual" ? "39" : "49"} / mo
                    </span>
                  </div>
                </th>
                <th className="py-5 px-4 font-semibold text-foreground text-center w-1/5">
                  <div className="flex flex-col items-center">
                    <span className="text-base font-bold">Enterprise</span>
                    <span className="text-xs text-muted-foreground">
                      ${billingCycle === "annual" ? "159" : "199"} / mo
                    </span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {COMPARISON_DATA.map((section, sIdx) => {
                const SectionIcon = section.icon;
                return (
                  <tr key={sIdx} className="contents">
                    {/* Category Header Row */}
                    <tr className="bg-muted/30 border-t-2 border-border/70">
                      <td
                        colSpan={4}
                        className="py-3.5 px-6 font-bold text-xs uppercase tracking-wider text-primary"
                      >
                        <div className="flex items-center gap-2">
                          <SectionIcon className="size-4" />
                          <span>{section.category}</span>
                        </div>
                      </td>
                    </tr>

                    {/* Features Rows */}
                    {section.features.map((feat, fIdx) => (
                      <tr
                        key={fIdx}
                        className="hover:bg-muted/15 transition-colors"
                      >
                        <td className="py-3.5 px-6 text-foreground font-medium text-xs sm:text-sm">
                          {feat.name}
                        </td>

                        {/* Free Value */}
                        <td className="py-3.5 px-4 text-center">
                          {typeof feat.free === "boolean" ? (
                            feat.free ? (
                              <Check className="size-4 text-emerald-500 mx-auto" />
                            ) : (
                              <Minus className="size-4 text-muted-foreground/40 mx-auto" />
                            )
                          ) : (
                            <span className="text-xs text-muted-foreground font-medium">
                              {feat.free}
                            </span>
                          )}
                        </td>

                        {/* Pro Value (Highlighted column) */}
                        <td className="py-3.5 px-4 text-center bg-primary/5 border-x border-primary/20">
                          {typeof feat.pro === "boolean" ? (
                            feat.pro ? (
                              <Check className="size-4 text-primary font-bold mx-auto" />
                            ) : (
                              <Minus className="size-4 text-muted-foreground/40 mx-auto" />
                            )
                          ) : (
                            <span className="text-xs text-primary font-semibold">
                              {feat.pro}
                            </span>
                          )}
                        </td>

                        {/* Enterprise Value */}
                        <td className="py-3.5 px-4 text-center">
                          {typeof feat.enterprise === "boolean" ? (
                            feat.enterprise ? (
                              <Check className="size-4 text-emerald-500 mx-auto" />
                            ) : (
                              <Minus className="size-4 text-muted-foreground/40 mx-auto" />
                            )
                          ) : (
                            <span className="text-xs text-foreground font-semibold">
                              {feat.enterprise}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ Section */}
      <div id="faq" className="pt-4">
        <PricingFaq />
      </div>

      {/* Bottom CTA Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-primary/90 via-primary to-indigo-600 p-8 sm:p-12 text-primary-foreground text-center space-y-6 shadow-2xl relative overflow-hidden">
        <div className="space-y-3 max-w-2xl mx-auto relative z-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to upgrade your customer experience?
          </h2>
          <p className="text-sm sm:text-base text-primary-foreground/80">
            Start automating customer support inquiries with Gemini 2.0 AI in under 5 minutes. No credit card required.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10 pt-2">
          <Link
            href="/sign-up"
            className={cn(
              buttonVariants({ size: "lg", variant: "secondary" }),
              "font-bold px-8 shadow-lg text-primary hover:text-primary"
            )}
          >
            Start Free Trial
            <ArrowRight className="size-4 ml-2" />
          </Link>
          <Link
            href="/install"
            className={cn(
              buttonVariants({ size: "lg", variant: "outline" }),
              "font-medium border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
            )}
          >
            View Embed Guide
          </Link>
        </div>
      </div>
    </div>
  );
}

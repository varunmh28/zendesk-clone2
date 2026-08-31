"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Check,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Bot,
  Building,
  HelpCircle,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PricingTable } from "@/components/marketing/pricing-table";
import { PricingFaq } from "@/components/marketing/pricing-faq";
import { cn } from "@/lib/utils";

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");

  const plans = [
    {
      name: "Free",
      badge: "Get Started",
      description: "Essential AI customer support for individuals, side projects, and early prototypes.",
      monthlyPrice: 0,
      annualPrice: 0,
      features: [
        "1 Team Seat included",
        "100 AI Messages / month",
        "5 Knowledge Base source documents",
        "Core Embeddable Widget",
        "Realtime Shared Team Inbox",
        "Community Support",
      ],
      ctaText: "Start for Free",
      ctaHref: "/sign-up",
      popular: false,
    },
    {
      name: "Pro",
      badge: "Most Popular",
      description: "Complete AI and human support automation for growing teams and startups.",
      monthlyPrice: 49,
      annualPrice: 39,
      features: [
        "5 Team Seats included ($15/seat add-on)",
        "2,000 AI Messages / month",
        "50 Knowledge Base source documents",
        "Gemini 2.0 Flash RAG with Source Citations",
        "Lead Capture Forms (Pre/Mid-chat)",
        "Live Agent Collision Prevention & Presence",
        "Custom Widget Branding & Proactive Triggers",
        "Priority Email & In-App Support",
      ],
      ctaText: "Start 14-Day Free Pro Trial",
      ctaHref: "/sign-up",
      popular: true,
    },
    {
      name: "Enterprise",
      badge: "Scale & SLA",
      description: "Dedicated AI infrastructure, unlimited seats, and custom SLAs for enterprise organizations.",
      monthlyPrice: 199,
      annualPrice: 159,
      features: [
        "Unlimited / 25+ Included Team Seats",
        "20,000+ AI Messages / month",
        "Unlimited Knowledge Base documents",
        "Custom AI Persona & Fine-Tuned Instructions",
        "White-label Widget (Zero branding)",
        "Dedicated Account Manager & Slack Connect",
        "99.9% Guaranteed Uptime SLA",
        "Custom Webhooks, SSO & Invoicing",
      ],
      ctaText: "Contact Enterprise Sales",
      ctaHref: "/sign-up",
      popular: false,
    },
  ];

  return (
    <div className="flex flex-col py-12 md:py-20 lg:py-24 space-y-20">
      {/* Pricing Hero */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center space-y-5">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
          <Zap className="size-3.5" /> Fair, Transparent Pricing
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground">
          Predictable plans for teams of any size
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
          Scale your customer success with Gemini 2.0 AI RAG. No hidden per-ticket resolution fees, ever.
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
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan) => {
            const price = billingCycle === "annual" ? plan.annualPrice : plan.monthlyPrice;

            return (
              <div
                key={plan.name}
                className={cn(
                  "relative rounded-3xl p-7 sm:p-8 flex flex-col justify-between transition-all duration-200 shadow-md",
                  plan.popular
                    ? "border-2 border-primary bg-card/90 shadow-xl ring-4 ring-primary/10"
                    : "border border-border/80 bg-card/50 hover:border-border"
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
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
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
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl sm:text-5xl font-black tracking-tight text-foreground">
                      ${price}
                    </span>
                    <span className="text-xs sm:text-sm text-muted-foreground font-medium">
                      / month {billingCycle === "annual" && price > 0 && "(billed annually)"}
                    </span>
                  </div>

                  {/* CTA Button */}
                  <Link
                    href={plan.ctaHref}
                    className={cn(
                      buttonVariants({
                        variant: plan.popular ? "default" : "outline",
                        size: "lg",
                      }),
                      "w-full font-semibold gap-2 shadow-xs",
                      plan.popular && "shadow-md"
                    )}
                  >
                    {plan.ctaText}
                    <ArrowRight className="size-4" />
                  </Link>

                  {/* Feature Checklist */}
                  <div className="space-y-3 pt-4 border-t border-border/60">
                    <span className="text-xs font-semibold uppercase tracking-wider text-foreground">
                      What's included:
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
      </div>

      {/* Feature Comparison Matrix Section */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Detailed Feature Comparison Matrix
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Explore every limit, security feature, and capability side-by-side across plans.
          </p>
        </div>

        <PricingTable />
      </div>

      {/* FAQ Section */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" id="faq">
        <PricingFaq />
      </div>
    </div>
  );
}

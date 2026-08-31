import { Metadata } from "next";
import {
  Code,
  Terminal,
  Zap,
  CheckCircle2,
  Cpu,
  Layers,
  ArrowRight,
  ShieldCheck,
  BookOpen,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { InstallGuide } from "@/components/marketing/install-guide";
import { WidgetPlayground } from "@/components/marketing/widget-playground";
import { cn } from "@/lib/utils";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Installation & Developer Portal — SupportHub",
  description:
    "Embed the SupportHub AI Widget into any web application or CMS in under 2 minutes. Complete guides for HTML, React, Next.js, and Shopify.",
};

export default function InstallPortalPage() {
  return (
    <div className="flex flex-col py-12 md:py-20 space-y-20">
      {/* Hero */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center space-y-5">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
          <Terminal className="size-3.5" /> 2-Minute Quickstart Integration
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground">
          Developer Installation & Integration Portal
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
          Integrate the SupportHub AI chat widget into any website, single-page application, or CMS with zero build configuration.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground pt-3">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="size-3.5 text-emerald-500" /> Lightweight Async Bundle (&lt;18KB)
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="size-3.5 text-emerald-500" /> Zero Layout Shift (CLS 0.0)
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="size-3.5 text-emerald-500" /> Cross-Origin Isolated
          </span>
        </div>
      </div>

      {/* Main Installation Guide Section */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8" id="frameworks">
        <InstallGuide />
      </div>

      {/* Connection Tester Playground Section */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 border-t border-border/50 pt-16">
        <WidgetPlayground />
      </div>

      {/* Bottom Developer CTA */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-primary/20 bg-gradient-to-r from-primary/10 via-card to-indigo-500/10 p-8 sm:p-12 text-center space-y-5 shadow-lg">
          <h3 className="text-2xl sm:text-3xl font-bold text-foreground">
            Ready to generate your live workspace key?
          </h3>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">
            Create an organization in SupportHub to upload your knowledge base documents and customize your chat widget.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/sign-up"
              className={cn(buttonVariants({ size: "lg" }), "font-semibold gap-2 shadow-md")}
            >
              Create Free Workspace
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/dashboard"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

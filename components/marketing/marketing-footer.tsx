import Link from "next/link";
import { Bot, Sparkles, Globe, Share2, Shield, Heart } from "lucide-react";

export function MarketingFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/60 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 xl:gap-12">
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Bot className="size-4" />
              </div>
              <span className="text-lg font-bold tracking-tight text-foreground flex items-center gap-1.5">
                SupportHub
                <span className="inline-flex items-center gap-0.5 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                  <Sparkles className="size-2.5" /> AI 2.0
                </span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              The next-generation AI customer support platform. Grounded RAG agent, realtime shared inbox, and instant human takeover in under 2 minutes.
            </p>
            <div className="flex items-center gap-3 pt-2 text-muted-foreground">
              <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                All Systems Operational
              </div>
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/#features" className="hover:text-foreground transition-colors">
                  AI Shared Inbox
                </Link>
              </li>
              <li>
                <Link href="/#simulation" className="hover:text-foreground transition-colors">
                  Interactive Simulator
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-foreground transition-colors">
                  Pricing Plans
                </Link>
              </li>
              <li>
                <Link href="/install" className="hover:text-foreground transition-colors">
                  Embed Widget
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="hover:text-foreground transition-colors">
                  Knowledge Base RAG
                </Link>
              </li>
            </ul>
          </div>

          {/* Developers */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">Developers</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/install" className="hover:text-foreground transition-colors">
                  Quickstart Guide
                </Link>
              </li>
              <li>
                <Link href="/install#frameworks" className="hover:text-foreground transition-colors">
                  React & Next.js SDK
                </Link>
              </li>
              <li>
                <Link href="/install#playground" className="hover:text-foreground transition-colors">
                  Widget Playground
                </Link>
              </li>
              <li>
                <Link href="/install#api" className="hover:text-foreground transition-colors">
                  JS API Reference
                </Link>
              </li>
              <li>
                <a href="https://convex.dev" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors inline-flex items-center gap-1">
                  Built with Convex ↗
                </a>
              </li>
            </ul>
          </div>

          {/* Company & Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">Legal & Trust</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <span className="hover:text-foreground transition-colors cursor-pointer">
                  Privacy Policy
                </span>
              </li>
              <li>
                <span className="hover:text-foreground transition-colors cursor-pointer">
                  Terms of Service
                </span>
              </li>
              <li>
                <span className="hover:text-foreground transition-colors cursor-pointer">
                  Security & SOC2
                </span>
              </li>
              <li>
                <span className="hover:text-foreground transition-colors cursor-pointer">
                  GDPR Compliance
                </span>
              </li>
              <li>
                <span className="hover:text-foreground transition-colors cursor-pointer">
                  System Status
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-border/40 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {currentYear} SupportHub Inc. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              Powered by Gemini 2.0 Flash & Convex
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

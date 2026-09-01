"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { WidgetContainer } from "@/components/widget/widget-container";
import Link from "next/link";
import {
  Globe,
  RotateCcw,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Shield,
  Zap,
  Server,
  Database,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  X,
  Sliders,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SampleSiteClientProps {
  orgId: string;
  slug: string;
}

export function SampleSiteClient({ orgId, slug }: SampleSiteClientProps) {
  const workspace = useQuery(api.workspaces.getByOrgId, { orgId });
  const settings = useQuery(
    api.widget.getWidgetSettings,
    orgId ? { orgId } : "skip"
  );

  const [isWidgetOpen, setIsWidgetOpen] = useState(false);
  const [resetCount, setResetCount] = useState(0);
  const [showProactive, setShowProactive] = useState(false);

  // Position and styling from widget settings
  const position = settings?.position || "bottom-right";
  const primaryColor = settings?.primaryColor || "#6366f1";
  const borderRadius = settings?.borderRadius || "12px";
  const proactiveEnabled = settings?.proactiveEnabled ?? false;
  const proactiveDelaySeconds = settings?.proactiveDelaySeconds ?? 3;
  const proactiveMessage = settings?.proactiveMessage || "Hi there! How can we help you today?";

  // Proactive popup timer
  useEffect(() => {
    if (!proactiveEnabled || isWidgetOpen) {
      setShowProactive(false);
      return;
    }

    const timer = setTimeout(() => {
      setShowProactive(true);
    }, proactiveDelaySeconds * 1000);

    return () => clearTimeout(timer);
  }, [proactiveEnabled, proactiveDelaySeconds, isWidgetOpen, resetCount]);

  const handleResetSession = () => {
    if (typeof window !== "undefined" && workspace?.publicKey) {
      localStorage.removeItem(`sh_visitor_${workspace.publicKey}`);
      localStorage.removeItem(`sh_visitor_info_${workspace.publicKey}`);
      setResetCount((c) => c + 1);
      setIsWidgetOpen(false);
      setShowProactive(false);
    }
  };

  const handleTriggerWidget = () => {
    setIsWidgetOpen(true);
    setShowProactive(false);
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Test Utility Bar */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-2.5 text-xs sm:text-sm">
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 flex items-center gap-1 py-0.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Live Website Simulation
          </Badge>
          <span className="hidden md:inline text-slate-400">|</span>
          <span className="text-slate-300 font-medium hidden md:inline">
            Testing Workspace: <span className="font-mono text-xs text-indigo-300">{workspace?.name || slug}</span>
          </span>
          {workspace?.publicKey && (
            <span className="hidden lg:inline text-slate-400 font-mono text-[11px] bg-slate-800 px-2 py-0.5 rounded">
              Key: {workspace.publicKey}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleResetSession}
            className="text-xs h-8 border-slate-700 hover:bg-slate-800 text-slate-200 gap-1.5 cursor-pointer"
            title="Clears localStorage visitor ID and session to test fresh visitor flow"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Reset Visitor Session</span>
          </Button>

          <Button
            size="sm"
            onClick={handleTriggerWidget}
            style={{ backgroundColor: primaryColor }}
            className="text-xs h-8 text-white font-medium gap-1.5 shadow-sm hover:opacity-90 cursor-pointer"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            {isWidgetOpen ? "Widget Open" : "Open Chat Widget"}
          </Button>

          {workspace?.publicKey && (
            <Link
              href={`/widget/${workspace.publicKey}`}
              target="_blank"
              className="text-xs h-8 px-2.5 flex items-center gap-1 rounded-md border border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-slate-300 transition-colors"
              title="Open standalone widget window in new tab"
            >
              <ExternalLink className="h-3 w-3" />
              <span className="hidden lg:inline">Standalone</span>
            </Link>
          )}

          <Link
            href={`/orgs/${slug}/inbox`}
            className="text-xs h-8 px-2.5 flex items-center gap-1 rounded-md border border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-slate-300 transition-colors"
          >
            <MessageSquare className="h-3 w-3" />
            <span className="hidden sm:inline">View Team Inbox</span>
          </Link>
        </div>
      </header>

      {/* Simulated Sample Website Content */}
      <div className="flex-1 overflow-x-hidden">
        {/* Mock Brand Navigation */}
        <nav className="border-b border-slate-800/60 bg-slate-900/40 px-6 lg:px-12 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center font-bold text-white text-lg shadow-lg shadow-indigo-500/20">
                A
              </div>
              <span className="font-bold text-lg tracking-tight text-white">
                Apex<span className="text-indigo-400">Cloud</span>
              </span>
            </div>

            <div className="hidden md:flex items-center gap-6 text-sm text-slate-400 font-medium">
              <a href="#features" className="hover:text-slate-200 transition-colors">Features</a>
              <a href="#solutions" className="hover:text-slate-200 transition-colors">Solutions</a>
              <a href="#pricing" className="hover:text-slate-200 transition-colors">Pricing</a>
              <a href="#faq" className="hover:text-slate-200 transition-colors">FAQ</a>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleTriggerWidget}
              className="text-xs sm:text-sm font-medium text-slate-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-800/60 transition-colors flex items-center gap-1.5"
            >
              <HelpCircle className="h-4 w-4 text-indigo-400" />
              Contact Support
            </button>
            <button
              onClick={handleTriggerWidget}
              className="text-xs sm:text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded-lg shadow-sm transition-all"
            >
              Get Started
            </button>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative pt-16 pb-20 px-6 lg:px-12 max-w-6xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-medium">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Interactive Widget Test Sandbox</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
            Enterprise Cloud Infrastructure Built for <span className="bg-gradient-to-r from-indigo-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">Scale and Speed</span>
          </h1>

          <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Deploy ultra-low latency compute clusters globally in milliseconds. Backed by 24/7 AI-grounded customer assistance powered by SupportHub.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={handleTriggerWidget}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition-all cursor-pointer"
            >
              <MessageSquare className="h-4 w-4" />
              Chat With Our Live Assistant
            </button>
            <a
              href="#test-triggers"
              className="px-6 py-3 rounded-xl border border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-300 font-medium text-sm transition-colors flex items-center gap-2"
            >
              Explore Test Prompts
              <ChevronRight className="h-4 w-4" />
            </a>
          </div>

          {/* Widget Testing Assistant Banner */}
          <div id="test-triggers" className="pt-12">
            <Card className="bg-slate-900/80 border-slate-800 text-left overflow-hidden shadow-2xl">
              <CardHeader className="border-b border-slate-800/80 bg-slate-900/90 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <CardTitle className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                      <Zap className="h-5 w-5 text-amber-400" />
                      Quick Widget Interactive Triggers
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-400">
                      Click any prompt below to trigger the embedded widget and test real AI RAG answers, citations, and agent takeover.
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="border-indigo-500/30 text-indigo-400 text-xs self-start sm:self-auto">
                    Active Widget Key: {workspace?.publicKey?.slice(0, 10)}...
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div
                  onClick={handleTriggerWidget}
                  className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800/40 transition-all cursor-pointer group"
                >
                  <div className="h-8 w-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Database className="h-4 w-4" />
                  </div>
                  <h4 className="text-sm font-semibold text-white group-hover:text-indigo-300">
                    Test Knowledge Base RAG
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Ask questions grounded in your uploaded articles or PDFs to inspect Gemini AI citations.
                  </p>
                </div>

                <div
                  onClick={handleTriggerWidget}
                  className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800/40 transition-all cursor-pointer group"
                >
                  <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Shield className="h-4 w-4" />
                  </div>
                  <h4 className="text-sm font-semibold text-white group-hover:text-emerald-300">
                    Test Lead Capture Form
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Submit visitor contact details in the widget to test automatic sync into your Leads CRM.
                  </p>
                </div>

                <div
                  onClick={handleTriggerWidget}
                  className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-800/40 transition-all cursor-pointer group"
                >
                  <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Server className="h-4 w-4" />
                  </div>
                  <h4 className="text-sm font-semibold text-white group-hover:text-amber-300">
                    Test Human Handover
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Click &quot;Talk to a human agent&quot; in the widget menu to test real-time WebSocket inbox routing.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Feature Grid */}
        <section id="features" className="py-16 px-6 lg:px-12 max-w-6xl mx-auto border-t border-slate-800/60">
          <div className="text-center space-y-3 mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Why Global Teams Choose ApexCloud</h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto">
              Engineered from the ground up for zero-downtime microservices and instant reactive data sync.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
              <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white">Sub-10ms Edge Routing</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Worldwide distributed anycast network routing requests to the closest compute nodes automatically.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
              <div className="h-10 w-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                <Shield className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white">Zero-Trust Isolation</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                End-to-end encrypted tunnels, tenant partition barriers, and instant security patch deployments.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Database className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-white">Instant Vector Search</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Built-in 768-dimensional embedding stores for high-throughput semantic querying and RAG workloads.
              </p>
            </div>
          </div>
        </section>

        {/* Pricing Table Section */}
        <section id="pricing" className="py-16 px-6 lg:px-12 max-w-6xl mx-auto border-t border-slate-800/60">
          <div className="text-center space-y-3 mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Predictable, Transparent Pricing</h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto">
              Scale effortlessly from your first serverless function to multi-region clusters.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
              <h4 className="text-sm font-semibold text-slate-300">Starter</h4>
              <div className="text-3xl font-extrabold text-white">$0 <span className="text-xs text-slate-400 font-normal">/ month</span></div>
              <p className="text-xs text-slate-400">Perfect for prototyping, dev environments, and side projects.</p>
              <ul className="text-xs text-slate-300 space-y-2 pt-2 border-t border-slate-800">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-indigo-400" /> 10GB Bandwidth</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-indigo-400" /> 100k Function Invocations</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-indigo-400" /> Community Support</li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/90 border-2 border-indigo-500/60 shadow-xl shadow-indigo-500/10 space-y-4 relative">
              <div className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-indigo-500 text-white text-[10px] font-bold">
                POPULAR
              </div>
              <h4 className="text-sm font-semibold text-indigo-300">Growth</h4>
              <div className="text-3xl font-extrabold text-white">$49 <span className="text-xs text-slate-400 font-normal">/ month</span></div>
              <p className="text-xs text-slate-400">Everything needed for production web applications and teams.</p>
              <ul className="text-xs text-slate-300 space-y-2 pt-2 border-t border-slate-800">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-indigo-400" /> 500GB Bandwidth</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-indigo-400" /> 5M Function Invocations</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-indigo-400" /> 24/7 AI & Human Support</li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
              <h4 className="text-sm font-semibold text-slate-300">Enterprise</h4>
              <div className="text-3xl font-extrabold text-white">$199 <span className="text-xs text-slate-400 font-normal">/ month</span></div>
              <p className="text-xs text-slate-400">High concurrency, custom SLAs, and dedicated compute instances.</p>
              <ul className="text-xs text-slate-300 space-y-2 pt-2 border-t border-slate-800">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-indigo-400" /> Unlimited Bandwidth</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-indigo-400" /> Dedicated VPC Peering</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-indigo-400" /> 99.99% Uptime SLA</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Mock Footer */}
        <footer className="border-t border-slate-800/80 bg-slate-950 py-8 px-6 lg:px-12 text-center text-xs text-slate-500">
          <p>© 2026 ApexCloud Technologies Inc. Sample Test Site for SupportHub Customer Chat Widget.</p>
        </footer>
      </div>

      {/* Floating Proactive Greeting Popup (Simulated) */}
      {showProactive && !isWidgetOpen && (
        <div
          className={cn(
            "fixed z-50 animate-in fade-in slide-in-from-bottom-3 duration-300 max-w-xs p-3.5 bg-slate-900 border border-slate-700 text-slate-100 shadow-2xl",
            position === "bottom-left" ? "bottom-20 left-6" : "bottom-20 right-6"
          )}
          style={{ borderRadius }}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[10px] font-bold">
                AI
              </div>
              <span className="text-xs font-semibold">{settings?.title || "Support"}</span>
            </div>
            <button
              onClick={() => setShowProactive(false)}
              className="text-slate-400 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="text-xs text-slate-300 mt-2">{proactiveMessage}</p>
          <button
            onClick={handleTriggerWidget}
            className="mt-2.5 text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            Reply now <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* Floating Chat Widget Launcher Button */}
      {!isWidgetOpen && (
        <button
          onClick={() => setIsWidgetOpen(true)}
          style={{
            backgroundColor: primaryColor,
            borderRadius: borderRadius === "0px" ? "4px" : "9999px",
          }}
          className={cn(
            "fixed z-50 h-14 w-14 text-white shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer",
            position === "bottom-left" ? "bottom-6 left-6" : "bottom-6 right-6"
          )}
          aria-label="Open Support Chat"
        >
          <MessageSquare className="h-6 w-6" />
        </button>
      )}

      {/* Embedded Live Widget Modal Overlay */}
      {isWidgetOpen && workspace?.publicKey && (
        <div
          className={cn(
            "fixed z-50 shadow-2xl border border-border overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col bg-white text-slate-900",
            position === "bottom-left"
              ? "bottom-4 left-4 sm:bottom-6 sm:left-6 w-[calc(100vw-2rem)] sm:w-[400px] h-[calc(100vh-6rem)] sm:h-[620px]"
              : "bottom-4 right-4 sm:bottom-6 sm:right-6 w-[calc(100vw-2rem)] sm:w-[400px] h-[calc(100vh-6rem)] sm:h-[620px]"
          )}
          style={{ borderRadius }}
        >
          {/* Top Widget Close / Minimize Bar */}
          <div className="absolute top-2 right-2 z-50">
            <button
              onClick={() => setIsWidgetOpen(false)}
              className="h-7 w-7 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Close widget"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <WidgetContainer
            key={`widget-session-${resetCount}`}
            workspaceKey={workspace.publicKey}
            isStandalone={false}
          />
        </div>
      )}
    </div>
  );
}

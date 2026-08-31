"use client";

import { useState } from "react";
import {
  Copy,
  Check,
  Code2,
  Terminal,
  Layers,
  Sparkles,
  ExternalLink,
  BookOpen,
  CheckCircle2,
  Cpu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface InstallGuideProps {
  initialWorkspaceKey?: string;
}

export function InstallGuide({ initialWorkspaceKey = "pk_live_8f3a9e201b4c7d" }: InstallGuideProps) {
  const [workspaceKey, setWorkspaceKey] = useState(initialWorkspaceKey);
  const [activeTab, setActiveTab] = useState<"html" | "react" | "nextjs" | "cms">("html");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const htmlSnippet = `<!-- Place this snippet right before closing </body> tag -->
<script
  src="https://cdn.supporthub.io/widget.js"
  data-workspace="${workspaceKey}"
  data-position="bottom-right"
  defer>
</script>`;

  const nextSnippet = `// app/layout.tsx (Next.js 14 / 15 / 16 App Router)
import Script from "next/script";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Script
          src="https://cdn.supporthub.io/widget.js"
          data-workspace="${workspaceKey}"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}`;

  const reactSnippet = `// components/SupportWidget.tsx (React SPA / Vite / Remix)
import { useEffect } from "react";

export function SupportWidget() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.supporthub.io/widget.js";
    script.setAttribute("data-workspace", "${workspaceKey}");
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return null;
}`;

  const cmsSnippet = `<!-- WordPress / Shopify / Webflow / Squarespace -->
<!-- 1. Go to your Theme Settings -> Custom Code -> Footer Scripts -->
<!-- 2. Paste the following embed script: -->
<script
  src="https://cdn.supporthub.io/widget.js"
  data-workspace="${workspaceKey}"
  data-theme="auto"
  defer>
</script>`;

  const sdkSnippet = `// Optional: Identify authenticated logged-in users & trigger programmatic chat
window.SupportHub = window.SupportHub || [];

// Open chat window programmatically
window.SupportHub.open();

// Pass user traits for lead capture & context
window.SupportHub.identify({
  userId: "usr_9942",
  email: "alex@acmecorp.com",
  name: "Alex Rivera",
  plan: "Enterprise"
});`;

  return (
    <div className="space-y-10">
      {/* Workspace Key Configurator Bar */}
      <div className="rounded-2xl border border-border/80 bg-card/70 backdrop-blur-md p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              Configure Your Workspace Public Key
            </h3>
            <p className="text-xs text-muted-foreground">
              All snippets below will update automatically with your custom public key.
            </p>
          </div>
          <div className="flex items-center gap-2 max-w-md w-full md:w-auto">
            <div className="relative flex-1">
              <input
                type="text"
                value={workspaceKey}
                onChange={(e) => setWorkspaceKey(e.target.value)}
                placeholder="Enter pk_live_..."
                className="w-full rounded-lg border border-border bg-background px-3.5 py-2 text-xs font-mono text-foreground focus:border-primary focus:outline-none"
              />
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setWorkspaceKey("pk_live_demo_workspace_994")}
              className="text-xs whitespace-nowrap"
            >
              Use Demo Key
            </Button>
          </div>
        </div>
      </div>

      {/* Main Framework Tabs */}
      <div className="rounded-2xl border border-border/80 bg-card/50 backdrop-blur-md shadow-xl overflow-hidden">
        {/* Tab Headers */}
        <div className="flex flex-wrap border-b border-border/70 bg-muted/40 px-3 pt-2">
          {[
            { id: "html", label: "HTML / Vanilla JS", icon: Code2 },
            { id: "nextjs", label: "Next.js (App Router)", icon: Terminal },
            { id: "react", label: "React / Vite / SPA", icon: Layers },
            { id: "cms", label: "WordPress / Shopify / Webflow", icon: ExternalLink },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex items-center gap-2 border-b-2 px-4 py-3 text-xs sm:text-sm font-semibold transition-all cursor-pointer",
                  isActive
                    ? "border-primary text-primary bg-background/80 rounded-t-lg"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-accent/40"
                )}
              >
                <Icon className="size-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content Panels */}
        <div className="p-5 sm:p-6 space-y-4">
          {activeTab === "html" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h4 className="text-sm font-semibold text-foreground">Standard HTML Integration</h4>
                  <p className="text-xs text-muted-foreground">
                    Add the script tag before your closing &lt;/body&gt; tag on any web page.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(htmlSnippet, "html")}
                  className="text-xs gap-1.5"
                >
                  {copiedId === "html" ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                  {copiedId === "html" ? "Copied!" : "Copy Snippet"}
                </Button>
              </div>

              <div className="relative rounded-xl border border-border/60 bg-zinc-950 p-4 font-mono text-xs text-zinc-100 overflow-x-auto">
                <pre>
                  <code>{htmlSnippet}</code>
                </pre>
              </div>
            </div>
          )}

          {activeTab === "nextjs" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h4 className="text-sm font-semibold text-foreground">Next.js App Router Integration</h4>
                  <p className="text-xs text-muted-foreground">
                    Load via Next.js Script with `strategy="lazyOnload"` for zero impact on Core Web Vitals.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(nextSnippet, "nextjs")}
                  className="text-xs gap-1.5"
                >
                  {copiedId === "nextjs" ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                  {copiedId === "nextjs" ? "Copied!" : "Copy Snippet"}
                </Button>
              </div>

              <div className="relative rounded-xl border border-border/60 bg-zinc-950 p-4 font-mono text-xs text-zinc-100 overflow-x-auto">
                <pre>
                  <code>{nextSnippet}</code>
                </pre>
              </div>
            </div>
          )}

          {activeTab === "react" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h4 className="text-sm font-semibold text-foreground">React / Vite SPA Hook</h4>
                  <p className="text-xs text-muted-foreground">
                    Mount as a reusable component or inside your application root.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(reactSnippet, "react")}
                  className="text-xs gap-1.5"
                >
                  {copiedId === "react" ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                  {copiedId === "react" ? "Copied!" : "Copy Snippet"}
                </Button>
              </div>

              <div className="relative rounded-xl border border-border/60 bg-zinc-950 p-4 font-mono text-xs text-zinc-100 overflow-x-auto">
                <pre>
                  <code>{reactSnippet}</code>
                </pre>
              </div>
            </div>
          )}

          {activeTab === "cms" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h4 className="text-sm font-semibold text-foreground">No-Code / CMS Platform Embed</h4>
                  <p className="text-xs text-muted-foreground">
                    Works seamlessly on Shopify, Webflow, WordPress, Squarespace, and Ghost.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(cmsSnippet, "cms")}
                  className="text-xs gap-1.5"
                >
                  {copiedId === "cms" ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                  {copiedId === "cms" ? "Copied!" : "Copy Snippet"}
                </Button>
              </div>

              <div className="relative rounded-xl border border-border/60 bg-zinc-950 p-4 font-mono text-xs text-zinc-100 overflow-x-auto">
                <pre>
                  <code>{cmsSnippet}</code>
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* JavaScript Client API Reference */}
      <div className="rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/50 pb-4">
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
              <Cpu className="size-4 text-primary" />
              Client-Side JavaScript SDK & Identify API
            </h3>
            <p className="text-xs text-muted-foreground">
              Control the widget lifecycle and pass authenticated user data programmatically.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => copyToClipboard(sdkSnippet, "sdk")}
            className="text-xs gap-1.5 self-start sm:self-auto"
          >
            {copiedId === "sdk" ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
            {copiedId === "sdk" ? "Copied!" : "Copy SDK Code"}
          </Button>
        </div>

        <div className="relative rounded-xl border border-border/60 bg-zinc-950 p-4 font-mono text-xs text-zinc-100 overflow-x-auto">
          <pre>
            <code>{sdkSnippet}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}

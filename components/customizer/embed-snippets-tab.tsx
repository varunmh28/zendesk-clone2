"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Code2,
  Copy,
  Check,
  ExternalLink,
  Key,
  Layers,
  Globe,
  Sparkles,
  Terminal,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface EmbedSnippetsTabProps {
  publicKey: string;
  orgSlug: string;
}

export function EmbedSnippetsTab({ publicKey, orgSlug }: EmbedSnippetsTabProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://your-domain.com";

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const htmlSnippet = `<!-- Zendesk Clone Live Support Widget -->
<script
  src="${baseUrl}/widget.js"
  data-public-key="${publicKey}"
  async
></script>`;

  const reactSnippet = `// 1. Install or load the Widget in your React / Next.js layout:
import { ZendeskWidget } from "@zendesk-clone/widget-react";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <ZendeskWidget publicKey="${publicKey}" />
      </body>
    </html>
  );
}`;

  const iframeSnippet = `<iframe
  src="${baseUrl}/widget/${publicKey}"
  width="400"
  height="640"
  style="border:none; border-radius:16px; box-shadow: 0 10px 30px rgba(0,0,0,0.15);"
  title="Customer Support Widget"
></iframe>`;

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* Workspace Public Key Card */}
      <div className="p-4 rounded-xl border bg-card space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Key className="h-4 w-4 text-primary" /> Workspace Public Key
          </label>
          <Button
            variant="ghost"
            size="xs"
            onClick={() => handleCopy(publicKey, "pk")}
            className="text-xs gap-1 h-7"
          >
            {copiedKey === "pk" ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <Check className="h-3 w-3" /> Copied!
              </span>
            ) : (
              <>
                <Copy className="h-3 w-3" /> Copy Key
              </>
            )}
          </Button>
        </div>

        <div className="p-2.5 rounded-lg bg-muted/50 border font-mono text-xs text-foreground select-all break-all">
          {publicKey || "wk_loading..."}
        </div>
      </div>

      {/* Sandbox Test Button */}
      <div className="p-4 rounded-xl border border-primary/30 bg-primary/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <Globe className="h-4 w-4 text-primary" /> Test in Fullscreen Sandbox
          </div>
          <p className="text-xs text-muted-foreground">
            Preview the widget loaded directly in standalone mode with your current live workspace key.
          </p>
        </div>

        <a
          href={`/widget/${publicKey}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all shrink-0 shadow-sm"
        >
          <span>Open Sandbox</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      {/* 1. HTML Script Snippet */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Code2 className="h-4 w-4 text-primary" /> Standard HTML / Website Script
          </label>
          <Button
            variant="ghost"
            size="xs"
            onClick={() => handleCopy(htmlSnippet, "html")}
            className="text-xs gap-1 h-7"
          >
            {copiedKey === "html" ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <Check className="h-3 w-3" /> Copied Code!
              </span>
            ) : (
              <>
                <Copy className="h-3 w-3" /> Copy Snippet
              </>
            )}
          </Button>
        </div>
        <div className="relative rounded-xl border bg-slate-950 p-3.5 font-mono text-xs text-slate-100 overflow-x-auto shadow-inner">
          <pre className="leading-relaxed whitespace-pre-wrap">{htmlSnippet}</pre>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Paste before the closing &lt;/body&gt; tag on any WordPress, Shopify, Webflow, or static website.
        </p>
      </div>

      {/* 2. React / Next.js Snippet */}
      <div className="space-y-2 pt-2 border-t">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Terminal className="h-4 w-4 text-primary" /> React / Next.js Component
          </label>
          <Button
            variant="ghost"
            size="xs"
            onClick={() => handleCopy(reactSnippet, "react")}
            className="text-xs gap-1 h-7"
          >
            {copiedKey === "react" ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <Check className="h-3 w-3" /> Copied Code!
              </span>
            ) : (
              <>
                <Copy className="h-3 w-3" /> Copy Snippet
              </>
            )}
          </Button>
        </div>
        <div className="relative rounded-xl border bg-slate-950 p-3.5 font-mono text-xs text-slate-100 overflow-x-auto shadow-inner">
          <pre className="leading-relaxed whitespace-pre-wrap">{reactSnippet}</pre>
        </div>
      </div>

      {/* 3. Iframe Embed Snippet */}
      <div className="space-y-2 pt-2 border-t">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Layers className="h-4 w-4 text-primary" /> Iframe Embed (Direct Frame)
          </label>
          <Button
            variant="ghost"
            size="xs"
            onClick={() => handleCopy(iframeSnippet, "iframe")}
            className="text-xs gap-1 h-7"
          >
            {copiedKey === "iframe" ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <Check className="h-3 w-3" /> Copied Code!
              </span>
            ) : (
              <>
                <Copy className="h-3 w-3" /> Copy Snippet
              </>
            )}
          </Button>
        </div>
        <div className="relative rounded-xl border bg-slate-950 p-3.5 font-mono text-xs text-slate-100 overflow-x-auto shadow-inner">
          <pre className="leading-relaxed whitespace-pre-wrap">{iframeSnippet}</pre>
        </div>
      </div>
    </div>
  );
}

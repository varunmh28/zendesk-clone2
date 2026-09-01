"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { CustomizerShell } from "@/components/customizer/customizer-shell";
import { Sliders, Sparkles, Loader2 } from "lucide-react";

export function CustomizerClientPage({ slug, orgId }: { slug: string; orgId: string }) {
  const { orgId: clerkOrgId } = useAuth();

  // Lookup workspace by slug or clerk orgId
  const workspaceBySlug = useQuery(api.workspaces.getBySlug, { slug });
  const workspaceByOrgId = useQuery(
    api.workspaces.getByOrgId,
    clerkOrgId ? { orgId: clerkOrgId } : "skip"
  );

  const workspace = workspaceBySlug || workspaceByOrgId;
  const effectiveOrgId = workspace?.orgId || clerkOrgId || slug;
  const publicKey = workspace?.publicKey || "";

  if (workspace === undefined) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground gap-2">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="text-xs">Loading widget customizer...</span>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Widget Customizer & Styling
            </h1>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              <Sparkles className="h-3 w-3" /> Live Simulator
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Personalize your chat widget branding, tune proactive greeting popups, customize FAQ links, and copy installation snippets.
          </p>
        </div>
      </div>

      {/* Main Customizer Two-Pane Shell */}
      {effectiveOrgId && (
        <CustomizerShell
          orgId={effectiveOrgId}
          orgSlug={slug}
          publicKey={publicKey}
        />
      )}
    </div>
  );
}
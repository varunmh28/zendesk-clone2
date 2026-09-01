"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { AppearanceTab } from "./appearance-tab";
import { BehaviorTab } from "./behavior-tab";
import { LeadCaptureTab } from "./lead-capture-tab";
import { FaqManagerTab, FaqItem } from "./faq-manager-tab";
import { EmbedSnippetsTab } from "./embed-snippets-tab";
import { LiveWidgetPreview } from "./live-widget-preview";
import { Button } from "@/components/ui/button";
import {
  Palette,
  Volume2,
  UserCheck,
  HelpCircle,
  Code2,
  Save,
  RotateCcw,
  CheckCircle2,
  Loader2,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CustomizerShellProps {
  orgId: string;
  orgSlug: string;
  publicKey: string;
}

type TabType = "appearance" | "behavior" | "leads" | "faqs" | "embed";

const DEFAULT_SETTINGS = {
  primaryColor: "#6366f1",
  borderRadius: "16px",
  position: "bottom-right" as const,
  title: "Customer Support",
  subtitle: "We typically reply in a few minutes",
  logoUrl: null as string | null,
  logoId: undefined as Id<"_storage"> | undefined,
  soundEnabled: true,
  proactiveEnabled: false,
  proactiveDelaySeconds: 5,
  proactiveMessage: "Hi there! 👋 How can we help you today?",
  leadCaptureMode: "optional" as const,
  faqItems: [] as FaqItem[],
};

export function CustomizerShell({ orgId, orgSlug, publicKey }: CustomizerShellProps) {
  const updateSettingsMutation = useMutation(api.widget.updateWidgetSettings);
  const serverSettings = useQuery(api.widget.getWidgetSettings, orgId ? { orgId } : "skip");

  // Active left-pane tab
  const [activeTab, setActiveTab] = useState<TabType>("appearance");

  // Form draft state
  const [primaryColor, setPrimaryColor] = useState(DEFAULT_SETTINGS.primaryColor);
  const [borderRadius, setBorderRadius] = useState(DEFAULT_SETTINGS.borderRadius);
  const [position, setPosition] = useState<"bottom-right" | "bottom-left">(DEFAULT_SETTINGS.position);
  const [title, setTitle] = useState(DEFAULT_SETTINGS.title);
  const [subtitle, setSubtitle] = useState(DEFAULT_SETTINGS.subtitle);
  const [logoUrl, setLogoUrl] = useState<string | null>(DEFAULT_SETTINGS.logoUrl);
  const [logoId, setLogoId] = useState<Id<"_storage"> | undefined>(DEFAULT_SETTINGS.logoId);
  const [soundEnabled, setSoundEnabled] = useState(DEFAULT_SETTINGS.soundEnabled);
  const [proactiveEnabled, setProactiveEnabled] = useState(DEFAULT_SETTINGS.proactiveEnabled);
  const [proactiveDelaySeconds, setProactiveDelaySeconds] = useState(DEFAULT_SETTINGS.proactiveDelaySeconds);
  const [proactiveMessage, setProactiveMessage] = useState(DEFAULT_SETTINGS.proactiveMessage);
  const [leadCaptureMode, setLeadCaptureMode] = useState<"before_chat" | "mid_chat" | "optional" | "disabled">(
    DEFAULT_SETTINGS.leadCaptureMode
  );
  const [faqItems, setFaqItems] = useState<FaqItem[]>(DEFAULT_SETTINGS.faqItems);

  // Status indicators
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Sync server settings into state on first load
  useEffect(() => {
    if (serverSettings) {
      setPrimaryColor(serverSettings.primaryColor || DEFAULT_SETTINGS.primaryColor);
      setBorderRadius(serverSettings.borderRadius || DEFAULT_SETTINGS.borderRadius);
      setPosition((serverSettings.position as any) || DEFAULT_SETTINGS.position);
      setTitle(serverSettings.title || DEFAULT_SETTINGS.title);
      setSubtitle(serverSettings.subtitle || DEFAULT_SETTINGS.subtitle);
      setLogoUrl(serverSettings.logoUrl || null);
      setLogoId(serverSettings.logoId || undefined);
      setSoundEnabled(serverSettings.soundEnabled ?? DEFAULT_SETTINGS.soundEnabled);
      setProactiveEnabled(serverSettings.proactiveEnabled ?? DEFAULT_SETTINGS.proactiveEnabled);
      setProactiveDelaySeconds(serverSettings.proactiveDelaySeconds ?? DEFAULT_SETTINGS.proactiveDelaySeconds);
      setProactiveMessage(serverSettings.proactiveMessage || DEFAULT_SETTINGS.proactiveMessage);
      setLeadCaptureMode((serverSettings.leadCaptureMode as any) || DEFAULT_SETTINGS.leadCaptureMode);
      setFaqItems(serverSettings.faqItems || []);
      setHasChanges(false);
    }
  }, [serverSettings]);

  // Mark changes when any field is updated
  const markChanged = () => setHasChanges(true);

  // Save handler
  const handleSave = async () => {
    if (!orgId) return;

    setIsSaving(true);
    setSaveSuccess(false);

    try {
      await updateSettingsMutation({
        orgId,
        primaryColor,
        borderRadius,
        position,
        title,
        subtitle,
        logoUrl: logoUrl || undefined,
        logoId: logoId,
        soundEnabled,
        proactiveEnabled,
        proactiveDelaySeconds,
        proactiveMessage,
        leadCaptureMode,
        faqItems,
      });

      setSaveSuccess(true);
      setHasChanges(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to save widget settings:", err);
      alert("Failed to save widget configuration.");
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to server or default values
  const handleReset = () => {
    if (serverSettings) {
      setPrimaryColor(serverSettings.primaryColor || DEFAULT_SETTINGS.primaryColor);
      setBorderRadius(serverSettings.borderRadius || DEFAULT_SETTINGS.borderRadius);
      setPosition((serverSettings.position as any) || DEFAULT_SETTINGS.position);
      setTitle(serverSettings.title || DEFAULT_SETTINGS.title);
      setSubtitle(serverSettings.subtitle || DEFAULT_SETTINGS.subtitle);
      setLogoUrl(serverSettings.logoUrl || null);
      setLogoId(serverSettings.logoId || undefined);
      setSoundEnabled(serverSettings.soundEnabled ?? DEFAULT_SETTINGS.soundEnabled);
      setProactiveEnabled(serverSettings.proactiveEnabled ?? DEFAULT_SETTINGS.proactiveEnabled);
      setProactiveDelaySeconds(serverSettings.proactiveDelaySeconds ?? DEFAULT_SETTINGS.proactiveDelaySeconds);
      setProactiveMessage(serverSettings.proactiveMessage || DEFAULT_SETTINGS.proactiveMessage);
      setLeadCaptureMode((serverSettings.leadCaptureMode as any) || DEFAULT_SETTINGS.leadCaptureMode);
      setFaqItems(serverSettings.faqItems || []);
    } else {
      setPrimaryColor(DEFAULT_SETTINGS.primaryColor);
      setBorderRadius(DEFAULT_SETTINGS.borderRadius);
      setPosition(DEFAULT_SETTINGS.position);
      setTitle(DEFAULT_SETTINGS.title);
      setSubtitle(DEFAULT_SETTINGS.subtitle);
      setLogoUrl(DEFAULT_SETTINGS.logoUrl);
      setLogoId(DEFAULT_SETTINGS.logoId);
      setSoundEnabled(DEFAULT_SETTINGS.soundEnabled);
      setProactiveEnabled(DEFAULT_SETTINGS.proactiveEnabled);
      setProactiveDelaySeconds(DEFAULT_SETTINGS.proactiveDelaySeconds);
      setProactiveMessage(DEFAULT_SETTINGS.proactiveMessage);
      setLeadCaptureMode(DEFAULT_SETTINGS.leadCaptureMode);
      setFaqItems(DEFAULT_SETTINGS.faqItems);
    }
    setHasChanges(false);
  };

  const navTabs: Array<{ id: TabType; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "behavior", label: "Behavior & Sounds", icon: Volume2 },
    { id: "leads", label: "Lead Capture", icon: UserCheck },
    { id: "faqs", label: "Help Center & FAQs", icon: HelpCircle },
    { id: "embed", label: "Embed & Install", icon: Code2 },
  ];

  return (
    <div className="space-y-6">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-4 rounded-2xl border shadow-xs">
        <div className="flex items-center gap-3">
          <div
            className="h-10 w-10 rounded-xl text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs"
            style={{ backgroundColor: primaryColor }}
          >
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground leading-tight">
              Widget Customizer & Embed
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Customize colors, proactive greeting rules, lead capture gating, and install on your website.
            </p>
          </div>
        </div>

        {/* Save & Reset Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          {saveSuccess && (
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 animate-in fade-in">
              <CheckCircle2 className="h-4 w-4" /> Changes saved!
            </span>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={isSaving}
            className="text-xs rounded-xl gap-1.5 h-9"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="text-xs rounded-xl gap-1.5 h-9 px-5 font-semibold"
            style={{ backgroundColor: primaryColor }}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Save Changes</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Two-Pane Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Pane: Config Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Tab Navigation Buttons */}
          <div className="flex items-center gap-1.5 p-1 bg-muted/40 rounded-2xl border overflow-x-auto">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer",
                    isActive
                      ? "bg-card text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-card/50"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content Panels */}
          <div className="p-6 rounded-2xl border bg-card shadow-xs min-h-[480px]">
            {activeTab === "appearance" && (
              <AppearanceTab
                primaryColor={primaryColor}
                onChangePrimaryColor={(c) => {
                  setPrimaryColor(c);
                  markChanged();
                }}
                borderRadius={borderRadius}
                onChangeBorderRadius={(r) => {
                  setBorderRadius(r);
                  markChanged();
                }}
                position={position}
                onChangePosition={(p) => {
                  setPosition(p);
                  markChanged();
                }}
                title={title}
                onChangeTitle={(t) => {
                  setTitle(t);
                  markChanged();
                }}
                subtitle={subtitle}
                onChangeSubtitle={(s) => {
                  setSubtitle(s);
                  markChanged();
                }}
                logoUrl={logoUrl}
                onChangeLogoUrl={(url, sId) => {
                  setLogoUrl(url);
                  setLogoId(sId);
                  markChanged();
                }}
              />
            )}

            {activeTab === "behavior" && (
              <BehaviorTab
                soundEnabled={soundEnabled}
                onChangeSoundEnabled={(e) => {
                  setSoundEnabled(e);
                  markChanged();
                }}
                proactiveEnabled={proactiveEnabled}
                onChangeProactiveEnabled={(e) => {
                  setProactiveEnabled(e);
                  markChanged();
                }}
                proactiveDelaySeconds={proactiveDelaySeconds}
                onChangeProactiveDelaySeconds={(d) => {
                  setProactiveDelaySeconds(d);
                  markChanged();
                }}
                proactiveMessage={proactiveMessage}
                onChangeProactiveMessage={(m) => {
                  setProactiveMessage(m);
                  markChanged();
                }}
              />
            )}

            {activeTab === "leads" && (
              <LeadCaptureTab
                leadCaptureMode={leadCaptureMode}
                onChangeLeadCaptureMode={(m) => {
                  setLeadCaptureMode(m);
                  markChanged();
                }}
              />
            )}

            {activeTab === "faqs" && (
              <FaqManagerTab
                orgId={orgId}
                faqItems={faqItems}
                onChangeFaqItems={(items) => {
                  setFaqItems(items);
                  markChanged();
                }}
              />
            )}

            {activeTab === "embed" && (
              <EmbedSnippetsTab publicKey={publicKey} orgSlug={orgSlug} />
            )}
          </div>
        </div>

        {/* Right Pane: Live Interactive Preview (5 cols) */}
        <div className="lg:col-span-5 sticky top-6">
          <LiveWidgetPreview
            primaryColor={primaryColor}
            borderRadius={borderRadius}
            position={position}
            title={title}
            subtitle={subtitle}
            logoUrl={logoUrl}
            soundEnabled={soundEnabled}
            proactiveEnabled={proactiveEnabled}
            proactiveDelaySeconds={proactiveDelaySeconds}
            proactiveMessage={proactiveMessage}
            leadCaptureMode={leadCaptureMode}
            faqItems={faqItems}
          />
        </div>
      </div>
    </div>
  );
}

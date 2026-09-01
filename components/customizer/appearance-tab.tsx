"use client";

import React, { useRef, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import {
  Palette,
  Layout,
  Upload,
  Image as ImageIcon,
  Trash2,
  Check,
  Sparkles,
  Sliders,
  CornerDownRight,
  CornerDownLeft,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const PRESET_COLORS = [
  { name: "Indigo", hex: "#6366f1" },
  { name: "Blue", hex: "#2563eb" },
  { name: "Sky", hex: "#0284c7" },
  { name: "Emerald", hex: "#10b981" },
  { name: "Purple", hex: "#8b5cf6" },
  { name: "Rose", hex: "#f43f5e" },
  { name: "Amber", hex: "#f59e0b" },
  { name: "Cyan", hex: "#06b6d4" },
  { name: "Slate", hex: "#475569" },
  { name: "Dark", hex: "#0f172a" },
];

const RADIUS_PRESETS = [
  { label: "Sharp (0px)", value: "0px" },
  { label: "Subtle (8px)", value: "8px" },
  { label: "Default (16px)", value: "16px" },
  { label: "Rounded (24px)", value: "24px" },
];

interface AppearanceTabProps {
  primaryColor: string;
  onChangePrimaryColor: (color: string) => void;
  borderRadius: string;
  onChangeBorderRadius: (radius: string) => void;
  position: "bottom-right" | "bottom-left";
  onChangePosition: (pos: "bottom-right" | "bottom-left") => void;
  title: string;
  onChangeTitle: (title: string) => void;
  subtitle: string;
  onChangeSubtitle: (subtitle: string) => void;
  logoUrl?: string | null;
  onChangeLogoUrl: (url: string | null, storageId?: Id<"_storage">) => void;
}

export function AppearanceTab({
  primaryColor,
  onChangePrimaryColor,
  borderRadius,
  onChangeBorderRadius,
  position,
  onChangePosition,
  title,
  onChangeTitle,
  subtitle,
  onChangeSubtitle,
  logoUrl,
  onChangeLogoUrl,
}: AppearanceTabProps) {
  const generateUploadUrl = useMutation(api.widget.generateUploadUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [customLogoUrl, setCustomLogoUrl] = useState("");

  const numericRadius = parseInt(borderRadius, 10) || 0;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const uploadUrl = await generateUploadUrl();
      const res = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!res.ok) throw new Error("Upload failed");
      const { storageId } = (await res.json()) as { storageId: Id<"_storage"> };

      // Local preview URL
      const preview = URL.createObjectURL(file);
      onChangeLogoUrl(preview, storageId);
    } catch (err) {
      console.error("Logo upload error:", err);
      alert("Failed to upload brand logo.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleApplyLogoUrl = () => {
    if (customLogoUrl.trim()) {
      onChangeLogoUrl(customLogoUrl.trim());
      setCustomLogoUrl("");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* 1. Brand Color */}
      <div className="space-y-3">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Palette className="h-4 w-4 text-primary" /> Brand Primary Color
        </label>
        <p className="text-xs text-muted-foreground">
          Sets the theme color for the widget header, launcher bubble, action buttons, and active tabs.
        </p>

        {/* Color picker & Hex input */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="color"
              value={primaryColor.startsWith("#") ? primaryColor : "#6366f1"}
              onChange={(e) => onChangePrimaryColor(e.target.value)}
              className="h-10 w-12 rounded-xl border border-border cursor-pointer bg-transparent p-0.5"
            />
          </div>
          <div className="relative flex-1 max-w-xs">
            <input
              type="text"
              value={primaryColor}
              onChange={(e) => onChangePrimaryColor(e.target.value)}
              placeholder="#6366f1"
              className="w-full px-3 py-2 text-sm font-mono rounded-xl border bg-background text-foreground uppercase focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
        </div>

        {/* Preset Color Swatches */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {PRESET_COLORS.map((preset) => {
            const isSelected =
              primaryColor.toLowerCase() === preset.hex.toLowerCase();
            return (
              <button
                key={preset.hex}
                type="button"
                onClick={() => onChangePrimaryColor(preset.hex)}
                className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center transition-all cursor-pointer border border-white/20 shadow-2xs hover:scale-105",
                  isSelected ? "ring-2 ring-offset-2 ring-primary scale-110" : ""
                )}
                style={{ backgroundColor: preset.hex }}
                title={preset.name}
              >
                {isSelected && <Check className="h-4 w-4 text-white drop-shadow-sm" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Corner Border Radius */}
      <div className="space-y-3 pt-4 border-t">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Sliders className="h-4 w-4 text-primary" /> Corner Radius
          </label>
          <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-md bg-muted text-foreground">
            {borderRadius}
          </span>
        </div>

        <input
          type="range"
          min={0}
          max={24}
          step={2}
          value={numericRadius}
          onChange={(e) => onChangeBorderRadius(`${e.target.value}px`)}
          className="w-full accent-primary cursor-pointer h-2 bg-muted rounded-lg"
        />

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {RADIUS_PRESETS.map((preset) => (
            <button
              key={preset.value}
              type="button"
              onClick={() => onChangeBorderRadius(preset.value)}
              className={cn(
                "py-1.5 px-2 text-xs rounded-lg border text-center transition-all",
                borderRadius === preset.value
                  ? "bg-primary text-primary-foreground border-primary font-medium"
                  : "bg-background border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Placement Position */}
      <div className="space-y-3 pt-4 border-t">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Layout className="h-4 w-4 text-primary" /> Widget Screen Position
        </label>
        <p className="text-xs text-muted-foreground">
          Choose where the floating widget bubble appears on your website pages.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Bottom Right */}
          <button
            type="button"
            onClick={() => onChangePosition("bottom-right")}
            className={cn(
              "p-4 rounded-xl border text-left transition-all flex items-start justify-between cursor-pointer",
              position === "bottom-right"
                ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-xs"
                : "border-border bg-card hover:border-muted-foreground/40"
            )}
          >
            <div>
              <div className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <CornerDownRight className="h-4 w-4 text-primary" /> Bottom Right
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Standard default position (recommended)
              </div>
            </div>
            {position === "bottom-right" && (
              <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            )}
          </button>

          {/* Bottom Left */}
          <button
            type="button"
            onClick={() => onChangePosition("bottom-left")}
            className={cn(
              "p-4 rounded-xl border text-left transition-all flex items-start justify-between cursor-pointer",
              position === "bottom-left"
                ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-xs"
                : "border-border bg-card hover:border-muted-foreground/40"
            )}
          >
            <div>
              <div className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <CornerDownLeft className="h-4 w-4 text-primary" /> Bottom Left
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Best if bottom-right is used by another tool
              </div>
            </div>
            {position === "bottom-left" && (
              <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            )}
          </button>
        </div>
      </div>

      {/* 4. Title & Subtitle */}
      <div className="space-y-4 pt-4 border-t">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
          Header Titles & Branding
        </label>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground">Widget Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => onChangeTitle(e.target.value)}
            placeholder="e.g. Acme Support"
            className="w-full px-3 py-2 text-sm rounded-xl border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground">Subtitle / Greeting</label>
          <input
            type="text"
            value={subtitle}
            onChange={(e) => onChangeSubtitle(e.target.value)}
            placeholder="e.g. We typically reply in a few minutes"
            className="w-full px-3 py-2 text-sm rounded-xl border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
      </div>

      {/* 5. Brand Logo */}
      <div className="space-y-3 pt-4 border-t">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <ImageIcon className="h-4 w-4 text-primary" /> Brand Logo
        </label>
        <p className="text-xs text-muted-foreground">
          Displayed inside the widget header avatar and launcher button.
        </p>

        {logoUrl ? (
          <div className="flex items-center gap-3 p-3 rounded-xl border bg-card">
            <img
              src={logoUrl}
              alt="Brand logo"
              className="h-10 w-10 rounded-lg object-contain bg-white/10 border p-1"
            />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-foreground truncate">Custom Logo Active</div>
              <div className="text-[11px] text-muted-foreground truncate">{logoUrl}</div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onChangeLogoUrl(null)}
              className="text-destructive hover:bg-destructive/10 text-xs h-8"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" /> Remove
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />

            <div className="flex flex-col sm:flex-row items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-full sm:w-auto text-xs rounded-xl gap-1.5 h-9"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-3.5 w-3.5" /> Upload Logo File
                  </>
                )}
              </Button>

              <span className="text-xs text-muted-foreground">or enter URL:</span>

              <div className="flex items-center gap-1.5 w-full sm:flex-1">
                <input
                  type="url"
                  value={customLogoUrl}
                  onChange={(e) => setCustomLogoUrl(e.target.value)}
                  placeholder="https://example.com/logo.png"
                  className="flex-1 px-3 py-1.5 text-xs rounded-xl border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleApplyLogoUrl}
                  disabled={!customLogoUrl.trim()}
                  className="text-xs rounded-xl h-8.5"
                >
                  Set
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Volume2, MessageSquareText, Play, Sparkles, Clock } from "lucide-react";
import { playNotificationChime } from "@/components/widget/widget-audio";

interface BehaviorTabProps {
  soundEnabled: boolean;
  onChangeSoundEnabled: (enabled: boolean) => void;
  proactiveEnabled: boolean;
  onChangeProactiveEnabled: (enabled: boolean) => void;
  proactiveDelaySeconds: number;
  onChangeProactiveDelaySeconds: (delay: number) => void;
  proactiveMessage: string;
  onChangeProactiveMessage: (message: string) => void;
}

export function BehaviorTab({
  soundEnabled,
  onChangeSoundEnabled,
  proactiveEnabled,
  onChangeProactiveEnabled,
  proactiveDelaySeconds,
  onChangeProactiveDelaySeconds,
  proactiveMessage,
  onChangeProactiveMessage,
}: BehaviorTabProps) {
  const handleTestChime = () => {
    playNotificationChime();
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* 1. Sound Notifications */}
      <div className="space-y-3">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Volume2 className="h-4 w-4 text-primary" /> Audio Chimes & Sound Effects
        </label>
        <p className="text-xs text-muted-foreground">
          Play subtle audio feedback when new visitor/agent messages arrive or proactive greeting popups trigger.
        </p>

        <div className="flex items-center justify-between p-4 rounded-xl border bg-card">
          <div className="space-y-0.5">
            <div className="text-sm font-semibold text-foreground">Sound Notifications</div>
            <div className="text-xs text-muted-foreground">
              {soundEnabled ? "Audio chimes are enabled" : "Audio is muted"}
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleTestChime}
              className="text-xs rounded-lg gap-1.5 h-8"
              title="Preview audio chime"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>Test Sound</span>
            </Button>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => onChangeSoundEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
      </div>

      {/* 2. Proactive Engagement Greeting */}
      <div className="space-y-4 pt-4 border-t">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <MessageSquareText className="h-4 w-4 text-primary" /> Proactive Engagement Popup
        </label>
        <p className="text-xs text-muted-foreground">
          Automatically display a friendly greeting message above the widget bubble after a visitor spends time on your site.
        </p>

        {/* Toggle Card */}
        <div className="flex items-center justify-between p-4 rounded-xl border bg-card">
          <div className="space-y-0.5">
            <div className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-primary" /> Enable Proactive Greeting
            </div>
            <div className="text-xs text-muted-foreground">
              Pop up greeting to visitors after dwell time threshold
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={proactiveEnabled}
              onChange={(e) => onChangeProactiveEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>

        {/* Proactive Delay & Message (if enabled) */}
        {proactiveEnabled && (
          <div className="space-y-4 p-4 rounded-xl border bg-muted/20 animate-in fade-in duration-150">
            {/* Delay Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-primary" /> Dwell Delay Before Popup
                </label>
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-md bg-background border text-foreground">
                  {proactiveDelaySeconds} {proactiveDelaySeconds === 1 ? "second" : "seconds"}
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={60}
                step={1}
                value={proactiveDelaySeconds}
                onChange={(e) => onChangeProactiveDelaySeconds(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer h-2 bg-muted rounded-lg"
              />
              <div className="flex justify-between text-[11px] text-muted-foreground">
                <span>1s (Instant)</span>
                <span>15s</span>
                <span>30s</span>
                <span>60s (Slow)</span>
              </div>
            </div>

            {/* Greeting Message Content */}
            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-medium text-foreground">
                Proactive Greeting Message Text
              </label>
              <textarea
                value={proactiveMessage}
                onChange={(e) => onChangeProactiveMessage(e.target.value)}
                placeholder="Hi there! 👋 How can we help you today?"
                rows={3}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
              />
              <p className="text-[11px] text-muted-foreground">
                Shown inside the proactive bubble popup before visitor opens the full chat window.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

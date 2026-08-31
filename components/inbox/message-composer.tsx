"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { Send, Lock, MessageSquare, CornerDownLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MessageComposerProps {
  onSendMessage: (content: string, isInternalNote: boolean) => Promise<void>;
  onTyping?: (isTyping: boolean) => void;
  disabled?: boolean;
}

export function MessageComposer({
  onSendMessage,
  onTyping,
  disabled,
}: MessageComposerProps) {
  const [content, setContent] = useState("");
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleInputChange = (value: string) => {
    setContent(value);

    // Handle typing status
    if (onTyping) {
      if (value.trim().length > 0) {
        onTyping(true);
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        typingTimeoutRef.current = setTimeout(() => {
          onTyping(false);
        }, 2000);
      } else {
        onTyping(false);
      }
    }
  };

  const handleSend = async () => {
    const trimmed = content.trim();
    if (!trimmed || isSubmitting || disabled) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (onTyping) {
      onTyping(false);
    }

    try {
      setIsSubmitting(true);
      await onSendMessage(trimmed, isInternalNote);
      setContent("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    } catch (err) {
      console.error("Failed to send message", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSend();
    }
  };

  // Adjust textarea height dynamically
  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        200
      )}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [content]);

  return (
    <div
      className={cn(
        "border-t bg-card p-3 md:p-4 transition-colors",
        isInternalNote
          ? "bg-amber-500/5 dark:bg-amber-950/20 border-amber-500/30"
          : "bg-background"
      )}
    >
      {/* Mode toggle header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center rounded-lg border bg-muted/60 p-0.5 text-xs font-medium">
          <button
            type="button"
            onClick={() => setIsInternalNote(false)}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2.5 py-1 transition-all",
              !isInternalNote
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <MessageSquare className="h-3.5 w-3.5 text-primary" />
            <span>Public Reply</span>
          </button>
          <button
            type="button"
            onClick={() => setIsInternalNote(true)}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2.5 py-1 transition-all",
              isInternalNote
                ? "bg-amber-500 text-white shadow-xs font-semibold"
                : "text-muted-foreground hover:text-amber-700 dark:hover:text-amber-300"
            )}
          >
            <Lock className="h-3.5 w-3.5" />
            <span>Internal Note</span>
          </button>
        </div>

        <div className="text-[11px] text-muted-foreground hidden sm:flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded bg-muted border text-[10px] font-mono">
            Ctrl
          </kbd>
          <span>+</span>
          <kbd className="px-1.5 py-0.5 rounded bg-muted border text-[10px] font-mono">
            Enter
          </kbd>
          <span>to send</span>
        </div>
      </div>

      {/* Internal note banner */}
      {isInternalNote && (
        <div className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-300 mb-2 font-medium">
          <Lock className="h-3.5 w-3.5" />
          <span>Internal note will only be visible to teammates.</span>
        </div>
      )}

      {/* Input area */}
      <div className="relative rounded-lg border bg-card focus-within:ring-2 focus-within:ring-ring/40 transition-all shadow-xs">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled || isSubmitting}
          placeholder={
            isInternalNote
              ? "Leave an internal note for your team..."
              : "Type a reply to the customer..."
          }
          rows={2}
          className="w-full resize-none bg-transparent px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none disabled:opacity-50"
        />

        <div className="flex items-center justify-between px-3 py-2 border-t bg-muted/20">
          <div className="text-[11px] text-muted-foreground">
            {isInternalNote ? (
              <span className="text-amber-600 dark:text-amber-400 font-medium">
                Note mode active
              </span>
            ) : (
              <span>Message will be sent to visitor</span>
            )}
          </div>

          <Button
            size="sm"
            onClick={handleSend}
            disabled={!content.trim() || isSubmitting || disabled}
            variant={isInternalNote ? "default" : "default"}
            className={cn(
              "gap-1.5 h-8",
              isInternalNote
                ? "bg-amber-600 hover:bg-amber-700 text-white"
                : ""
            )}
          >
            <span>{isInternalNote ? "Add Note" : "Send"}</span>
            <Send className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

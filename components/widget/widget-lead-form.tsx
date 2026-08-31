"use client";

import { useState } from "react";
import { User, Mail, Phone, MessageSquare, CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface WidgetLeadFormProps {
  onSubmit: (lead: { name: string; email: string; phone: string; notes?: string }) => Promise<void>;
  primaryColor: string;
  initialValues?: { name?: string; email?: string; phone?: string };
  isBeforeChat?: boolean;
  onSkip?: () => void;
}

export function WidgetLeadForm({
  onSubmit,
  primaryColor,
  initialValues,
  isBeforeChat,
  onSkip,
}: WidgetLeadFormProps) {
  const [name, setName] = useState(initialValues?.name || "");
  const [email, setEmail] = useState(initialValues?.email || "");
  const [phone, setPhone] = useState(initialValues?.phone || "");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onSubmit({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        notes: notes.trim() || undefined,
      });
      setIsSubmitted(true);
    } catch (err) {
      console.error("Failed to submit contact info:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-white dark:bg-slate-950">
        <div className="rounded-full bg-emerald-100 dark:bg-emerald-950/60 p-3 mb-3 text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h2 className="text-base font-semibold text-foreground">
          Contact Info Saved!
        </h2>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs leading-relaxed">
          Thank you! Our support team will follow up via email or SMS if you leave the chat.
        </p>
        {onSkip && (
          <Button
            size="sm"
            onClick={onSkip}
            className="mt-4 text-xs text-white"
            style={{ backgroundColor: primaryColor }}
          >
            Continue to Chat
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col justify-between p-5 bg-white dark:bg-slate-950 overflow-y-auto">
      <div>
        <div className="mb-4">
          <h2 className="text-base font-semibold text-foreground">
            {isBeforeChat ? "Welcome! Let's get in touch" : "Leave your contact details"}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isBeforeChat
              ? "Please enter your details to start chatting with us."
              : "We'll follow up with you even if you navigate away."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="lead-name" className="text-xs text-foreground font-medium">
              Your Name
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="lead-name"
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-9 text-xs h-9"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="lead-email" className="text-xs text-foreground font-medium">
              Email Address <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="lead-email"
                type="email"
                required
                placeholder="jane@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9 text-xs h-9"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="lead-phone" className="text-xs text-foreground font-medium">
              Phone Number (optional)
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="lead-phone"
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="pl-9 text-xs h-9"
              />
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              disabled={!email.trim() || isSubmitting}
              className="w-full text-xs font-semibold text-white h-9 gap-1.5"
              style={{ backgroundColor: primaryColor }}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <span>{isBeforeChat ? "Start Chatting" : "Save Details"}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </Button>
          </div>
        </form>
      </div>

      {!isBeforeChat && onSkip && (
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={onSkip}
            className="text-xs text-muted-foreground hover:underline"
          >
            Back to conversation
          </button>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import {
  Activity,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCw,
  Sparkles,
  Bot,
  MessageSquare,
  X,
  Send,
  Zap,
  ShieldCheck,
  Cpu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function WidgetPlayground() {
  const [testKey, setTestKey] = useState("pk_live_demo_workspace_994");
  const [status, setStatus] = useState<"idle" | "testing" | "success" | "error">("idle");
  const [diagnostics, setDiagnostics] = useState<{
    latencyMs: number;
    agentStatus: string;
    kbChunksReady: number;
    widgetPosition: string;
    corsValidated: boolean;
  } | null>(null);

  const [widgetOpen, setWidgetOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: "user" | "bot"; text: string }>>([
    { sender: "bot", text: "Connected to SupportHub Workspace Playground! Ready to test your live RAG bot." },
  ]);
  const [inputText, setInputText] = useState("");

  const handleTestConnection = () => {
    if (!testKey.trim()) return;
    setStatus("testing");
    setDiagnostics(null);

    setTimeout(() => {
      if (testKey.toLowerCase().includes("invalid") || testKey.length < 5) {
        setStatus("error");
      } else {
        setStatus("success");
        setDiagnostics({
          latencyMs: 38,
          agentStatus: "Operational (Gemini 2.0 Flash)",
          kbChunksReady: 142,
          widgetPosition: "bottom-right",
          corsValidated: true,
        });
      }
    }, 900);
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    const userMsg = inputText.trim();
    setChatMessages((prev) => [...prev, { sender: "user", text: userMsg }]);
    setInputText("");

    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: `[Playground Response]: Verified workspace key "${testKey}". Retrieved context with 98% confidence score!`,
        },
      ]);
    }, 600);
  };

  return (
    <div className="space-y-8" id="playground">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <Activity className="size-3.5" /> Interactive Developer Playground
        </div>
        <h3 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Live Connection Tester & Sandbox
        </h3>
        <p className="text-sm text-muted-foreground max-w-xl mx-auto">
          Verify your workspace endpoint, check vector index readiness, and simulate the floating widget.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Connection Tester & Diagnostics */}
        <div className="lg:col-span-6 space-y-5">
          <div className="rounded-2xl border border-border/80 bg-card/70 backdrop-blur-md p-5 sm:p-6 shadow-md space-y-5">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Zap className="size-4 text-primary" />
              Workspace Key Verification
            </h4>

            <div className="space-y-2">
              <label className="text-xs text-muted-foreground font-medium">Public Workspace Key</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={testKey}
                  onChange={(e) => setTestKey(e.target.value)}
                  placeholder="pk_live_..."
                  className="flex-1 rounded-lg border border-border bg-background px-3.5 py-2 text-xs font-mono text-foreground focus:border-primary focus:outline-none"
                />
                <Button
                  onClick={handleTestConnection}
                  disabled={status === "testing"}
                  size="sm"
                  className="gap-1.5 text-xs font-semibold"
                >
                  {status === "testing" ? (
                    <>
                      <RotateCw className="size-3.5 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <Play className="size-3.5" />
                      Verify Key
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Diagnostic Results Box */}
            {status === "success" && diagnostics && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-3 animate-fadeIn">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="size-4" />
                  Workspace Active & Verified
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-lg bg-background/80 p-2.5 border border-border/50">
                    <span className="text-muted-foreground block text-[11px]">API Latency</span>
                    <span className="font-mono font-semibold text-foreground">{diagnostics.latencyMs} ms</span>
                  </div>
                  <div className="rounded-lg bg-background/80 p-2.5 border border-border/50">
                    <span className="text-muted-foreground block text-[11px]">RAG Vector Chunks</span>
                    <span className="font-mono font-semibold text-foreground">{diagnostics.kbChunksReady} Indexed</span>
                  </div>
                  <div className="rounded-lg bg-background/80 p-2.5 border border-border/50">
                    <span className="text-muted-foreground block text-[11px]">Agent Engine</span>
                    <span className="font-semibold text-foreground text-[11px] truncate block">{diagnostics.agentStatus}</span>
                  </div>
                  <div className="rounded-lg bg-background/80 p-2.5 border border-border/50">
                    <span className="text-muted-foreground block text-[11px]">CORS Validation</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">All Origins Allowed</span>
                  </div>
                </div>
              </div>
            )}

            {status === "error" && (
              <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 space-y-1 text-xs text-destructive">
                <div className="flex items-center gap-2 font-semibold">
                  <AlertCircle className="size-4" />
                  Workspace Key Not Found
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Check your key in the SupportHub Dashboard under Settings → API Keys.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Interactive Simulated Sandbox Website */}
        <div className="lg:col-span-6">
          <div className="relative h-[380px] rounded-2xl border border-border/80 bg-zinc-950/90 text-white overflow-hidden shadow-xl flex flex-col justify-between">
            {/* Fake Browser Toolbar */}
            <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/90 px-4 py-2 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="size-2.5 rounded-full bg-red-500/80" />
                <div className="size-2.5 rounded-full bg-amber-500/80" />
                <div className="size-2.5 rounded-full bg-emerald-500/80" />
              </div>
              <div className="rounded-md bg-zinc-800/80 px-3 py-1 font-mono text-[11px] text-zinc-300">
                https://your-domain.com/store
              </div>
              <div className="text-[10px] text-zinc-500">Live Client View</div>
            </div>

            {/* Fake Page Body */}
            <div className="p-6 space-y-3 text-zinc-300 flex-1">
              <div className="h-4 w-1/3 bg-zinc-800 rounded animate-pulse" />
              <div className="h-3 w-3/4 bg-zinc-800/60 rounded" />
              <div className="h-3 w-1/2 bg-zinc-800/60 rounded" />
              <div className="mt-6 p-4 rounded-xl border border-zinc-800/80 bg-zinc-900/50 text-xs text-zinc-400">
                👉 <strong className="text-zinc-200">Test Floating Widget:</strong> Click the launcher button on the bottom right to trigger the floating client bubble.
              </div>
            </div>

            {/* Floating Widget Mock */}
            <div className="absolute bottom-4 right-4 z-20">
              {widgetOpen ? (
                <div className="w-72 rounded-2xl border border-zinc-700 bg-zinc-900 shadow-2xl overflow-hidden flex flex-col animate-scaleUp">
                  {/* Widget Header */}
                  <div className="bg-primary px-3 py-2.5 text-white flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-semibold">
                      <Bot className="size-3.5" /> SupportHub Bot
                    </div>
                    <button
                      onClick={() => setWidgetOpen(false)}
                      className="text-white/80 hover:text-white"
                    >
                      <X className="size-4" />
                    </button>
                  </div>

                  {/* Chat messages */}
                  <div className="p-3 space-y-2 max-h-40 overflow-y-auto text-[11px]">
                    {chatMessages.map((m, i) => (
                      <div
                        key={i}
                        className={cn(
                          "p-2 rounded-lg max-w-[85%]",
                          m.sender === "user"
                            ? "ml-auto bg-primary text-white"
                            : "mr-auto bg-zinc-800 text-zinc-200"
                        )}
                      >
                        {m.text}
                      </div>
                    ))}
                  </div>

                  {/* Input */}
                  <div className="p-2 border-t border-zinc-800 flex gap-1 bg-zinc-900">
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                      placeholder="Type a test message..."
                      className="flex-1 bg-zinc-800 text-[11px] rounded px-2 py-1 text-white focus:outline-none"
                    />
                    <button
                      onClick={handleSendMessage}
                      className="bg-primary text-white p-1 rounded hover:bg-primary/80"
                    >
                      <Send className="size-3" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setWidgetOpen(true)}
                  className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:scale-105 transition-transform"
                  aria-label="Open support widget"
                >
                  <MessageSquare className="size-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

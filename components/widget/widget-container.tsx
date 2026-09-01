"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { WidgetHeader } from "./widget-header";
import { WidgetChat, VisitorMessage } from "./widget-chat";
import { WidgetFaq } from "./widget-faq";
import { WidgetLeadForm } from "./widget-lead-form";
import { playNotificationChime } from "./widget-audio";
import { X, Sparkles, Loader2 } from "lucide-react";

interface WidgetContainerProps {
  workspaceKey: string;
  isStandalone?: boolean;
}

export function WidgetContainer({ workspaceKey, isStandalone = true }: WidgetContainerProps) {
  const [visitorId, setVisitorId] = useState<string>("");
  const [sessionId] = useState(() => `v_sess_${Math.random().toString(36).slice(2, 11)}`);
  const [conversationId, setConversationId] = useState<Id<"conversations"> | null>(null);
  const [activeTab, setActiveTab] = useState<"chat" | "faq" | "lead">("chat");
  const [selectedArticleId, setSelectedArticleId] = useState<Id<"articles"> | null>(null);
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  // Proactive popup state
  const [showProactivePopup, setShowProactivePopup] = useState(false);
  const [proactiveDismissed, setProactiveDismissed] = useState(false);

  // Lead capture state
  const [visitorInfo, setVisitorInfo] = useState<{ name?: string; email?: string; phone?: string }>({});
  const [leadCaptured, setLeadCaptured] = useState(false);

  // 1. Fetch widget config by public workspace key
  const config = useQuery(api.widget.getWidgetConfig, { publicKey: workspaceKey });

  // Mutations
  const initSession = useMutation(api.widget.initVisitorSession);
  const sendMessageMutation = useMutation(api.widget.sendVisitorMessage);
  const requestHandoverMutation = useMutation(api.widget.requestHumanHandover);
  const visitorHeartbeat = useMutation(api.widget.visitorHeartbeat);
  const visitorSetTyping = useMutation(api.presence.setTyping);
  const submitLeadMutation = useMutation(api.widget.submitLead);

  // Initialize visitorId from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(`sh_visitor_${workspaceKey}`);
    if (stored) {
      setVisitorId(stored);
    } else {
      const newId = `vis_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
      localStorage.setItem(`sh_visitor_${workspaceKey}`, newId);
      setVisitorId(newId);
    }

    const storedInfo = localStorage.getItem(`sh_visitor_info_${workspaceKey}`);
    if (storedInfo) {
      try {
        const parsed = JSON.parse(storedInfo);
        setVisitorInfo(parsed);
        if (parsed.email) setLeadCaptured(true);
      } catch (e) {}
    }
  }, [workspaceKey]);

  // 2. Initialize visitor session & conversation
  useEffect(() => {
    if (!visitorId || !config?.workspace) return;

    initSession({
      publicKey: workspaceKey,
      visitorId,
      visitorName: visitorInfo.name,
      visitorEmail: visitorInfo.email,
      visitorPhone: visitorInfo.phone,
    })
      .then((id) => {
        setConversationId(id);
      })
      .catch(console.error);
  }, [visitorId, config?.workspace, workspaceKey, initSession, visitorInfo]);

  // 3. Conversation & messages query
  const conversation = useQuery(
    api.widget.getVisitorConversation,
    conversationId && visitorId
      ? { publicKey: workspaceKey, visitorId, conversationId }
      : "skip"
  );

  const messages = useQuery(
    api.widget.getVisitorMessages,
    conversationId && visitorId
      ? { publicKey: workspaceKey, visitorId, conversationId }
      : "skip"
  );

  // Clear AI generating state when AI reply arrives or handover occurs
  useEffect(() => {
    if (!messages || messages.length === 0) return;
    const latest = messages[messages.length - 1];
    if (latest.role === "ai" || latest.role === "agent" || conversation?.handedToHuman) {
      setIsAiGenerating(false);
    }
  }, [messages, conversation?.handedToHuman]);

  // 4. Presence query (agents viewing/typing)
  const presence = useQuery(
    api.widget.getWidgetPresence,
    conversationId
      ? { publicKey: workspaceKey, conversationId }
      : "skip"
  );

  // 5. Send visitor presence heartbeat
  useEffect(() => {
    if (!conversationId || !workspaceKey) return;

    visitorHeartbeat({
      publicKey: workspaceKey,
      conversationId,
      sessionId,
      visitorName: visitorInfo.name,
      isTyping: false,
    }).catch(console.error);

    const interval = setInterval(() => {
      visitorHeartbeat({
        publicKey: workspaceKey,
        conversationId,
        sessionId,
        visitorName: visitorInfo.name,
      }).catch(console.error);
    }, 8000);

    return () => clearInterval(interval);
  }, [conversationId, workspaceKey, sessionId, visitorInfo.name, visitorHeartbeat]);

  // 6. Proactive message delay trigger
  useEffect(() => {
    if (!config?.widgetSettings?.proactiveEnabled || proactiveDismissed) return;

    const delay = (config.widgetSettings.proactiveDelaySeconds ?? 5) * 1000;
    const timer = setTimeout(() => {
      setShowProactivePopup(true);
      if (config.widgetSettings.soundEnabled) {
        playNotificationChime();
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [config?.widgetSettings, proactiveDismissed]);

  // 7. Play sound on incoming agent/AI messages
  const lastMessageCountRef = useRef<number>(0);
  useEffect(() => {
    if (!messages) return;

    if (lastMessageCountRef.current > 0 && messages.length > lastMessageCountRef.current) {
      const latestMsg = messages[messages.length - 1];
      if (latestMsg.role === "agent" || latestMsg.role === "ai") {
        if (config?.widgetSettings?.soundEnabled) {
          playNotificationChime();
        }
      }
    }
    lastMessageCountRef.current = messages.length;
  }, [messages, config?.widgetSettings?.soundEnabled]);

  // Handle send message
  const handleSendMessage = async (content: string) => {
    if (!conversationId || !visitorId) return;

    if (!conversation?.handedToHuman) {
      setIsAiGenerating(true);
    }

    await sendMessageMutation({
      publicKey: workspaceKey,
      visitorId,
      conversationId,
      content,
    });

    setShowProactivePopup(false);
  };

  // Handle human handover request
  const handleRequestHandover = async () => {
    if (!conversationId || !visitorId) return;
    setIsAiGenerating(false);
    await requestHandoverMutation({
      publicKey: workspaceKey,
      visitorId,
      conversationId,
    });
  };

  // Handle visitor typing
  const handleTyping = useCallback(
    (isTyping: boolean) => {
      visitorSetTyping({
        sessionId,
        isTyping,
      }).catch(console.error);
    },
    [sessionId, visitorSetTyping]
  );

  // Handle lead submission
  const handleLeadSubmit = async (leadData: {
    name: string;
    email: string;
    phone: string;
    notes?: string;
  }) => {
    if (!visitorId) return;

    await submitLeadMutation({
      publicKey: workspaceKey,
      visitorId,
      conversationId: conversationId ?? undefined,
      name: leadData.name,
      email: leadData.email,
      phone: leadData.phone,
      notes: leadData.notes,
    });

    const newInfo = { name: leadData.name, email: leadData.email, phone: leadData.phone };
    setVisitorInfo(newInfo);
    setLeadCaptured(true);
    localStorage.setItem(`sh_visitor_info_${workspaceKey}`, JSON.stringify(newInfo));

    setActiveTab("chat");
  };

  // If loading workspace config
  if (config === undefined) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-slate-950 text-muted-foreground text-xs gap-2">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <span>Loading support chat...</span>
      </div>
    );
  }

  // If invalid workspace key
  if (config === null) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-6 text-center bg-slate-50 dark:bg-slate-950 text-muted-foreground">
        <div className="rounded-full bg-red-100 p-3 mb-2 text-red-600">
          <X className="h-6 w-6" />
        </div>
        <h3 className="font-semibold text-foreground text-sm">Widget Unavailable</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs">
          The workspace with key &ldquo;{workspaceKey}&rdquo; could not be found. Please check your install script.
        </p>
      </div>
    );
  }

  const { widgetSettings } = config;
  const primaryColor = widgetSettings.primaryColor || "#2563eb";
  const borderRadius = widgetSettings.borderRadius || "16px";
  const isHandedToHuman = conversation?.handedToHuman ?? false;

  // Check if lead capture mode is 'before_chat' and not yet captured
  const isBeforeChatGate =
    widgetSettings.leadCaptureMode === "before_chat" &&
    !leadCaptured &&
    activeTab !== "faq";

  return (
    <div
      className="flex flex-col h-screen w-full overflow-hidden bg-white dark:bg-slate-950 shadow-2xl border transition-all"
      style={{
        borderRadius: isStandalone ? borderRadius : "0px",
      }}
    >
      {/* Widget Header */}
      <WidgetHeader
        title={widgetSettings.title}
        subtitle={widgetSettings.subtitle}
        logoUrl={widgetSettings.logoUrl}
        primaryColor={primaryColor}
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab === "chat") setSelectedArticleId(null);
        }}
        isAgentTyping={presence?.agentTyping}
        isAiTyping={isAiGenerating}
        agentName={presence?.activeAgent?.name}
        isHandedToHuman={isHandedToHuman}
        onRequestHumanHandover={handleRequestHandover}
        leadCaptured={leadCaptured}
      />

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
        {/* Proactive Greeting Banner Popup */}
        {showProactivePopup && !proactiveDismissed && activeTab === "chat" && (
          <div className="absolute top-3 left-3 right-3 z-30 animate-in slide-in-from-top-2 duration-200">
            <div className="rounded-xl border bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3.5 shadow-lg flex items-start justify-between gap-3 text-xs">
              <div className="flex items-start gap-2.5">
                <div
                  className="p-1.5 rounded-lg text-white shrink-0 mt-0.5"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{widgetSettings.title}</p>
                  <p className="text-muted-foreground mt-0.5 leading-relaxed">
                    {widgetSettings.proactiveMessage}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowProactivePopup(false);
                  setProactiveDismissed(true);
                }}
                className="text-muted-foreground hover:text-foreground p-1 rounded-md cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Tab 1: Chat (or Before Chat Lead Gate) */}
        {activeTab === "chat" && (
          isBeforeChatGate ? (
            <WidgetLeadForm
              onSubmit={handleLeadSubmit}
              primaryColor={primaryColor}
              isBeforeChat={true}
            />
          ) : (
            <WidgetChat
              messages={(messages as VisitorMessage[]) || []}
              onSendMessage={handleSendMessage}
              onTyping={handleTyping}
              primaryColor={primaryColor}
              isAgentTyping={presence?.agentTyping}
              isAiTyping={isAiGenerating}
              agentName={presence?.activeAgent?.name}
              isHandedToHuman={isHandedToHuman}
              onRequestHumanHandover={handleRequestHandover}
              proactiveMessage={widgetSettings.proactiveMessage}
              onOpenArticleModal={(articleId) => {
                setSelectedArticleId(articleId);
                setActiveTab("faq");
              }}
              showMidChatLeadPrompt={
                widgetSettings.leadCaptureMode === "mid_chat" &&
                !leadCaptured &&
                (messages?.length ?? 0) >= 2
              }
              onRequestLeadCapture={() => setActiveTab("lead")}
            />
          )
        )}

        {/* Tab 2: FAQs / Knowledge Base */}
        {activeTab === "faq" && (
          <WidgetFaq
            publicKey={workspaceKey}
            faqItems={widgetSettings.faqItems || []}
            primaryColor={primaryColor}
            selectedArticleId={selectedArticleId}
            onSelectArticle={setSelectedArticleId}
            onAskInChat={(q) => {
              setActiveTab("chat");
              handleSendMessage(q);
            }}
          />
        )}

        {/* Tab 3: Lead Capture Form */}
        {activeTab === "lead" && (
          <WidgetLeadForm
            onSubmit={handleLeadSubmit}
            primaryColor={primaryColor}
            initialValues={visitorInfo}
            isBeforeChat={false}
            onSkip={() => setActiveTab("chat")}
          />
        )}
      </div>
    </div>
  );
}

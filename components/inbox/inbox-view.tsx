"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id, Doc } from "@/convex/_generated/dataModel";
import { ConversationList, FilterTab } from "./conversation-list";
import { ConversationItem } from "./conversation-card";
import { ConversationHeader } from "./conversation-header";
import { ChatThread } from "./chat-thread";
import { PresenceBar } from "./presence-bar";
import { MessageComposer } from "./message-composer";
import { getSessionId } from "./presence-utils";
import { MessageSquare, Inbox, ShieldCheck } from "lucide-react";

interface InboxViewProps {
  orgId: string;
}

export function InboxView({ orgId }: InboxViewProps) {
  const [selectedConversationId, setSelectedConversationId] = useState<Id<"conversations"> | null>(null);
  const [filter, setFilter] = useState<FilterTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sessionId] = useState(() => getSessionId());

  // Current authenticated user
  const currentUser = useQuery(api.users.getMe);
  const orgUsers = useQuery(api.users.listByOrgId, { orgId }) ?? [];

  // Stats query
  const stats = useQuery(api.conversations.getStats, { orgId });

  // Map filter tab to backend query args
  const listArgs = useMemo(() => {
    let status: "open" | "closed" = "open";
    let assignment: "all" | "unassigned" | "mine" = "all";

    if (filter === "closed") {
      status = "closed";
      assignment = "all";
    } else if (filter === "unassigned") {
      status = "open";
      assignment = "unassigned";
    } else if (filter === "mine") {
      status = "open";
      assignment = "mine";
    } else {
      status = "open";
      assignment = "all";
    }

    return {
      orgId,
      status,
      assignment,
      search: searchQuery.trim() || undefined,
    };
  }, [orgId, filter, searchQuery]);

  const conversations = useQuery(api.conversations.list, listArgs);

  // Mutations
  const markAsRead = useMutation(api.conversations.markAsRead);
  const assignConversation = useMutation(api.conversations.assign);
  const setStatus = useMutation(api.conversations.setStatus);
  const setHandedToHuman = useMutation(api.conversations.setHandedToHuman);
  const sendMessageMutation = useMutation(api.messages.send);
  const presenceHeartbeat = useMutation(api.presence.heartbeat);
  const setTypingMutation = useMutation(api.presence.setTyping);

  // Selected conversation details & messages
  const selectedConversation = useQuery(
    api.conversations.get,
    selectedConversationId ? { conversationId: selectedConversationId } : "skip"
  );

  const messages = useQuery(
    api.messages.list,
    selectedConversationId ? { conversationId: selectedConversationId } : "skip"
  );

  const presenceSessions = useQuery(
    api.presence.listPresence,
    selectedConversationId ? { conversationId: selectedConversationId } : "skip"
  );

  // Auto-select first conversation if none selected on desktop
  useEffect(() => {
    if (!selectedConversationId && conversations && conversations.length > 0) {
      const first = conversations[0];
      setSelectedConversationId(first._id);
      if (!first.isRead) {
        markAsRead({ conversationId: first._id }).catch(console.error);
      }
    }
  }, [conversations, selectedConversationId, markAsRead]);

  // Presence heartbeat when conversation is active
  useEffect(() => {
    if (!selectedConversationId || !currentUser?._id || !orgId) return;

    // Send initial heartbeat
    presenceHeartbeat({
      orgId,
      conversationId: selectedConversationId,
      userId: currentUser._id,
      sessionId,
      isTyping: false,
    }).catch(console.error);

    // Heartbeat every 8 seconds
    const interval = setInterval(() => {
      presenceHeartbeat({
        orgId,
        conversationId: selectedConversationId,
        userId: currentUser._id,
        sessionId,
      }).catch(console.error);
    }, 8000);

    return () => clearInterval(interval);
  }, [selectedConversationId, currentUser?._id, orgId, sessionId, presenceHeartbeat]);

  const handleSelectConversation = useCallback(
    (conv: ConversationItem) => {
      setSelectedConversationId(conv._id);
      if (!conv.isRead) {
        markAsRead({ conversationId: conv._id }).catch(console.error);
      }
    },
    [markAsRead]
  );

  const handleSendMessage = async (content: string, isInternalNote: boolean) => {
    if (!selectedConversationId) return;

    await sendMessageMutation({
      orgId,
      conversationId: selectedConversationId,
      role: "agent",
      content,
      isInternalNote,
      authorId: currentUser?._id,
    });
  };

  const handleTyping = useCallback(
    (isTyping: boolean) => {
      setTypingMutation({
        sessionId,
        isTyping,
      }).catch(console.error);
    },
    [sessionId, setTypingMutation]
  );

  const handleAssign = async (assigneeId?: Id<"users">) => {
    if (!selectedConversationId) return;
    await assignConversation({
      conversationId: selectedConversationId,
      assigneeId,
    });
  };

  const handleSetStatus = async (status: "open" | "closed") => {
    if (!selectedConversationId) return;
    await setStatus({
      conversationId: selectedConversationId,
      status,
    });
  };

  const handleSetHandedToHuman = async (handed: boolean) => {
    if (!selectedConversationId) return;
    await setHandedToHuman({
      conversationId: selectedConversationId,
      handedToHuman: handed,
    });
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] w-full overflow-hidden bg-background">
      {/* Left Pane: Conversation List */}
      <ConversationList
        conversations={(conversations as ConversationItem[]) || []}
        selectedConversationId={selectedConversationId ?? undefined}
        onSelectConversation={handleSelectConversation}
        currentFilter={filter}
        onFilterChange={setFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        stats={stats}
        isLoading={conversations === undefined}
      />

      {/* Right Pane: Conversation Thread & Composer */}
      <div className="flex-1 flex flex-col h-full bg-background min-w-0">
        {selectedConversation ? (
          <>
            {/* Header */}
            <ConversationHeader
              conversation={selectedConversation}
              orgUsers={orgUsers}
              onAssign={handleAssign}
              onSetStatus={handleSetStatus}
              onSetHandedToHuman={handleSetHandedToHuman}
            />

            {/* Chat Thread */}
            <ChatThread
              messages={messages || []}
              visitorName={selectedConversation.visitorName}
              visitorEmail={selectedConversation.visitorEmail}
              subject={selectedConversation.subject}
              source={selectedConversation.source}
            />

            {/* Presence Bar */}
            <PresenceBar
              currentSessionId={sessionId}
              currentUserId={currentUser?._id}
              presenceSessions={presenceSessions || []}
            />

            {/* Message Composer */}
            <MessageComposer
              onSendMessage={handleSendMessage}
              onTyping={handleTyping}
              disabled={selectedConversation.status === "closed"}
            />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
            <div className="rounded-full bg-muted/60 p-4 mb-3 border">
              <Inbox className="h-8 w-8 opacity-40 text-foreground" />
            </div>
            <h3 className="font-medium text-foreground text-base">
              No conversation selected
            </h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              Choose a conversation from the left pane to view messages, reply to
              visitors, or collaborate with teammates.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

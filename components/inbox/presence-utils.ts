"use client";

let cachedSessionId: string | null = null;

export function getSessionId(): string {
  if (typeof window === "undefined") return "server-session";
  if (cachedSessionId) return cachedSessionId;

  try {
    let stored = window.sessionStorage.getItem("zd_agent_session_id");
    if (!stored) {
      stored = `sess_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`;
      window.sessionStorage.setItem("zd_agent_session_id", stored);
    }
    cachedSessionId = stored;
    return stored;
  } catch {
    cachedSessionId = `sess_${Math.random().toString(36).substring(2, 15)}`;
    return cachedSessionId;
  }
}

export function formatTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diffMs = now - timestamp;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;

  const date = new Date(timestamp);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function formatExactTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

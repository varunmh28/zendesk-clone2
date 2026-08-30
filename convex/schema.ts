import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // One workspace per Clerk Organization. Auto-provisioned on organization.created webhook.
  workspaces: defineTable({
    orgId: v.string(),
    name: v.string(),
    slug: v.string(),
    plan: v.union(v.literal("free"), v.literal("pro"), v.literal("enterprise")),
    aiMessageLimit: v.number(),
    kbDocumentLimit: v.number(),
    seatLimit: v.number(),
    publicKey: v.string(),
  })
    .index("by_orgId", ["orgId"])
    .index("by_slug", ["slug"])
    .index("by_publicKey", ["publicKey"]),

  // Synced from Clerk membership webhooks
  users: defineTable({
    orgId: v.string(),
    clerkUserId: v.string(),
    tokenIdentifier: v.string(),
    name: v.string(),
    email: v.string(),
    avatarUrl: v.optional(v.string()),
    role: v.union(v.literal("admin"), v.literal("agent"), v.literal("member")),
    isActive: v.boolean(),
  })
    .index("by_orgId", ["orgId"])
    .index("by_tokenIdentifier", ["tokenIdentifier"])
    .index("by_clerkUserId", ["clerkUserId"])
    .index("by_orgId_and_role", ["orgId", "role"]),

  // Visitor conversations - one per widget chat session
  conversations: defineTable({
    orgId: v.string(),
    visitorId: v.string(),
    visitorName: v.optional(v.string()),
    visitorEmail: v.optional(v.string()),
    visitorPhone: v.optional(v.string()),
    status: v.union(v.literal("open"), v.literal("closed")),
    assigneeId: v.optional(v.id("users")),
    handedToHuman: v.boolean(),
    isRead: v.boolean(),
    subject: v.optional(v.string()),
    source: v.union(v.literal("widget"), v.literal("api")),
    agentThreadId: v.optional(v.string()),
  })
    .index("by_orgId", ["orgId"])
    .index("by_orgId_and_status", ["orgId", "status"])
    .index("by_orgId_and_assignee", ["orgId", "assigneeId"])
    .index("by_orgId_and_isRead", ["orgId", "isRead"])
    .index("by_visitorId", ["orgId", "visitorId"]),

  // Individual messages in a conversation
  messages: defineTable({
    orgId: v.string(),
    conversationId: v.id("conversations"),
    role: v.union(v.literal("visitor"), v.literal("agent"), v.literal("ai")),
    content: v.string(),
    authorId: v.optional(v.id("users")),
    isInternalNote: v.boolean(),
    citations: v.optional(
      v.array(
        v.object({
          articleId: v.optional(v.id("articles")),
          chunkId: v.optional(v.id("kbChunks")),
          title: v.string(),
          excerpt: v.string(),
        })
      )
    ),
  })
    .index("by_conversation", ["conversationId"])
    .index("by_orgId", ["orgId"]),

  // Leads captured from widget
  leads: defineTable({
    orgId: v.string(),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    visitorId: v.string(),
    conversationId: v.optional(v.id("conversations")),
    status: v.union(
      v.literal("new"),
      v.literal("contacted"),
      v.literal("qualified"),
      v.literal("closed")
    ),
    source: v.string(),
    notes: v.optional(v.string()),
  })
    .index("by_orgId", ["orgId"])
    .index("by_orgId_and_status", ["orgId", "status"])
    .index("by_visitorId", ["orgId", "visitorId"]),

  // Help center articles (human-written)
  articles: defineTable({
    orgId: v.string(),
    title: v.string(),
    slug: v.string(),
    content: v.string(),
    category: v.string(),
    coverImageId: v.optional(v.id("_storage")),
    isPublished: v.boolean(),
    isPopular: v.boolean(),
    authorId: v.id("users"),
    viewCount: v.number(),
  })
    .index("by_orgId", ["orgId"])
    .index("by_orgId_and_published", ["orgId", "isPublished"])
    .index("by_orgId_and_category", ["orgId", "category"])
    .searchIndex("search_content", {
      searchField: "content",
      filterFields: ["orgId", "isPublished"],
    }),

  // Uploaded KB source documents
  kbDocuments: defineTable({
    orgId: v.string(),
    name: v.string(),
    fileId: v.id("_storage"),
    mimeType: v.string(),
    sizeBytes: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("ready"),
      v.literal("error")
    ),
    chunkCount: v.optional(v.number()),
    errorMessage: v.optional(v.string()),
  })
    .index("by_orgId", ["orgId"])
    .index("by_orgId_and_status", ["orgId", "status"]),

  // Chunked + embedded KB content (Gemini text-embedding-004, 768-dim)
  kbChunks: defineTable({
    orgId: v.string(),
    documentId: v.optional(v.id("kbDocuments")),
    articleId: v.optional(v.id("articles")),
    content: v.string(),
    embedding: v.array(v.float64()),
    tokenCount: v.number(),
    chunkIndex: v.number(),
  })
    .index("by_orgId", ["orgId"])
    .index("by_document", ["documentId"])
    .index("by_article", ["articleId"])
    .vectorIndex("by_embedding", {
      vectorField: "embedding",
      dimensions: 768,
      filterFields: ["orgId"],
    }),

  // Per-workspace widget config
  widgetSettings: defineTable({
    orgId: v.string(),
    primaryColor: v.string(),
    borderRadius: v.string(),
    position: v.union(v.literal("bottom-right"), v.literal("bottom-left")),
    launcherIconUrl: v.optional(v.string()),
    title: v.string(),
    subtitle: v.optional(v.string()),
    logoId: v.optional(v.id("_storage")),
    leadCaptureMode: v.union(
      v.literal("before_chat"),
      v.literal("mid_chat"),
      v.literal("optional")
    ),
    proactiveEnabled: v.boolean(),
    proactiveDelaySeconds: v.number(),
    proactiveMessage: v.optional(v.string()),
    soundEnabled: v.boolean(),
    faqItems: v.array(
      v.object({
        question: v.string(),
        articleId: v.optional(v.id("articles")),
      })
    ),
  }).index("by_orgId", ["orgId"]),

  // Monthly rolling usage counters
  usageMetrics: defineTable({
    orgId: v.string(),
    periodStart: v.number(),
    aiMessagesUsed: v.number(),
    kbDocumentsTotal: v.number(),
    seatsUsed: v.number(),
  }).index("by_orgId_and_period", ["orgId", "periodStart"]),

  // HIGH-CHURN: presence heartbeats (isolated table)
  presenceSessions: defineTable({
    orgId: v.string(),
    conversationId: v.id("conversations"),
    userId: v.id("users"),
    sessionId: v.string(),
    isTyping: v.boolean(),
    lastHeartbeat: v.number(),
  })
    .index("by_conversation", ["conversationId"])
    .index("by_user", ["userId"])
    .index("by_session", ["sessionId"]),

  // Webhook event log for idempotency
  webhookEvents: defineTable({
    svixId: v.string(),
    eventType: v.string(),
    processedAt: v.number(),
  }).index("by_svixId", ["svixId"]),
});

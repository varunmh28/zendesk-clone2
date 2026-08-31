# SupportHub — Intercom/Zendesk-Style Multi-Tenant SaaS: Full Architecture

> **Stack**: Next.js 16 (App Router) · Convex 1.45 · Clerk Organizations + Seat-Based Billing · Tailwind CSS v4 · shadcn/ui · Google Gemini AI

---

## 1. System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          CLERK AUTH & BILLING LAYER                         │
│  Organizations · Seat-Limited Plans · RBAC Roles · JWT Tokens               │
└────────────────────────────┬────────────────────────────────────────────────┘
                             │  JWT (orgId + roles + plan claims)
             ┌───────────────┼──────────────────┐
             ▼                                  ▼
┌────────────────────────┐          ┌─────────────────────────────┐
│   AGENT DASHBOARD      │          │   CONVEX REALTIME BACKEND    │
│  Next.js App Router    │◄────────►│                             │
│                        │  WS/HTTP │  • Workspace-scoped queries  │
│  /dashboard (inbox)    │          │  • @convex-dev/agent (AI)    │
│  /kb (knowledge base)  │          │  • @convex-dev/presence      │
│  /leads (CRM)          │          │  • @convex-dev/rate-limiter  │
│  /customizer (widget)  │          │  • Gemini embeddings + RAG   │
│  /settings (billing)   │          │  • File storage (docs/imgs)  │
└────────────────────────┘          └──────────┬──────────────────┘
                                               │  Public scoped endpoints
                                               ▼
                              ┌────────────────────────────────┐
                              │  EMBEDDABLE CUSTOMER WIDGET    │
                              │  (iframe · any external site)  │
                              │                                │
                              │  • Anonymous visitor sessions  │
                              │  • Streaming AI chat (Gemini)  │
                              │  • Configurable lead capture   │
                              │  • Built-in help center reader │
                              │  • Proactive messages          │
                              └────────────────────────────────┘
```

---

## 2. Multi-Tenancy & Data Isolation

### Clerk ↔ Convex Workspace Binding

Every Clerk Organization maps **1-to-1** to a Convex workspace. The `orgId` from Clerk is the authoritative tenant key — stored and indexed on **every** Convex document.

```
Clerk Organization (org_xxx)
         │
         │  (webhook: organization.created)
         ▼
Convex `workspaces` table { orgId: "org_xxx", plan: "free", ... }
         │
         ├── conversations     { orgId }
         ├── messages          { orgId }
         ├── leads             { orgId }
         ├── articles          { orgId }
         ├── kbDocuments       { orgId }
         ├── widgetSettings    { orgId }
         └── usageMetrics      { orgId }
```

### Isolation Enforcement Rule

Every Convex query and mutation:
1. Calls `ctx.auth.getUserIdentity()` — throws `401` if not authenticated
2. Reads `orgId` from `identity.tokenIdentifier` derived claims (never accepted as argument)
3. Queries exclusively via `.withIndex("by_orgId", (q) => q.eq("orgId", orgId))`
4. Public visitor endpoints validate against `workspacePublicKey` — no agent data crosses the boundary

### Clerk Roles → App Permissions

| Clerk Role | Dashboard Access | KB Admin | Billing | Widget Customizer |
|---|---|---|---|---|
| `org:admin` | ✅ Full | ✅ | ✅ | ✅ |
| `org:agent` *(custom)* | ✅ Inbox only | Read-only | ❌ | ❌ |
| `org:member` | Read-only | ❌ | ❌ | ❌ |

Custom roles (`org:agent`) are created via Clerk Dashboard → Roles & Permissions or `clerk api` CLI during Phase 1 setup.

---

## 3. Convex Database Schema (Complete)

### Core Principle
- High-churn operational data (presence, typing, heartbeats) lives in **dedicated tables** — never embedded in shared documents
- All arrays in documents are bounded (no unbounded arrays — child records go in their own tables)
- Every table that participates in cross-tenant queries carries `orgId` + an `"by_orgId"` index

```
workspaces          — one per Clerk org, stores plan + quota state
users               — synced from Clerk webhooks, stores agent profiles
conversations       — visitor threads (orgId-scoped)
messages            — individual chat messages (conversationId FK)
conversationAgents  — assignment records (conversation ↔ agent)
leads               — captured visitors / prospects (orgId-scoped)
articles            — KB help center articles (orgId-scoped, markdown)
kbDocuments         — uploaded files (.md/.txt/.pdf) with storage ref
kbChunks            — split & embedded chunks (vector index, 768-dim)
widgetSettings      — per-workspace widget config (theme, behavior)
usageMetrics        — monthly rolling counters (AI msgs, docs, seats)
agentThreads        — @convex-dev/agent thread bindings per conversation
presenceSessions    — high-churn: viewer/typing state (separate table)
```

### Key Index Definitions

```typescript
// conversations — most critical query paths
conversations: defineTable({...})
  .index("by_orgId",           ["orgId"])
  .index("by_orgId_status",    ["orgId", "status"])
  .index("by_orgId_assignee",  ["orgId", "assigneeId"])
  .index("by_visitorId",       ["orgId", "visitorId"])

// messages — realtime feed
messages: defineTable({...})
  .index("by_conversation",    ["conversationId"])
  .index("by_orgId",           ["orgId"])

// kbChunks — vector search (Gemini text-embedding-004 = 768 dims)
kbChunks: defineTable({...})
  .index("by_orgId",           ["orgId"])
  .vectorIndex("by_embedding", {
    vectorField: "embedding",
    dimensions: 768,
    filterFields: ["orgId"],
  })

// presenceSessions — heartbeat table (isolated from user docs)
presenceSessions: defineTable({...})
  .index("by_conversation",    ["conversationId"])
  .index("by_user",            ["userId"])
```

---

## 4. Convex Components Installed

| Component | Purpose | Notes |
|---|---|---|
| `@convex-dev/agent` | AI thread management, durable conversation history, streaming | 1 thread per conversation |
| `@convex-dev/presence` | Typing indicators, active viewer tracking | Separate heartbeat table |
| `@convex-dev/rate-limiter` | Per-workspace quota enforcement (AI messages, KB uploads) | Prevents race conditions on quota |

> **AI Gateway**: Use `convexGateway("google/gemini-2.0-flash")` from `@convex-dev/ai-sdk-provider` for LLM calls (no key needed on paid Convex plan). Store Gemini embedding key (`GEMINI_API_KEY`) in Convex env for `text-embedding-004` RAG calls (gateway does not serve embeddings yet).

---

## 5. Clerk Billing — Seat-Based Plans

### Plan Tiers (Self-Serve via Clerk Pricing Table)

| Feature | Free | Pro | Enterprise |
|---|---|---|---|
| **Seats** | 1 agent | 5 agents | Unlimited |
| **AI messages / month** | 100 | 5,000 | Unlimited |
| **KB documents** | 10 | 100 | Unlimited |
| **Crawl pages** | 0 | 50 | Unlimited |
| **Widget customization** | Basic | Full | Full + white-label |
| **Analytics** | ❌ | ✅ | ✅ Advanced |
| **Priority support** | ❌ | ❌ | ✅ |

### Seat-Based Billing Implementation

```
Clerk Billing Plan (seat-limited)
  └── org.maxAllowedMemberships = plan.seats
       └── Clerk enforces seat cap at invitation time
            └── Convex usageMetrics tracks actual monthly usage
                 └── @convex-dev/rate-limiter enforces AI message quotas
```

All three plans are self-serve through the Clerk Pricing Table embedded in `/settings/billing`. Clerk handles checkout, seat adjustments, and subscription lifecycle. Convex syncs plan state via Clerk webhooks (`organizationMembership.*`, plan events).

### Quota Enforcement Strategy (Soft Warning + Hard Gate)

```
80% of limit reached  → In-app banner warning to admin
100% of limit reached → AI gracefully degrades (captures message for human)
                         Hard gate on KB uploads
                         Upgrade prompt shown inline
```

---

## 6. App Router File Structure

```
app/
├── (marketing)/                    ← Phase 6
│   ├── page.tsx                    # Animated landing page
│   ├── pricing/page.tsx            # Plan comparison
│   └── install/page.tsx            # Embed snippet guide
│
├── (auth)/
│   ├── sign-in/[[...sign-in]]/page.tsx
│   ├── sign-up/[[...sign-up]]/page.tsx
│   └── session-tasks/
│       └── choose-organization/page.tsx   # Clerk org task
│
├── (dashboard)/                    ← Protected: orgId required
│   ├── layout.tsx                  # Auth + Convex provider
│   ├── orgs/[slug]/
│   │   ├── inbox/page.tsx          # Shared team inbox
│   │   ├── kb/
│   │   │   ├── articles/page.tsx   # Article CRUD
│   │   │   └── documents/page.tsx  # File ingestion
│   │   ├── leads/page.tsx          # Lead pipeline CRM
│   │   ├── customizer/page.tsx     # Widget no-code editor
│   │   └── settings/
│   │       ├── billing/page.tsx    # Clerk Pricing Table
│   │       └── team/page.tsx       # Member management
│
├── widget/                         ← Public iframe entrypoint
│   └── [workspaceKey]/page.tsx     # Visitor-facing chat widget
│
└── api/
    ├── webhooks/clerk/route.ts     # Org + membership + billing events
    └── widget-token/route.ts       # Issues scoped visitor tokens

convex/
├── schema.ts                       # Full type-safe schema
├── auth.config.ts                  # Clerk JWT config
├── convex.config.ts                # Component mounts (agent, presence, rate-limiter)
├── workspaces.ts                   # Workspace provisioning
├── conversations.ts                # Inbox queries + mutations
├── messages.ts                     # Message CRUD + realtime feed
├── leads.ts                        # Lead capture + CRM
├── articles.ts                     # KB article CRUD
├── kbDocuments.ts                  # Document ingestion + chunking
├── ai/
│   ├── agent.ts                    # @convex-dev/agent thread management
│   ├── embed.ts                    # Gemini text-embedding-004 (Node action)
│   └── rag.ts                      # Vector search + retrieval
├── widget.ts                       # Public visitor session endpoints
├── presence.ts                     # @convex-dev/presence wrappers
├── usage.ts                        # Quota metering + rate-limiter checks
├── billing.ts                      # Webhook sync + plan state mutations
└── http.ts                         # HTTP endpoints (widget auth, webhooks)
```

---

## 7. Realtime Data Flow — Agent Inbox

```
Visitor (widget)                 Convex                    Agent (dashboard)
     │                             │                             │
     │── sendMessage() ───────────►│                             │
     │                             │── insert messages table     │
     │                             │── reactive query fires ────►│ (realtime update)
     │                             │                             │
     │                             │◄── agentReply() ────────────│ (or AI)
     │                             │── stream AI response        │
     │◄── streaming tokens ────────│                             │
     │                             │                             │
     │                        @presence                          │
     │                             │◄── heartbeat ───────────────│
     │                             │◄── startTyping() ───────────│
     │◄── typingIndicator ─────────│                             │
```

---

## 8. AI Agent Architecture (RAG + Streaming)

```
Visitor message
      │
      ▼
Convex action: handleVisitorMessage()
      │
      ├─ 1. Check quota via @convex-dev/rate-limiter
      │       └─ Degraded: save for human, skip AI
      │
      ├─ 2. Embed query → Gemini text-embedding-004 (768-dim)
      │
      ├─ 3. ctx.vectorSearch("kbChunks", "by_embedding", { filter: orgId })
      │       └─ returns top-K chunk IDs + scores
      │
      ├─ 4. Hydrate chunk docs via internalQuery
      │
      ├─ 5. @convex-dev/agent.generateText(ctx, { threadId }, {
      │         prompt: visitorMessage,
      │         system: "You are a support agent for {workspace}...",
      │         context: retrievedChunks,   ← RAG context
      │       })
      │       └─ streams tokens via convexGateway("google/gemini-2.0-flash")
      │
      └─ 6. Stream tokens to widget + store message in Convex
              └─ Source citations attached to response
```

---

## 9. Embeddable Widget Architecture

```html
<!-- One-line install on any site -->
<script src="https://yourapp.com/widget.js"
        data-workspace="wk_xxx"></script>
```

```
External Site
    └── <script> injects iframe launcher button
              └── iframe src: /widget/{workspaceKey}
                      └── Loads Next.js widget page (isolated origin)
                              ├── Anonymous visitor session (localStorage ID)
                              ├── Configurable lead capture (from widgetSettings)
                              ├── Proactive message after dwell delay
                              ├── Live chat (human or AI)
                              └── Built-in help center reader
```

**Visitor Identity Model**: Anonymous `visitorId` stored in `localStorage`. Enriched with Name/Email/Phone when lead capture fires (configurable: Before Chat / Mid-Chat / Optional). Visitor connects to Convex via a scoped public token from `/api/widget-token` — this token can only read/write their own `conversationId`.

---

## 10. Development Phases — Execution Roadmap

Aligned exactly with the attached diagram. Two sequential foundations feed into two parallel waves.

```
Phase 0 — Setup & wiring  (Sequential)
    │
    ▼
Phase 1 — Auth + workspaces + dashboard shell  (Sequential)
    │
    ├──────────────────────────────────────────────────────────────────────┐
    │            Wave A — Parallel after Foundation                        │
    ▼                    ▼                    ▼                    ▼       │
Phase 2           Phase 3               Phase 5            Phase 6        │
Inbox +           KB + RAG              Billing             Marketing      │
Widget core       core                  & plans             & install      │
    │                    │                                                 │
    └──────────────── Wave B — Parallel, dependent ───────────────────────┘
                         │
                    ┌────┴────┐
                    ▼         ▼
               Phase 4    Phase 7
               Leads +    Widget AI
               Customizer integration
```

---

### Phase 1 — Foundation 🔒 Sequential

> Everything downstream depends on this. Ships the shared schema, auth wiring, all Convex components installed, and the dashboard shell that all tracks build on.

**Scope:**
- Clerk Orgs enabled + custom `org:agent` role created via Clerk CLI
- `convex/auth.config.ts` wired to Clerk JWT issuer
- `convex/convex.config.ts` mounting `@convex-dev/agent`, `@convex-dev/presence`, `@convex-dev/rate-limiter`
- **Full** `convex/schema.ts` — all 13 tables with all indexes (written once here, not in each track)
- Clerk webhook handler → auto-provision `workspaces` doc on `organization.created`
- Dashboard shell: nav sidebar, org switcher (`<OrganizationSwitcher hidePersonal />`), route guards
- `clerkMiddleware` protecting all `/orgs/[slug]/*` routes

**Verification gate (must pass before parallel tracks start):**
- [ ] Sign up → create org → routed to dashboard shell
- [ ] Invite second user as `org:agent` → verify role-gated nav items
- [ ] Confirm Convex `workspaces` doc created with correct `orgId`
- [ ] Confirm all 13 tables present in Convex dashboard (schema deploy)
- [ ] `tsc --noEmit` passes

---

### Parallel Batch — 3 Tracks (separate git worktrees) ⚡

> These three tracks are **fully independent** of each other. Each only depends on the Phase 1 schema, auth, and components — which are already deployed. They produce PRs that merge back into `main` sequentially in any order that resolves without conflict, since they own separate files.

---

#### Track A — Realtime Team Inbox & Presence

**Owns:** `convex/conversations.ts`, `convex/messages.ts`, `convex/presence.ts`, `app/(dashboard)/orgs/[slug]/inbox/`

**Scope:**
- Convex queries/mutations for conversations (list, create, assign, status toggle open/close)
- Realtime message feed (insert, subscribe)
- `@convex-dev/presence` wrappers — typing indicator, active viewer per conversation
- Two-pane inbox UI: conversation list (left) + thread + composer (right)
- Filters: All / Unread / Unassigned / Assigned to me
- Assignment picker, open/close toggle, internal notes
- Live badge counts for new/unread conversations

**Verification gate:**
- [ ] Two browser sessions: simulate agent A and agent B in same conversation
- [ ] Typing indicator fires and clears correctly
- [ ] Assign conversation → filter "Assigned to me" shows it immediately (realtime)
- [ ] Close conversation → disappears from open view
- [ ] `tsc --noEmit` passes

---

#### Track B — Knowledge Base & AI Agent (RAG)

**Owns:** `convex/articles.ts`, `convex/kbDocuments.ts`, `convex/ai/`, `app/(dashboard)/orgs/[slug]/kb/`

**Scope:**
- Article CRUD UI (category, markdown editor, cover image, published/draft toggle)
- Document upload (.md / .txt / .pdf) → Convex file storage
- Node action: chunk documents → embed via Gemini `text-embedding-004` (768-dim) → insert into `kbChunks`
- `@convex-dev/agent` thread management (create thread per conversation)
- RAG action: embed query → vector search filtered by `orgId` → hydrate chunks → pass as context to Gemini 2.0 Flash via `convexGateway`
- Token streaming response with source citations
- Human takeover mutation (marks conversation `handedToHuman: true`, stops AI replies)

**Verification gate:**
- [ ] Upload a .pdf KB doc → chunks appear in Convex with embeddings
- [ ] Publish a help center article
- [ ] Submit a test message via `convex/http.ts` endpoint → AI responds with streamed tokens + cited source
- [ ] Mark conversation as handed over → AI stops responding
- [ ] `tsc --noEmit` passes

---

#### Track C — Clerk Seat-Based Billing & Quota Gating

**Owns:** `convex/billing.ts`, `convex/usage.ts`, `app/(dashboard)/orgs/[slug]/settings/billing/`, `app/api/webhooks/clerk/`

**Scope:**
- Create Free / Pro / Enterprise seat-based plans in Clerk via `clerk` CLI
- Clerk Pricing Table embedded in `/settings/billing`
- Clerk webhook handler: sync plan changes → update `workspaces.plan` + `workspaces.quotas` in Convex
- `usageMetrics` monthly rolling counters (AI messages, KB documents, seats)
- `@convex-dev/rate-limiter` config: per-`orgId` limits keyed to plan tier
- Quota check helpers used by other functions: `checkAiQuota(ctx, orgId)`, `checkKbQuota(ctx, orgId)`
- In-app banner: 80% warning + 100% upgrade prompt

**Verification gate:**
- [ ] Three plans visible in Clerk dashboard (Free/Pro/Enterprise with seat limits)
- [ ] Pricing Table renders and allows plan selection
- [ ] Webhook fires on plan change → Convex `workspaces.plan` updates
- [ ] Exceed AI message quota (set low limit) → graceful degradation fires, not a crash
- [ ] `tsc --noEmit` passes

---

### Phase 3 — Embeddable Widget + Customizer + Lead Pipeline 🔒 Sequential

> Starts only after all three tracks are merged. The widget is the convergence surface: it routes conversations to the inbox (Track A), streams AI responses (Track B), and enforces quotas (Track C).

**Owns:** `app/widget/`, `convex/widget.ts`, `convex/leads.ts`, `app/(dashboard)/orgs/[slug]/customizer/`, `app/(dashboard)/orgs/[slug]/leads/`

**Scope:**
- `app/widget/[workspaceKey]/page.tsx` — iframe-isolated visitor chat page
- Anonymous visitor session (`localStorage` `visitorId`)
- Configurable lead capture (Before Chat / Mid-Chat / Optional — read from `widgetSettings`)
- Proactive message on dwell delay (from `widgetSettings.proactiveDelay`)
- Built-in help center reader (lists published articles, full markdown reader)
- Widget visitor token endpoint (`/api/widget-token`) — scoped to single `conversationId`
- Per-workspace theming (colors, radius, logo, position) applied at render
- No-code widget customizer UI (live preview iframe + copy-paste snippet generator)
- Lead pipeline CRM table: sortable, filterable, inline status updates, CSV export, pagination

**Verification gate:**
- [ ] Embed snippet on a test HTML page → widget launches, visitor can chat
- [ ] Conversation appears in agent inbox (Track A) in realtime
- [ ] AI replies stream with source citation (Track B)
- [ ] Exceed quota → AI degrades gracefully, lead captured (Track C)
- [ ] Customize theme in dashboard → preview iframe reflects change immediately
- [ ] Submit lead form → appears in leads table with correct status

---

### Phase 4 — Marketing & Install Portal 🔒 Sequential

> Can begin as soon as Phase 3 is merged. Fully independent of all Convex backend logic — purely Next.js pages and static content.

**Owns:** `app/(marketing)/`

**Scope:**
- Animated landing page (hero with widget demo, feature highlights)
- Pricing page with plan comparison table + FAQ accordion
- Install & setup guide with syntax-highlighted embed snippet + step-by-step walkthrough
- `<OrganizationSwitcher />` / sign-up CTA in marketing header

**Verification gate:**
- [ ] Full funnel test: landing → pricing → sign-up → create org → onboarding → widget embedded
- [ ] Lighthouse score ≥ 90 (performance + SEO)
- [ ] All pages mobile-responsive

---

## 11. Key Technical Decisions Summary

| Decision | Choice | Rationale |
|---|---|---|
| **Tenant isolation key** | Clerk `orgId` | Single authoritative source of truth, tied to billing |
| **LLM provider** | Google Gemini 2.0 Flash | Fast streaming, large context for PDFs, cost-efficient |
| **Embedding model** | Gemini `text-embedding-004` (768-dim) | Native Gemini, matches Convex vector index capabilities |
| **AI thread management** | `@convex-dev/agent` | Durable history, tool-call support, reactive streaming |
| **Presence** | `@convex-dev/presence` | Correct per-user aggregation, heartbeat timeout, no hand-rolled race conditions |
| **Quota enforcement** | `@convex-dev/rate-limiter` | Atomic, no races under concurrency, retry-after built-in |
| **Visitor identity** | Anonymous localStorage ID + optional enrichment | Configurable gating per workspace admin preference |
| **Billing** | Clerk Pricing Table (self-serve) | All 3 plans self-serve, seat-based, no custom checkout code |
| **Widget isolation** | iframe (separate origin) | Style isolation, security, no conflict with host site CSS |
| **UI components** | shadcn/ui + Tailwind v4 | Headless, composable, Tailwind v4 CSS-first config |

---

## Open Questions

> [!NOTE]
> These do not block Phase 1 but should be resolved before Phase 3:

1. **Convex AI Gateway plan**: The `convexGateway` Gemini integration requires a paid Convex Cloud plan. Are we on a paid plan, or should we configure a direct Gemini API key from the start?
2. **Product name**: "SupportHub" is a placeholder — do you have a name chosen?
3. **Widget domain**: The widget JS loader and iframe will need a stable public URL. Should this be the same Next.js deployment or a separate CDN-hosted asset?

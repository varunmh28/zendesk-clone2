## Phase 0 — Setup & Wiring ✅

| Item | Status |
| :--- | :--- |
| `pnpm add @convex-dev/agent @convex-dev/presence @convex-dev/rate-limiter @convex-dev/ai-sdk-provider svix nanoid lucide-react` | ✅ Installed |
| `shadcn init` — detected Tailwind v4, wrote `components.json` | ✅ |
| `shadcn` components: `button`, `badge`, `avatar`, `separator`, `tooltip`, `scroll-area` | ✅ |
| `convex/convex.config.ts` — mounts agent, presence, rateLimiter | ✅ Deployed live |
| `convex/auth.config.ts` — wired to Clerk JWT issuer | ✅ |
| Clerk Organizations enabled via CLI | ✅ |
| `org:agent` custom role created via Clerk API | ✅ `role_3Ie0YzBSAg4F6XdhUCLdxsm5jsi` |

---

## Phase 1 — Auth + Workspaces + Dashboard Shell ✅

| Item | Status |
| :--- | :--- |
| `convex/schema.ts` — 13 tables, all indexes, 768-dim vector index | ✅ Deployed |
| `convex/workspaces.ts` — provision + plan update | ✅ |
| `convex/users.ts` — upsert from Clerk | ✅ |
| `convex/webhooks.ts` — idempotent event router | ✅ |
| `convex/http.ts` — Clerk webhook HTTP endpoint | ✅ |
| `proxy.ts` — `clerkMiddleware` with public route matcher (Next.js 16) | ✅ |
| `app/layout.tsx` — `ClerkProvider` + `ConvexClientProvider` + org task URL | ✅ |
| `DashboardShell` — sidebar nav, `OrganizationSwitcher`, `UserButton` | ✅ |
| All `orgs/[slug]/*` placeholder routes | ✅ |
| `pnpm build` → zero errors | ✅ |
/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as ai_agent from "../ai/agent.js";
import type * as ai_chunking from "../ai/chunking.js";
import type * as ai_embed from "../ai/embed.js";
import type * as ai_rag from "../ai/rag.js";
import type * as articles from "../articles.js";
import type * as billing from "../billing.js";
import type * as conversations from "../conversations.js";
import type * as http from "../http.js";
import type * as kbDocuments from "../kbDocuments.js";
import type * as messages from "../messages.js";
import type * as presence from "../presence.js";
import type * as usage from "../usage.js";
import type * as users from "../users.js";
import type * as webhooks from "../webhooks.js";
import type * as widget from "../widget.js";
import type * as workspaces from "../workspaces.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "ai/agent": typeof ai_agent;
  "ai/chunking": typeof ai_chunking;
  "ai/embed": typeof ai_embed;
  "ai/rag": typeof ai_rag;
  articles: typeof articles;
  billing: typeof billing;
  conversations: typeof conversations;
  http: typeof http;
  kbDocuments: typeof kbDocuments;
  messages: typeof messages;
  presence: typeof presence;
  usage: typeof usage;
  users: typeof users;
  webhooks: typeof webhooks;
  widget: typeof widget;
  workspaces: typeof workspaces;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  agent: import("@convex-dev/agent/_generated/component.js").ComponentApi<"agent">;
  presence: import("@convex-dev/presence/_generated/component.js").ComponentApi<"presence">;
  rateLimiter: import("@convex-dev/rate-limiter/_generated/component.js").ComponentApi<"rateLimiter">;
};

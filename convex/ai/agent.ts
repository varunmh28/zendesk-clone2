import {
  action,
  mutation,
  internalMutation,
  internalQuery,
} from "../_generated/server";
import { api, internal } from "../_generated/api";
import { v } from "convex/values";
import { embedText } from "./embed";
import { Id, Doc } from "../_generated/dataModel";
import { SearchResult } from "./rag";

/**
 * Mutation for human agent to take over the conversation
 */
export const takeoverConversation = mutation({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) throw new Error("Conversation not found");

    await ctx.db.patch(args.conversationId, {
      handedToHuman: true,
    });
  },
});

/**
 * Internal query to fetch conversation and recent messages
 */
export const getConversationContext = internalQuery({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) return null;

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .order("desc")
      .take(10);

    return {
      conversation,
      messages: messages.reverse(),
    };
  },
});

/**
 * Internal mutation to save AI response message and update metrics
 */
export const saveAiResponse = internalMutation({
  args: {
    orgId: v.string(),
    conversationId: v.id("conversations"),
    content: v.string(),
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
  },
  handler: async (ctx, args) => {
    // Insert AI message
    const messageId = await ctx.db.insert("messages", {
      orgId: args.orgId,
      conversationId: args.conversationId,
      role: "ai",
      content: args.content,
      isInternalNote: false,
      citations: args.citations,
    });

    // Update monthly usage metrics
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const metric = await ctx.db
      .query("usageMetrics")
      .withIndex("by_orgId_and_period", (q) =>
        q.eq("orgId", args.orgId).eq("periodStart", periodStart)
      )
      .first();

    if (metric) {
      await ctx.db.patch(metric._id, {
        aiMessagesUsed: (metric.aiMessagesUsed ?? 0) + 1,
      });
    }

    return messageId;
  },
});

/**
 * Action to generate AI reply using RAG and Gemini 2.0 Flash
 */
export const generateAiReply = action({
  args: {
    conversationId: v.id("conversations"),
    userMessage: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Fetch conversation details
    const contextData = await ctx.runQuery(
      internal.ai.agent.getConversationContext,
      { conversationId: args.conversationId }
    );

    if (!contextData || !contextData.conversation) {
      throw new Error("Conversation not found");
    }

    const { conversation, messages } = contextData;

    // If human agent has taken over, do not reply as AI
    if (conversation.handedToHuman) {
      return null;
    }

    const orgId = conversation.orgId;

    // 2. Check AI message monthly quota for this workspace
    const quota = await ctx.runQuery(api.usage.checkAiQuota, { orgId });
    if (quota && !quota.allowed) {
      const fallbackQuotaMessage =
        "Thank you for contacting us! Our automated AI assistant has reached its monthly plan limit. A human support representative will assist you shortly.";
      await ctx.runMutation(internal.ai.agent.saveAiResponse, {
        orgId,
        conversationId: args.conversationId,
        content: fallbackQuotaMessage,
      });
      return {
        content: fallbackQuotaMessage,
        citations: [],
      };
    }

    // 3. Check burst rate limit
    try {
      const rateLimit = await ctx.runMutation(api.usage.checkRateLimit, {
        orgId,
        actionName: "aiMessageRate",
      });
      if (rateLimit && !rateLimit.ok) {
        const waitSeconds = Math.ceil((rateLimit.retryAfter ?? 1000) / 1000);
        const rateLimitReply = `Our AI assistant is currently experiencing high demand. Please retry in ${waitSeconds}s or hold on for a human agent.`;
        await ctx.runMutation(internal.ai.agent.saveAiResponse, {
          orgId,
          conversationId: args.conversationId,
          content: rateLimitReply,
        });
        return {
          content: rateLimitReply,
          citations: [],
        };
      }
    } catch (e) {
      // Non-blocking fallback if rate limiter table is not yet initialized
      console.warn("Rate limit check passed with fallback:", e);
    }

    // 4. Perform RAG vector search for relevant context
    let ragChunks: SearchResult[] = [];
    try {
      const queryEmbedding = await embedText(args.userMessage);
      const vectorHits = await ctx.vectorSearch("kbChunks", "by_embedding", {
        vector: queryEmbedding,
        limit: 4,
        filter: (q) => q.eq("orgId", orgId),
      });

      if (vectorHits.length > 0) {
        ragChunks = await ctx.runQuery(internal.ai.rag.hydrateChunks, {
          hits: vectorHits,
        });
      }
    } catch (err) {
      console.warn("RAG search failed, continuing without KB context:", err);
    }

    // 3. Build prompt
    let kbContext = "No knowledge base documents found.";
    if (ragChunks.length > 0) {
      kbContext = ragChunks
        .map(
          (c, idx) =>
            `[Source ${idx + 1}: ${c.title}]\n${c.content}\n`
        )
        .join("\n---\n");
    }

    const conversationHistory = messages
      .map(
        (m: Doc<"messages">) =>
          `${m.role === "visitor" ? "User" : m.role === "ai" ? "AI Support" : "Agent"}: ${m.content}`
      )
      .join("\n");

    const systemPrompt = `You are a helpful, courteous, and accurate customer support assistant for this organization.
Use the provided Knowledge Base context to answer the user's question.
If the Knowledge Base contains relevant information, answer directly and concisely.
If the Knowledge Base does NOT contain enough information, politely answer as best as you can or suggest transferring the conversation to a human support agent.

=== KNOWLEDGE BASE CONTEXT ===
${kbContext}

=== RECENT CONVERSATION HISTORY ===
${conversationHistory || "No previous messages."}

=== CURRENT USER QUESTION ===
${args.userMessage}
`;

    // 4. Call Gemini 2.0 Flash
    const apiKey = process.env.GEMINI_API_KEY;
    let replyText = "";

    if (apiKey) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: systemPrompt }],
              },
            ],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 1000,
            },
          }),
        });

        if (response.ok) {
          const data = (await response.json()) as {
            candidates?: Array<{
              content?: { parts?: Array<{ text?: string }> };
            }>;
          };
          replyText =
            data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
        } else {
          const errorText = await response.text();
          console.error("Gemini 2.0 Flash API error:", errorText);
        }
      } catch (err) {
        console.error("Failed to generate response via Gemini API:", err);
      }
    }

    // Fallback response if API call was skipped or failed
    if (!replyText) {
      if (ragChunks.length > 0) {
        replyText = `Based on our knowledge base (${ragChunks[0].title}):\n\n${ragChunks[0].excerpt}\n\nLet me know if you would like more details or if you'd like to speak with a human support agent!`;
      } else {
        replyText = `Thank you for reaching out! I'm here to help. Could you provide a bit more detail about your question, or would you like me to connect you with a support representative?`;
      }
    }

    // 5. Build citations
    const citations = ragChunks.map((c) => ({
      articleId: c.articleId,
      chunkId: c.chunkId,
      title: c.title,
      excerpt: c.excerpt,
    }));

    // 6. Save AI message to database
    await ctx.runMutation(internal.ai.agent.saveAiResponse, {
      orgId,
      conversationId: args.conversationId,
      content: replyText,
      citations: citations.length > 0 ? citations : undefined,
    });

    return {
      content: replyText,
      citations,
    };
  },
});

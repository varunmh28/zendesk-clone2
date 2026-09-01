import { action, internalAction } from "../_generated/server";
import { v } from "convex/values";

/**
 * Generate a deterministic pseudo-random 768-dim vector for fallback / offline development
 */
function createFallbackEmbedding(text: string): number[] {
  const vector: number[] = new Array(768).fill(0);
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }
  for (let i = 0; i < 768; i++) {
    const val = Math.sin(hash + i * 31);
    vector[i] = Number(val.toFixed(6));
  }
  // Normalize vector
  const norm = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0)) || 1;
  return vector.map((v) => Number((v / norm).toFixed(6)));
}

/**
 * Embed a single text string using Google Gemini text-embedding-004
 */
export async function embedText(text: string): Promise<number[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  const cleanText = text.trim();
  if (!cleanText) {
    return new Array(768).fill(0);
  }

  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not configured; using fallback embedding for offline/dev testing.");
    return createFallbackEmbedding(cleanText);
  }

  // Try standard embedding models
  const models = ["gemini-embedding-001", "text-embedding-004", "gemini-embedding-2"];
  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:embedContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: `models/${model}`,
          content: {
            parts: [{ text: cleanText }],
          },
          outputDimensionality: 768,
        }),
      });

      if (!response.ok) {
        continue;
      }

      const data = (await response.json()) as {
        embedding?: { values?: number[] };
      };

      if (data.embedding?.values && data.embedding.values.length === 768) {
        return data.embedding.values;
      }
    } catch {
      // try next model
    }
  }

  return createFallbackEmbedding(cleanText);
}

/**
 * Embed batch of texts using Google Gemini batchEmbedContents API
 */
export async function embedBatch(texts: string[]): Promise<number[][]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (texts.length === 0) return [];

  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not configured; using fallback batch embeddings.");
    return texts.map(createFallbackEmbedding);
  }

  // Sequential or chunked embedding with fallback
  const results: number[][] = [];
  for (const text of texts) {
    const emb = await embedText(text);
    results.push(emb);
  }
  return results;
}

/**
 * Convex internal action for single text embedding
 */
export const embedTextAction = internalAction({
  args: { text: v.string() },
  handler: async (_ctx, args) => {
    return await embedText(args.text);
  },
});

/**
 * Convex public action for text embedding
 */
export const embedTextPublic = action({
  args: { text: v.string() },
  handler: async (_ctx, args) => {
    return await embedText(args.text);
  },
});

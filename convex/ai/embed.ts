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

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "models/text-embedding-004",
        content: {
          parts: [{ text: cleanText }],
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`Gemini Embed API error (${response.status}):`, errText);
      return createFallbackEmbedding(cleanText);
    }

    const data = (await response.json()) as {
      embedding?: { values?: number[] };
    };

    if (data.embedding?.values && data.embedding.values.length === 768) {
      return data.embedding.values;
    }

    console.warn("Gemini Embed API response did not contain 768 values, using fallback");
    return createFallbackEmbedding(cleanText);
  } catch (error) {
    console.error("Failed to generate embedding via Gemini API:", error);
    return createFallbackEmbedding(cleanText);
  }
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

  // Gemini batch embed accepts up to 100 requests per batch
  const batchSize = 50;
  const results: number[][] = [];

  for (let i = 0; i < texts.length; i += batchSize) {
    const chunk = texts.slice(i, i + batchSize);
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:batchEmbedContents?key=${apiKey}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requests: chunk.map((text) => ({
            model: "models/text-embedding-004",
            content: {
              parts: [{ text: text.trim() || " " }],
            },
          })),
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error(`Gemini Batch Embed API error (${response.status}):`, errText);
        results.push(...chunk.map(createFallbackEmbedding));
        continue;
      }

      const data = (await response.json()) as {
        embeddings?: Array<{ values?: number[] }>;
      };

      if (data.embeddings && data.embeddings.length === chunk.length) {
        for (let j = 0; j < chunk.length; j++) {
          const emb = data.embeddings[j]?.values;
          if (emb && emb.length === 768) {
            results.push(emb);
          } else {
            results.push(createFallbackEmbedding(chunk[j]));
          }
        }
      } else {
        results.push(...chunk.map(createFallbackEmbedding));
      }
    } catch (error) {
      console.error("Failed to generate batch embeddings via Gemini API:", error);
      results.push(...chunk.map(createFallbackEmbedding));
    }
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

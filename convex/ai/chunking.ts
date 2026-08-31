/**
 * Utility to chunk text/markdown into ~500-1000 character chunks with overlap
 */
export function chunkText(
  text: string,
  targetSize: number = 800,
  overlap: number = 150
): string[] {
  const clean = text.trim();
  if (!clean) return [];
  if (clean.length <= targetSize) return [clean];

  const chunks: string[] = [];
  // Split by double newlines or single newlines first to preserve paragraph boundaries
  const paragraphs = clean.split(/\n{2,}/);
  let currentChunk = "";

  for (const para of paragraphs) {
    const trimmedPara = para.trim();
    if (!trimmedPara) continue;

    if (currentChunk.length + trimmedPara.length + 2 <= targetSize) {
      currentChunk = currentChunk ? `${currentChunk}\n\n${trimmedPara}` : trimmedPara;
    } else {
      if (currentChunk) {
        chunks.push(currentChunk);
        // Prepare overlap
        const words = currentChunk.split(/\s+/);
        const overlapText = words.slice(-Math.max(5, Math.floor(overlap / 10))).join(" ");
        currentChunk = overlapText ? `${overlapText}\n\n${trimmedPara}` : trimmedPara;
      } else {
        // Paragraph itself exceeds targetSize, split by sentence or fixed slice
        let remaining = trimmedPara;
        while (remaining.length > targetSize) {
          // Find split point near targetSize
          let splitIdx = remaining.lastIndexOf(". ", targetSize);
          if (splitIdx < targetSize / 2) {
            splitIdx = remaining.lastIndexOf(" ", targetSize);
          }
          if (splitIdx < targetSize / 2) {
            splitIdx = targetSize;
          }

          const slice = remaining.substring(0, splitIdx + 1).trim();
          if (slice) chunks.push(slice);

          const nextStart = Math.max(0, splitIdx - overlap);
          remaining = remaining.substring(nextStart).trim();
        }
        currentChunk = remaining;
      }
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

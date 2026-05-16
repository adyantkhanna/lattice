import { eq } from "drizzle-orm";
import { db } from "../db/client";
import { sourceCache } from "../db/schema";
import { generateId } from "../utils";
import type { SourceResult } from "./types";

const TTL_MS: Record<string, number> = {
  rss: 2 * 60 * 60 * 1000, // 2 hours
  arxiv: 6 * 60 * 60 * 1000, // 6 hours
  exa: 4 * 60 * 60 * 1000, // 4 hours
};

function key(adapter: string, query: string, packSlug: string): string {
  return `${adapter}:${packSlug}:${query.slice(0, 120)}`;
}

/**
 * Read-through cache backed by the source_cache table.
 * On a cold miss, calls fn() and stores the result.
 */
export async function withCache(
  adapter: string,
  query: string,
  packSlug: string,
  fn: () => Promise<SourceResult[]>,
): Promise<SourceResult[]> {
  const cacheKey = key(adapter, query, packSlug);
  const now = new Date();

  const cached = await db.query.sourceCache.findFirst({
    where: eq(sourceCache.url, cacheKey),
  });

  if (cached && cached.expiresAt > now) {
    try {
      return JSON.parse(cached.content) as SourceResult[];
    } catch {
      // Fall through to fresh fetch on corrupt entry
    }
  }

  const results = await fn();
  const ttl = TTL_MS[adapter] ?? 4 * 60 * 60 * 1000;
  const expiresAt = new Date(now.getTime() + ttl);
  const serialized = JSON.stringify(results);

  if (cached) {
    await db
      .update(sourceCache)
      .set({ content: serialized, fetchedAt: now, expiresAt })
      .where(eq(sourceCache.url, cacheKey));
  } else {
    try {
      await db.insert(sourceCache).values({
        id: generateId(),
        url: cacheKey,
        content: serialized,
        fetchedAt: now,
        expiresAt,
      });
    } catch {
      // Race condition — another request inserted first; ignore
    }
  }

  return results;
}

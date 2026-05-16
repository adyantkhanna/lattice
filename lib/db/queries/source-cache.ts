import { eq, lt } from "drizzle-orm";
import { db } from "../client";
import { type NewSourceCache, type SourceCache, sourceCache } from "../schema";

export async function getCachedSource(url: string): Promise<SourceCache | undefined> {
  const row = await db.query.sourceCache.findFirst({ where: eq(sourceCache.url, url) });
  if (!row) return undefined;
  if (row.expiresAt < new Date()) return undefined;
  return row;
}

export async function upsertSourceCache(data: NewSourceCache): Promise<void> {
  await db
    .insert(sourceCache)
    .values(data)
    .onConflictDoUpdate({
      target: sourceCache.url,
      set: { content: data.content, fetchedAt: data.fetchedAt, expiresAt: data.expiresAt },
    });
}

export async function pruneExpiredCache(): Promise<void> {
  await db.delete(sourceCache).where(lt(sourceCache.expiresAt, new Date()));
}

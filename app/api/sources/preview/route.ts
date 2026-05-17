import { like } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { sourceCache } from "@/lib/db/schema";
import type { SourceResult } from "@/lib/sources/types";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url).searchParams.get("url");
  if (!url) return new Response("url required", { status: 400 });

  // source_cache.content stores JSON.stringify(SourceResult[]) keyed by query,
  // so scan for any entry whose JSON contains this exact URL.
  const escapedUrl = url.replace(/%/g, "\\%").replace(/_/g, "\\_");
  const entry = await db.query.sourceCache.findFirst({
    where: like(sourceCache.content, `%"url":"${escapedUrl}"%`),
  });

  if (!entry) return Response.json({ content: null });

  try {
    const sources = JSON.parse(entry.content) as SourceResult[];
    const match = sources.find((s) => s.url === url);
    return Response.json({ content: match?.content ?? null });
  } catch {
    return Response.json({ content: null });
  }
}

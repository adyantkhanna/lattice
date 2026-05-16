import type { TopicPack } from "../pack-loader/types";
import type { SourceResult } from "./types";

function extractTag(xml: string, tag: string): string {
  // Handles CDATA and plain text content
  const re = new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?</${tag}>`, "i");
  return xml.match(re)?.[1]?.trim() ?? "";
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchFeed(feedUrl: string, query: string): Promise<SourceResult[]> {
  try {
    const res = await fetch(feedUrl, {
      signal: AbortSignal.timeout(8_000),
      headers: { "User-Agent": "Lattice/1.0 (research agent)" },
    });
    if (!res.ok) return [];
    const xml = await res.text();

    // Match RSS <item> or Atom <entry> blocks
    const blocks = Array.from(xml.matchAll(/<(item|entry)>([\s\S]*?)<\/\1>/gi)).map((m) => m[2]);

    const queryWords = query.toLowerCase().split(/\s+/).slice(0, 3);
    const results: SourceResult[] = [];

    for (const block of blocks) {
      const title = stripHtml(extractTag(block, "title"));
      const link = extractTag(block, "link") || extractTag(block, "id");
      const raw =
        extractTag(block, "content") ||
        extractTag(block, "description") ||
        extractTag(block, "summary");
      const content = stripHtml(raw).slice(0, 800);

      // Keep items that share at least one query word
      const combined = `${title} ${content}`.toLowerCase();
      if (!queryWords.some((w) => combined.includes(w))) continue;
      if (!link || !title) continue;

      results.push({ url: link, title, content, source: "rss" });
      if (results.length >= 3) break;
    }

    return results;
  } catch (e) {
    console.error(`[rss] failed to fetch ${feedUrl}:`, e);
    return [];
  }
}

export async function rssSearch(query: string, pack: TopicPack): Promise<SourceResult[]> {
  const feeds = pack.sources?.rss ?? [];
  if (feeds.length === 0) return [];

  const results = await Promise.all(feeds.map((url) => fetchFeed(url, query)));
  return results.flat();
}

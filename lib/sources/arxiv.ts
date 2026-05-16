import type { TopicPack } from "../pack-loader/types";
import type { SourceResult } from "./types";

function extractTag(xml: string, tag: string): string {
  return xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i"))?.[1]?.trim() ?? "";
}

/**
 * Searches the arXiv API. When the pack has arxiv_categories, restricts to those.
 * Returns Atom-parsed SourceResult entries.
 */
export async function arxivSearch(
  query: string,
  pack: TopicPack,
  maxResults = 5,
): Promise<SourceResult[]> {
  const categories = pack.sources?.arxiv_categories ?? [];
  const catFilter =
    categories.length > 0 ? `+AND+(${categories.map((c) => `cat:${c}`).join("+OR+")})` : "";

  const q = encodeURIComponent(`all:${query}${catFilter}`);
  const url = `https://export.arxiv.org/api/query?search_query=${q}&max_results=${maxResults}&sortBy=relevance`;

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
    if (!res.ok) return [];
    const xml = await res.text();

    return Array.from(xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)).map((m) => {
      const entry = m[1];
      const title = extractTag(entry, "title").replace(/\s+/g, " ");
      const summary = extractTag(entry, "summary").replace(/\s+/g, " ").slice(0, 800);
      const id = extractTag(entry, "id").replace("http://arxiv.org/", "https://arxiv.org/");

      return { url: id, title, content: summary, source: "arxiv" as const };
    });
  } catch (e) {
    console.error("[arxiv] failed:", e);
    return [];
  }
}

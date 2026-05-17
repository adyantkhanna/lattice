import type { TopicPack } from "../pack-loader/types";
import type { SourceResult } from "./types";

const EXA_BASE = "https://api.exa.ai";

type ExaSearchResult = {
  url: string;
  title: string;
  text?: string;
  publishedDate?: string;
};

type ExaResponse = {
  results: ExaSearchResult[];
};

/**
 * Search via Exa. When pack has curated sites, restricts to those domains.
 * When pack sources are empty, runs an unscoped search (general web fallback).
 */
export async function exaSearch(
  query: string,
  pack: TopicPack,
  numResults = 5,
): Promise<SourceResult[]> {
  const apiKey = process.env.EXA_API_KEY;
  if (!apiKey) {
    console.warn("[exa] EXA_API_KEY not set — skipping");
    return [];
  }

  const sites = pack.sources?.sites ?? [];
  const body: Record<string, unknown> = {
    query,
    numResults,
    contents: { text: { maxCharacters: 1200 } },
    useAutoprompt: true,
  };
  if (sites.length > 0) body.includeDomains = sites;

  try {
    const res = await fetch(`${EXA_BASE}/search`, {
      method: "POST",
      // cache: 'no-store' bypasses Next.js RSC fetch interception to avoid hangs
      cache: "no-store",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(12_000),
    });

    if (!res.ok) {
      console.error("[exa] API error", res.status, await res.text());
      return [];
    }

    const data = (await res.json()) as ExaResponse;
    return data.results.map((r) => ({
      url: r.url,
      title: r.title ?? r.url,
      content: r.text ?? "",
      publishedAt: r.publishedDate,
      source: "exa" as const,
    }));
  } catch (e) {
    console.error("[exa] fetch failed:", e);
    return [];
  }
}

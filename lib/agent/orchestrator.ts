import type { TopicPack } from "../pack-loader/types";
import { arxivSearch } from "../sources/arxiv";
import { withCache } from "../sources/cache";
import { exaSearch } from "../sources/exa";
import { rssSearch } from "../sources/rss";
import type { SourceResult } from "../sources/types";
import { decompose } from "./decompose";
import { synthesize } from "./synthesize";

export type OrchestratorResult = {
  textStream: AsyncIterable<string>;
  sources: SourceResult[];
};

type ExpertiseProfile = {
  background?: string;
  level?: string;
  goals?: string;
};

export async function orchestrate(
  question: string,
  pack: TopicPack,
  expertiseProfile?: ExpertiseProfile | null,
): Promise<OrchestratorResult> {
  // Decompose question into sub-queries (fallback to original question on error)
  const subQueries = await decompose(question, pack).catch((e) => {
    console.error("[orchestrator] decompose failed, using original:", e);
    return [question];
  });

  // Fetch from all adapters in parallel for each sub-query
  const sourceMatrix = await Promise.all(
    subQueries.map((q) =>
      Promise.all([
        withCache("rss", q, pack.slug, () => rssSearch(q, pack)),
        withCache("arxiv", q, pack.slug, () => arxivSearch(q, pack)),
        withCache("exa", q, pack.slug, () => exaSearch(q, pack)),
      ]).then((results) => results.flat()),
    ),
  );

  // Flatten + deduplicate by URL
  const seen = new Set<string>();
  const uniqueSources = sourceMatrix.flat().filter((s) => {
    if (seen.has(s.url)) return false;
    seen.add(s.url);
    return true;
  });

  const textStream = await synthesize(question, uniqueSources, pack, expertiseProfile);
  return { textStream, sources: uniqueSources };
}

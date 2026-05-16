import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { parse } from "yaml";
import type { TopicPack } from "./types";
import { validatePack } from "./validate";

const PACKS_DIR = join(process.cwd(), "packs");

let cachedPacks: TopicPack[] | null = null;

export async function loadAllPacks(): Promise<TopicPack[]> {
  if (cachedPacks) return cachedPacks;

  const files = (await readdir(PACKS_DIR)).filter((f) => f.endsWith(".yaml") || f.endsWith(".yml"));

  const packs: TopicPack[] = [];

  for (const file of files) {
    const raw = await readFile(join(PACKS_DIR, file), "utf-8");
    const data = parse(raw);
    const result = await validatePack(data);
    if (!result.valid) {
      console.error(`[pack-loader] Invalid pack ${file}:`, result.errors);
      continue;
    }
    packs.push(result.pack);
  }

  cachedPacks = packs;
  return packs;
}

export async function loadPackBySlug(slug: string): Promise<TopicPack | undefined> {
  const packs = await loadAllPacks();
  return packs.find((p) => p.slug === slug);
}

export function hasAnySources(pack: TopicPack): boolean {
  const s = pack.sources ?? {};
  return (
    (s.rss?.length ?? 0) > 0 ||
    (s.sites?.length ?? 0) > 0 ||
    (s.arxiv_categories?.length ?? 0) > 0 ||
    (s.youtube_channels?.length ?? 0) > 0 ||
    (s.twitter_handles?.length ?? 0) > 0
  );
}

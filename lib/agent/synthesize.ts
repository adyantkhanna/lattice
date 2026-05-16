import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import type { TopicPack } from "../pack-loader/types";
import type { SourceResult } from "../sources/types";

let cachedPrompt: string | null = null;

async function getPrompt(): Promise<string> {
  if (!cachedPrompt) {
    cachedPrompt = await readFile(join(process.cwd(), "lib/agent/prompts/synthesize.md"), "utf-8");
  }
  return cachedPrompt;
}

export async function synthesize(
  question: string,
  sources: SourceResult[],
  pack: TopicPack,
): Promise<AsyncIterable<string>> {
  const systemPrompt = await getPrompt();

  const sourcesBlock =
    sources.length > 0
      ? sources
          .slice(0, 15)
          .map((s, i) => `### [${i + 1}] ${s.title}\nURL: ${s.url}\n\n${s.content}`)
          .join("\n\n---\n\n")
      : "No curated sources retrieved. Answer from training knowledge only.";

  const result = streamText({
    model: anthropic("claude-sonnet-4-6"),
    system: systemPrompt,
    prompt: [
      `Topic pack: ${pack.name} — ${pack.description}`,
      "",
      "## Sources",
      sourcesBlock,
      "",
      `## Question`,
      question,
    ].join("\n"),
  });

  return result.textStream;
}

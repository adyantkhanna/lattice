import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { streamText } from "ai";
import type { TopicPack } from "../pack-loader/types";
import type { SourceResult } from "../sources/types";
import { anthropic } from "./provider";

let cachedPrompt: string | null = null;

async function getPrompt(): Promise<string> {
  if (!cachedPrompt) {
    cachedPrompt = await readFile(join(process.cwd(), "lib/agent/prompts/synthesize.md"), "utf-8");
  }
  return cachedPrompt;
}

type ExpertiseProfile = {
  background?: string;
  level?: string;
  goals?: string;
};

export async function synthesize(
  question: string,
  sources: SourceResult[],
  pack: TopicPack,
  expertiseProfile?: ExpertiseProfile | null,
): Promise<AsyncIterable<string>> {
  const systemPrompt = await getPrompt();

  const sourcesBlock =
    sources.length > 0
      ? sources
          .slice(0, 15)
          .map((s, i) => `### [${i + 1}] ${s.title}\nURL: ${s.url}\n\n${s.content}`)
          .join("\n\n---\n\n")
      : "No curated sources retrieved. Answer from training knowledge only.";

  const profileBlock =
    expertiseProfile?.background || expertiseProfile?.level || expertiseProfile?.goals
      ? [
          "## Learner Profile",
          expertiseProfile.background ? `Background: ${expertiseProfile.background}` : "",
          expertiseProfile.level ? `Expertise level: ${expertiseProfile.level}` : "",
          expertiseProfile.goals ? `Goals: ${expertiseProfile.goals}` : "",
          "",
          "Calibrate your explanation depth, vocabulary, and examples to match this profile. For beginners, prefer analogies and step-by-step reasoning. For experts, skip basics and focus on nuance.",
        ]
          .filter(Boolean)
          .join("\n")
      : "";

  const prompt = [
    `Topic pack: ${pack.name} — ${pack.description}`,
    "",
    ...(profileBlock ? [profileBlock, ""] : []),
    "## Sources",
    sourcesBlock,
    "",
    "## Question",
    question,
  ].join("\n");

  const result = streamText({
    model: anthropic("claude-sonnet-4-6"),
    system: systemPrompt,
    prompt,
  });

  return result.textStream;
}

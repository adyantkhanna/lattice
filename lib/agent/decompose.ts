import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { generateObject, jsonSchema } from "ai";
import type { TopicPack } from "../pack-loader/types";
import { anthropic } from "./provider";

let cachedPrompt: string | null = null;

async function getPrompt(): Promise<string> {
  if (!cachedPrompt) {
    cachedPrompt = await readFile(join(process.cwd(), "lib/agent/prompts/decompose.md"), "utf-8");
  }
  return cachedPrompt;
}

const subQueriesSchema = jsonSchema<{ sub_queries: string[] }>({
  type: "object",
  properties: {
    sub_queries: {
      type: "array",
      items: { type: "string" },
      minItems: 2,
      maxItems: 5,
      description: "Focused, independently-searchable sub-queries",
    },
  },
  required: ["sub_queries"],
  additionalProperties: false,
});

export async function decompose(question: string, pack: TopicPack): Promise<string[]> {
  const systemPrompt = await getPrompt();

  const { object } = await generateObject({
    model: anthropic("claude-haiku-4-5-20251001"),
    schema: subQueriesSchema,
    system: systemPrompt,
    prompt: `Topic pack: ${pack.name} — ${pack.description}\n\nUser question: ${question}`,
  });

  return object.sub_queries;
}

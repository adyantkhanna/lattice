import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { generateObject, jsonSchema } from "ai";
import type { SourceResult } from "../sources/types";
import { anthropic } from "./provider";

let cachedPrompt: string | null = null;

async function getPrompt(): Promise<string> {
  if (!cachedPrompt) {
    cachedPrompt = await readFile(
      join(process.cwd(), "lib/agent/prompts/extract-nodes.md"),
      "utf-8",
    );
  }
  return cachedPrompt;
}

type KnowledgeNode = {
  title: string;
  summary: string;
  sources: string[];
};

const nodesSchema = jsonSchema<{ nodes: KnowledgeNode[] }>({
  type: "object",
  properties: {
    nodes: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          summary: { type: "string", description: "2-3 sentence summary of the concept" },
          sources: { type: "array", items: { type: "string" }, description: "Source URLs" },
        },
        required: ["title", "summary", "sources"],
        additionalProperties: false,
      },
      maxItems: 8,
    },
  },
  required: ["nodes"],
  additionalProperties: false,
});

export async function extractNodes(
  answer: string,
  sources: SourceResult[],
): Promise<KnowledgeNode[]> {
  const systemPrompt = await getPrompt();
  const sourceList = sources.map((s) => `${s.url} — ${s.title}`).join("\n");

  const { object } = await generateObject({
    model: anthropic("claude-sonnet-4-6"),
    schema: nodesSchema,
    system: systemPrompt,
    prompt: ["Available source URLs:", sourceList, "", "Answer:", answer].join("\n"),
  });

  return object.nodes;
}

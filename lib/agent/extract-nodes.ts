import { generateObject, jsonSchema } from "ai";
import type { SourceResult } from "../sources/types";
import { anthropic } from "./provider";

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

/**
 * Extracts structured knowledge nodes from a synthesized answer for the
 * knowledge tree panel (Milestone 3). Called asynchronously after streaming.
 */
export async function extractNodes(
  answer: string,
  sources: SourceResult[],
): Promise<KnowledgeNode[]> {
  const sourceList = sources.map((s) => `${s.url} — ${s.title}`).join("\n");

  const { object } = await generateObject({
    model: anthropic("claude-sonnet-4-6"),
    schema: nodesSchema,
    prompt: [
      "Extract the key concepts from this research answer as structured knowledge nodes.",
      "Each node should capture a distinct concept, mechanism, or insight.",
      "",
      "Available source URLs:",
      sourceList,
      "",
      "Answer:",
      answer,
    ].join("\n"),
  });

  return object.nodes;
}

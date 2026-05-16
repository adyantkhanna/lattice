import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { anthropic } from "@ai-sdk/anthropic";
import { generateObject, jsonSchema } from "ai";

const scoreSchema = jsonSchema<{
  accuracy: number;
  citation_quality: number;
  source_relevance: number;
  specificity: number;
  level_calibration: number;
  reasoning: string;
}>({
  type: "object",
  properties: {
    accuracy: { type: "integer", minimum: 0, maximum: 5 },
    citation_quality: { type: "integer", minimum: 0, maximum: 5 },
    source_relevance: { type: "integer", minimum: 0, maximum: 5 },
    specificity: { type: "integer", minimum: 0, maximum: 5 },
    level_calibration: { type: "integer", minimum: 0, maximum: 5 },
    reasoning: {
      type: "string",
      description: "2-3 sentence justification for the scores given",
    },
  },
  required: [
    "accuracy",
    "citation_quality",
    "source_relevance",
    "specificity",
    "level_calibration",
    "reasoning",
  ],
  additionalProperties: false,
});

export type EvalScore = {
  accuracy: number;
  citation_quality: number;
  source_relevance: number;
  specificity: number;
  level_calibration: number;
  reasoning: string;
  total: number;
};

let cachedRubric: string | null = null;

async function getRubric(): Promise<string> {
  if (!cachedRubric) {
    cachedRubric = await readFile(join(process.cwd(), "evals/rubrics/default.md"), "utf-8");
  }
  return cachedRubric;
}

export async function judge(
  question: string,
  answer: string,
  packName: string,
): Promise<EvalScore> {
  const rubric = await getRubric();

  const { object } = await generateObject({
    model: anthropic("claude-sonnet-4-6"),
    schema: scoreSchema,
    system: `You are an expert evaluator for AI research assistants. Use this rubric to score the answer:\n\n${rubric}`,
    prompt: [
      `Pack context: ${packName}`,
      "",
      `Question: ${question}`,
      "",
      "Answer to evaluate:",
      answer,
    ].join("\n"),
  });

  return {
    ...object,
    total:
      object.accuracy +
      object.citation_quality +
      object.source_relevance +
      object.specificity +
      object.level_calibration,
  };
}

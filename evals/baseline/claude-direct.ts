import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";

/**
 * Vanilla Sonnet 4.6 baseline — no pack context, no source retrieval.
 * Used as the comparison point in eval reports.
 */
export async function runBaseline(question: string): Promise<string> {
  const { text } = await generateText({
    model: anthropic("claude-sonnet-4-6"),
    prompt: question,
  });
  return text;
}

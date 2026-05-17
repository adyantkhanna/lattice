import { createAnthropic } from "@ai-sdk/anthropic";

// Normalise ANTHROPIC_BASE_URL: add /v1 if missing (common misconfiguration)
const rawBase = process.env.ANTHROPIC_BASE_URL ?? "https://api.anthropic.com/v1";
const baseURL = rawBase.endsWith("/v1") ? rawBase : `${rawBase.replace(/\/$/, "")}/v1`;

export const anthropic = createAnthropic({ baseURL });

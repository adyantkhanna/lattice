import Ajv from "ajv";
import addFormats from "ajv-formats";
import type { TopicPack } from "./types";

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

let compiledValidate: ReturnType<typeof ajv.compile> | null = null;

async function getValidator(): Promise<ReturnType<typeof ajv.compile>> {
  if (compiledValidate) return compiledValidate;
  const { readFile } = await import("node:fs/promises");
  const { join } = await import("node:path");
  const raw = await readFile(join(process.cwd(), "packs/pack.schema.json"), "utf-8");
  compiledValidate = ajv.compile(JSON.parse(raw));
  return compiledValidate;
}

export type ValidationResult =
  | { valid: true; pack: TopicPack }
  | { valid: false; errors: string[] };

export async function validatePack(data: unknown): Promise<ValidationResult> {
  const validate = await getValidator();
  const valid = validate(data);
  if (!valid) {
    const errors = (validate.errors ?? []).map((e) => `${e.instancePath || "root"}: ${e.message}`);
    return { valid: false, errors };
  }
  return { valid: true, pack: data as TopicPack };
}

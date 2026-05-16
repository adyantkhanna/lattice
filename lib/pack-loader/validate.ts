import Ajv from "ajv";
import addFormats from "ajv-formats";
import type { TopicPack } from "./types";

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

let schema: object | null = null;

async function getSchema(): Promise<object> {
  if (schema) return schema;
  const { readFile } = await import("node:fs/promises");
  const { join } = await import("node:path");
  const raw = await readFile(join(process.cwd(), "packs/pack.schema.json"), "utf-8");
  schema = JSON.parse(raw);
  return schema as object;
}

export type ValidationResult =
  | { valid: true; pack: TopicPack }
  | { valid: false; errors: string[] };

export async function validatePack(data: unknown): Promise<ValidationResult> {
  const s = await getSchema();
  const validate = ajv.compile(s);
  const valid = validate(data);
  if (!valid) {
    const errors = (validate.errors ?? []).map((e) => `${e.instancePath || "root"}: ${e.message}`);
    return { valid: false, errors };
  }
  return { valid: true, pack: data as TopicPack };
}

#!/usr/bin/env tsx
/**
 * Validates all YAML files in /packs against pack.schema.json.
 * Exits with code 1 if any pack fails validation.
 *
 * Usage: pnpm tsx scripts/validate-packs.ts
 */
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { parse } from "yaml";
import { validatePack } from "../lib/pack-loader/validate";

const PACKS_DIR = join(process.cwd(), "packs");

async function main() {
  const files = (await readdir(PACKS_DIR)).filter((f) => f.endsWith(".yaml") || f.endsWith(".yml"));

  let failed = 0;

  for (const file of files) {
    const raw = await readFile(join(PACKS_DIR, file), "utf-8");
    const data = parse(raw);
    const result = await validatePack(data);

    if (!result.valid) {
      console.error(`FAIL  ${file}`);
      for (const e of result.errors) console.error(`      ${e}`);
      failed++;
    } else {
      console.log(`OK    ${file}`);
    }
  }

  if (failed > 0) {
    console.error(`\n${failed} pack(s) failed validation.`);
    process.exit(1);
  }

  console.log(`\nAll ${files.length} pack(s) valid.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

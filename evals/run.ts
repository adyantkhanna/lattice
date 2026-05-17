import { mkdirSync, readFileSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

// Load .env.local so the script works without manually exporting env vars
try {
  const raw = readFileSync(join(process.cwd(), ".env.local"), "utf-8");
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
} catch {
  // .env.local is optional
}

// Guard against a bare base URL that would misroute API calls (should end in /v1)
if (process.env.ANTHROPIC_BASE_URL && !process.env.ANTHROPIC_BASE_URL.endsWith("/v1")) {
  process.env.ANTHROPIC_BASE_URL = `${process.env.ANTHROPIC_BASE_URL.replace(/\/$/, "")}/v1`;
}

import { orchestrate } from "../lib/agent/orchestrator";
import { loadPackBySlug } from "../lib/pack-loader/load";
import { runBaseline } from "./baseline/claude-direct";
import { type EvalScore, judge } from "./judges/pack-aware-judge";

// CLI: pnpm eval --pack <slug>
const args = process.argv.slice(2);
const packFlagIdx = args.indexOf("--pack");
const rawSlug = packFlagIdx >= 0 ? args[packFlagIdx + 1] : undefined;

if (!rawSlug) {
  console.error("Usage: pnpm eval --pack <slug>");
  process.exit(1);
}

const packSlug: string = rawSlug;

type EvalCase = { id: string; question: string; pack: string };

function scoreRow(label: string, s: EvalScore): string {
  return `| ${label} | ${s.accuracy} | ${s.citation_quality} | ${s.source_relevance} | ${s.specificity} | ${s.level_calibration} | **${s.total}/25** |`;
}

async function main() {
  const pack = await loadPackBySlug(packSlug);
  if (!pack) {
    console.error(`Pack not found: ${packSlug}`);
    process.exit(1);
  }

  const datasetPath = join(process.cwd(), "evals/datasets", `${packSlug}.jsonl`);
  let raw: string;
  try {
    raw = await readFile(datasetPath, "utf-8");
  } catch {
    console.error(`Dataset not found: ${datasetPath}`);
    process.exit(1);
  }

  const cases: EvalCase[] = raw
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line) as EvalCase);

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const outputDir = join(process.cwd(), "evals/runs", timestamp);
  mkdirSync(outputDir, { recursive: true });

  const sections: string[] = [];
  let totalAgent = 0;
  let totalBaseline = 0;

  console.log(`\nRunning ${cases.length} eval questions for pack: ${pack.name}\n`);

  for (const c of cases) {
    console.log(`→ [${c.id}] ${c.question.slice(0, 70)}…`);

    // Run agent
    process.stdout.write("  agent…");
    let agentAnswer = "";
    try {
      const { textStream } = await orchestrate(c.question, pack);
      for await (const chunk of textStream) {
        agentAnswer += chunk;
      }
    } catch (e) {
      agentAnswer = `[agent error: ${e}]`;
    }
    process.stdout.write(" done\n");

    // Run baseline
    process.stdout.write("  baseline…");
    const baselineAnswer = await runBaseline(c.question).catch((e) => `[baseline error: ${e}]`);
    process.stdout.write(" done\n");

    // Judge both in parallel
    process.stdout.write("  judging…");
    const [agentScore, baselineScore] = await Promise.all([
      judge(c.question, agentAnswer, pack.name),
      judge(c.question, baselineAnswer, pack.name),
    ]);
    process.stdout.write(" done\n");

    totalAgent += agentScore.total;
    totalBaseline += baselineScore.total;

    console.log(`  Scores — Agent: ${agentScore.total}/25  Baseline: ${baselineScore.total}/25\n`);

    const tableHeader =
      "| | Acc | Cite | Src | Spec | Level | Total |\n|---|---|---|---|---|---|---|";

    sections.push(
      [
        `## ${c.id}: ${c.question}`,
        "",
        tableHeader,
        scoreRow("**Agent**", agentScore),
        scoreRow("Baseline", baselineScore),
        "",
        `_${agentScore.reasoning}_`,
        "",
        "<details><summary>Agent answer</summary>",
        "",
        agentAnswer,
        "",
        "</details>",
        "",
        "<details><summary>Baseline (vanilla Sonnet)</summary>",
        "",
        baselineAnswer,
        "",
        "</details>",
      ].join("\n"),
    );
  }

  const avgAgent = (totalAgent / cases.length).toFixed(1);
  const avgBaseline = (totalBaseline / cases.length).toFixed(1);

  const report = [
    `# Eval Report — ${pack.name}`,
    "",
    `**Run:** ${new Date().toISOString()}  `,
    `**Pack:** ${packSlug}  `,
    `**Questions:** ${cases.length}`,
    "",
    `## Summary`,
    "",
    `| | Average score (/25) |`,
    `|---|---|`,
    `| **Agent (Lattice)** | **${avgAgent}** |`,
    `| Baseline (vanilla Sonnet) | ${avgBaseline} |`,
    "",
    "---",
    "",
    sections.join("\n\n---\n\n"),
  ].join("\n");

  const reportPath = join(outputDir, "REPORT.md");
  await writeFile(reportPath, report, "utf-8");

  console.log(`\nReport saved → ${reportPath}`);
  console.log(`Average — Agent: ${avgAgent}/25  Baseline: ${avgBaseline}/25`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

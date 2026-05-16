# Lattice — Project Brief

## What we're building

Lattice is an open-source AI research agent that helps you become an
expert on any topic fast. Unlike ChatGPT/Claude deep research or
Stanford STORM, it:

1. Searches curated, opinionated source lists per topic — not generic web
2. Outputs a navigable tree of knowledge, not a wall of prose
3. Remembers what you already know and skips the basics
4. (Future) Surfaces adversarial perspectives and open debates

The unit of extension is a Topic Pack — a YAML file defining sources,
canonical readings, key people, glossary, and open debates for a domain.
Community contributes packs via PRs. Think "awesome lists, but executable
by an AI agent."

## Relationship to existing work

Stanford's STORM (github.com/stanford-oval/storm) is the closest analog.
Study its approach to perspective-guided question asking and knowledge
graph extraction. Lattice differs in two material ways: (a) Topic Packs
as a community-extensible curation format, and (b) personal memory
across sessions.

## Auth & deployment model

Follow the Dify / LibreChat / Cal.com pattern: built-in optional auth,
single codebase, mode controlled by env var.

Mode A — Local (default): AUTH_MODE=local
- No login UI
- Hardcoded user_id = 'local' threaded through all DB queries
- SQLite at ./data/lattice.db
- BYOK: user provides ANTHROPIC_API_KEY in .env.local
- 30-second setup: pnpm install && pnpm dev

Mode B — Multi-user (self-hosted): AUTH_MODE=multi
- Auth.js v5 with email magic link + GitHub OAuth
- Postgres instead of SQLite
- Same UI, same schema, same agent code

All auth logic lives in /lib/auth/ and is bypassed in local mode by
middleware that injects a stub session.

## v1 scope

- Local mode only. Mode B scaffolded but not finalized.
- Three Topic Packs (built separately — use placeholder YAMLs for now)
- Full agent loop with curated source search
- Knowledge tree UI
- Basic memory-of-you via onboarding
- Eval harness

## Tech stack

- Next.js 14 (App Router) + TypeScript
- Tailwind + shadcn/ui
- Drizzle ORM (SQLite local, Postgres multi-user)
- Auth.js v5
- Vercel AI SDK (streaming, tool use)
- Anthropic SDK — Claude Sonnet 4.6 (synthesis), Haiku 4.5 (decomposition)
- Exa API for general web search
- pnpm
- Vitest for tests
- Biome for lint + format

## Repo structure

```
lattice/
├── .github/
│   ├── ISSUE_TEMPLATE/
│   ├── PULL_REQUEST_TEMPLATE/
│   ├── workflows/  (ci.yml, validate-packs.yml, eval-regression.yml)
│   ├── CODEOWNERS
│   └── dependabot.yml
├── app/  (Next.js app router — auth, app, api routes)
├── components/  (ui, chat, knowledge-tree, pack-selector)
├── lib/
│   ├── agent/  (orchestrator, decompose, synthesize, extract-nodes, prompts/)
│   ├── auth/  (config, middleware with local-mode bypass, providers)
│   ├── db/  (schema, client, queries/, migrations/)
│   ├── pack-loader/  (load, validate, types)
│   ├── sources/  (rss, arxiv, twitter, youtube, exa, cache)
│   └── utils/
├── packs/  (YAML topic packs, pack.schema.json, README.md)
├── evals/  (datasets/, rubrics/, baseline/, judges/, runs/, run.ts)
├── docs/  (architecture, deployment, pack-authoring, evals, roadmap)
├── scripts/
├── data/  (gitignored)
├── .env.example
├── biome.json
├── docker-compose.yml
├── Dockerfile
├── drizzle.config.ts
└── README.md, CONTRIBUTING.md, CODE_OF_CONDUCT.md, SECURITY.md,
    LICENSE (MIT), CHANGELOG.md
```

## Data model (Drizzle)

```
users          { id, email nullable, name nullable, expertise_profile jsonb, created_at }
conversations  { id, user_id, topic_pack_slug, title, created_at, updated_at }
messages       { id, conversation_id, role, content, citations jsonb, created_at }
knowledge_nodes{ id, user_id, topic_pack_slug, parent_id nullable,
                 title, summary, sources jsonb,
                 status: unread|learning|known, created_at }
source_cache   { id, url unique, content, fetched_at, expires_at }
```

## Topic Pack format

```yaml
slug, name, description, maintainers[]
sources:
  rss[], twitter_handles[], youtube_channels[],
  arxiv_categories[], sites[]
canonical_readings: [{ title, url, why }]
key_people:         [{ name, role, handle? }]
glossary:           [{ term, definition }]
open_debates:       [{ question, perspectives[] }]
```

## Build order — STRICT, do not skip ahead

### Milestone 0: Foundation
- Init Next.js + TS + Tailwind + shadcn/ui
- Configure Biome, Vitest, Drizzle (SQLite)
- .env.example documenting every variable
- Auth.js v5 with local-mode bypass middleware
- Pack loader reading /packs/*.yaml, validating against JSON schema
- Pack schema validation script + GitHub Action
- README, CONTRIBUTING, CODE_OF_CONDUCT, LICENSE, SECURITY
- Template pack and 3 placeholder packs (ai-hardware,
  ai-inference-economics, vertical-ai-smb) with just slug/name/description

### Milestone 1: Skeleton UI
- Pack selection screen (grid)
- Chat UI with streaming (Vercel AI SDK)
- Conversation history sidebar
- All data persists via Drizzle

### Milestone 2: Curated-source agent
- decompose.ts — question → sub-queries via Haiku
- Source adapters: RSS, arXiv, Exa with includeDomains
- In-memory + file cache for source fetches
- synthesize.ts — sub-results → answer via Sonnet with inline citations
- Streaming end-to-end
- Falls back to general web search if pack has no curated sources

### Milestone 3: Knowledge tree
- extract-nodes.ts — extract concepts via structured output
- Collapsible tree sidebar
- Mark-as-known interaction, persists per user per pack

### Milestone 4: Memory of you
- Onboarding → expertise_profile
- System prompt injection of relevant slice
- Settings page

### Milestone 5: Evals (build alongside M2, not after)
- Eval CLI (pnpm eval --pack <slug>)
- Baseline: vanilla Claude (no pack)
- LLM judge with rubric (accuracy, source quality, specificity,
  level calibration, citations)
- Markdown report
- GitHub Action for regression runs

### Milestone 6 (future): Multi-user mode polish
- Postgres adapter, Auth.js providers wired, Docker Compose,
  deployment doc

## Open-source hygiene — required from day one

- README with one-line pitch, quickstart (3 commands), feature list,
  link to docs/contributing/roadmap
- Issue templates (bug, feature, new pack request)
- PR templates (default + new pack)
- GitHub Actions: CI (lint, typecheck, test), validate packs, eval regression
- CODEOWNERS, dependabot.yml, SECURITY.md
- MIT LICENSE
- CHANGELOG.md in keep-a-changelog format
- Semantic versioning starting v0.1.0
- CODE_OF_CONDUCT.md (Contributor Covenant 2.1)

## UI principles

- Reading-optimized, generous whitespace
- Source Serif Pro for long content, Inter for chrome
- Dark mode default
- Three-pane desktop: knowledge tree | chat | source preview
- Citations are first-class — every claim hyperlinked

## Conventions

- TypeScript strict mode
- All DB queries go through /lib/db/queries/ — no inline SQL elsewhere
- All prompts live as .md files in /lib/agent/prompts/ — never inline
- All env vars documented in .env.example with comments
- Tests next to source files as *.test.ts
- Biome for format/lint, runs on pre-commit via lefthook
- Conventional Commits for messages (feat:, fix:, docs:, etc.)
- Branch naming: feat/, fix/, docs/, chore/

# Lattice

**Become an expert on any topic in hours, not months.**

Lattice is an open-source AI research agent that searches curated source
lists, builds a navigable knowledge tree, and remembers what you already
know — so every session starts where you left off.

## Why Lattice?

| | ChatGPT/Claude Deep Research | Stanford STORM | **Lattice** |
|---|---|---|---|
| Sources | Generic web | Generic web | Curated per topic |
| Output | Prose report | Wikipedia-style article | Navigable knowledge tree |
| Memory | None | None | Remembers your expertise |
| Extensible | No | No | Community Topic Packs |

## Quickstart (local mode)

```bash
git clone https://github.com/your-org/lattice
cd lattice
cp .env.example .env.local   # add your ANTHROPIC_API_KEY
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Features

- **Topic Packs** — community-curated YAML files defining authoritative sources,
  key people, canonical readings, and open debates for a domain
- **Curated search** — Exa queries scoped to pack-defined domains; falls back to
  general web when no sources are configured
- **Knowledge tree** — collapsible concept graph you can mark as known/learning
- **Memory of you** — onboarding captures your expertise level; prompts adapt accordingly
- **Local-first** — runs entirely on your machine with your API key; no accounts required
- **Self-hostable** — `AUTH_MODE=multi` enables multi-user mode with Auth.js

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). The fastest way to contribute is to
add or improve a [Topic Pack](packs/README.md).

## Roadmap

See [docs/roadmap.md](docs/roadmap.md) (coming in M1).

## License

MIT — see [LICENSE](LICENSE).

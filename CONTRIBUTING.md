# Contributing to Lattice

Thank you for your interest in contributing!

## Ways to contribute

1. **Add or improve a Topic Pack** — the highest-impact contribution
2. **File a bug** — use the bug report issue template
3. **Request a feature** — use the feature request template
4. **Submit a PR** — see the guidelines below

## Development setup

```bash
git clone https://github.com/your-org/lattice
cd lattice
cp .env.example .env.local   # fill in ANTHROPIC_API_KEY
pnpm install
pnpm dev
```

## Before submitting a PR

```bash
pnpm lint        # Biome check
pnpm typecheck   # TypeScript
pnpm test        # Vitest
```

All three must pass. CI runs the same checks.

## Topic Packs

The fastest path to contribution. See [packs/README.md](packs/README.md)
for the authoring guide and use the "New Topic Pack" PR template when
submitting.

## Commit messages

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add RSS source adapter
fix: handle empty pack sources gracefully
docs: update pack authoring guide
chore: upgrade drizzle-kit
test: add validate-pack edge cases
refactor: split orchestrator into smaller fns
```

## Branch naming

`feat/<name>`, `fix/<name>`, `docs/<name>`, `chore/<name>`

## Code of conduct

Please read [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) before participating.

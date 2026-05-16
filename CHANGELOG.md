# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Next.js 14 + TypeScript + Tailwind project scaffold
- Drizzle ORM with SQLite (local mode) and Postgres (multi-user mode) support
- Auth.js v5 integration with local-mode bypass middleware
- Topic Pack YAML format with JSON Schema validation
- Pack loader (`lib/pack-loader/`) with load, validate, and type modules
- Placeholder packs: `ai-hardware`, `ai-inference-economics`, `vertical-ai-smb`
- Template pack for community contributors
- Pack validation script (`scripts/validate-packs.ts`)
- Biome for linting and formatting
- Vitest for unit testing
- Lefthook for pre-commit hooks
- GitHub Actions: CI workflow, pack validation workflow
- Open-source hygiene: README, CONTRIBUTING, CODE_OF_CONDUCT, LICENSE, SECURITY
- `.env.example` documenting all environment variables

[Unreleased]: https://github.com/your-org/lattice/compare/HEAD...HEAD

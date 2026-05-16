# Topic Packs

A Topic Pack is a YAML file that tells Lattice where to find authoritative
information on a subject and what the key concepts, people, and debates are.

## Creating a pack

1. Copy `template.yaml` to `<your-slug>.yaml`
2. Fill in the required fields: `slug`, `name`, `description`
3. Add as many optional fields as you have quality data for
4. Leave fields empty rather than filling them with guesses
5. Submit a PR — the `validate-packs` CI action will check your YAML

## Schema

All packs are validated against `pack.schema.json`. Run the validator locally:

```bash
pnpm tsx scripts/validate-packs.ts
```

## Fields

| Field | Required | Description |
|---|---|---|
| `slug` | yes | Kebab-case unique identifier |
| `name` | yes | Human-readable name |
| `description` | yes | One-paragraph summary |
| `maintainers` | no | GitHub usernames |
| `sources.rss` | no | RSS/Atom feed URLs |
| `sources.twitter_handles` | no | Twitter/X handles (without @) |
| `sources.youtube_channels` | no | YouTube channel IDs or handles |
| `sources.arxiv_categories` | no | arXiv category codes (e.g. cs.LG) |
| `sources.sites` | no | Domains to search via Exa includeDomains |
| `canonical_readings` | no | Must-read references with title, url, why |
| `key_people` | no | Notable people with name, role, handle? |
| `glossary` | no | Term/definition pairs |
| `open_debates` | no | Questions with multiple perspectives |

## Empty packs are fine

A pack with only `slug`, `name`, and `description` is valid and useful.
Lattice will fall back to general web search via Exa for packs with no
curated sources.

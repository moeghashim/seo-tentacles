# SEO Tentacles

A CLI-first SEO app, built for automation and agent integration (Codex, Claude, Open Claw).

## Current focus
- Audit and plan pages.
- Import backlink opportunities from CSV and track execution state.
- Programmatic SEO generation + validation pipelines.
- Multi-agent manifests from a single command contract.
- Vercel-friendly deployment outputs.

## Quick start

```bash
npm install
npm run build
node dist/cli/index.js --help
```

Development mode:

```bash
npm run dev -- audit --url https://example.com
```

## CLI command map
- `seo audit`
- `seo build`
- `seo edit`
- `seo plan`
- `seo publish`
- `seo health`
- `seo backlink import|list|pick`
- `seo programmatic import|generate|validate|publish|status`

## Docs
See `docs/INDEX.md` for the doc map.

## Environment
Set API keys and secrets through environment variables. Add none in code.


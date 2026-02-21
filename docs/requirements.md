# Requirements

## Functional
- Parse CSV and JSON input.
- Support `audit`, `build`, `edit`, `publish`, `health`.
- Support `backlink` command set with import/list/pick.
- Support programmatic import/generate/validate/publish/status.
- Generate agent manifests for Codex, Claude, Open Claw.

## Non-functional
- Commands must return stable JSON.
- No manual secrets in file payloads.
- Keep modules small and single-purpose.

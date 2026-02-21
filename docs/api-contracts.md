# API Contracts

## audit
`seo audit --url <url> [--format json|md|text]`

## backlink
- `seo backlink import --source <path>`
- `seo backlink list --status <state> --paid <free|paid|all> --category <value>`
- `seo backlink pick --website <value> --type <value> --set-status <not-started|in-progress|done|blocked>`

## programmatic
- `seo programmatic import --source <path>`
- `seo programmatic generate --source <path> --template <path> --out <dir> [--dry-run]`
- `seo programmatic validate --source <path>`
- `seo programmatic publish --project <name> --scope <preview|production>`
- `seo programmatic status --run-id <id>`

# SEO Tentacles - Claude Manifest

## seo audit
Run a technical SEO audit for a URL.

Args:
- --url (required): Target URL to analyze

Examples:
- `seo audit --url https://example.com`

## seo build
Copy source content to a target directory with build metadata.

Args:
- --source (required): Source directory to copy from.
- --target (required): Destination directory.
- --env (optional): Build environment, e.g. staging or prod.

Examples:
- `seo build --source src/site --target dist/site --env staging`

## seo edit
Create a review artifact from a target and a plan file.

Args:
- --target (required): Target file path.
- --plan (required): Plan file path.

Examples:
- `seo edit --target pages/service.md --plan /tmp/plan.json`

## seo plan
Generate a simple technical SEO plan for a URL or topic.

Args:
- --input (optional): Optional URL/topic string.

Examples:
- `seo plan --input https://example.com`

## seo publish
Run a project publish flow.

Args:
- --project (required): Project name.
- --platform (optional): Target environment, for example preview or production.

Examples:
- `seo publish --project seo-site --platform preview`

## seo health
Check repo-level SEO project health.

Args:
- --project (optional): Optional project name.

Examples:
- `seo health --project seo-site`

## seo backlink import
Import backlink opportunities from CSV or JSON.

Args:
- --source (required): Path to source file.

Examples:
- `seo backlink import --source data/seed/backlinks/100-backlinks.csv`

## seo backlink list
List backlink opportunities with optional filters.

Args:
- --status (optional): Filter by status: not-started|in-progress|done|blocked.
- --paid (optional): Filter by payment model: free|paid|all.
- --category (optional): Filter by category label.

Examples:
- `seo backlink list --status not-started --paid free`

## seo backlink pick
Update backlink status by website/type match.

Args:
- --website (required): Website domain to match.
- --type (required): Backlink type to match.
- --set-status (required): Target status value.

Examples:
- `seo backlink pick --website example.com --type guest-post --set-status in-progress`

## seo programmatic generate
Generate programmatic landing pages from source data and template.

Args:
- --source (required): Source file path.
- --template (required): Template path.
- --out (required): Output folder.
- --dry-run (optional): Run without writing output files.

Examples:
- `seo programmatic generate --source data/programmatic/entities.csv --template templates/programmatic/page-template.hbs --out .seo/output`

## seo programmatic import
Import entities for programmatic runs from CSV source.

Args:
- --source (required): CSV or JSON source path.

Examples:
- `seo programmatic import --source data/programmatic/entities.csv`

## seo programmatic validate
Validate programmatic output specs.

Args:
- --source (required): JSON file containing page specs.

Examples:
- `seo programmatic validate --source .seo/programmatic-run.json`

## seo programmatic publish
Deploy programmatic pages to preview or production.

Args:
- --project (required): Project name.
- --scope (optional): Deployment scope: preview|production.

Examples:
- `seo programmatic publish --project seo-site --scope preview`

## seo programmatic status
Inspect latest or specific programmatic run status.

Args:
- --run-id (optional): Optional run identifier from prior generate.

Examples:
- `seo programmatic status`
- `seo programmatic status --run-id run_abc123`

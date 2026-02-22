# Programmatic SEO Workflow

1. Import data.
2. Generate pages with template.
3. Validate output.
   - generate command creates a `ProgrammaticRun` entry with status `running` then updates to `passed`/`failed`.
4. Publish and monitor.
   - `seo programmatic status --run-id <id>` inspects persisted run state.
   - `seo programmatic status` with no `--run-id` returns latest run.

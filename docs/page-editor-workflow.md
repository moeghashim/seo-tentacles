# Page Editor Workflow

Use `seo edit --target <path> --plan <file>` and keep generated diffs in review.

Current CLI behavior:
- Validates both inputs.
- Creates a review artifact under `.seo/edits/<request_id>.json` with metadata for traceability.
- Marks `target_exists` in the artifact to indicate whether the target file was present at edit time.

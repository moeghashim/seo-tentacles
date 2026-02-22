# Page Build Pipeline

1. Input source ingest.
2. Parse + normalize.
3. Render templates.
4. Validate quality.
5. Output artifacts and manifest.

Current CLI behavior:
- `seo build --source <dir> --target <dir>` copies the source directory to target.
- Command output includes a copy manifest with `run_id`, source/target paths, file list, and completion timestamp.

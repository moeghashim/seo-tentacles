const fs = require('fs');
const path = require('path');

const required = [
  'docs/INDEX.md',
  'docs/api-contracts.md',
  'docs/product-prd.md',
  'docs/vision-and-scope.md',
  'docs/requirements.md',
  'docs/user-flows.md',
  'docs/data-model.md',
  'docs/architecture.md',
  'docs/page-build-pipeline.md',
  'docs/page-editor-workflow.md',
  'docs/content-pipeline.md',
  'docs/seo-audit-workflow.md',
  'docs/technical-seo-spec.md',
  'docs/on-page-checklist.md',
  'docs/vercel-deployment.md',
  'docs/operations-runbook.md',
  'docs/faq.md',
  'docs/changelog.md',
  'docs/references/backlink-opportunities-24h.md',
  'docs/templates/keyword-brief-template.md',
  'docs/templates/seo-audit-template.md',
  'docs/templates/page-edit-checklist.md',
];

const missing = required.filter((file) => !fs.existsSync(path.resolve(process.cwd(), file)));

if (missing.length) {
  console.error('Missing docs:', missing.join('\n'));
  process.exitCode = 1;
} else {
  console.log('Docs check passed');
}

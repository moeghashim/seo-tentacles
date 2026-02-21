export type CommandArgument = {
  name: string;
  required: boolean;
  description: string;
};

export type CommandSpec = {
  name: string;
  description: string;
  args: CommandArgument[];
  examples: string[];
};

export const COMMAND_CONTRACT: CommandSpec[] = [
  {
    name: 'seo audit',
    description: 'Run a technical SEO audit for a URL.',
    args: [{ name: '--url', required: true, description: 'Target URL to analyze' }],
    examples: ['seo audit --url https://example.com'],
  },
  {
    name: 'seo backlink import',
    description: 'Import backlink opportunities from CSV or JSON.',
    args: [{ name: '--source', required: true, description: 'Path to source file.' }],
    examples: ['seo backlink import --source data/seed/backlinks/100-backlinks.csv'],
  },
  {
    name: 'seo programmatic generate',
    description: 'Generate programmatic landing pages from source data and template.',
    args: [
      { name: '--source', required: true, description: 'Source file path.' },
      { name: '--template', required: true, description: 'Template path.' },
      { name: '--out', required: true, description: 'Output folder.' },
    ],
    examples: ['seo programmatic generate --source data/programmatic/entities.csv --template templates/programmatic/page-template.hbs --out .seo/output'],
  },
];

import type { SeoAuditInput, SeoAuditResult } from './domain';

export async function runAudit(input: SeoAuditInput): Promise<SeoAuditResult> {
  const score = 80;
  const findings = [
    'Title and meta description checks are not implemented yet.',
    'Structured data checks are pending.',
  ];

  return {
    url: input.url,
    score,
    findings,
  };
}

export async function runPlan(url: string): Promise<{ url: string; steps: string[] }> {
  return {
    url,
    steps: [
      'Collect baseline index and crawl state.',
      'Evaluate on-page opportunities.',
      'Prepare edit plan and publishing checklist.',
    ],
  };
}

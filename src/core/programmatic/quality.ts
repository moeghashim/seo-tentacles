import type { ProgrammaticPageSpec } from './schema';
import type { SEOQualityIssue } from './schema';

export async function validatePages(pages: ProgrammaticPageSpec[]): Promise<SEOQualityIssue[]> {
  const issues: SEOQualityIssue[] = [];
  const seenTitle = new Map<string, number>();

  pages.forEach((page, index) => {
    if (!page.title) {
      issues.push({
        code: 'missing_title',
        severity: 'critical',
        message: `Page missing title ${page.slug}`,
        row_ref: String(index + 1),
      });
    }

    const key = page.title.toLowerCase();
    const count = seenTitle.get(key) ?? 0;
    seenTitle.set(key, count + 1);
    if (count >= 1) {
      issues.push({
        code: 'duplicate_title',
        severity: 'medium',
        message: `Duplicate title detected: ${page.title}`,
        row_ref: String(index + 1),
      });
    }

    if (!page.canonical || !page.canonical.startsWith('/')) {
      issues.push({
        code: 'invalid_canonical',
        severity: 'high',
        message: `Invalid canonical for ${page.slug}`,
        row_ref: String(index + 1),
      });
    }
  });

  return issues;
}

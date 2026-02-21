import fs from 'node:fs/promises';
import path from 'node:path';
import { validatePages } from '../../../core/programmatic/quality';
import type { ProgrammaticPageSpec } from '../../../core/programmatic/schema';
import { createResponse, emit, writeOutput } from '../../output';

export async function run(args: { source?: string; format?: string }) {
  if (!args.source) {
    writeOutput(emit(createResponse('seo programmatic validate', 'error', {}, [{ code: 'missing_source', message: 'source required' }]), args.format as any));
    return;
  }
  const raw = await fs.readFile(path.resolve(process.cwd(), args.source), 'utf8');
  const pages = JSON.parse(raw) as ProgrammaticPageSpec[];
  const issues = await validatePages(pages);
  const status = issues.some((issue) => issue.severity === 'critical' || issue.severity === 'high') ? 'warning' : 'ok';
  writeOutput(emit(createResponse('seo programmatic validate', status, { issues, total: issues.length } ), args.format as any));
}

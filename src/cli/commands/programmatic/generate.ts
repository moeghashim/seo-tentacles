import fs from 'node:fs/promises';
import path from 'node:path';
import { importEntitiesFromCsv } from '../../../core/programmatic/importer';
import { buildPages } from '../../../core/programmatic/page-builder';
import { validatePages } from '../../../core/programmatic/quality';
import { saveRun } from '../../../core/programmatic/storage';
import type { ProgrammaticRun } from '../../../core/programmatic/schema';
import { createResponse, emit, writeOutput } from '../../output';

export async function run(args: { source?: string; template?: string; out?: string; format?: string; dryRun?: boolean }) {
  if (!args.source || !args.template || !args.out) {
    writeOutput(
      emit(
        createResponse('seo programmatic generate', 'error', {}, [{ code: 'missing_args', message: 'source, template, and out are required' }]),
        args.format as any
      )
    );
    return;
  }

  const entities = await importEntitiesFromCsv(args.source);
  const template = await fs.readFile(path.resolve(process.cwd(), args.template), 'utf8');
  const runId = `run_${Date.now().toString(36)}`;
  const initial: ProgrammaticRun = {
    run_id: runId,
    template_name: args.template,
    source_reference: args.source,
    status: 'running',
    items_processed: 0,
    created_at: new Date().toISOString(),
    artifacts: [],
  };
  await saveRun(initial);

  const pages = await buildPages(entities, template, args.out, { dryRun: !!args.dryRun });
  const issues = await validatePages(pages);
  const criticalIssues = issues.filter((issue) => issue.severity === 'critical' || issue.severity === 'high');
  const finalStatus = criticalIssues.length ? 'failed' : 'passed';
  const finalRun: ProgrammaticRun = {
    ...initial,
    status: finalStatus,
    items_processed: pages.length,
    artifacts: [
      path.resolve(process.cwd(), args.out),
      `template:${args.template}`,
      `issues:${criticalIssues.length}`,
      `dryRun:${String(!!args.dryRun)}`,
      ...pages.map((page) => page.slug),
    ],
  };
  await saveRun(finalRun);

  const message = args.dryRun ? 'dry run complete' : 'pages generated';
  const status = finalStatus === 'failed' ? 'warning' : args.dryRun ? 'ok' : 'ok';
  writeOutput(
      emit(
        createResponse(
          'seo programmatic generate',
          status,
          {
          message,
          run_id: finalRun.run_id,
          count: pages.length,
          issues: criticalIssues.length,
          pages: args.dryRun ? [] : pages,
          },
          [],
          criticalIssues.length ? [{ code: 'quality_blockers', message: 'Quality validation found critical/high issues.' }] : [],
          ['Run `seo programmatic validate --source <path-to-pages-json>` for full findings', 'Run `seo programmatic status --run-id <run_id>` for status']
        ),
        args.format as any
      )
  );
}

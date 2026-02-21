import fs from 'node:fs/promises';
import path from 'node:path';
import { importEntitiesFromCsv } from '../../../core/programmatic/importer';
import { buildPages } from '../../../core/programmatic/page-builder';
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
  const pages = await buildPages(entities, template, args.out);

  const message = args.dryRun ? 'dry run complete' : 'pages generated';
  writeOutput(emit(createResponse('seo programmatic generate', 'ok', { message, count: pages.length, pages: args.dryRun ? [] : pages } ), args.format as any));
}

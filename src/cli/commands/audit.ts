import { runAudit } from '../../core/seo/engine';
import { createResponse, emit, writeOutput } from '../output';

export async function run(args: { url?: string; format?: string }) {
  if (!args.url) {
    const response = createResponse(
      'seo audit',
      'error',
      { message: 'Missing --url' },
      [{ code: 'missing_url', message: 'You must pass --url' }]
    );
    writeOutput(emit(response, args.format as any));
    return;
  }

  const result = await runAudit({ url: String(args.url) });
  writeOutput(emit(createResponse('seo audit', 'ok', result), args.format as any));
}

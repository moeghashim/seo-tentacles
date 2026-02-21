import { createResponse, emit, writeOutput } from '../../output';

export async function run(args: { runId?: string; format?: string }) {
  writeOutput(emit(createResponse('seo programmatic status', 'ok', { runId: args.runId || null, status: 'not implemented' }), args.format as any));
}

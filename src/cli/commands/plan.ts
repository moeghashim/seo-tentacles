import { runPlan } from '../../core/seo/engine';
import { createResponse, emit, writeOutput } from '../output';

export async function run(args: { input?: string; format?: string }) {
  const url = args.input || '';
  const result = await runPlan(url);
  writeOutput(emit(createResponse('seo plan', url ? 'ok' : 'warning', result), args.format as any));
}

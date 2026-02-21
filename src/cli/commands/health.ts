import { healthCheck } from '../../core/seo/ops';
import { createResponse, emit, writeOutput } from '../output';

export async function run(args: { project?: string; format?: string }) {
  const result = await healthCheck(args.project);
  writeOutput(emit(createResponse('seo health', 'ok', result), args.format as any));
}

import { createResponse, emit, writeOutput } from '../output';

export async function run(args: { source?: string; target?: string; env?: string; format?: string }) {
  const artifacts = {
    source: args.source || '',
    target: args.target || '',
    env: args.env || 'staging',
    message: 'build pipeline stub complete',
  };
  writeOutput(emit(createResponse('seo build', args.source ? 'ok' : 'warning', artifacts), args.format as any));
}

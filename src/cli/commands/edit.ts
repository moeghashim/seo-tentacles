import { createResponse, emit, writeOutput } from '../output';

export async function run(args: { target?: string; plan?: string; format?: string }) {
  const artifacts = {
    target: args.target || '',
    plan: args.plan || '',
    message: 'edit workflow stub created',
  };
  writeOutput(emit(createResponse('seo edit', args.target ? 'ok' : 'warning', artifacts), args.format as any));
}

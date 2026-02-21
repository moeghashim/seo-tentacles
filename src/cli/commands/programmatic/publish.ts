import { deployProgrammatic } from '../../../core/programmatic/vercel-deploy';
import { createResponse, emit, writeOutput } from '../../output';

export async function run(args: { project?: string; scope?: string; format?: string }) {
  if (!args.project) {
    writeOutput(emit(createResponse('seo programmatic publish', 'error', {}, [{ code: 'missing_project', message: 'project required' }]), args.format as any));
    return;
  }

  const deployment = await deployProgrammatic(args.project, (args.scope as any) || 'preview');
  writeOutput(emit(createResponse('seo programmatic publish', 'ok', deployment), args.format as any));
}

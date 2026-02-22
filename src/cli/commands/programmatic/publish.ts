import { deployProgrammatic } from '../../../core/programmatic/vercel-deploy';
import { loadRuns, saveRun } from '../../../core/programmatic/storage';
import type { ProgrammaticRun } from '../../../core/programmatic/schema';
import { createResponse, emit, writeOutput } from '../../output';

export async function run(args: { project?: string; scope?: string; format?: string }) {
  if (!args.project) {
    writeOutput(emit(createResponse('seo programmatic publish', 'error', {}, [{ code: 'missing_project', message: 'project required' }]), args.format as any));
    return;
  }

  const deployment = await deployProgrammatic(args.project, (args.scope as any) || 'preview');
  const runs = await loadRuns();
  const latest = [...runs].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
  const artifacts = [deployment.url, `project:${args.project}`, `scope:${(args.scope as string) || 'preview'}`];

  if (latest) {
    const updated: ProgrammaticRun = {
      ...latest,
      status: 'published',
      artifacts: [...new Set([...latest.artifacts, ...artifacts])],
    };
    await saveRun(updated);
  }

  writeOutput(
    emit(
      createResponse('seo programmatic publish', 'ok', {
        ...deployment,
        run_id: latest?.run_id ?? null,
      }),
      args.format as any
    )
  );
}

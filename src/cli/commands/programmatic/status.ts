import { createResponse, emit, writeOutput } from '../../output';
import { getRun, loadRuns } from '../../../core/programmatic/storage';

export async function run(args: { runId?: string; format?: string }) {
  const runId = args.runId;

  if (runId) {
    const run = await getRun(runId);
    if (!run) {
      writeOutput(
        emit(
          createResponse(
            'seo programmatic status',
            'warning',
            { run_id: runId },
            [{ code: 'run_not_found', message: `No run found for ${runId}` }]
          ),
          args.format as any
        )
      );
      return;
    }

    writeOutput(emit(createResponse('seo programmatic status', run.status === 'failed' ? 'warning' : 'ok', run), args.format as any));
    return;
  }

  const runs = await loadRuns();
  if (!runs.length) {
    writeOutput(
      emit(
        createResponse(
          'seo programmatic status',
          'warning',
          { run_id: null },
          [{ code: 'no_runs', message: 'No programmatic runs found.' }]
        ),
        args.format as any
      )
    );
    return;
  }

  const sorted = [...runs].sort((a, b) => (new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
  const latest = sorted[0];

  writeOutput(
    emit(
      createResponse('seo programmatic status', latest.status === 'failed' ? 'warning' : 'ok', {
        query: 'latest',
        run: latest,
        total_runs: runs.length,
        run_ids: sorted.map((run) => run.run_id),
      }),
      args.format as any
    )
  );
}

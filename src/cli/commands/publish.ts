import { createResponse, emit, writeOutput } from '../output';
import { deployToVercel } from '../../core/seo/infra/vercel';

export async function run(args: { project?: string; platform?: string; format?: string }) {
  if (!args.project) {
    writeOutput(
      emit(
        createResponse('seo publish', 'error', {}, [{ code: 'missing_project', message: 'Use --project <name> to publish.' }],
        [],
        ['Provide platform via --platform <preview|production>. Defaults to preview.']
      )
      , args.format as any
    );
    return;
  }

  const scope = args.platform === 'production' ? 'production' : 'preview';
  const result = await deployToVercel({ project: args.project, scope });
  writeOutput(emit(createResponse('seo publish', 'ok', result), args.format as any));
}

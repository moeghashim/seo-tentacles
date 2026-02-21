import { createResponse, emit, writeOutput } from '../../output';
import { importEntitiesFromCsv } from '../../../core/programmatic/importer';

export async function run(args: { source?: string; format?: string }) {
  if (!args.source) {
    writeOutput(
      emit(
        createResponse('seo programmatic import', 'error', {}, [{ code: 'missing_source', message: 'Set --source' }]),
        args.format as any
      )
    );
    return;
  }

  const entities = await importEntitiesFromCsv(args.source);
  writeOutput(emit(createResponse('seo programmatic import', 'ok', { total: entities.length, entities }), args.format as any));
}

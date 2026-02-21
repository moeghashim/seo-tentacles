import { createResponse, emit, writeOutput } from '../output';
import { importBacklinksFromFile, listBacklinks, pickBacklink } from '../../core/backlinks/service';

export async function run(args: { subcommand?: string; source?: string; status?: string; paid?: string; category?: string; website?: string; type?: string; setStatus?: string; format?: string }) {
  const sub = args.subcommand || '';

  if (sub === 'import') {
    if (!args.source) {
      writeOutput(emit(createResponse('seo backlink import', 'error', {}, [{ code: 'missing_source', message: 'Use --source <path>' }], []), args.format as any));
      return;
    }

    const result = await importBacklinksFromFile(args.source);
    const warnings = result.warnings.map((value) => ({ code: 'import_warning', message: value }));
    const errors = result.errors.map((value) => ({ code: 'import_error', message: value }));
    writeOutput(emit(createResponse('seo backlink import', errors.length ? 'warning' : 'ok', result, errors, warnings), args.format as any));
    return;
  }

  if (sub === 'list') {
    const items = await listBacklinks({
      status: args.status,
      paid: args.paid,
      category: args.category,
    });
    writeOutput(emit(createResponse('seo backlink list', 'ok', { items }), args.format as any));
    return;
  }

  if (sub === 'pick') {
    if (!args.website || !args.type || !args.setStatus) {
      writeOutput(
        emit(
          createResponse(
            'seo backlink pick',
            'error',
            {},
            [{ code: 'missing_arguments', message: 'Require --website, --type, and --set-status.' }]
          ),
          args.format as any
        )
      );
      return;
    }

    const updated = await pickBacklink(args.website, args.type, args.setStatus as any);
    if (!updated) {
      writeOutput(emit(createResponse('seo backlink pick', 'warning', { found: false }, [{ code: 'not_found', message: 'No matching entry found' }]), args.format as any));
      return;
    }

    writeOutput(emit(createResponse('seo backlink pick', 'ok', { item: updated })), args.format as any);
    return;
  }

  writeOutput(
    emit(
      createResponse(
        'seo backlink',
        'warning',
        { subcommand: sub || null, message: 'subcommands: import|list|pick' },
        [{ code: 'invalid_subcommand', message: 'supported: import list pick' }]
      ),
      args.format as any
    )
  );
}

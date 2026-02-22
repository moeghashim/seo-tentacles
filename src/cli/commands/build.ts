import { createResponse, emit, writeOutput } from '../output';
import fs from 'node:fs/promises';
import path from 'node:path';

type CopyManifest = {
  run_id: string;
  source: string;
  target: string;
  env: string;
  files: Array<{ source: string; target: string; bytes: number }>;
  completed_at: string;
};

async function copyWithManifest(sourceRoot: string, targetRoot: string) {
  const files: Array<{ source: string; target: string; bytes: number }> = [];
  await fs.mkdir(targetRoot, { recursive: true });

  async function walk(currentSource: string, currentTarget: string) {
    const entries = await fs.readdir(currentSource, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name === '.git' || entry.name === 'node_modules' || entry.name.startsWith('.')) {
        continue;
      }

      const src = path.join(currentSource, entry.name);
      const dst = path.join(currentTarget, entry.name);

      if (entry.isDirectory()) {
        await fs.mkdir(dst, { recursive: true });
        await walk(src, dst);
        continue;
      }

      const stat = await fs.stat(src);
      await fs.mkdir(path.dirname(dst), { recursive: true });
      await fs.copyFile(src, dst);
      files.push({
        source: path.relative(process.cwd(), src),
        target: path.relative(process.cwd(), dst),
        bytes: stat.size,
      });
    }
  }

  await walk(sourceRoot, targetRoot);
  return files;
}

export async function run(args: { source?: string; target?: string; env?: string; format?: string }) {
  if (!args.source || !args.target) {
    writeOutput(
      emit(
        createResponse(
          'seo build',
          'error',
          {},
          [{ code: 'missing_args', message: 'Use --source and --target to run build.' }]
        ),
        args.format as any
      )
    );
    return;
  }

  const sourcePath = path.resolve(process.cwd(), args.source);
  const targetPath = path.resolve(process.cwd(), args.target);
  const env = args.env || 'staging';
  const runId = `run_${Date.now().toString(36)}`;

  try {
    const sourceStat = await fs.stat(sourcePath);
    if (!sourceStat.isDirectory()) {
      writeOutput(
        emit(
          createResponse(
            'seo build',
            'error',
            {},
            [{ code: 'invalid_source', message: 'Source must be a directory path.' }]
          ),
          args.format as any
        )
      );
      return;
    }
  } catch (error) {
    writeOutput(
      emit(
        createResponse(
          'seo build',
          'error',
          {},
          [{ code: 'source_not_found', message: `Source not found: ${args.source}` }]
        ),
        args.format as any
      )
    );
    return;
  }

  const files = await copyWithManifest(sourcePath, targetPath);
  const artifacts: CopyManifest = {
    run_id: runId,
    source: args.source,
    target: args.target,
    env,
    files,
    completed_at: new Date().toISOString(),
  };
  const status = files.length ? 'ok' : 'warning';
  const warning = files.length ? [] : [{ code: 'no_files', message: 'Source directory was empty.' }];
  writeOutput(emit(createResponse('seo build', status, artifacts, [], warning), args.format as any));
}

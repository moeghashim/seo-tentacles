import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { createResponse, emit, writeOutput } from '../output';

type EditArtifact = {
  request_id: string;
  target: string;
  plan_file: string;
  plan_lines: number;
  target_exists: boolean;
  review_file: string;
  created_at: string;
};

export async function run(args: { target?: string; plan?: string; format?: string }) {
  if (!args.target || !args.plan) {
    writeOutput(
      emit(
        createResponse(
          'seo edit',
          'error',
          {},
          [{ code: 'missing_args', message: 'Use --target and --plan to run edit.' }]
        ),
        args.format as any
      )
    );
    return;
  }

  const planPath = path.resolve(process.cwd(), args.plan);
  const targetPath = path.resolve(process.cwd(), args.target);
  let planText = '';

  try {
    planText = await fs.readFile(planPath, 'utf8');
  } catch (error) {
    writeOutput(
      emit(
        createResponse(
          'seo edit',
          'error',
          {},
          [{ code: 'plan_not_found', message: `Unable to read plan file: ${args.plan}` }]
        ),
        args.format as any
      )
    );
    return;
  }

  let targetExists = true;
  try {
    await fs.stat(targetPath);
  } catch (error) {
    targetExists = false;
  }

  const reviewDir = path.resolve(process.cwd(), '.seo', 'edits');
  await fs.mkdir(reviewDir, { recursive: true });

  const reviewHash = crypto.createHash('sha1').update(`${args.target}:${args.plan}:${Date.now()}`).digest('hex');
  const reviewFile = path.join(reviewDir, `${reviewHash}.json`);
  const artifact: EditArtifact = {
    request_id: reviewHash,
    target: args.target,
    plan_file: args.plan,
    plan_lines: planText.split('\n').length,
    target_exists: targetExists,
    review_file: path.relative(process.cwd(), reviewFile),
    created_at: new Date().toISOString(),
  };

  await fs.writeFile(reviewFile, JSON.stringify(artifact, null, 2), 'utf8');
  const status = targetExists ? 'ok' : 'warning';
  const warnings = targetExists
    ? []
    : [{ code: 'missing_target', message: `Target file was not found; review file contains plan-only artifact: ${args.target}` }];

  writeOutput(emit(createResponse('seo edit', status, artifact, [], warnings), args.format as any));
}

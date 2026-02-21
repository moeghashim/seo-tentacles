import path from 'node:path';
import { readJsonIfExists, writeJson } from '../seo/infra/storage';
import type { ProgrammaticRun } from './schema';

const storePath = path.resolve(process.cwd(), '.seo', 'programmatic-runs.json');

const DEFAULT: ProgrammaticRun[] = [];

export async function loadRuns(): Promise<ProgrammaticRun[]> {
  return readJsonIfExists<ProgrammaticRun[]>(storePath, DEFAULT);
}

export async function saveRun(run: ProgrammaticRun): Promise<void> {
  const items = await loadRuns();
  const existingIndex = items.findIndex((item) => item.run_id === run.run_id);
  if (existingIndex === -1) {
    items.push(run);
  } else {
    items[existingIndex] = run;
  }
  await writeJson(storePath, items);
}

export async function getRun(runId: string): Promise<ProgrammaticRun | undefined> {
  const runs = await loadRuns();
  return runs.find((run) => run.run_id === runId);
}

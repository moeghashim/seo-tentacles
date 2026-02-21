import type { ProgrammaticEntity } from './schema';

export function clusterByIntent(items: ProgrammaticEntity[]): Record<string, ProgrammaticEntity[]> {
  const output: Record<string, ProgrammaticEntity[]> = {};
  for (const item of items) {
    const key = item.intent;
    if (!output[key]) {
      output[key] = [];
    }
    output[key].push(item);
  }
  return output;
}

export function clusterByLocation(items: ProgrammaticEntity[]): Record<string, ProgrammaticEntity[]> {
  const output: Record<string, ProgrammaticEntity[]> = {};
  for (const item of items) {
    const key = item.location?.toLowerCase().trim() || 'global';
    if (!output[key]) {
      output[key] = [];
    }
    output[key].push(item);
  }
  return output;
}

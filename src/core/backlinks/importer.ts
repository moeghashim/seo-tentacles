import fs from 'node:fs/promises';
import path from 'node:path';
import { parseCsv } from '../../utils/csv';
import { normalizeBacklinkRow } from './service';
import type { BacklinkOpportunity } from './types';

export async function parseBacklinksFromSource(source: string): Promise<BacklinkOpportunity[]> {
  const resolved = path.resolve(process.cwd(), source);
  const raw = await fs.readFile(resolved, 'utf8');
  const rows = parseCsv(raw);
  return rows.map((row, index) => normalizeBacklinkRow(row, index + 1));
}

export async function parseBacklinksJson(source: string): Promise<BacklinkOpportunity[]> {
  const resolved = path.resolve(process.cwd(), source);
  const raw = await fs.readFile(resolved, 'utf8');
  const data = JSON.parse(raw) as BacklinkOpportunity[];
  return data.map((item, index) => normalizeBacklinkRow(item as unknown as Record<string, string>, index + 1));
}

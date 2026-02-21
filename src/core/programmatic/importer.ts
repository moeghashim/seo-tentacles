import fs from 'node:fs/promises';
import path from 'node:path';
import { parseCsv } from '../../utils/csv';
import type { ProgrammaticEntity } from './schema';
import crypto from 'node:crypto';
import { slugify } from '../../utils/slug';

export async function importEntitiesFromCsv(source: string): Promise<ProgrammaticEntity[]> {
  const file = await fs.readFile(path.resolve(process.cwd(), source), 'utf8');
  const rows = parseCsv(file);
  return rows
    .filter((row) => row['topic'] || row['query'] || row['Topic'])
    .map((row, idx) => ({
      id: crypto.createHash('md5').update(`${row['topic'] || ''}-${row['query'] || ''}-${idx}`).digest('hex'),
      topic: String(row['topic'] || row['Topic'] || ''),
      query: String(row['query'] || row['Query'] || ''),
      intent: ((String(row['intent'] || row['Intent'] || 'informational').toLowerCase() as ProgrammaticEntity['intent']) || 'informational'),
      location: String(row['location'] || row['Location'] || ''),
      attributes: {
        source: String(row['source'] || row['Source'] || ''),
      },
      source_file: source,
      metadata: {
        sourceRow: String(idx + 1),
      },
    }));
}

export async function importEntitiesFromJson(source: string): Promise<ProgrammaticEntity[]> {
  const raw = await fs.readFile(path.resolve(process.cwd(), source), 'utf8');
  const parsed = JSON.parse(raw) as ProgrammaticEntity[];
  return parsed.map((row) => ({
    ...row,
    id: row.id || slugify(`${row.topic}-${row.query}`),
    source_file: row.source_file || source,
  }));
}

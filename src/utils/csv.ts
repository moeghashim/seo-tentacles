export type CsvRecord = Record<string, string>;

function splitCsvLine(line: string): string[] {
  const output: string[] = [];
  let token = '';
  let quoted = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"') {
      if (quoted && next === '"') {
        token += '"';
        i += 1;
      } else {
        quoted = !quoted;
      }
      continue;
    }

    if (char === ',' && !quoted) {
      output.push(token);
      token = '';
      continue;
    }

    token += char;
  }

  output.push(token);
  return output.map((value) => value.trim());
}

export function parseCsv(text: string): CsvRecord[] {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (!lines.length) return [];

  const headers = splitCsvLine(lines[0]).map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const values = splitCsvLine(line);
    const row: CsvRecord = {};
    headers.forEach((header, index) => {
      row[header] = values[index] ?? '';
    });
    return row;
  });
}

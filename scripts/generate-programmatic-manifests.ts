import { promises as fs } from 'node:fs';
import { clusterByIntent } from '../src/core/programmatic/cluster';
import { importEntitiesFromCsv } from '../src/core/programmatic/importer';

async function main() {
  const source = process.argv[2] || 'data/programmatic/examples/entities.csv';
  const entities = await importEntitiesFromCsv(source);
  const clusters = clusterByIntent(entities);
  const summary = Object.entries(clusters).map(([intent, items]) => ({ intent, count: items.length }));

  await fs.writeFile('examples/programmatic-manifest.json', JSON.stringify(summary, null, 2), 'utf8');
}

main();

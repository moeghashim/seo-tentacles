import { promises as fs } from 'node:fs';
import path from 'node:path';
import { codexManifest } from '../src/agents/codex-adapter';
import { claudeManifest } from '../src/agents/claude-adapter';
import { openClawManifest } from '../src/agents/openclaw-adapter';

async function main() {
  const out = path.resolve(process.cwd(), 'docs', 'agent-specs');
  await fs.mkdir(out, { recursive: true });
  await fs.writeFile(path.join(out, 'manifest.codex.json'), JSON.stringify(codexManifest(), null, 2), 'utf8');
  await fs.writeFile(path.join(out, 'manifest.claude.md'), claudeManifest(), 'utf8');
  await fs.writeFile(path.join(out, 'manifest.openclaw.json'), JSON.stringify(openClawManifest(), null, 2), 'utf8');
}

main();

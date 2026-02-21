import path from 'node:path';
import { readJsonIfExists, writeJson } from '../seo/infra/storage';
import type { BacklinkStore } from './types';

const DEFAULT_STORE: BacklinkStore = { updatedAt: new Date(0).toISOString(), items: [] };

export function getBacklinkStorePath(): string {
  return path.resolve(process.cwd(), '.seo', 'backlinks-store.json');
}

export async function loadBacklinkStore(): Promise<BacklinkStore> {
  return readJsonIfExists<BacklinkStore>(getBacklinkStorePath(), DEFAULT_STORE);
}

export async function saveBacklinkStore(store: BacklinkStore): Promise<void> {
  await writeJson(getBacklinkStorePath(), store);
}

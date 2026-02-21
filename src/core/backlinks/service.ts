import crypto from 'node:crypto';
import { loadBacklinkStore, saveBacklinkStore } from './storage';
import type { BacklinkOpportunity, BacklinkStatus, BacklinkImportResult } from './types';
import { parseBacklinksFromSource } from './importer';

export function normalizeMoneyLikeNumber(raw: string): number | null {
  if (!raw) return null;
  const value = Number(String(raw).replace(/,/g, ''));
  return Number.isFinite(value) ? value : null;
}

export function parseBacklinkPaymentModel(raw: string): 'free' | 'paid' | 'mixed' | 'unknown' {
  const value = String(raw || '').toLowerCase();
  if (!value) return 'unknown';
  const hasFree = value.includes('free');
  const hasPaid = value.includes('paid');
  if (hasFree && hasPaid) return 'mixed';
  if (hasFree) return 'free';
  if (hasPaid) return 'paid';
  return 'unknown';
}

export function normalizeBacklinkRow(row: Record<string, string>, index: number): BacklinkOpportunity {
  const website = String(row['Website'] || row['website'] || '').trim();
  const name = String(row['Name'] || row['name'] || website).trim();
  const id = crypto.createHash('sha1').update(`${website}-${name}-${index}`).digest('hex');

  return {
    id,
    website,
    name,
    dr: normalizeMoneyLikeNumber(String(row['DR'] || row['dr'] || '')),
    ahrefsTraffic: normalizeMoneyLikeNumber(String(row['Ahrefs Traffic'] || row['ahrefsTraffic'] || '')),
    type: String(row['Type'] || row['type'] || ''),
    category: String(row['Category'] || row['category'] || ''),
    nicheIndustry: String(row['Niche/Industry'] || row['nicheIndustry'] || ''),
    scopeLocalGlobal: String(row['Local/Global'] || row['scopeLocalGlobal'] || ''),
    linkType: String(row['Link Type'] || row['linkType'] || '').split(',').map((item) => item.trim()).filter(Boolean),
    paidFree: parseBacklinkPaymentModel(String(row['Paid/Free'] || row['paidFree'] || '')),
    instructions: String(row['Instructions'] || row['instructions'] || ''),
    verificationMode: String(row['Instant/Requires Confirmation'] || row['verificationMode'] || ''),
    owner: String(row['Owner'] || row['owner'] || ''),
    status: String((row['Status'] || row['status'] || 'not-started')).toLowerCase().replace(' ', '-') as BacklinkStatus,
    email: String(row['Email'] || row['email'] || ''),
    password: String(row['Password'] || row['password'] || ''),
    sourceFile: row['sourceFile'] ? String(row['sourceFile']) : '',
  };
}

export async function importBacklinksFromFile(source: string): Promise<BacklinkImportResult> {
  const rows = await parseBacklinksFromSource(source);
  const existing = await loadBacklinkStore();
  const errors: string[] = [];
  const warnings: string[] = [];
  let imported = 0;

  const dedupe = new Map(existing.items.map((item) => [item.id, item]));

  rows.forEach((row, idx) => {
    if (!row.website) {
      errors.push(`Row ${idx + 1} has no website`);
      return;
    }
    if (dedupe.has(row.id)) {
      warnings.push(`Duplicate skipped: ${row.website}`);
      return;
    }
    dedupe.set(row.id, { ...row, sourceFile: source });
    imported += 1;
  });

  const merged = Array.from(dedupe.values());
  await saveBacklinkStore({
    updatedAt: new Date().toISOString(),
    items: merged,
  });

  return {
    total: rows.length,
    imported,
    skipped: rows.length - imported,
    errors,
    warnings,
  };
}

export async function listBacklinks(filters: { status?: string; paid?: string; category?: string }) {
  const store = await loadBacklinkStore();
  return store.items.filter((item) => {
    const statusMatch = filters.status ? item.status === filters.status : true;
    const paidMatch = filters.paid
      ? filters.paid === 'all'
        ? true
        : item.paidFree === filters.paid
      : true;
    const categoryMatch = filters.category ? item.category === filters.category : true;
    return statusMatch && paidMatch && categoryMatch;
  });
}

export async function pickBacklink(website: string, type: string, setStatus: BacklinkStatus) {
  const store = await loadBacklinkStore();
  const idx = store.items.findIndex((item) => item.website === website && item.type === type);
  if (idx === -1) {
    return null;
  }
  store.items[idx].status = setStatus;
  store.updatedAt = new Date().toISOString();
  await saveBacklinkStore(store);
  return store.items[idx];
}

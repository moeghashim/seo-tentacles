export type BacklinkStatus = 'not-started' | 'in-progress' | 'done' | 'blocked';

export interface BacklinkOpportunity {
  id: string;
  website: string;
  name: string;
  dr: number | null;
  ahrefsTraffic: number | null;
  type: string;
  category: string;
  nicheIndustry: string;
  scopeLocalGlobal: string;
  linkType: string[];
  paidFree: 'free' | 'paid' | 'mixed' | 'unknown';
  instructions: string;
  verificationMode: string;
  owner: string;
  status: BacklinkStatus;
  email?: string;
  password?: string;
  sourceFile: string;
}

export interface BacklinkImportResult {
  total: number;
  imported: number;
  skipped: number;
  errors: string[];
  warnings: string[];
}

export interface BacklinkStore {
  updatedAt: string;
  items: BacklinkOpportunity[];
}

export interface SeoAuditInput {
  url: string;
}

export interface SeoAuditResult {
  url: string;
  score: number;
  findings: string[];
}

export interface BuildInput {
  source: string;
  target: string;
  env: 'staging' | 'prod';
}

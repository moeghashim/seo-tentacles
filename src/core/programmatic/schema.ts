export interface ProgrammaticEntity {
  id: string;
  topic: string;
  query: string;
  intent: 'informational' | 'transactional' | 'commercial';
  location?: string;
  attributes: Record<string, string | number | boolean>;
  source_file: string;
  metadata?: Record<string, string>;
}

export interface ProgrammaticPageSpec {
  slug: string;
  canonical: string;
  title: string;
  description: string;
  h1: string;
  body: string;
  schema_org?: Record<string, unknown>;
  internal_links: string[];
  breadcrumbs: string[];
}

export interface ProgrammaticRun {
  run_id: string;
  template_name: string;
  source_reference: string;
  status: 'running' | 'passed' | 'failed' | 'published' | 'rolled_back';
  items_processed: number;
  created_at: string;
  artifacts: string[];
}

export interface SEOQualityIssue {
  code: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  row_ref?: string;
  fix_hint?: string;
}

import type { SeoAuditInput, SeoAuditResult } from './domain';

type Severity = 'critical' | 'high' | 'medium' | 'low';

interface Finding {
  code: string;
  severity: Severity;
  message: string;
}

const USER_AGENT = 'seo-tentacles-cli';

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function addFinding(list: Finding[], severity: Severity, code: string, message: string) {
  list.push({ code, severity, message });
}

function parseTitle(html: string) {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match ? match[1].trim().replace(/\s+/g, ' ') : '';
}

function stripNoiseForText(html: string) {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<!--([\s\S]*?)-->/g, '');
}

function extractAttribute(tag: string, key: string) {
  const pattern = new RegExp(`${key}\\s*=\\s*(?:\"([^\"]*)\"|'([^']*)'|([^\\s>]+))`, 'i');
  const match = tag.match(pattern);
  return match ? (match[1] ?? match[2] ?? match[3] ?? '').trim() : '';
}

function collectMetaValues(html: string) {
  const tags = html.match(/<meta\b[^>]*>/gi) ?? [];
  const map: Record<string, string[]> = {};
  tags.forEach((tag) => {
    const name = extractAttribute(tag, 'name').toLowerCase();
    const property = extractAttribute(tag, 'property').toLowerCase();
    const httpEquiv = extractAttribute(tag, 'http-equiv').toLowerCase();
    const content = extractAttribute(tag, 'content');
    const keys = [name, property, httpEquiv].filter(Boolean);
    keys.forEach((key) => {
      const list = map[key] ?? [];
      list.push(content);
      map[key] = list;
    });
  });

  return map;
}

function parseMeta(html: string, selectors: string[]) {
  const meta = collectMetaValues(html);
  for (const selector of selectors) {
    const [, value] = selector.split('=');
    const key = value.toLowerCase();
    const entries = meta[key];
    if (entries?.length) {
      return entries[entries.length - 1].trim().replace(/\s+/g, ' ');
    }
  }
  return '';
}

function parseCanonical(html: string) {
  const linkTags = html.match(/<link\b[^>]*>/gi) ?? [];
  const canonicalTag = linkTags.find((tag) => {
    const rel = extractAttribute(tag, 'rel').toLowerCase();
    return rel.split(/\s+/).includes('canonical');
  });
  if (!canonicalTag) return '';
  return extractAttribute(canonicalTag, 'href');
}

function countMatches(html: string, pattern: RegExp) {
  const matches = html.match(pattern);
  return matches ? matches.length : 0;
}

function countAltMissingImages(html: string) {
  const raw = stripNoiseForText(html);
  const images = raw.match(/<img\b[^>]*>/gi) ?? [];
  let missingAlt = 0;
  images.forEach((image) => {
    if (!/\balt\s*=/.test(image)) {
      missingAlt += 1;
      return;
    }
    const value = extractAttribute(image, 'alt');
    if (!value.trim()) {
      missingAlt += 1;
    }
  });

  return { missingAlt, totalImages: images.length };
}

function collectLinks(html: string) {
  const raw = stripNoiseForText(html);
  const tagPattern = /<a\b[^>]*href\s*=\s*(?:\"[^\"]*\"|'[^']*'|[^\s>]+)/gi;
  const tags = raw.match(tagPattern) ?? [];
  let total = 0;
  let internal = 0;
  let noFollow = 0;

  tags.forEach((tag) => {
    const href = extractAttribute(tag, 'href');
    if (!href) return;
    total += 1;

    if (/\brel\s*=\s*(?:\"[^\"]*\"|'[^']*')/i.test(tag)) {
      const relValue = extractAttribute(tag, 'rel').toLowerCase();
      if (relValue.includes('nofollow')) {
        noFollow += 1;
      }
    }

    if (href.startsWith('/') || href.startsWith('#') || href.startsWith('./') || href.startsWith('../') || href.startsWith('?')) {
      internal += 1;
    }
  });

  return { total, internal, noFollow };
}

function collectSchemaBlocks(html: string) {
  const blocks = html.match(/<script\b[^>]*type=[\"']application\/ld\+json[\"'][^>]*>[\s\S]*?<\/script>/gi) ?? [];
  return blocks
    .map((block) => {
      const match = block.match(/<script\b[^>]*>([\s\S]*?)<\/script>/i);
      return match?.[1]?.trim() ?? '';
    })
    .filter(Boolean);
}

function parseScriptJson(block: string) {
  try {
    JSON.parse(block);
    return true;
  } catch {
    return false;
  }
}

function parseHeadingSequence(html: string) {
  const body = html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)?.[1] ?? html;
  const headings = body.match(/<h([1-6])\b[^>]*>/gi) ?? [];
  return headings
    .map((heading) => Number.parseInt(heading[2], 10))
    .filter((value) => Number.isFinite(value));
}

function scoreDelta(severity: Severity) {
  switch (severity) {
    case 'critical':
      return 35;
    case 'high':
      return 20;
    case 'medium':
      return 12;
    case 'low':
      return 6;
    default:
      return 0;
  }
}

function toFormattedFindings(findings: Finding[]) {
  return findings.map((item) => `[${item.severity}] ${item.message}`);
}

function buildPlanFromFindings(url: string, findings: Finding[]): string[] {
  const bySeverity = {
    critical: findings.filter((finding) => finding.severity === 'critical').length,
    high: findings.filter((finding) => finding.severity === 'high').length,
    medium: findings.filter((finding) => finding.severity === 'medium').length,
    low: findings.filter((finding) => finding.severity === 'low').length,
  };

  const steps = [
    `Confirm crawlability and canonical for ${url}.`,
    'Fix title, meta description, and H1 completeness before publish.',
    'Add JSON-LD and internal links for discoverability.',
  ];

  if (bySeverity.critical) {
    steps.unshift('Address critical findings first, then rerun audit.');
  }
  if (findings.some((finding) => finding.code === 'missing_schema')) {
    steps.push('Validate structured data with schema schema or CMS schema validator.');
  }
  if (findings.some((finding) => finding.code === 'low_internal_links')) {
    steps.push('Add at least 2 contextual internal links targeting related pages.');
  }
  if (bySeverity.medium > 2 || bySeverity.high > 0) {
    steps.push('Review medium/high-priority technical SEO recommendations before deployment.');
  }

  return steps;
}

export async function runAudit(input: SeoAuditInput): Promise<SeoAuditResult> {
  const findings: Finding[] = [];
  let score = 100;

  if (!input.url) {
    addFinding(findings, 'critical', 'missing_url', 'No URL provided for audit.');
    return {
      url: '',
      score: 0,
      findings: toFormattedFindings(findings),
    };
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(input.url);
  } catch (error) {
    addFinding(findings, 'critical', 'invalid_url', 'Invalid URL format.');
    return {
      url: input.url,
      score: 0,
      findings: toFormattedFindings(findings),
    };
  }

  const target = parsedUrl.toString();
  let html = '';
  let responseStatus: number | null = null;

  try {
    const response = await fetch(target, {
      redirect: 'follow',
      headers: { 'user-agent': USER_AGENT },
    });

    responseStatus = response.status;
    html = await response.text();

    if (!response.ok) {
      addFinding(findings, 'high', 'http_error', `HTTP request failed with status ${response.status}.`);
      score -= scoreDelta('high');
    }
  } catch (error) {
    addFinding(findings, 'high', 'fetch_failed', 'Failed to fetch page content.');
    score -= scoreDelta('high');
    return {
      url: input.url,
      score: clamp(score, 0, 100),
      findings: toFormattedFindings(findings),
    };
  }

  if (!html) {
    addFinding(findings, 'critical', 'empty_html', 'Page body returned empty.');
    score -= scoreDelta('critical');
    return {
      url: input.url,
      score: clamp(score, 0, 100),
      findings: toFormattedFindings(findings),
    };
  }

  const metaMap = collectMetaValues(html);
  const title = parseTitle(html);
  const description = parseMeta(html, ['name=description', 'property=og:description']);
  const canonical = parseCanonical(html);
  const h1Count = countMatches(html, /<h1\b[^>]*>/gi);
  const links = collectLinks(html);
  const schemaBlocks = collectSchemaBlocks(html);
  const headingSequence = parseHeadingSequence(html);
  const altProfile = countAltMissingImages(html);
  const viewport = metaMap.viewport && metaMap.viewport.length ? metaMap.viewport[metaMap.viewport.length - 1] : '';
  const robots = metaMap.robots && metaMap.robots.length ? metaMap.robots[metaMap.robots.length - 1] : '';
  const themeColor = metaMap['theme-color'] && metaMap['theme-color'].length ? metaMap['theme-color'][metaMap['theme-color'].length - 1] : '';
  const langTag = html.match(/<html\b[^>]*lang=[\"']([^\"']+)[\"'][^>]*>/i)?.[1] ?? '';

  if (!title) {
    addFinding(findings, 'critical', 'missing_title', 'Missing <title> tag.');
    score -= scoreDelta('critical');
  } else {
    if (title.length < 20) {
      addFinding(findings, 'medium', 'short_title', `Title is very short (${title.length} chars).`);
      score -= scoreDelta('medium');
    }
    if (title.length > 60) {
      addFinding(findings, 'medium', 'long_title', `Title exceeds recommended length (${title.length} chars).`);
      score -= scoreDelta('medium');
    }
  }

  if (!description) {
    addFinding(findings, 'high', 'missing_description', 'Missing meta description.');
    score -= scoreDelta('high');
  } else if (description.length > 160) {
    addFinding(findings, 'low', 'long_description', `Meta description is long (${description.length} chars).`);
    score -= scoreDelta('low');
  } else if (description.length < 80) {
    addFinding(findings, 'low', 'short_description', `Meta description is short (${description.length} chars).`);
    score -= scoreDelta('low');
  }

  if (!canonical) {
    addFinding(findings, 'medium', 'missing_canonical', 'No canonical URL declared.');
    score -= scoreDelta('medium');
  } else {
    if (!canonical.startsWith('http')) {
      addFinding(findings, 'low', 'relative_canonical', 'Canonical URL is relative; prefer absolute canonical URLs.');
      score -= scoreDelta('low');
    }
    try {
      const canonicalUrl = canonical.startsWith('http') ? new URL(canonical) : new URL(canonical, parsedUrl);
      if (canonicalUrl.hostname !== parsedUrl.hostname) {
        addFinding(findings, 'medium', 'cross_domain_canonical', 'Canonical domain does not match target host.');
        score -= scoreDelta('medium');
      }
      if (!canonicalUrl.pathname.endsWith('/')) {
        addFinding(findings, 'low', 'canonical_path_format', 'Canonical path should usually end with a slash.');
        score -= scoreDelta('low');
      }
      if (canonical.includes('?') || canonical.includes('#')) {
        addFinding(findings, 'low', 'canonical_query_fragment', 'Canonical contains query/fragment; prefer clean canonical URLs.');
        score -= scoreDelta('low');
      }
    } catch {
      addFinding(findings, 'medium', 'canonical_parse_error', 'Canonical URL could not be parsed.');
      score -= scoreDelta('medium');
    }
  }

  if (!h1Count) {
    addFinding(findings, 'critical', 'missing_h1', 'No <h1> tag found.');
    score -= scoreDelta('critical');
  } else if (h1Count > 1) {
    addFinding(findings, 'low', 'multiple_h1', `Multiple <h1> tags found (${h1Count}).`);
    score -= scoreDelta('low');
  }

  if (links.internal < 2) {
    addFinding(findings, 'low', 'low_internal_links', `Low internal link density (${links.internal}).`);
    score -= scoreDelta('low');
  }

  if (links.total < 6) {
    addFinding(findings, 'low', 'low_all_links', `Low total link count (${links.total}).`);
    score -= scoreDelta('low');
  }

  if (links.noFollow > 8) {
    addFinding(findings, 'low', 'high_nofollow_links', `Many nofollow links detected (${links.noFollow}).`);
    score -= scoreDelta('low');
  }

  if (!schemaBlocks.length) {
    addFinding(findings, 'low', 'missing_schema', 'No JSON-LD structured data found.');
    score -= scoreDelta('low');
  } else {
    const invalidSchemaCount = schemaBlocks.filter((block) => !parseScriptJson(block)).length;
    if (invalidSchemaCount) {
      addFinding(findings, 'medium', 'invalid_schema_json', `${invalidSchemaCount} JSON-LD block(s) are invalid.`);
      score -= scoreDelta('medium');
    }
  }

  if (!viewport) {
    addFinding(findings, 'medium', 'missing_viewport', 'Missing viewport meta tag.');
    score -= scoreDelta('medium');
  }

  if (!langTag) {
    addFinding(findings, 'low', 'missing_html_lang', 'Missing <html lang> attribute.');
    score -= scoreDelta('low');
  }

  if (!themeColor) {
    addFinding(findings, 'low', 'missing_theme_color', 'Missing theme-color meta value.');
    score -= scoreDelta('low');
  }

  if (robots.toLowerCase().includes('noindex')) {
    addFinding(findings, 'high', 'robots_noindex', 'Robots meta contains noindex.');
    score -= scoreDelta('high');
  }

  if (altProfile.totalImages) {
    const ratio = altProfile.missingAlt / altProfile.totalImages;
    if (ratio >= 0.5) {
      addFinding(findings, 'medium', 'missing_alt', `${altProfile.missingAlt}/${altProfile.totalImages} images missing alt text.`);
      score -= scoreDelta('medium');
    }
  }

  if (responseStatus && responseStatus >= 400) {
    addFinding(findings, 'low', 'server_response_warning', 'Non-success status returned from fetch check.');
    score -= 4;
  }

  if (headingSequence.length && headingSequence[0] !== 1) {
    addFinding(findings, 'low', 'invalid_heading_hierarchy', 'Page should start with H1.');
    score -= scoreDelta('low');
  }

  if (headingSequence.some((value, index) => {
    if (index === 0) return false;
    const previous = headingSequence[index - 1];
    return value > previous + 1;
  })) {
    addFinding(findings, 'low', 'heading_jump', 'Heading levels should not skip levels.');
    score -= scoreDelta('low');
  }

  if (title && title === description) {
    addFinding(findings, 'low', 'title_description_dup', 'Title and description text are identical.');
    score -= scoreDelta('low');
  }

  if (links.total > 0 && links.internal / links.total < 0.15) {
    addFinding(findings, 'low', 'low_internal_ratio', `Internal links ratio is low (${Math.round((links.internal / links.total) * 100)}%).`);
    score -= scoreDelta('low');
  }

  score = clamp(score, 0, 100);

  if (score < 40) {
    addFinding(findings, 'medium', 'seo_urgent', 'SEO score is in an urgent remediation band.');
    score = clamp(score, 0, 100);
  }

  return {
    url: input.url,
    score,
    findings: toFormattedFindings(findings),
  };
}

export async function runPlan(url: string): Promise<{ url: string; steps: string[] }> {
  if (!url) {
    return {
      url: '',
      steps: ['Provide a valid URL', 'Run `seo audit --url <url>`', 'Run `seo plan --input <url>`'],
    };
  }

  const safeInput = { url };
  const findings: Finding[] = [];
  if (!/^https?:\/\//.test(url)) {
    addFinding(findings, 'medium', 'missing_protocol', 'URL should include http or https.');
  }

  const auditUrl = await runAudit(safeInput);
  const steps = buildPlanFromFindings(url, auditUrl.findings.map((item): Finding => {
    const match = item.match(/\[(\w+)\]\s(.*)/);
    const severity = (match?.[1] as Severity) ?? 'low';
    return {
      code: 'previous_findings',
      severity,
      message: match?.[2] ?? item,
    };
  }));

  if (!findings.length && auditUrl.findings.length === 0) {
    steps.push('Audit is healthy. Continue monitoring with scheduled checks.');
  }

  return {
    url,
    steps: [...new Set(steps)],
  };
}

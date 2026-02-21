import type { ProgrammaticPageSpec } from './schema';

export function buildSitemap(pages: ProgrammaticPageSpec[], baseUrl: string): string {
  const now = new Date().toISOString();
  const urls = pages
    .map(
      (page) => `  <url>\n    <loc>${baseUrl}${page.canonical}</loc>\n    <lastmod>${now}</lastmod>\n  </url>`
    )
    .join('\n');

  return ['<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">', urls, '</urlset>'].join('\n');
}

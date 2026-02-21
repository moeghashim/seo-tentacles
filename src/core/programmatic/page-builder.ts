import fs from 'node:fs/promises';
import path from 'node:path';
import type { ProgrammaticEntity, ProgrammaticPageSpec } from './schema';
import { slugify } from '../../utils/slug';
import { renderTemplate } from './template-engine';

export async function buildPages(entities: ProgrammaticEntity[], template: string, outputDir: string): Promise<ProgrammaticPageSpec[]> {
  const out = path.resolve(process.cwd(), outputDir);
  await fs.mkdir(out, { recursive: true });

  const created: ProgrammaticPageSpec[] = [];

  for (const item of entities) {
    const slug = slugify(item.topic || item.query);
    const canonical = `/${slug}/`;
    const context = {
      topic: item.topic,
      query: item.query,
      intent: item.intent,
      location: item.location || '',
      slug,
      canonical,
    } as Record<string, string>;

    const body = renderTemplate(template, context);
    const title = `${item.topic} - SEO Page`;
    const description = `Auto-generated content for ${item.topic}`;

    const spec: ProgrammaticPageSpec = {
      slug,
      canonical,
      title,
      description,
      h1: item.topic,
      body,
      schema_org: {
        '@type': 'Article',
        headline: title,
      },
      internal_links: [],
      breadcrumbs: [item.location || 'global', item.topic],
    };

    const filePath = path.join(out, `${slug}.md`);
    const content = [
      `---`,
      `title: ${JSON.stringify(spec.title)}`,
      `description: ${JSON.stringify(spec.description)}`,
      `slug: ${slug}`,
      `canonical: ${spec.canonical}`,
      `---`,
      '',
      spec.body,
    ].join('\n');

    await fs.writeFile(filePath, content, 'utf8');
    created.push(spec);
  }

  return created;
}

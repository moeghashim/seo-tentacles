import { getCommandContract } from './cli-first';

export function codexManifest() {
  return {
    name: 'seo-tentacles',
    description: 'CLI-first SEO skillset with backlinks, audits, and programmatic SEO.',
    runtime: 'shell',
    commands: getCommandContract(),
  };
}

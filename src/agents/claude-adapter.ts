import { getCommandContract } from './cli-first';

export function claudeManifest() {
  let md = '# SEO Tentacles - Claude Manifest\n\n';
  md += 'Commands:\n\n';
  for (const command of getCommandContract()) {
    md += `## ${command.name}\n${command.description}\n\n`;
    if (command.args.length) {
      md += 'Args:\n';
      for (const arg of command.args) {
        md += `- ${arg.name} (${arg.required ? 'required' : 'optional'}): ${arg.description}\n`;
      }
      md += '\n';
    }
    if (command.examples.length) {
      md += 'Examples:\n';
      for (const example of command.examples) {
        md += `- \`${example}\`\n`;
      }
      md += '\n';
    }
  }
  return md;
}

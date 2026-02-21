export function renderTemplate(template: string, context: Record<string, string>): string {
  return template.replace(/\{\{\s*([a-zA-Z0-9_\.]+)\s*\}\}/g, (_m, key) => {
    const value = context[key] ?? '';
    return String(value);
  });
}

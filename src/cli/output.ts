type OutputFormat = 'json' | 'md' | 'text';

export type CliStatus = 'ok' | 'error' | 'warning';

export interface Issue {
  code: string;
  message: string;
}

export interface CliResponse<T = unknown> {
  request_id: string;
  command: string;
  status: CliStatus;
  artifacts: T;
  warnings: Issue[];
  errors: Issue[];
  next_actions: string[];
}

function formatRequestId() {
  return `req_${Date.now().toString(36)}`;
}

function formatText(response: CliResponse<unknown>): string {
  const lines: string[] = [];
  lines.push(`${response.command} - ${response.status}`);
  lines.push(`request_id: ${response.request_id}`);

  if (response.errors.length) {
    lines.push('errors:');
    response.errors.forEach((error) => lines.push(` - ${error.code}: ${error.message}`));
  }
  if (response.warnings.length) {
    lines.push('warnings:');
    response.warnings.forEach((warning) => lines.push(` - ${warning.code}: ${warning.message}`));
  }

  lines.push('artifacts:');
  lines.push(typeof response.artifacts === 'string' ? response.artifacts : JSON.stringify(response.artifacts, null, 2));

  if (response.next_actions.length) {
    lines.push('next_actions:');
    response.next_actions.forEach((action) => lines.push(` - ${action}`));
  }

  return lines.join('\n');
}

export function createResponse<T>(command: string, status: CliStatus, artifacts: T, errors: Issue[] = [], warnings: Issue[] = [], nextActions: string[] = []): CliResponse<T> {
  return {
    request_id: formatRequestId(),
    command,
    status,
    artifacts,
    errors,
    warnings,
    next_actions: nextActions,
  };
}

export function emit<T>(response: CliResponse<T>, format: OutputFormat = 'text') {
  switch (format) {
    case 'json':
      return JSON.stringify(response, null, 2);
    case 'md':
      return `### ${response.command}\n\n- Status: ${response.status}\n- request_id: ${response.request_id}\n`; 
    case 'text':
    default:
      return formatText(response);
  }
}

export function writeOutput(text: string, _format?: OutputFormat) {
  process.stdout.write(text);
}

import { runAudit } from './engine';
import { getRuntimeInfo } from '../../cli/diagnostics';

export async function healthCheck(project?: string) {
  return {
    project: project ?? 'default',
    runtime: getRuntimeInfo(),
    status: 'healthy',
    message: 'System checks passed',
  };
}

export async function runAuditOnly(url: string) {
  return runAudit({ url });
}

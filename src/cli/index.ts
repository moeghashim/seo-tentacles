#!/usr/bin/env node
import { createResponse, emit, writeOutput } from './output';
import { run as runAudit } from './commands/audit';
import { run as runBuild } from './commands/build';
import { run as runEdit } from './commands/edit';
import { run as runPlan } from './commands/plan';
import { run as runPublish } from './commands/publish';
import { run as runHealth } from './commands/health';
import { run as runBacklink } from './commands/backlink';
import { run as runImportProgrammatic } from './commands/programmatic/import';
import { run as runGenerateProgrammatic } from './commands/programmatic/generate';
import { run as runValidateProgrammatic } from './commands/programmatic/validate';
import { run as runPublishProgrammatic } from './commands/programmatic/publish';
import { run as runStatusProgrammatic } from './commands/programmatic/status';

type Token = Record<string, string | boolean>;

type CommandContext = {
  format: 'json' | 'md' | 'text';
  tokens: Token;
  rest: string[];
};

function parseArgs(argv: string[]): { command: string[]; context: CommandContext } {
  const tokens: Token = {};
  const positional: string[] = [];

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith('--')) {
      positional.push(arg);
      continue;
    }

    const trimmed = arg.replace(/^--/, '');
    const equalIndex = trimmed.indexOf('=');

    if (equalIndex > -1) {
      const key = trimmed.slice(0, equalIndex);
      const value = trimmed.slice(equalIndex + 1);
      tokens[key] = value;
      continue;
    }

    const next = argv[i + 1];
    if (!next || next.startsWith('--')) {
      tokens[trimmed] = true;
      continue;
    }

    tokens[trimmed] = next;
    i += 1;
  }

  const format = typeof tokens.format === 'string' ? (tokens.format as 'json' | 'md' | 'text') : 'text';
  return { command: positional, context: { format, tokens, rest: positional.slice(1) } };
}

async function route() {
  const { command, context } = parseArgs(process.argv.slice(2));

  const [root, sub, sub2] = command;
  const format = context.format;

  if (!root || root === '--help' || root === 'help') {
    const response = createResponse('seo', 'warning', {
      message: 'Available commands: audit, build, edit, plan, publish, health, backlink, programmatic',
    });
    return writeOutput(emit(response, format));
  }

  try {
    if (root === 'audit') {
      return runAudit({ url: context.tokens.url as string, format });
    }

    if (root === 'build') {
      return runBuild({
        source: context.tokens.source as string,
        target: context.tokens.target as string,
        env: context.tokens.env as string,
        format,
      });
    }

    if (root === 'edit') {
      return runEdit({ target: context.tokens.target as string, plan: context.tokens.plan as string, format });
    }

    if (root === 'plan') {
      return runPlan({ input: context.tokens.input as string, format });
    }

    if (root === 'publish') {
      return runPublish({
        project: context.tokens.project as string,
        platform: context.tokens.platform as string,
        format,
      });
    }

    if (root === 'health') {
      return runHealth({ project: context.tokens.project as string, format });
    }

    if (root === 'backlink') {
      return runBacklink({
        subcommand: sub,
        source: context.tokens.source as string,
        status: context.tokens.status as string,
        paid: context.tokens.paid as string,
        category: context.tokens.category as string,
        website: context.tokens.website as string,
        type: context.tokens.type as string,
        setStatus: context.tokens['set-status'] as string,
        format,
      });
    }

    if (root === 'programmatic') {
      if (sub === 'import') {
        return runImportProgrammatic({
          source: context.tokens.source as string,
          format,
        });
      }
      if (sub === 'generate') {
        return runGenerateProgrammatic({
          source: context.tokens.source as string,
          template: context.tokens.template as string,
          out: context.tokens.out as string,
          dryRun: context.tokens['dry-run'] === true,
          format,
        });
      }
      if (sub === 'validate') {
        return runValidateProgrammatic({
          source: context.tokens.source as string,
          format,
        });
      }
      if (sub === 'publish') {
        return runPublishProgrammatic({
          project: context.tokens.project as string,
          scope: context.tokens.scope as string,
          format,
        });
      }
      if (sub === 'status') {
        return runStatusProgrammatic({
          runId: context.tokens['run-id'] as string,
          format,
        });
      }
    }

    const response = createResponse('seo', 'error', {
      command: command.join(' '),
      message: 'Unknown command',
    }, [{ code: 'unknown_command', message: `command not recognized: ${root}` }]);
    return writeOutput(emit(response, format));
  } catch (error) {
    const response = createResponse('seo', 'error', {
      message: (error as Error).message,
    }, [{ code: 'command_failed', message: 'Unhandled exception while running command.' }]);
    return writeOutput(emit(response, format));
  }
}

route();

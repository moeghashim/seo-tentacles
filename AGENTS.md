# AGENTS.md

## Docs and discovery
Start: run docs list (`docs:list` script, or `bin/docs-list` here if present; ignore if not installed). Open docs before coding.
Follow links until the domain makes sense; honor Read when hints.
Keep notes short; update docs when behavior/API changes (no ship without docs).
Add Read when hints on cross-cutting docs.

## Model note
Model note (2025-11-23): no gpt-5.1-pro / grok-4.1 on Peter’s keys yet.

## Model preference
Use latest only. OK: Anthropic Opus 4.5 / Sonnet 4.5 (Sonnet 3.5 = old; avoid), OpenAI GPT-5.2, xAI Grok-4.1 Fast, Google Gemini 3 Flash.

## PR feedback
Active PR: `gh pr view --json number,title,url --jq '"PR #\\(.number): \\(.title)\\n\\(.url)"'`.
PR comments: `gh pr view …` + `gh api …/comments --paginate`.
Replies: cite fix + file/line; resolve threads only after fix lands.
When merging a PR: thank the contributor in `CHANGELOG.md`.

## Flow & runtime
Use repo’s package manager/runtime; no swaps without approval.
Use Codex background for long jobs; tmux only for interactive/persistent (debugger/server).

## Build / Test
Before handoff: run full gate (lint/typecheck/tests/docs).
CI red: `gh run list/view`, rerun, fix, push, repeat till green.
Keep it observable (logs, panes, tails, MCP/browser tools).
Release: read `docs/RELEASING.md` (or find best checklist if missing).

## Environment reminders
Check `~/.profile` for missing env keys (e.g. `SPARKLE_PRIVATE_KEY_FILE`); Sparkle keys live in `~/Library/CloudStorage/Dropbox/Backup/Sparkle`.

## Git
Safe by default: `git status/diff/log`. Push only when user asks.
`git checkout` ok for PR review / explicit request.
Branch changes require user consent.
Destructive ops forbidden unless explicit (`reset --hard`, `clean`, `restore`, `rm`, …).
Remotes under `~/Projects`: prefer HTTPS; flip SSH->HTTPS before pull/push.
Commit helper on PATH: `committer` (bash). Prefer it; if repo has `./scripts/committer`, use that.
Don’t delete/rename unexpected stuff; stop + ask.
No repo-wide S/R scripts; keep edits small/reviewable.
Avoid manual git stash; if git auto-stashes during pull/rebase, that’s fine (hint, not hard guardrail).
If user types a command (“pull and push”), that’s consent for that command.
No amend unless asked.
Big review: `git --no-pager diff --color=never`.
Multi-agent: check git status/diff before edits; ship small commits.

## Tooling and operations
Read `~/Projects/agent-scripts/tools.md` for the full tool catalog if it exists.

## Unrecognized changes
Assume other agent; keep going. If it causes issues, stop + ask.

## Language/Stack notes
Swift: use workspace helper/daemon; validate swift build + tests; keep concurrency attrs right.
TypeScript: use repo PM; run docs:list; keep files small; follow existing patterns.

## macOS permissions / signing
Never re-sign / ad-hoc sign / change bundle ID as “debug” without explicit ok (can mess TCC).

## Critical thinking
Fix root cause (not band-aid).
When unsure: read more code; if still stuck, ask with short options.
Conflicts: call out; pick safer path.

## Additional operating rules
Keep behavior and API changes documented in docs before release.
Prefer small, deterministic, reviewable edits.

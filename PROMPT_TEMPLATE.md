# House-Style Prompt Template

## Purpose
Use this template to convert a layperson request into a scoped, verifiable engineering prompt in this repository style (`prompts/000..120b`).

Use it when the request requires code/doc changes, clear constraints, and auditable outputs.

## When To Use
- You have a user goal but unclear implementation details.
- You need to prevent runaway edits or broad autonomy.
- You need deterministic deliverables (files, diffs, test steps, rollback path).

## Canonical Skeleton (Copy/Paste)
```md
You are Codex CLI (gpt-5.3-codex xhigh) running at repo root.

Context
- [prior prompt/task reference]
- [current architecture facts confirmed from repo]
- [known constraints that must carry forward]

Mission
- [single sentence: what must be achieved]

Non-negotiable constraints
- [hard constraint 1]
- [hard constraint 2]
- [hard constraint 3]

Current issue / evidence
- [observed behavior]
- [logs/errors]
- [root cause hypothesis if known]

Target behavior
- [what should happen for primary path]
- [what should stay unchanged]

Implementation requirements
1) [specific code/doc change]
2) [specific code/doc change]
3) [specific code/doc change]

Verification steps
- [manual and/or command checks]
- [expected outputs]
- [negative checks / regressions]

Rollback / escape hatch
- If [risk trigger], stop and revert only files changed in this task:
  - `git restore -- <file1> <file2>`
- Report what failed and where.

Deliverables
- [file list changed]
- [exact diff requirement if needed]
- [checkpoint/log summary requirement]
```

## Conversion Guide (Lay Request -> Prompt)
1. Extract intent.
- Rewrite the user request as a one-line mission with success criteria.

2. Split facts vs assumptions.
- Facts: repo state, errors, existing commands, file paths.
- Assumptions: suspected causes or platform behavior.
- If uncertain, add an explicit inspection step before edits.

3. Convert vague asks into concrete goals.
- Replace “fix this” with exact runtime behavior before/after.
- Name the functions/files to touch.

4. Separate hard vs soft constraints.
- Hard: must never happen (`no TS build`, `no settings auto-change`, `no network`).
- Soft: preferred but adjustable (`minimal diff`, `keep logs readable`).

5. Define output artifacts.
- Exact files to create/update.
- Required summaries, diffs, checkpoints.
- Required test checklist and expected outcomes.

## Repo Context Rules
- Inspect before assuming: use `rg` + direct file reads.
- Do not infer versioning or command IDs without checking `package.json`/source.
- Keep scope to listed files unless prompt explicitly authorizes broader edits.

## Safety Rails (Prevent Agent Spirals)
- Ban open-ended language: avoid “fix everything”, “improve anything found”.
- Require numbered implementation steps tied to specific files/functions.
- Require explicit non-goals (“dedicated mode unchanged”, “no packaging in this task”).
- Add verification gates: if check fails, stop and report rather than expanding scope.
- Add rollback instructions for touched files.

## Done Definition Checklist
- [ ] Behavior matches target scenarios.
- [ ] Constraints respected (no forbidden tooling/paths/settings).
- [ ] Only allowed files changed.
- [ ] Verification steps executed or explicitly marked not run.
- [ ] Deliverables produced exactly as requested.
- [ ] Rollback steps documented.

## Worked Example
Lay request:
- “My extension keeps renaming terminals wrong after scripts. Fix it without breaking release setup.”

Filled prompt (short form):
```md
Context
- Continue from `prompts/120b_release.md`.
- Runtime is JS/no-build with `extension/extension.js` entrypoint.

Mission
- Fix undedicated terminal revert naming without changing packaging behavior.

Non-negotiable constraints
- No TS build/out/webpack.
- Keep `workbench.action.terminal.renameWithArg`.
- No user settings auto-modification.
- Do not run packaging in this task.

Current issue / evidence
- Revert path sets invalid/unsupported name and triggers `No name argument provided`.

Target behavior
- Run-file titles apply temporarily.
- Revert succeeds with no toast errors.
- Dedicated terminal behavior unchanged.

Implementation requirements
1) Update revert helper in `extension/extension.js` to return safe non-empty reset token.
2) Ensure `applyTitleToTerminal` never sends empty/missing `name`.
3) Update manual revert command to reuse same helper.
4) Add docs note in `docs/spec_terminal_naming.md` and `docs/release.md`.
5) Add checkpoint file describing regression and fix.

Verification steps
- Run script command and confirm temporary title + clean revert.
- Run manual revert command and confirm no error toast.

Rollback / escape hatch
- `git restore -- extension/extension.js docs/spec_terminal_naming.md docs/release.md CHECKPOINTS/<new>.md`

Deliverables
- Minimal diff for listed files.
- Short summary of risk reduction.
```

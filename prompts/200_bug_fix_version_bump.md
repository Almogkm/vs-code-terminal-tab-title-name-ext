Bugfix v0.1.1 (Pass 1): remove literal `${process}` revert.

Context
- Continue from `prompts/120b_release.md`.
- Runtime is JS/no-build (`extension/extension.js` entrypoint).
- Tab rename mechanism must remain `workbench.action.terminal.renameWithArg`.
- No OSC / `${sequence}` / `printf` title emission.

Mission
- Fix Mode A revert logic so terminals are never renamed to literal `${process}`.
- Keep dedicated terminal behavior unchanged.
- Bump version/changelog for v0.1.1 and package a VSIX only if tooling already exists.

Non-negotiable constraints
- No TypeScript build, no `out/`, no webpack.
- Do not modify user settings automatically.
- Do not add dependencies.
- Keep edits minimal and limited to files listed below.

Scope
- `extension/extension.js`
- `extension/package.json`
- `extension/CHANGELOG.md`

Pre-edit inspection (required)
1) Confirm current revert path and baseline constants:
- `rg -n "DEFAULT_BASELINE_NAME|handleExecutionEnd|applyTitleToTerminal|revertActiveTerminalToBaseline" extension/extension.js`
2) Confirm current version:
- `node -p "require('./extension/package.json').version"`
3) If expected symbols are missing, stop and report actual names before editing.

Implementation requirements
1) Stop all rename targets that use literal `${process}`.
- Remove fallback assignments/targets that force `${process}` during revert.

2) Add helper `computeRevertNameForUndedicated(state)`.
- Return `""` when baseline is missing/empty, shell baseline (`bash/zsh/sh/fish`), or transient process (`python/python3/node/R/Rscript/...`).
- Else return `sanitizeTitle(state.baselineName)`.

3) Allow explicit empty reset in `applyTitleToTerminal`.
- Reject only `null`/`undefined` title values.
- Permit empty string only when `options.allowEmpty === true`.
- Keep rate limiting logic and state updates (`lastTitle`, `lastRenameAt`) intact.

4) Update execution-end revert (Mode A only).
- When `state.isTemporarilyRenamed`, compute revert name with the helper and apply it with:
- `applyTitleToTerminal(terminal, revertName, { bypassRateLimit: true, allowEmpty: true })`
- Clear temporary flags after apply attempt.

5) Update manual revert command to use the same helper.
- For undedicated terminals, use helper + `allowEmpty: true` when needed.
- User message should say `Reverted to default (process-following)` when reset path is used.

6) Improve debug command clarity.
- Keep command ID/title unchanged.
- Remove misleading shell-kind guess.
- Show terminal name (render empty as `<default>`), PID, and extension state fields.

7) Version + changelog.
- Set `extension/package.json` version to `0.1.1`.
- Add `0.1.1` entry in `extension/CHANGELOG.md` for:
  - no literal `${process}` renames
  - reset-to-default revert path
  - clearer debug command output

8) VSIX packaging (best effort, no install).
- Do not run, even if `@vscode/vsce` is already usable locally:
  - `cd extension && npx @vscode/vsce package`
- If unavailable, do not install anything; report exact failure and stop.

Verification steps
- Extension Host manual checks:
1. Undedicated terminal: `python3 other_script.py`
- During run: temporary parsed title.
- After end: not stuck at `${process}` and no hard-pin to shell label.
2. Undedicated terminal: `python3` interactive -> exit.
- Process-following behavior returns.
3. Manual command: `Terminal Tab Titles: Revert Active Terminal To Baseline`.
- Must not set literal `${process}`.
4. Dedicated terminal behavior remains fixed/pinned.

Rollback / escape hatch
- If revert behavior regresses or new error toasts appear, rollback only this task’s files:
- `git restore -- extension/extension.js extension/package.json extension/CHANGELOG.md`
- Then report failing command + output-channel lines.

Deliverables
- Exact diffs for changed files.
- Summary of before/after revert behavior.
- Packaging result (VSIX filename or exact packaging failure output).

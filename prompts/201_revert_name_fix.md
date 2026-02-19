Bugfix v0.1.1 (Pass 2): fix empty-name revert regression.

Context
- Continue from `prompts/200_bug_fix_version_bump.md`.
- Runtime is JS/no-build (`extension/extension.js` entrypoint).
- Rename API remains `workbench.action.terminal.renameWithArg`.
- No OSC / no `${sequence}` / no `printf` title emission.
- Do NOT package/publish in this task.

Mission
- Eliminate `No name argument provided` errors caused by empty/missing rename payloads.
- Keep Mode A temporary rename + revert behavior and Mode B dedicated behavior intact.

Current issue / evidence
- Revert path logs reset intent but may pass empty/sentinel values into rename command.
- In this environment, `renameWithArg` rejects empty string names.

Non-negotiable constraints
- No TypeScript build, no `out/`, no webpack.
- No user settings auto-modification.
- No network.
- No new dependencies.
- No broad refactors outside listed files.

Scope
- `extension/extension.js`
- `docs/spec_terminal_naming.md`
- `docs/release.md`
- `extension/package.json`
- `extension/CHANGELOG.md`
- `CHECKPOINTS/121_v011_reset_space_revert_fix.md` (new)

Pre-edit inspection (required)
1) Locate revert/reset code paths:
- `rg -n "DEFAULT_BASELINE_NAME|computeRevertName|allowEmpty|reset|No name argument provided|revertActiveTerminalToBaseline" extension/extension.js`
2) Confirm version/changelog state:
- `node -p "require('./extension/package.json').version"`
- `rg -n "0\.1\.1" extension/CHANGELOG.md`
3) If symbols differ, map actual equivalents before editing; do not invent parallel code paths.

Implementation requirements
1) Never rename to `${process}`.
- Remove/disable any remaining rename target/fallback equal to `${process}`.

2) Introduce safe reset token.
- Add constant:
- `const RESET_NAME = ' ';`  // one ASCII space
- Use this token whenever undedicated revert should reset to default-like naming.
- Sentinel strings (for logs only) must never be used as rename payload.

3) Harden `applyTitleToTerminal`.
- Must never call rename command with missing/empty `name`.
- Allowed payloads: normal non-empty title OR `RESET_NAME`.
- Keep rate-limit and state updates intact.
- Logging should render reset payload as `<reset-space>` while still sending real payload `' '`.

4) Centralize undedicated revert selection.
- Use one helper for both execution-end and manual revert command.
- Rules:
  - baseline missing/empty -> `RESET_NAME`
  - shell baseline (`bash/zsh/sh/fish`) -> `RESET_NAME`
  - transient process names (`python/python3/node/R/...`) -> `RESET_NAME`
  - else -> `sanitizeTitle(state.baselineName)`
- Guard output: if helper yields null/undefined/empty, force `RESET_NAME`.

5) Apply helper in both revert paths.
- `handleExecutionEnd` Mode A revert uses helper + bypass rate-limit.
- `revertActiveTerminalToBaseline` command uses same helper and updates state consistently.
- Always call `getOrCreateTerminalState(activeTerminal)` in manual command.

6) Debug command clarity.
- Keep command ID/title unchanged.
- Do not claim shell kind.
- Show terminal display name (`RESET_NAME -> <reset-space>`, empty -> `<empty>`), PID, and extension state fields.

7) Docs + checkpoint.
- `docs/spec_terminal_naming.md`: document `RESET_NAME = ' '` workaround and reason.
- `docs/release.md`: add v0.1.1 note about empty-name rejection and reset-space workaround.
- Add troubleshooting note: `No name argument provided` should no longer occur after fix.
- Create `CHECKPOINTS/201_reset_space_revert_fix.md` with:
  - date/timestamp
  - regression summary
  - fix summary
  - files changed
  - short success-log excerpt

8) Versioning (if not already finalized).
- Ensure `extension/package.json` is `0.1.1`.
- Ensure `extension/CHANGELOG.md` includes 0.1.1 entries for:
  - no literal `${process}` rename
  - no empty-name rename error
  - reset-space workaround behavior

Verification steps
- Extension Host manual checks:
1. Undedicated: `python3 other_script.py`
- temporary parsed title during run
- no `No name argument provided` toast on end
- not pinned to `${process}`
2. Undedicated: run `python3` interactive, then exit
- returns to process-following behavior
3. Manual command: `Terminal Tab Titles: Revert Active Terminal To Baseline`
- no `No name argument provided` error
4. Dedicated terminals remain fixed/pinned and do not revert to reset-space on end.
5. Output channel has no empty-name rename attempts.

Rollback / escape hatch
- If new rename errors appear, rollback only this task files:
- `git restore -- extension/extension.js docs/spec_terminal_naming.md docs/release.md extension/package.json extension/CHANGELOG.md CHECKPOINTS/121_v011_reset_space_revert_fix.md`
- Report failing command and output-channel excerpt.

Deliverables
- Exact diffs for all changed files.
- Short note confirming no empty/missing rename payloads are sent.
- Verification notes for all checklist items (pass/fail).

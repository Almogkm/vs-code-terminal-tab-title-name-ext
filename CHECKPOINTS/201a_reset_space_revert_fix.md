# Checkpoint 121 - v0.1.1 Reset-Space Revert Fix

## Date
- 2026-02-18

## Regression Summary
- Prior revert logic removed `${process}` but tried to reset by passing an empty name to `workbench.action.terminal.renameWithArg`.
- In this VS Code environment, empty rename arguments fail with `No name argument provided`.
- This produced revert errors after temporary run-file titles and could trigger secondary process instability.

## Fix Implemented
- Introduced `RESET_NAME = ' '` (single ASCII space) in runtime revert logic.
- Undedicated terminal revert now never passes empty/missing rename names.
- Runtime now never renames to literal `${process}` and never sends sentinel strings as rename payloads.
- Debug command output now focuses on extension state and renders reset-space clearly.

## Files Changed
- `extension/extension.js`
- `extension/package.json`
- `extension/CHANGELOG.md`
- `docs/spec_terminal_naming.md`
- `docs/release.md`
- `extension/README.md`

## Output Log Excerpt (successful path)
```text
[terminal-tab-titles] execution start: python3 other_script.py
[terminal-tab-titles] parsed title: Python: other_script.py
[terminal-tab-titles] title applied: Python: other_script.py
[terminal-tab-titles] reverting undedicated terminal: <reset-space>
[terminal-tab-titles] title applied: <reset-space>
[terminal-tab-titles] revert applied
```

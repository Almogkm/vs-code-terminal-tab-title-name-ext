# Checkpoint 201 - Reset-Space Revert Fix (v0.1.1)

## Timestamp
- 2026-02-19 00:27:54Z

## Regression Summary
- Undedicated terminal revert could pass empty or sentinel-like names into `workbench.action.terminal.renameWithArg`.
- In this environment, empty rename names can fail with `No name argument provided`.
- Prior fallback behavior also risked literal `${process}` payloads in earlier iterations.

## Fix Summary
- Revert logic uses a non-empty reset token: `RESET_NAME = ' '` (single space).
- `computeRevertNameForUndedicated(state)` centralizes revert target selection and forces safe fallback.
- `applyTitleToTerminal` rejects null/undefined/empty names, but allows reset-space payload.
- Manual revert command and execution-end revert both use the same helper and never send empty payloads.
- Debug output renders reset payload as `<reset-space>` while sending real payload `' '`.

## Files Changed / Verified
- `extension/extension.js`
- `docs/spec_terminal_naming.md`
- `docs/release.md`
- `extension/package.json`
- `extension/CHANGELOG.md`
- `CHECKPOINTS/201_reset_space_revert_fix.md`

## Successful OutputChannel Excerpt (expected)
```text
[terminal-tab-titles] execution start: python3 other_script.py
[terminal-tab-titles] parsed title: Python: other_script.py
[terminal-tab-titles] title applied: Python: other_script.py
[terminal-tab-titles] reverting undedicated terminal: <reset-space>
[terminal-tab-titles] title applied: <reset-space>
[terminal-tab-titles] revert applied
```

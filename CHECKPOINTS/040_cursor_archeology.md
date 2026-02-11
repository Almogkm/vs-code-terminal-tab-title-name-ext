# CHECKPOINTS/040_cursor_archeology.md

> Historical note: This checkpoint inferred OSC-based persistence. Current implementation uses `workbench.action.terminal.renameWithArg` for terminal renaming.

## Current status
- Proceed with VS Code APIs (shell execution events + renameWithArg), not OSC sequences.

## Summary
- Local repo-only archeology (no web/docs) found xterm.js in the renderer and node-pty in the main process.
- Original (historical): No evidence of terminal title handling (OSC sequences or xterm `onTitleChange`) exists in the open-source snapshots.

## Implications for our design (historical)
- We cannot derive terminal title behavior from Cursor’s open-source code.
- Original (historical): Continue with VS Code APIs + OSC title sequences for persistence.

## Open questions
- Whether proprietary Cursor builds add terminal title naming logic not present here.

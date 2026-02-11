# CHECKPOINTS/040_cursor_archeology.md

## Summary
- Local repo-only archeology (no web/docs) found xterm.js in the renderer and node-pty in the main process.
- No evidence of terminal title handling (OSC sequences or xterm `onTitleChange`) exists in the open-source snapshots.

## Implications for our design
- We cannot derive terminal title behavior from Cursor’s open-source code.
- Continue with VS Code APIs + OSC title sequences for persistence.

## Open questions
- Whether proprietary Cursor builds add terminal title naming logic not present here.

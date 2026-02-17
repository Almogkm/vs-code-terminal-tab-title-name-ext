# Terminal Tab Titles (VS Code)

A VS Code extension that renames integrated terminal tabs based on executed commands, with safe defaults and zero build tooling.

## What It Does
- **Mode A (user-started terminals):** rename only for run‑file commands, then revert to the shell baseline when the command finishes.
- **Mode B (dedicated/editor terminals):** keep a fixed title (e.g., `Python: script.py`) and re‑apply it if other extensions revert the name.

Renaming uses VS Code’s `workbench.action.terminal.renameWithArg`. No OSC sequences, no shell prompt hacks.

## Requirements
- **Shell integration events available:** the extension uses terminal shell execution events when VS Code exposes them. If unavailable, it logs a message and does nothing (no errors, no renames).
- **Supported commands (rename only for file targets):**
  - `python` / `python3` (script files)
  - `R` / `Rscript` (script files)
  - `bash` / `sh` / `zsh` (script files)
  - `node` / `nodejs` (script files)
- **Explicit non-goal:** `make` targets are **not** renamed.

## Behavior Summary
**Mode A — user-started terminals**
- Rename on run‑file commands only.
- Revert to baseline after command completion.

**Mode B — dedicated/editor terminals**
- Detect via baseline name or editor‑run heuristic (first execution within ~3s of open with active editor match).
- Enforce a fixed title on start/end (and on name changes if VS Code exposes the event).

## Commands
- **Terminal Tab Titles: Debug Info**
- **Terminal Tab Titles: Rename Active Terminal Temporary Test**
- **Terminal Tab Titles: Revert Active Terminal To Baseline**

## Settings
- `terminalTabTitles.enabled` (boolean, default `true`): enable/disable automatic renames.
- `terminalTabTitles.debugLogging` (boolean, default `false`): verbose logs to the **Terminal Tab Titles** OutputChannel.

## Troubleshooting
- Open **Output** → select **Terminal Tab Titles** to see logs.
- If you see `shell execution events available: no`, VS Code does not provide shell integration events in this environment; the extension will no‑op.
- If titles revert unexpectedly, enable `terminalTabTitles.debugLogging` and verify baseline capture and dedicated detection logs.

## Security Model (Summary)
- **Does not execute user commands.**
- **No network access.**
- Titles are sanitized (control chars removed, length capped).

## License
MIT (see `LICENSE`).

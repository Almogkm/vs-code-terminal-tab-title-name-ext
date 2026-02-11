# CHECKPOINTS/071_fix_title_emission.md

> Historical note: This step refined OSC/printf title emission. Current implementation no longer uses OSC; it renames terminals via `workbench.action.terminal.renameWithArg` (see `CHECKPOINTS/073_switch_to_renameWithArg.md`).

## Current status
- Title setting is done via VS Code terminal rename command; no OSC/printf emission.

## Root cause
- Original (historical): Sending OSC sequences via `terminal.sendText(sequence)` writes to shell stdin and does **not** set the terminal title.

## Changes
- Original (historical): Emit titles by executing `printf` in the shell: `printf '\033]2;%s\007' '<title>'`.
- Original (historical): Added single-quote escaping and stricter sanitization (strip control chars, max 120 chars).
- Original (historical): Added "Terminal Titles: Set Title Test" command for manual validation.
- Original (historical): Added OutputChannel logging for activation, shell exec event availability, command parsing, and title application.

## Test checklist
1) F5 to start Extension Development Host.
2) Apply required settings in the Extension Development Host.
3) Run "Terminal Titles: Set Title Test" and confirm tab title updates.
4) Run `python3 some_script.py` and confirm title changes to `Python: some_script.py`.
5) Check OutputChannel "Terminal Titles" for logs.

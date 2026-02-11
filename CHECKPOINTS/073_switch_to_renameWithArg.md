# CHECKPOINTS/073_switch_to_renameWithArg.md

## Root cause
- OSC/printf title sequences were unreliable in VS Code terminal tabs and caused recursion/spam.

## Changes
- Switched to terminal renaming via `workbench.action.terminal.renameWithArg`.
- Removed OSC/printf emission path and added guards to ignore internal/printf/OSC-like command lines.
- Added command "Terminal Titles: Rename Active Terminal Test".
- Updated user setup docs: no settings required.

## Test checklist
1) F5 to launch Extension Development Host.
2) Open a terminal and run "Terminal Titles: Rename Active Terminal Test".
3) Run `python3 some_script.py` and confirm title updates.
4) Verify no repeated renames or spam when running `printf` manually.
5) Check OutputChannel "Terminal Titles" for logs.

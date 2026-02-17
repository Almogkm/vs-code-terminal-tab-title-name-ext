# CHECKPOINTS/072_fix_recursion_and_settings.md

> Historical note: This step addressed OSC/printf recursion and `${sequence}` settings. Current implementation renames terminals directly via `workbench.action.terminal.renameWithArg` (see `CHECKPOINTS/073_switch_to_renameWithArg.md`).

## Current status
- No `${sequence}` setting is required; titles are applied via `renameWithArg` and guarded against re-entrancy.

## Root cause
- Original (historical): Title emission used `printf` in the terminal, which triggered `onDidStartTerminalShellExecution` and caused an infinite re-apply loop.
- Original (historical): User settings were still using `${process}`, so titles reverted to `bash`.

## Changes
- Original (historical): Added a re-entrancy guard (`isApplyingTitle`) and a regex filter for internal `printf` title commands.
- Original (historical): `sendTitleToTerminal` now sets the guard before sending and clears it shortly after.
- Original (historical): Updated setup docs to require `${sequence}` and added exact steps to open User Settings JSON in the Extension Development Host.

## Test plan
1) F5 to launch Extension Development Host.
2) Original (historical): Open User Settings (JSON) and set `terminal.integrated.tabs.title` to `${sequence}`.
3) Run "Terminal Tab Titles: Set Title Test" and confirm the tab title updates once (no loop).
4) Run `python3 some_script.py` and confirm title updates.
5) Check OutputChannel "Terminal Tab Titles" for a single log per command and ignored internal title logs.

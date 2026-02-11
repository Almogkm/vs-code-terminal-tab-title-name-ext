# CHECKPOINTS/010_vscode_terminal_titles.md

> Historical note: This checkpoint reflects the earlier `${sequence}`/OSC approach. Current design uses `workbench.action.terminal.renameWithArg` and does not require `${sequence}` settings.

## Current status
- We now rename terminals directly via `workbench.action.terminal.renameWithArg`; no `${sequence}` setting is required.

## Summary
- Verified the tab title/description settings and the complete list of supported variables, including `${sequence}`, `${shellCommand}`, and `${shellPromptInput}`.
- Confirmed `${sequence}` reflects the process-provided title string, which can be shown by setting `terminal.integrated.tabs.title` to `${sequence}`.
- Documented how shell integration enables command detection and working directory metadata, its supported shells, and quality levels (None/Basic/Rich).

## Implications for our design (historical)
- We should rely on `${sequence}` for persistence and emit a title sequence from the extension.
- We cannot depend on template transforms (basename, regex, conditional logic), so command parsing/formatting must be done in our code.
- Features that depend on shell integration (`${shellCommand}`, `${shellPromptInput}`, `${cwdFolder}` on Windows) must degrade gracefully when shell integration is missing or low quality.

## Open questions
- Original (historical): How VS Code prioritizes title updates when multiple processes emit OSC title sequences.
- How reliable `${shellCommand}` is across shells and common prompt frameworks.
- Behavior of `${shellPromptInput}` during multi-line input or prompt editing.

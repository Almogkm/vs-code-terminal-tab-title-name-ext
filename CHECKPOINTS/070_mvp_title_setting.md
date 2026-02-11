# CHECKPOINTS/070_mvp_title_setting.md

> Historical note: This step used OSC/`${sequence}` title emission. The current implementation renames terminals via `workbench.action.terminal.renameWithArg` (see `CHECKPOINTS/073_switch_to_renameWithArg.md`).

## Current status
- Titles are set via `workbench.action.terminal.renameWithArg`; OSC emission path removed.

## Summary
- Added MVP command-detection hook using terminal shell execution start events.
- Original (historical): Parses command lines, computes a title, sanitizes it, and emits an OSC title sequence to the same terminal.
- Original (historical): Added user setup instructions for `${sequence}` and shell integration.

## Files updated
- `extension/extension.js`
- `extension/title.js`
- `extension/parser.js`
- `extension/package.json`
- `docs/user_setup.md`

## Notes
- Behavior is gated by `terminalTitles.enabled`.
- If shell integration/events are unavailable, the extension does nothing.

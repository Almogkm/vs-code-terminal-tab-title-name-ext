# CHECKPOINTS/085_repo_sync_pass.md

## Summary
- Audited the repo for stale TS/OSC/${sequence} assumptions and updated docs/prompts/checkpoints to reflect the JS/no-build + renameWithArg approach.
- Marked OSC/${sequence} checkpoints as historical and added current-status notes.
- Updated planning guidance to reference `extension/*.js` and the runtime `extension/parser.js`.

## Files updated
- `DECISIONS.md`
- `SKILLS.md`
- `TERMINAL_RENAME_EXT_INSTRUCTIONS_GRAND_SCHEME.md`
- `TOKEN_BUDGETING.md`
- `CHECKPOINTS/000_bootstrap.md`
- `CHECKPOINTS/010_vscode_terminal_titles.md`
- `CHECKPOINTS/030_terminal_title_sequences.md`
- `CHECKPOINTS/040_cursor_archeology.md`
- `CHECKPOINTS/060_extension_skeleton.md`
- `CHECKPOINTS/070_mvp_title_setting.md`
- `CHECKPOINTS/071_fix_title_emission.md`
- `CHECKPOINTS/072_fix_recursion_and_settings.md`
- `CHECKPOINTS/085_repo_sync_pass.md`

## Remaining risks / TODOs
- Shell integration event availability and behavior across shells.
- `renameWithArg` reliability across terminals and focus changes.
- Parsing edge cases (wrappers, `python -m`, quoted paths).

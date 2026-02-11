# CHECKPOINTS/030_terminal_title_sequences.md

> Historical note: This checkpoint reflects the earlier OSC title sequence plan. Current implementation renames terminals via `workbench.action.terminal.renameWithArg` and does not emit OSC.

## Current status
- Titles are set by VS Code terminal rename command (`workbench.action.terminal.renameWithArg`), not OSC.

## Summary
- Original (historical): Ubuntu/bash-first approach: use OSC 2 to set window title, with OSC 0 as fallback.
- Original (historical): Preferred terminator is ST (`ESC \\`), with BEL (`\x07`) as fallback.
- Original (historical): Safe emission is via `printf` and `%s` in bash, never `echo -e` or command interpolation.
- Original (historical): `${sequence}` in VS Code tabs reflects process-provided title sequences, so emitting OSC titles in the terminal is the persistence mechanism.

## Implications for our design (historical)
- Implement a bash-safe title emission template using `printf` with ST, falling back to BEL when needed.
- Sanitize titles: strip control chars, remove newlines/tabs, enforce <= 240 chars.
- Expect occasional overwrites from child processes; our extension should re-emit on command start/end.

## Open questions
- Original (historical): Whether VS Code treats OSC 0 and OSC 2 identically for `${sequence}`.
- Original (historical): How often child processes override titles in real Ubuntu setups.

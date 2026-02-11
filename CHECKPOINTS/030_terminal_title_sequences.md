# CHECKPOINTS/030_terminal_title_sequences.md

## Summary
- Ubuntu/bash-first approach: use OSC 2 to set window title, with OSC 0 as fallback.
- Preferred terminator is ST (`ESC \\`), with BEL (`\x07`) as fallback.
- Safe emission is via `printf` and `%s` in bash, never `echo -e` or command interpolation.
- `${sequence}` in VS Code tabs reflects process-provided title sequences, so emitting OSC titles in the terminal is the persistence mechanism.

## Implications for our design
- Implement a bash-safe title emission template using `printf` with ST, falling back to BEL when needed.
- Sanitize titles: strip control chars, remove newlines/tabs, enforce <= 240 chars.
- Expect occasional overwrites from child processes; our extension should re-emit on command start/end.

## Open questions
- Whether VS Code treats OSC 0 and OSC 2 identically for `${sequence}`.
- How often child processes override titles in real Ubuntu setups.

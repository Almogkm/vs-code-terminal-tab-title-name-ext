# RISKS_AND_GUARDRAILS.md

## Non-negotiables
- No destructive operations on user files or settings.
- Never execute or evaluate user-provided command strings.
- Always escape and sanitize any data used in title sequences.
- Degrade gracefully if shell integration or execution events are unavailable.

## Guardrails
- Treat command lines as untrusted input.
- Strip control characters and enforce length limits.
- If parsing fails, do not change the title.

## Title escape sequence guardrails
- Only emit OSC 0/2 sequences with a fixed template; never interpolate untrusted input into shell code.
- Strip all control characters (ESC, BEL, ST, and ASCII < 0x20 / 0x7F), plus newlines and tabs, before emitting.
- Enforce a conservative max title length (<= 240 chars) to avoid Windows' 255-char VT limit.
- Prefer ST terminator (`ESC \\`) when possible; fall back to BEL only when necessary.
- On Linux/bash, use `printf` with `%s` for title emission; never use `echo -e` or `$'...'` with untrusted input.
- Never pass titles through command substitution or backticks; treat all titles as data, not code.

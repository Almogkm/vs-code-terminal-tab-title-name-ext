# RISKS_AND_GUARDRAILS.md

## Non-negotiables
- No destructive operations on user files or settings.
- Never execute or evaluate user-provided command strings.
- Always sanitize any data used in terminal titles.
- Degrade gracefully if shell integration or execution events are unavailable.

## Guardrails
- Treat command lines as untrusted input.
- Strip control characters and enforce length limits.
- If parsing fails, do not change the title.

## Terminal rename guardrails
- Use VS Code terminal rename command only; do not send OSC/printf sequences.
- Strip control characters and enforce a conservative max title length.
- Never execute or interpolate user-provided commands in the terminal.

## Failure-mode mitigations
- Shell integration or execution events missing: log once and no-op (no errors, no title changes).
- Empty/invalid commandLine: skip rename and log only in debug mode.
- Internal/printf/OSC-like commands: ignore to prevent recursion or spam.
- Rapid-fire events: rate limit and suppress duplicate titles per terminal.
- Rename failures (command unavailable, terminal gone): catch and log without throwing.
- Ambiguous multi-command lines: truncate to the first command segment before parsing.

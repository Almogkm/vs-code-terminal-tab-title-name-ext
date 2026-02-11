Hardening task.

Goals:
- Strengthen sanitization and escaping for title strings.
- Add debouncing / rate limiting if needed.
- Handle edge cases: multi-command lines, chained commands, terminals without shell integration.
- Add telemetry-free debugging logs (toggleable).
- Extend RISKS_AND_GUARDRAILS.md with concrete failure-mode mitigations.
- Ensure recursion protection for `renameWithArg` (ignore internal/printf/OSC-like commands, guard re-entrancy).
- Ensure correct terminal targeting: prefer `execution.terminal` and call `terminal.show(true)` before rename.
- Reaffirm command parsing security: never execute user commands; only rename.

Deliverables:
- docs/security_model.md
- Updated code (extension/extension.js, extension/title.js)
- CHECKPOINTS/090_hardening.md

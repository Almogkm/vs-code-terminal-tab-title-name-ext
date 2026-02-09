Hardening task.

Goals:
- Strengthen sanitization and escaping.
- Add debouncing / rate limiting.
- Handle edge cases: multi-command lines, chained commands, terminals without shell integration.
- Add telemetry-free debugging logs (toggleable).
- Extend RISKS_AND_GUARDRAILS.md with concrete failure-mode mitigations.

Deliverables:
- docs/security_model.md
- Updated code
- CHECKPOINTS/090_hardening.md
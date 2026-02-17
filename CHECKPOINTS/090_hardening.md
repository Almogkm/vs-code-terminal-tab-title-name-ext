# CHECKPOINTS/090_hardening.md

## Summary
- Strengthened title sanitization (control chars, BIDI removal, whitespace normalization, length cap).
- Added per-terminal rate limiting + duplicate suppression and improved re-entrancy guards.
- Added toggleable debug logging and improved handling of multi-command lines.
- Documented security model and updated guardrails with concrete failure mitigations.

## Files updated
- `extension/extension.js`
- `extension/title.js`
- `extension/package.json`
- `docs/security_model.md`
- `RISKS_AND_GUARDRAILS.md`
- `CHECKPOINTS/090_hardening.md`

## Notes / testing
- Tests not run (no harness). Recommended manual check:
  - Toggle `terminalTabTitles.debugLogging` and confirm debug logs appear.
  - Run `python3 script.py` and confirm rename.
  - Run `python3 a.py && python3 b.py` and confirm first command is used.
  - Run `printf '\033]2;X\007'` and confirm no rename.

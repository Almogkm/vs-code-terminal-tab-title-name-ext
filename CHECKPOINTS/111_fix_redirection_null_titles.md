# CHECKPOINTS/111_fix_redirection_null_titles.md

## Summary
- Stripped redirections from the command segment before parsing to avoid treating them as script arguments.
- Hardened parser to only accept file-like tokens for Python/Node (and R) script detection.
- Added guard to skip renames when parsed titles are invalid (e.g., `: null`).
- Updated test plan negative tests to cover redirection cases.

## Files updated
- `extension/extension.js`
- `extension/parser.js`
- `docs/test_plan.md`
- `CHECKPOINTS/111_fix_redirection_null_titles.md`

## How to test
1. Run `node -v 2>/dev/null || true` and confirm no rename occurs.
2. Run `python3 -V 2>/dev/null || true` and confirm no rename occurs.
3. Run `python3 some_script.py` and confirm temporary rename + revert works.
4. Verify debug logs show "start event ignored: invalid parsed title" for invalid cases.

## Expected logs (debugLogging=true)
- `start event ignored: invalid parsed title`
- `start event ignored: targetType not file`

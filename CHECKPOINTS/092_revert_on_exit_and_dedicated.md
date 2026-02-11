# CHECKPOINTS/092_revert_on_exit_and_dedicated.md

## Summary
- Implemented two-mode naming: temporary rename for run-file commands with revert on end, and dedicated terminals that never auto-rename.
- Added terminal baseline tracking on open and end-event handling for reverts.
- Added manual commands for temporary rename and revert, plus updated user docs.

## Files updated
- `extension/extension.js`
- `extension/package.json`
- `docs/user_setup.md`
- `CHECKPOINTS/092_revert_on_exit_and_dedicated.md`

## Test checklist
- User-started terminal:
  - Run `cd tools` => no rename.
  - Run `python3 missing.py` => temporary rename then revert to baseline after exit.
  - Run `python3 some_script.py` => temporary rename then revert after exit.
- Dedicated terminal ("Run Python File in Dedicated Terminal"):
  - Name stays `Python: original.py` even after `cd tools` and running other scripts.

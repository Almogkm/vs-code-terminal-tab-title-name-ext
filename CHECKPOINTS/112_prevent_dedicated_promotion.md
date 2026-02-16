# CHECKPOINTS/112_prevent_dedicated_promotion.md

## Reproduction
1. Open a user-started terminal.
2. Run `/bin/python3 /full/path/some_script.py`.
3. Observe terminal becomes fixed/dedicated (incorrect).

## Changes
- Dedicated classification is now **immutable** and based **only** on baseline name captured at terminal open (or one deferred capture if name was empty).
- Removed all reclassification paths based on runtime terminal name or command line heuristics.
- Dedicated enforcement now runs only when `isDedicatedPermanent` is true.
- Added debug logging for baseline capture and dedicated decision.

## Verification
1. User-started terminal: `/bin/python3 /full/path/some_script.py` temporarily renames then reverts; terminal does **not** become fixed.
2. Dedicated terminal (baseline name like `Python: foo.py`) remains fixed and enforced on start/end/name changes.
3. Debug logs show:
   - `baseline captured: "<name>"`
   - `dedicated? yes/no (reason: matched regex / no match)`

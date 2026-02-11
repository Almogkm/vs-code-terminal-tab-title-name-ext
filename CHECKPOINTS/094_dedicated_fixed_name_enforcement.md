# CHECKPOINTS/094_dedicated_fixed_name_enforcement.md

## Root cause
- Dedicated terminals can revert their name (e.g., back to `bash`) after execution because another extension resets the tab title.

## Summary
- Dedicated terminals now use a **fixed name** derived from the first run‑file execution and are **re‑enforced** on start/end/name changes.
- User‑started terminals keep temporary rename + revert behavior.

## Algorithm (dedicated detection)
- Mark dedicated if:
  - The initial terminal name matches editor‑owned patterns (e.g., `Python: foo.py`), **or**
  - First run‑file execution in a shell‑baseline terminal uses an **absolute interpreter path** and an **absolute script path**.
- When dedicated, compute `fixedName` once from the run‑file title format (e.g., `Python: file.py`).
- Enforce `fixedName` on execution start, execution end, and terminal name changes.

## Files updated
- `extension/extension.js`
- `docs/spec_terminal_naming.md`
- `docs/user_setup.md`
- `CHECKPOINTS/094_dedicated_fixed_name_enforcement.md`

## Tests
- Dedicated terminal created by “Run Python File in Dedicated Terminal”:
  - It may briefly show `bash`, but should end as `Python: original.py` and stay after exit.
  - Running commands in other terminals must not change it.
  - Running commands inside it must not change it.
- User‑started terminal:
  - `python3 some_script.py` => temporary rename then revert to baseline.

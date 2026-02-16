# Checkpoint 114 — Skip Transient Baseline Capture

## Reproduction
1. Open Extension Development Host (fresh window) and open the first terminal.
2. Run a run‑file command like `python3 other_script.py`.
3. Observe the terminal reverts to `python3` instead of the shell baseline (`bash`).

## Root Cause
`captureBaselineIfNeeded()` captured the first non‑empty terminal name it saw, which could be a transient process label like `python3` or `node`.

## Changes
- Added helpers to detect transient process names (e.g., `python`, `python3`, `node`, `R`, `Rscript`) and shell baselines (`bash`, `zsh`, `sh`, `fish`).
- Baseline capture now **skips transient names** unless the name matches a dedicated/editor‑owned pattern.
- Mode A revert now falls back to `bash` if no baseline is captured or if the captured baseline is transient.

## Verification Checklist
- **Mode A regression:** open a fresh terminal, run `python3 other_script.py` → title reverts to `bash`, not `python3`.
- **Dedicated detection:** editor‑owned terminals still detected by baseline regex or editor‑run heuristic.
- **Logs (debug enabled):**
  - `baseline capture skipped (transient): "python3"`
  - `baseline fallback applied: "bash"`

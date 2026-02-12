# Cross-Platform Notes (Linux‑first)

## Scope
- Implementation is **Linux-first** (Ubuntu + bash). Windows details are appendix-only.
- Renaming is done **only** via `workbench.action.terminal.renameWithArg`.
- No OSC/printf emission. No filesystem existence checks.

## Parsing coverage (current)
- **Python:** `python`, `python3`, `python -m module`, script files.
- **R:** `R`, `Rscript`, `R -f file.R`.
- **Shells:** `bash`, `sh`, `zsh` (script files only).
- **Node:** `node` / `nodejs` (script files only).
- **Pytest:** `pytest` or `python -m pytest` recognized; treated as **non‑file** targets for rename logic.

## Explicit decision: do not rename for `make`
- `make` targets are **not** treated as “run file” commands.
- Rationale: a make target isn’t necessarily a file, and renaming based on it is noisy and often misleading.
- In code this is enforced by renaming **only** when `parsed.targetType === "file"`.

## Script name extraction (Linux-first)
- Tokenization handles quotes and escaped spaces.
- Path extraction is **string‑only** (no filesystem checks).
- We use **basename only** for titles (e.g., `/home/me/foo/bar.py` → `bar.py`).
- Tilde and relative paths are preserved as strings but still yield correct basenames:
  - `~/src/app.py` → `app.py`
  - `./scripts/run.sh` → `run.sh`
- Multi‑command lines are truncated to the **first command segment** before parsing.

## Dedicated terminal detection (Linux-first)
- Dedicated terminals are detected conservatively via:
  - Editor‑owned initial names (e.g., `Python: file.py`), or
  - First run‑file execution with **absolute** interpreter path + **absolute** script path.
- When dedicated, we enforce a **fixed title** on start/end/name changes.

## Shell integration availability
- When shell execution events are unavailable, the extension logs and no‑ops.
- This avoids errors and preserves user terminal behavior.

---

## Appendix: Windows considerations (informational only)
- Absolute paths may be `C:\\...` and should still parse into basenames correctly.
- If future Windows support is needed, extend dedicated detection to treat `C:\\...` as absolute interpreter/script paths.

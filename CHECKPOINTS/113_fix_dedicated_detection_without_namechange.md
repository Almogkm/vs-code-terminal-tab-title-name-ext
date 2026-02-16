# Checkpoint 113 — Dedicated Detection Without Name Change Events

## Reproduction
1. Disable terminal name change events (current VS Code API does not expose them).
2. Run **“Run Python File in Dedicated Terminal.”**
3. Observe the terminal opens as `bash` (or empty) and later shows `Python: <file>`.
4. After the run, the title reverts to `bash` because the extension classified it as Mode A.

## Root Cause
Baseline capture happens too early (`bash` or empty) and there is no `onDidChangeTerminalName` event to observe the later dedicated rename. As a result, the terminal is misclassified as non‑dedicated and reverts on command end.

## Changes
- Track `openedAtMs` and `hasSeenAnyExecution` per terminal.
- Add a **narrow editor‑run detection** path on the **first** execution within ~3s of open:
  - run‑file command
  - active editor matches target (basename or full path)
  - baseline empty/`bash`
  - not temporarily renamed
- When detected, set `isDedicatedPermanent=true`, store `fixedName`, and apply it immediately (bypass rate limit).
- Prevent baseline capture from overwriting an already‑dedicated classification.

## Verification Checklist
- **Dedicated terminal:** “Run Python File in Dedicated Terminal” → title stabilizes as `Python: original.py` and stays fixed after exit.
- **Mode A regression:** In a user‑started terminal with a different active editor file, run `/bin/python3 /abs/path/script.py` → temporary rename then revert; terminal does **not** become dedicated.
- **Logs (debug enabled):**
  - `terminal opened: openedAtMs=... initial name=...`
  - `dedicated (editor-run) detected; fixedName="..." reason: active editor match`

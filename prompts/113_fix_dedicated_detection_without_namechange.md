Bugfix: dedicated terminals revert to bash because baselineName is captured as "bash" before VS Code applies the dedicated name.

Observed
- Terminals started via “Run Python File in Dedicated Terminal” often open with name "" or "bash" and later become "Python: <file>".
- In this environment `vscode.window.onDidChangeTerminalName` is not available (`terminal name change events available: no`), so we cannot detect the later rename event.
- Result: dedicated terminal is misclassified as non-dedicated and reverts to baseline "bash" on command end.

Goal
- Keep Mode A behavior unchanged.
- Keep “no promotion to dedicated due to temporary titles” invariant.
- Restore Mode B behavior: editor-owned/dedicated terminals keep a fixed title like `Python: original.py` and never revert.

Constraints
- JS/no-build only.
- Keep rename mechanism: `workbench.action.terminal.renameWithArg`.
- No OSC, no `${sequence}`, no printf title emission.
- No network.

Implementation requirements

A) Preserve the invariant: classification must NOT flip due to runtime renames
1) Keep baselineName capture + isDedicatedPermanent-from-baseline logic as-is for normal cases.
2) Mode A temporary rename to `Python: ...` MUST NOT cause a terminal to be treated as dedicated.

B) Add a narrow “editor-run dedicated” detection path (one-time, safe)
We need a way to detect dedicated terminals without relying on terminal.name becoming `Python: ...`.

Implement this:

1) Add per-terminal state fields (if missing):
- openedAtMs (set at onDidOpenTerminal)
- hasSeenAnyExecution (bool)
- fixedName (string|null)  // only meaningful for dedicated terminals
- isDedicatedPermanent (bool) // keep existing meaning: dedicated behavior enabled

2) In `onDidOpenTerminal`:
- set `openedAtMs = Date.now()`
- do NOT force baselineName to "bash" if empty; keep the existing deferred baseline capture behavior

3) In `renameTerminalForExecution(event)` BEFORE Mode A parsing decisions:
- If `state.isDedicatedPermanent` is already true -> keep existing enforcement and return.
- Otherwise, attempt to detect an editor-run dedicated terminal using ALL of the following conditions:
  a) `state.hasSeenAnyExecution === false`
  b) `Date.now() - state.openedAtMs <= 3000`  (very small window)
  c) The parsed command is a run-file command (`parsed.targetType === "file"`)
  d) The run-file target matches the currently active editor file basename OR full path:
     - If `vscode.window.activeTextEditor?.document?.uri?.fsPath` exists:
       - match either basename == parsed.primaryTarget
       - or fsPath endsWith the original script argument (when absolute paths are used)
  e) BaselineName at this time is empty or "bash" (i.e., we have NOT already captured a baseline that looks editor-owned)
  f) state.isTemporarilyRenamed is false (avoid classification based on our own rename)

- If ALL conditions pass:
  - Set `state.isDedicatedPermanent = true`
  - Set `state.fixedName = sanitizeTitle(parsed.title)`  (e.g., "Python: some_script.py")
  - Apply the fixedName immediately via renameWithArg (bypassRateLimit)
  - Log: `dedicated (editor-run) detected; fixedName="<...>" reason: active editor match`
  - IMPORTANT: do NOT revert on end for this terminal.

4) Mark `state.hasSeenAnyExecution = true` on first execution start event (always).

C) End-event logic
- In `handleExecutionEnd`:
  - If `state.isDedicatedPermanent === true` and `state.fixedName` exists:
    - enforce fixedName (as now) and DO NOT revert to baseline
  - Otherwise, keep Mode A revert behavior unchanged.

D) Logging
When `terminalTitles.debugLogging=true` log:
- terminal opened: openedAtMs, initial name
- baseline captured / deferred capture (existing)
- dedicated classification path used:
  - `dedicated? yes/no (baseline regex)` (existing)
  - `dedicated (editor-run) detected ...` (new)
- Ensure no spam: keep duplicate suppression patterns already used.

E) Update docs + tests
1) Update `docs/test_plan.md`:
- Add dedicated detection test:
  - Use “Run Python File in Dedicated Terminal”
  - Confirm title stays `Python: original.py` even after the run exits
- Add regression:
  - In a user-started terminal, run `/bin/python3 /abs/path/script.py` WITHOUT having that file as the active editor.
  - Expected: Mode A temporary rename + revert, NOT dedicated.
- Add note: “Dedicated terminals are detected either by baseline name at open OR by editor-run heuristic (active editor match within 3s of open).”

2) Write `CHECKPOINTS/113_fix_dedicated_detection_without_namechange.md` including:
- Repro steps
- Explanation why baseline-based detection fails when namechange events aren’t available
- Verification checklist

Deliverables
- Exact diffs
- Updated docs/test_plan.md
- CHECKPOINTS/113_fix_dedicated_detection_without_namechange.md

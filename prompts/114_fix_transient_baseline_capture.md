Bugfix: baselineName must not be captured from transient process names (e.g., "python3"), which causes Mode A to revert to the wrong baseline.

Observed
- In a user-started terminal (Mode A), the first terminal opened sometimes gets baseline deferred-captured as "python3" (or another transient process).
- Then, after a run-file rename (e.g. "Python: other_script.py"), revert goes to "python3" instead of "bash".
- Root cause: captureBaselineIfNeeded() locks baselineName on the first non-empty terminal.name it sees, and that may already be a transient VS Code process label.

Goal
- Mode A should revert to the shell baseline (typically "bash") — not to transient process labels like "python3", "node", "R", etc.
- Keep the “no promotion to dedicated from temporary renames” invariant.
- Keep the current dedicated detection approach (baseline-regex OR editor-run heuristic).

Constraints
- JS/no-build only.
- Keep rename mechanism: workbench.action.terminal.renameWithArg.
- No OSC, no ${sequence}, no printf title emission.
- No network.

Implementation requirements

1) Add explicit baseline capture policy
- Introduce helper(s) in extension/extension.js:
  - isTransientProcessName(name): true for names like "python", "python3", "node", "R", "Rscript", "pwsh", etc. (keep list small but include python/python3/node/R).
  - isShellBaselineName(name): true for shell baselines (at least: "bash", "zsh", "sh", "fish"). (You may keep it conservative and Linux-first.)

2) Change baseline capture behavior (critical)
- Baseline must be decided ONCE per terminal, but we must avoid capturing transient names.
- Modify captureBaselineIfNeeded(terminal, state, source) so that:
  a) If terminal.name is empty -> do nothing (as now).
  b) If terminal.name is transient (isTransientProcessName) AND it is NOT an editor-owned name (not matching dedicated regex like /^Python:\s+/ etc):
     - do NOT capture baseline yet (keep baselineCaptured=false).
     - log (debug only): `baseline capture skipped (transient): "<name>"`
  c) If terminal.name looks like an editor-owned/dedicated name (matches dedicated regex), allow capture (for baseline-based dedicated classification).
  d) If terminal.name looks like a shell baseline (bash/zsh/sh/fish), allow capture.

3) Ensure Mode A always has a usable baseline at revert time
- In handleExecutionEnd (Mode A path), if baseline is still not captured (baselineName empty):
  - fall back to "bash" (Linux-first) as baseline for revert, AND store it as baselineName + baselineCaptured=true.
  - log (debug): `baseline fallback applied: "bash"`

This guarantees we never “revert to python3” and never get stuck with missing baseline.

4) Keep dedicated enforcement rules intact
- Do not change:
  - “Mode A temporary renames must not trigger dedicated enforcement”
  - Dedicated mode must not be recomputed from runtime renamed titles
- Ensure editor-run dedicated detection still works.

5) Update docs/test_plan.md with a regression test
Add under Mode A:
- “Fresh EDH / first terminal baseline regression”
  - Open EDH, open the first terminal.
  - Run `python3 other_script.py`.
  - Expected: title becomes `Python: other_script.py` then reverts to `bash` (not `python3`).
  - Note: baseline capture must skip transient names like `python3`.

Deliverables
- Exact diffs
- CHECKPOINTS/114_fix_transient_baseline_capture.md with:
  - reproduction steps
  - explanation (why baseline became python3)
  - verification checklist

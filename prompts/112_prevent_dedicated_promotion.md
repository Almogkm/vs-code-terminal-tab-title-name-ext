Bugfix: prevent Mode A terminals from being promoted to “dedicated” after temporary renames.

Observed
- In a user-started terminal (Mode A), running `/bin/python3 /path/script.py` can cause the terminal to start behaving like dedicated (fixed/locked title).
- Root cause: the extension currently “promotes” a terminal to dedicated by inspecting `terminal.name` during later executions (after we temporarily renamed it), and/or by using the “editor-run” heuristic.

Goal
- Dedicated-vs-non-dedicated classification must be immutable and must be decided ONLY from the baseline name captured when the terminal is opened (or first seen), never from later names or later commands.

Requirements (must satisfy all)

1) Immutable classification based only on baseline name
- Add/confirm per-terminal state fields:
  - `baselineName` (string)
  - `isDedicatedPermanent` (boolean)
  - `fixedName` (string|null)  // only relevant when isDedicatedPermanent=true
  - keep existing fields for temporary renames / rate limiting

- Capture baseline EXACTLY ONCE:
  - Preferred: in `vscode.window.onDidOpenTerminal`, set `baselineName = terminal.name || ""` and mark baselineCaptured=true.
  - If `terminal.name` is empty at open:
    - allow ONE deferred fill-in: on first later event where `terminal.name` becomes non-empty AND baselineCaptured is false, set baselineName then and lock it.
    - after baseline is set, never change it again.

- Compute `isDedicatedPermanent` EXACTLY ONCE and ONLY from baselineName:
  - `isDedicatedPermanent = isDedicatedTerminalName(baselineName)`
  - `fixedName = sanitizeTitle(baselineName)` when dedicated.

- Critically: remove/disable ALL code paths that can flip non-dedicated → dedicated based on:
  - `event.terminal.name` (runtime name)
  - command line heuristics (`looksLikeEditorRun(...)`)
  - temporary titles
If any such code path remains for safety/back-compat, it MUST log a warning and do nothing.

2) Dedicated enforcement only when isDedicatedPermanent===true
- Enforcement must run only when `state.isDedicatedPermanent === true` and `state.fixedName` is set.
- Mode A temporary rename to `Python: ...` must NEVER trigger dedicated enforcement.

3) Mode A behavior unchanged
- Mode A: rename only for `parsed.targetType === "file"` and revert on end to `baselineName`.
- Ensure `/bin/python3 /abs/path/script.py` in Mode A behaves like any other run-file:
  - temporary rename to `Python: script.py`
  - revert to baseline after end
  - must NOT become fixed/dedicated

4) Logging (when terminalTitles.debugLogging=true)
- When baseline is captured/locked, log:
  - `baseline captured: "<baselineName>"`
  - `dedicated? yes/no (reason: matched regex / no match)`
- If baseline was empty at open and later filled once, log:
  - `baseline deferred capture: "<baselineName>"`
- If ANY attempt is made to “reclassify” using runtime name or command line, log:
  - `WARNING: reclassification attempt ignored` + short reason
(But best is to remove those paths entirely.)

5) Update docs/test_plan.md
- Add a regression test:
  - In a user-started terminal run: `/bin/python3 /full/path/some_script.py`
  - Expected: title temporarily renames then reverts; terminal does NOT become fixed/dedicated.
- Add a note: “Dedicated mode is determined only at terminal open from baseline name.”

Deliverables
- Exact diffs
- CHECKPOINTS/112_prevent_dedicated_promotion.md including:
  - reproduction steps
  - what changed
  - verification steps

Constraints
- JS/no-build only.
- Keep rename mechanism: `workbench.action.terminal.renameWithArg`.
- No OSC, no `${sequence}`, no printf title emission.
- No network.

Implement docs/spec_terminal_naming.md.

Constraints:
- JS/no-build only.
- Keep rename mechanism: workbench.action.terminal.renameWithArg.
- No OSC, no ${sequence}, no printf title emission.
- No network.

Implementation requirements:

1) Track terminal state
- Add a WeakMap<Terminal, State> in extension/extension.js
State fields:
  - baselineName (set once, from terminal.name when first seen/opened)
  - isDedicatedPermanent (decide once from baselineName regex)
  - isTemporarilyRenamed (bool)
  - lastTemporaryTitle (string|null)
  - lastRenameAtMs / rate limiting (reuse your existing rate limiting)
- Subscribe to vscode.window.onDidOpenTerminal to init baselineName early.

2) Rename on START (only when parsed.targetType === "file")
- In onDidStartTerminalShellExecution handler:
  - if terminal isDedicatedPermanent => do nothing
  - parse primary command segment as you already do
  - parseCommandLine(segment)
  - if parsed.targetType !== "file" => do nothing
  - else applyTitleToTerminal(terminal, sanitizeTitle(parsed.title))
  - mark isTemporarilyRenamed = true

3) Revert on END
- Subscribe to vscode.window.onDidEndTerminalShellExecution (if available).
- On end:
  - if terminal isDedicatedPermanent => do nothing
  - if isTemporarilyRenamed => rename back to baselineName (sanitized) and clear flag
  - revert regardless of exit status (success/failure)

4) Manual commands
- Keep existing debugInfo command.
- Keep renameActiveTerminalTest but:
  - make it TEMPORARY (sets isTemporarilyRenamed=true) OR provide both:
    a) "Terminal Tab Titles: Rename Active Terminal Temporary Test"
    b) "Terminal Tab Titles: Revert Active Terminal To Baseline"

5) Logging
- OutputChannel “Terminal Tab Titles”
- With terminalTabTitles.debugLogging=true:
  - log start/end events, whether rename happened, and whether revert happened
  - do not spam; keep duplicate suppression

6) Update docs + checkpoint
- Update docs/user_setup.md to reflect new behavior.
- Write CHECKPOINTS/092_revert_on_exit_and_dedicated.md with:
  - changed files
  - test checklist

Test checklist must include:
- user-started terminal:
  - cd tools => no rename
  - python3 missing.py => temporary rename then revert to baseline after exit
  - python3 some_script.py => temporary rename then revert after exit
- dedicated terminal ("Run Python File in Dedicated Terminal"):
  - name stays "Python: original.py" even after cd/tools and running other scripts

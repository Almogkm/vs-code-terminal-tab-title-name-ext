Spec alignment (no code changes yet).

Current truth:
- Extension is JS/no-build (extension/extension.js).
- It renames tabs via workbench.action.terminal.renameWithArg.
- parser.js returns: { kind, targetType, primaryTarget, title }.

Goal: two terminal modes.

Mode A — user-started terminals (dynamic + revert):
- Baseline tab name is whatever the terminal was initially named (usually "bash").
- Only rename when the command is clearly a "run file" event:
  - Use parser output: rename ONLY when parsed.targetType === "file".
  - Do NOT rename when parsed.kind === "other" (prevents "Command: cd", "Command: ls", etc).
- When a run-file command starts: rename to parsed.title (sanitized).
- When it ends: revert to baselineName, regardless of exit code.

Mode B — dedicated terminals created by editor run commands (permanent):
- If a terminal’s initial name already looks like an editor-owned label (e.g. "Python: something.py"),
  treat it as dedicated/permanent:
  - never auto-rename it
  - never auto-revert it
  - keep name stable forever unless user manually renames

Detection:
- Capture baselineName at terminal open time (vscode.window.onDidOpenTerminal).
- isDedicatedPermanent heuristic should be narrow, like:
  /^Python:\s+.+\.py\b/i, /^R:\s+.+\.r\b/i, /^Sh:\s+.+\.(sh|bash)\b/i, etc.

Deliverables (docs only):
- Update DECISIONS.md describing the two-mode behavior and why it supersedes “rename on start only”.
- Add docs/spec_terminal_naming.md with the above rules + detection heuristics.
- Update docs/user_setup.md to describe behavior (no ${sequence}, no OSC).
- CHECKPOINTS/091_spec_terminal_naming.md (spec + TODOs).

Constraint: do not modify extension code in this step.

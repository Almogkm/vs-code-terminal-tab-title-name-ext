# Terminal Naming Spec

## Overview
We support two terminal modes:
- **Mode A (user-started terminals):** dynamic rename on “run file” commands, revert afterward.
- **Mode B (dedicated/editor-owned terminals):** fixed title enforced on start/end/name changes.

This avoids noisy renames for generic commands (e.g., `cd`, `ls`) while preserving a stable label for dedicated terminals created by editor actions.

## Inputs and state
- **Inputs:** `execution.commandLine`, `execution.terminal`, parser output `{ kind, targetType, primaryTarget, title }`.
- **State per terminal:**
  - `baselineName` captured at `onDidOpenTerminal`.
  - `isDedicated` and `fixedName` (set once, then enforced).
  - `isTemporarilyRenamed` + `lastTemporaryTitle` for Mode A.

## Mode A — user-started terminals (dynamic + revert)
- **Trigger:** shell execution start (`onDidStartTerminalShellExecution`).
- **Rename condition:** only when `parsed.targetType === "file"`.
- **Exclude:** if `parsed.kind === "other"`, do not rename.
- **Action on start:** rename terminal to `sanitizeTitle(parsed.title)`.
- **Action on end:** revert to `baselineName` captured at open, regardless of exit code.

## Mode B — dedicated terminals (fixed title enforced)
- **Detection:** if a terminal’s **initial** name looks editor-owned (e.g., `Python: something.py`) **or** the first run‑file execution looks like an editor‑owned “dedicated terminal” launch (absolute interpreter + absolute script path, baseline is a shell name).
- **Behavior:** compute a `fixedName` once and **re-apply** it on execution start/end and terminal name changes. This keeps the title stable even if other extensions revert to `bash`.

## Detection heuristic (narrow)
The `isDedicated` check should be conservative. Examples:
- `/^Python:\s+.+\.py\b/i`
- `/^R:\s+.+\.r\b/i`
- `/^Sh:\s+.+\.(sh|bash)\b/i`
- `/^Bash:\s+.+\.(sh|bash)\b/i`
- `/^Node:\s+.+\.m?js\b/i`
- `/^Java:\s+.+\.java\b/i`

Dedicated “editor‑run” signal (conservative):
- Baseline name is a shell (e.g., `bash`).
- Command token is an **absolute** interpreter path (e.g., `/usr/bin/python3`).
- First non‑flag argument is an **absolute** script path with a matching extension.

## Fixed name derivation
- When a terminal becomes dedicated and `fixedName` is unset, derive:
  - `Python: <file.py>`
  - `R: <file.r>`
  - `Sh: <file.sh>` / `Sh: <file.bash>`
  - `Node: <file.js|mjs|cjs>`
  - `Java: <file.java>`

## Sanitization
- Always sanitize titles before rename (control chars, BIDI removal, whitespace normalization, length cap).
- Never execute or inject user command strings.

## Non-goals
- We do not try to infer project context or task names.
- We do not attempt to rename for non-file commands.
- We do not override user manual terminal renames.

## Open questions
- Best source of `baselineName` if terminal is renamed by the user after open.
- How to handle multi-command lines where a run-file command is not first.

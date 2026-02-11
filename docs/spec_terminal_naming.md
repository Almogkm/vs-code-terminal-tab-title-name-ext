# Terminal Naming Spec

## Overview
We support two terminal modes:
- **Mode A (user-started terminals):** dynamic rename on “run file” commands, revert afterward.
- **Mode B (dedicated/editor-owned terminals):** do not auto-rename or auto-revert.

This avoids noisy renames for generic commands (e.g., `cd`, `ls`) while preserving a stable label for dedicated terminals created by editor actions.

## Inputs and state
- **Inputs:** `execution.commandLine`, `execution.terminal`, parser output `{ kind, targetType, primaryTarget, title }`.
- **State per terminal:**
  - `baselineName` captured at `onDidOpenTerminal`.
  - `isDedicatedPermanent` computed from the initial name.

## Mode A — user-started terminals (dynamic + revert)
- **Trigger:** shell execution start (`onDidStartTerminalShellExecution`).
- **Rename condition:** only when `parsed.targetType === "file"`.
- **Exclude:** if `parsed.kind === "other"`, do not rename.
- **Action on start:** rename terminal to `sanitizeTitle(parsed.title)`.
- **Action on end:** revert to `baselineName` captured at open, regardless of exit code.

## Mode B — dedicated terminals (permanent)
- **Detection:** if a terminal’s **initial** name looks editor-owned (e.g., `Python: something.py`).
- **Behavior:** never auto-rename or auto-revert. The name remains stable unless the user manually renames it.

## Detection heuristic (narrow)
The `isDedicatedPermanent` check should be conservative. Examples:
- `/^Python:\s+.+\.py\b/i`
- `/^R:\s+.+\.r\b/i`
- `/^Sh:\s+.+\.(sh|bash)\b/i`
- `/^Bash:\s+.+\.(sh|bash)\b/i`
- `/^Node:\s+.+\.m?js\b/i`

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

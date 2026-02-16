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
- **Detection:** determined either from the baseline name captured at terminal open (or one deferred capture if the name was empty) **or** from a narrow editor‑run heuristic on the **first** execution within ~3s of open (active editor match + run‑file command + baseline empty/`bash`).
- **Behavior:** compute `fixedName` once and **re-apply** it on execution start/end and terminal name changes. This keeps the title stable even if other extensions revert to `bash`.

## Detection heuristic (narrow)
Baseline‑name match should be conservative. Examples:
- `/^Python:\s+.+\.py\b/i`
- `/^R:\s+.+\.r\b/i`
- `/^Sh:\s+.+\.(sh|bash)\b/i`
- `/^Bash:\s+.+\.(sh|bash)\b/i`
- `/^Node:\s+.+\.m?js\b/i`
- `/^Java:\s+.+\.java\b/i`

Editor‑run detection (only once, only within ~3s of open):
- First execution is a run‑file command (`parsed.targetType === "file"`).
- Active editor path matches the run target (basename or full path).
- Baseline name is empty or `bash`.
- Terminal is not temporarily renamed by us.

## Fixed name derivation
- If dedicated via baseline, `fixedName` is the sanitized baseline name.
- If dedicated via editor‑run detection, `fixedName` comes from the parsed title (basename‑only).

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

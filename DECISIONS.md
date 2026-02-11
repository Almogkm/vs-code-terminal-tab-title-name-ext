# DECISIONS.md

## Initial design hypotheses (historical)
1. Use terminal title sequences plus `${sequence}` to persist tab titles after command exit. **Superseded** by renameWithArg.
2. Detect command starts via terminal shell execution events.
3. Parse command lines deterministically with conservative rules.

## Cursor repo archeology findings (Feb 11, 2026)
1. Local open-source snapshots use xterm.js in the renderer and node-pty in the main process.
2. No evidence of terminal title handling (OSC sequences or xterm `onTitleChange`) appears in these repos.
3. Therefore, our design should rely on VS Code APIs rather than Cursor-specific behavior; current implementation uses `workbench.action.terminal.renameWithArg` (not OSC).

## Implementation note (Feb 11, 2026)
1. The extension currently uses a **no-build JavaScript entrypoint** at `extension/extension.js`.
2. TypeScript + npm tooling may be reintroduced later **only if needed**.

## Implementation change (Feb 11, 2026)
1. Switched from OSC/`${sequence}` title sequences to `workbench.action.terminal.renameWithArg` due to reliability and recursion issues.

## Two-mode terminal naming (Feb 11, 2026)
1. Introduce two behaviors:
   - **Mode A (user-started terminals):** rename **only** for run‑file commands (`parsed.targetType === "file"`), and **revert** to the baseline name on command end.
   - **Mode B (dedicated terminals):** if the initial terminal name already looks editor‑owned (e.g., `Python: foo.py`), treat it as permanent and never auto‑rename or auto‑revert.
2. This supersedes the earlier “rename on start only” behavior for all terminals.

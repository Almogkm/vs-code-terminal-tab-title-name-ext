# DECISIONS.md

## Initial design hypotheses
1. Use terminal title sequences plus `${sequence}` to persist tab titles after command exit.
2. Detect command starts via terminal shell execution events.
3. Parse command lines deterministically with conservative rules.

## Cursor repo archeology findings (Feb 11, 2026)
1. Local open-source snapshots use xterm.js in the renderer and node-pty in the main process.
2. No evidence of terminal title handling (OSC sequences or xterm `onTitleChange`) appears in these repos.
3. Therefore, our design should rely on VS Code APIs + OSC title sequences rather than Cursor-specific behavior.

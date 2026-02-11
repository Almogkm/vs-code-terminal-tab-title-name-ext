# Learning: Cursor Terminal Title Behavior (Local Repo Only)

## Scope
- Local archeology only (no web/docs used).
- Repos:
  - `Cursor/First upload`
  - `Cursor/Last available open source version`

## Repo state
- Both repos resolve to the same commit: `42e8a782677650a1a9f703f8b7fb9e730602f81f`.

## Searches run (exact commands)
- `rg -n --hidden --no-ignore-vcs "onTitleChange|OSC|\]0;|\]2;|set.*title|title.*sequence|xterm|node-pty|shellIntegration|PROMPT_COMMAND|PS1" "Cursor/First upload"`
- `rg -n --hidden --no-ignore-vcs "onTitleChange|OSC|\]0;|\]2;|set.*title|title.*sequence|xterm|node-pty|shellIntegration|PROMPT_COMMAND|PS1" "Cursor/Last available open source version"`

## Top candidate files inspected
- `Cursor/First upload/src/components/terminal.tsx`
- `Cursor/First upload/src/main/terminal.ts`
- `Cursor/Last available open source version/src/components/terminal.tsx`
- `Cursor/Last available open source version/src/main/terminal.ts`
- `Cursor/First upload/package.json`
- `Cursor/Last available open source version/package.json`

## Findings (relevant to terminal titles)

### Architecture observed
- Renderer uses **xterm.js** for terminal UI.
- Main process uses **node-pty** to spawn shells and pass data over IPC.

### Terminal title handling
- **No evidence** of terminal title handling was found in either repo:
  - No `onTitleChange` usage in xterm.
  - No OSC title sequence emission (`ESC ] 0/2 ;`).
  - No VS Code API usage (these are Electron apps, not VS Code extensions).

## Implications
- The open-source Cursor snapshots do not provide a reference implementation for terminal title naming.
- We should proceed with the VS Code extension approach (shell integration events + OSC title sequences).

## Unknowns
- Proprietary Cursor builds may include internal logic not present in these snapshots.

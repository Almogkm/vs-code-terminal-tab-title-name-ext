# Learning: Terminal Title Escape Sequences (Ubuntu/bash-first)

> **Status (historical):** This document reflects a prior design that used OSC title sequences and `${sequence}`. We no longer use OSC for tab titles; we now rename terminals via VS Code’s `workbench.action.terminal.renameWithArg`. The original content is preserved below for reference.

## Sources
- xterm control sequences (OSC syntax, BEL/ST terminators): https://www.invisible-island.net/xterm/ctlseqs/ctlseqs.html
- xterm.js supported sequences (OSC 0/2, BEL/ST): https://xtermjs.org/docs/api/vtfeatures/
- VS Code Terminal Appearance (`${sequence}`): https://code.visualstudio.com/docs/terminal/appearance
- Windows Console VT sequences (for cross-platform appendix): https://learn.microsoft.com/en-us/windows/console/console-virtual-terminal-sequences
- PowerShell title emission example (appendix): https://devblogs.microsoft.com/powershell-community/changing-console-title/

## What we will use (Ubuntu/bash) — historical
- **OSC 2** to set window title (primary sequence).
- **OSC 0** as a fallback (some terminals map 0 to icon+title).
- **Terminators**: prefer **ST** (`ESC \\`), allow **BEL** (`\x07`) fallback.

### Exact sequences
- **OSC 2**: `ESC ] 2 ; <title> ST` or `ESC ] 2 ; <title> BEL`
- **OSC 0**: `ESC ] 0 ; <title> ST` or `ESC ] 0 ; <title> BEL`

## Safe emission in bash (Ubuntu) — historical

### Recommended (printf + ST)
```bash
printf '\033]2;%s\033\\' "$title"
```

### BEL fallback
```bash
printf '\033]2;%s\007' "$title"
```

### Notes
- Use `printf` with `%s` to avoid `echo -e` portability issues and accidental escape expansion.
- Always pass the title as data via `%s`.

## Escaping and sanitization (Linux-specific) — historical
- Treat the title as untrusted input.
- Strip ASCII control characters (`< 0x20` and `0x7F`), especially ESC and BEL.
- Remove newlines, carriage returns, and tabs.
- Enforce a max length (<= 240 chars) to stay safe across terminals.
- Do **not** use command substitution, backticks, or `$'...'` with untrusted data.

## VS Code terminal tabs and `${sequence}` — historical
- VS Code can show the process-provided title by setting `terminal.integrated.tabs.title` to `${sequence}`.
- `${sequence}` is documented as “the name provided to the terminal by the process,” which corresponds to the title escape sequences emitted by the shell/app.
- Therefore, emitting OSC 2/0 from the terminal session is how we persist titles in tabs.

## Limitations / uncertainties — historical
- Competing title updates from child processes may overwrite our title; the last sequence wins.
- OSC 0 vs OSC 2 handling in VS Code is not documented; we assume both map to `${sequence}`.

---

## Cross-platform appendix (short) — historical

### PowerShell (Windows)
```powershell
$title = 'My Title'
Write-Host "$([char]0x1B)]2;$title$([char]0x7)"
```

### cmd.exe (Windows)
- `cmd.exe` can output ESC via `$e` in `PROMPT`.
- Practical one-off emission typically uses PowerShell from cmd.

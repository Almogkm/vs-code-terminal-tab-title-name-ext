# SKILLS.md

## Initial skills needed
- VS Code extension anatomy (activation events, contributes, commands)
- Terminal shell integration in VS Code (shell integration and execution events)
- OSC title sequences and `${sequence}` usage
- Deterministic command line parsing
- Secure-by-default coding practices

## Learned (so far)
- Terminal tab title/description variables and their meanings (including `${sequence}`, `${shellCommand}`, `${shellPromptInput}`)
- Shell integration capabilities, supported shells, and quality levels (None/Basic/Rich)
- OSC title sequences (OSC 0/2) and xterm.js title-change behavior
- Terminal shell execution events (`onDidStartTerminalShellExecution`, `onDidEndTerminalShellExecution`) and their data model
- Shell integration activation constraints and version availability signals (VS Code 1.93+)
- Safe emission patterns for OSC title sequences across bash/zsh, PowerShell, and Windows console constraints
- Ubuntu/bash-first OSC emission patterns and Linux-specific escaping constraints

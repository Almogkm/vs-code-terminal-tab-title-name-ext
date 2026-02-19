# SKILLS.md

This file is the high-level skills index for this repository.
Detailed skill instructions live under `./skills/`.

## Initial skills needed

- **VS Code extension anatomy**
  - Covers activation events, contributes, and commands.
  - File: [`skills/vscode-extension-anatomy/SKILL.md`](skills/vscode-extension-anatomy/SKILL.md)

- **Terminal shell integration in VS Code**
  - Covers shell integration behavior and execution-event usage.
  - File: [`skills/vscode-terminal-shell-integration/SKILL.md`](skills/vscode-terminal-shell-integration/SKILL.md)

- **Deterministic command line parsing**
  - Covers predictable parsing and stable command classification.
  - File: [`skills/deterministic-command-line-parsing/SKILL.md`](skills/deterministic-command-line-parsing/SKILL.md)

- **Secure-by-default coding practices**
  - Covers safe handling of command-derived data and defensive behavior.
  - File: [`skills/secure-by-default-coding/SKILL.md`](skills/secure-by-default-coding/SKILL.md)

- **VS Code terminal rename command usage** (`workbench.action.terminal.renameWithArg`)
  - Covers the active terminal renaming mechanism used by this extension.
  - File: [`skills/vscode-terminal-rename-command/SKILL.md`](skills/vscode-terminal-rename-command/SKILL.md)

## Learned (so far)

- **Terminal tab title/description variables and meanings** (`${sequence}`, `${shellCommand}`, `${shellPromptInput}`) — historical reference
  - Historical context for prior tab-title formatting explorations.
  - File: [`skills/terminal-tab-title-variables-historical/SKILL.md`](skills/terminal-tab-title-variables-historical/SKILL.md)

- **Shell integration capabilities and quality levels** (None/Basic/Rich)
  - Capability/quality-level awareness for command metadata behavior.
  - File: [`skills/shell-integration-capabilities/SKILL.md`](skills/shell-integration-capabilities/SKILL.md)

- **OSC title sequences (OSC 0/2) and xterm.js title-change behavior** — historical reference
  - Historical context for sequence-based title updates.
  - File: [`skills/osc-title-sequences-historical/SKILL.md`](skills/osc-title-sequences-historical/SKILL.md)

- **Terminal shell execution events** (`onDidStartTerminalShellExecution`, `onDidEndTerminalShellExecution`) and data model
  - Start/end execution event handling and metadata usage.
  - File: [`skills/terminal-shell-execution-events/SKILL.md`](skills/terminal-shell-execution-events/SKILL.md)

- **Shell integration activation constraints and version availability signals** (VS Code 1.93+)
  - Version/capability checks for shell-integration-dependent behavior.
  - File: [`skills/shell-integration-activation-vscode-193-plus/SKILL.md`](skills/shell-integration-activation-vscode-193-plus/SKILL.md)

- **Safe emission patterns for OSC title sequences** across bash/zsh, PowerShell, and Windows console constraints — historical reference
  - Historical cross-platform emission safety notes.
  - File: [`skills/osc-safe-emission-patterns-historical/SKILL.md`](skills/osc-safe-emission-patterns-historical/SKILL.md)

- **Ubuntu/bash-first OSC emission patterns and Linux-specific escaping constraints** — historical reference
  - Historical Linux-first OSC/escaping notes.
  - File: [`skills/ubuntu-bash-osc-escaping-historical/SKILL.md`](skills/ubuntu-bash-osc-escaping-historical/SKILL.md)

- **VS Code terminal rename command usage** (`workbench.action.terminal.renameWithArg`)
  - Reinforced learned usage of the active rename mechanism.
  - File: [`skills/vscode-terminal-rename-command/SKILL.md`](skills/vscode-terminal-rename-command/SKILL.md)

- **OutputChannel-based debugging for extension behavior**
  - Operational logging and diagnostics through VS Code OutputChannel.
  - File: [`skills/outputchannel-debugging/SKILL.md`](skills/outputchannel-debugging/SKILL.md)

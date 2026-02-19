---
name: vscode-terminal-rename-command
description: Terminal tab naming via workbench.action.terminal.renameWithArg with sanitized payloads. Use when applying, reverting, or validating terminal rename behavior.
---

# VS Code Terminal Rename Command Usage

## Purpose
This skill standardizes terminal title changes through VS Code’s rename command: `workbench.action.terminal.renameWithArg`. It reflects the current repository mechanism for tab-title behavior.

## When to Use
- When applying terminal tab title updates.
- When reverting temporary names back to baseline/default-like names.
- When validating rename behavior in Extension Development Host.

## Inputs
- Target `vscode.Terminal` instance.
- Sanitized title string.
- Rename command: `workbench.action.terminal.renameWithArg`.

## Outputs
- Terminal tab name changes applied through VS Code command API.
- Consistent rename behavior with current extension architecture.

## Procedure
1. Compute and sanitize the intended terminal name.
2. Ensure the target terminal context is correct.
3. Execute `workbench.action.terminal.renameWithArg` with `{ name: <title> }`.
4. Record/log rename decision for debugability.

## Constraints
- Must:
  - Use `workbench.action.terminal.renameWithArg` for terminal naming behavior.
  - Keep rename payload explicit and sanitized.
- Must Not:
  - Use OSC/sequence emission as the primary rename mechanism.
  - Pass undefined/missing rename payloads.
- Avoid:
  - Mixing multiple rename mechanisms in active runtime logic.

## Examples
- Example 1:
  - Context: A file-run command is detected.
  - Steps:
    - Compute `Python: script.py`.
    - Sanitize title.
    - Execute rename command for the execution terminal.
  - Expected result:
    - Terminal tab reflects parsed title.

## Verification
- Confirm rename command is invoked with expected payload.
- Confirm tab name changes in Extension Development Host.

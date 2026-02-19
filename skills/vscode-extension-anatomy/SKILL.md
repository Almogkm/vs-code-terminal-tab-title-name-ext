---
name: vscode-extension-anatomy
description: VS Code extension anatomy for this repository, including activation events, command contributions, and command registration alignment. Use when adding, changing, or validating extension commands and activation behavior.
---

# VS Code Extension Anatomy

## Purpose
This skill captures the core extension structure needed in this repo: activation events, command contributions, and command handlers. It helps keep extension changes aligned with how VS Code loads and exposes functionality.

## When to Use
- When adding or updating command registration.
- When modifying extension activation behavior.
- When checking that manifest contributions match runtime code.

## Inputs
- `extension/package.json`.
- `extension/extension.js`.
- Command IDs and titles used by the extension.

## Outputs
- Consistent activation events and command contributions.
- Matching runtime command registrations.
- Reduced extension-load/config mismatch risk.

## Procedure
1. Read `extension/package.json` for `activationEvents` and `contributes.commands`.
2. Confirm matching registrations in `extension/extension.js`.
3. Verify each command has a stable ID/title pair and callable handler.
4. Confirm activation assumptions still match current behavior.

## Constraints
- Must:
  - Keep activation events and command contributions consistent with runtime handlers.
  - Keep command IDs stable unless there is an explicit migration plan.
- Must Not:
  - Assume activation behavior without checking `extension/package.json`.
  - Leave commands contributed but unregistered in runtime code.
- Avoid:
  - Broad refactors when only manifest/runtime alignment is needed.

## Examples
- Example 1:
  - Context: A new command is added for terminal-title diagnostics.
  - Steps:
    - Add the command to `contributes.commands`.
    - Add `onCommand:<id>` activation.
    - Register the command in `extension/extension.js`.
  - Expected result:
    - Command appears in Command Palette and executes.

## Verification
- Check command is present in `extension/package.json` and registered in `extension/extension.js`.
- Launch Extension Development Host and run the command from the Command Palette.

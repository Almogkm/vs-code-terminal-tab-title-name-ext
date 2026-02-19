---
name: terminal-shell-execution-events
description: Use of terminal shell execution lifecycle events (onDidStartTerminalShellExecution/onDidEndTerminalShellExecution) and their metadata model. Use when implementing start/end-based rename or revert behavior.
---

# Terminal Shell Execution Events

## Purpose
This skill captures use of `onDidStartTerminalShellExecution` and `onDidEndTerminalShellExecution` and their execution metadata. It enables start/end-based terminal naming workflows.

## When to Use
- When implementing execution-start-driven title updates.
- When implementing execution-end revert/enforcement behavior.
- When debugging command metadata or event timing.

## Inputs
- Shell execution start/end events.
- Event payload fields (such as command line and execution status metadata).
- Per-terminal extension state.

## Outputs
- Start/end event-driven rename behavior.
- Predictable revert/enforcement flow tied to execution lifecycle.

## Procedure
1. Subscribe to start/end execution events if available.
2. Read execution metadata from the event payload.
3. Apply behavior only to the event terminal.
4. Handle missing event availability gracefully.

## Constraints
- Must:
  - Use start/end events as primary signal when available.
  - Scope actions to the terminal associated with the execution event.
- Must Not:
  - Assume these events exist in every VS Code environment.
  - Execute user commands as part of event handling.
- Avoid:
  - Cross-terminal side effects from active-terminal assumptions.

## Examples
- Example 1:
  - Context: A Python file-run command starts and ends.
  - Steps:
    - On start: parse command and apply temporary title.
    - On end: apply configured revert/enforcement behavior.
  - Expected result:
    - Lifecycle-aligned renaming with predictable cleanup.

## Verification
- Confirm start/end event logs appear when integration is available.
- Confirm behavior is tied to `execution.terminal`, not unrelated terminals.

---
name: vscode-terminal-shell-integration
description: Terminal shell integration behavior in VS Code, including execution-event availability and graceful fallback when integration is missing. Use when implementing or debugging shell-integration-dependent terminal behavior.
---

# VS Code Terminal Shell Integration

## Purpose
This skill tracks shell integration behavior in VS Code, especially execution-event availability and command metadata quality. It supports safe terminal-title logic that degrades gracefully when integration is unavailable.

## When to Use
- When relying on terminal command start/end events.
- When debugging missing command metadata from terminal executions.
- When documenting behavior differences across shells.

## Inputs
- VS Code terminal execution events and payloads.
- Shell integration state/availability in the running environment.
- Extension debug logs.

## Outputs
- Correct use of shell-integration-dependent features.
- Clear fallback behavior when integration is missing.
- Better diagnostics for event availability issues.

## Procedure
1. Detect whether shell execution events are available.
2. Use event payload metadata only when provided by shell integration.
3. Keep non-destructive fallback behavior when integration is missing.
4. Log capability state for debugging.

## Constraints
- Must:
  - Treat shell integration as a capability that may be absent.
  - Fail gracefully when command execution metadata is unavailable.
- Must Not:
  - Assume shell integration exists in every terminal/session.
  - Execute user command strings to recover missing metadata.
- Avoid:
  - Hidden fallback paths that change behavior without logging.

## Examples
- Example 1:
  - Context: A terminal does not emit shell execution start events.
  - Steps:
    - Detect missing event capability.
    - Skip rename automation for that terminal.
    - Emit a clear debug log line.
  - Expected result:
    - No crash, no unsafe behavior, clear operator signal.

## Verification
- Check logs for capability detection lines.
- Confirm extension remains stable when shell integration is disabled/unavailable.

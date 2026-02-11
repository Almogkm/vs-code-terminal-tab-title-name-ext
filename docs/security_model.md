# Security Model

## Scope
This extension observes terminal shell execution events and renames the terminal tab based on a parsed command line. It does **not** execute commands, alter files, or change VS Code settings.

## Trust boundaries
- **Untrusted input:** `execution.commandLine` from the integrated terminal.
- **Trusted actions:** VS Code API calls (`workbench.action.terminal.renameWithArg`).

## Invariants (non-negotiables)
- Never execute or evaluate user-provided command strings.
- Never send data back into the terminal (no OSC/printf emission).
- Always sanitize titles before renaming.
- Degrade gracefully if shell integration/events are unavailable.

## Sanitization strategy
- Remove control characters (C0/C1), including ESC and newlines.
- Remove bidirectional (BIDI) control characters.
- Collapse whitespace and trim.
- Enforce a conservative max length (120 chars).

## Rate limiting and recursion protection
- Per-terminal rate limit prevents rapid repeat renames.
- Duplicate title suppression avoids repeated renames to the same title.
- Internal/OSC-like commands are ignored to avoid loops.
- Renames are guarded with a short re-entrancy window.

## Logging
- Debug logging is **toggleable** via `terminalTitles.debugLogging`.
- Logs are local-only (OutputChannel), no telemetry.

## Failure modes and safe behavior
- Missing shell integration: log and no-op.
- Missing command line data: skip rename.
- Rename command failure: catch and log without crashing.
- Ambiguous command lines: truncate to the first command segment.

## Known limitations
- Parsing is conservative and may not capture complex wrappers or nested shells.
- Some commands (e.g., `bash -c`) intentionally resolve to a generic title.

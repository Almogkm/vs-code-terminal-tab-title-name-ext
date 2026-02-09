# RISKS_AND_GUARDRAILS.md

## Non-negotiable guardrails
- Do not delete, modify, or move user files.
- Do not run network requests.
- Do not execute or evaluate user-provided command strings.
- Do not inject arbitrary shell code. If we send anything to a terminal, it must be a fixed template that **only** prints a title escape sequence, with the title string strictly sanitized.
- Never change VS Code user settings automatically without explicit user action. If a setting is required (e.g., tabs title), document it.

## Security model (high-level)
- The extension observes terminal executions and derives a label.
- It emits a terminal title escape sequence to set the terminal title.
- It must treat the observed command line as untrusted input.

## Input sanitization requirements (must implement)
- Strip all control characters (ASCII < 0x20 and 0x7F), including ESC.
- Strip newlines, carriage returns, tabs.
- Enforce max length (e.g., 120 chars).
- Replace path separators in display name only if needed (keep basename).
- Never include unescaped quotes in shell strings; prefer emitting the OSC sequence in a way that avoids shell interpolation pitfalls.

## Failure handling
- If shell integration is off or events missing: do nothing, log (debug-only).
- If parsing fails: do not change title.
- If terminal is disposed mid-event: ignore.

## Rollback
- Provide an enable/disable setting.
- Document uninstall steps.

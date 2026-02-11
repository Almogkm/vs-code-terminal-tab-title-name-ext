# CHECKPOINTS/020_shell_execution_events.md

## Summary
- Confirmed the stable APIs for detecting terminal command execution: `window.onDidStartTerminalShellExecution` and `window.onDidEndTerminalShellExecution`, which only fire when shell integration is active.
- Documented the data available from `TerminalShellExecution` (commandLine with confidence/trust, cwd) and `TerminalShellExecutionEndEvent` (exitCode with possible `undefined` cases).
- Found the earliest stable-release reference to the shell integration API in VS Code 1.93 release notes.
- Captured shell integration prerequisites: supported shells, enable/disable setting, and quality levels.

## Implications for our design
- We should gate command detection on `terminal.shellIntegration` and `onDidChangeTerminalShellIntegration` and handle the non-activation case gracefully.
- For minimum engine version, target VS Code >= 1.93 unless we find earlier evidence in `vscode.d.ts` history.
- Any fallback strategy without shell integration will be limited; an extension-managed terminal (Pseudoterminal) is viable only for extension-initiated commands.

## Open questions
- Do the start/end events exist in stable builds earlier than 1.93?
- How reliable is `commandLine` confidence across shells and prompt frameworks in real-world usage?
- Does “Run Python File in Dedicated Terminal” reliably trigger shell execution events in all supported shells?

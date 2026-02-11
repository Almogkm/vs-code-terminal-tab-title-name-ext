# Learning: VS Code Terminal Shell Execution Events

## Sources
- VS Code API reference: https://code.visualstudio.com/api/references/vscode-api/
- VS Code Terminal Shell Integration docs: https://code.visualstudio.com/docs/terminal/shell-integration
- VS Code August 2024 (1.93) release notes: https://code.visualstudio.com/updates/v1_93
- Python in VS Code June 2023 release blog (Dedicated Terminal): https://devblogs.microsoft.com/python/python-in-visual-studio-code-june-2023-release/

## Key quotes (short)
> "This will be fired when a terminal command is started. This event will fire only when shell integration is activated." (VS Code API)

> "The terminal shell integration API is now available to use." (VS Code 1.93 release notes)

> "Supported shells: Linux/macOS: bash, fish, pwsh, zsh; Windows: Git Bash, pwsh." (Shell Integration docs)

> "The Python extension will now create a new terminal for each file you run ... and will keep using this file’s dedicated terminal." (Python extension blog)

## Verified: Best available APIs for detecting command start/end + command line
- `window.onDidStartTerminalShellExecution` and `window.onDidEndTerminalShellExecution` exist in the stable API and fire only when shell integration is active.
- The terminal shell integration API is available to use as of VS Code 1.93 (August 2024 release notes).
- `Terminal.shellIntegration` is the entry point for shell integration features and can remain `undefined` if shell integration never activates (unsupported shell or conflicting setup). Listen to `window.onDidChangeTerminalShellIntegration` to know when it activates.

## Verified: Data available from the events
- `TerminalShellExecution.commandLine` provides the executed command line, and its confidence depends on shell integration. The value can become more accurate after the end event fires.
- `TerminalShellExecution.commandLine` exposes `value`, `confidence`, and `isTrusted`. High confidence means the command was explicitly reported by shell integration or executed via `TerminalShellIntegration.executeCommand`.
- `TerminalShellExecution.cwd` provides the working directory reported by the shell when the command executed; this requires shell integration support for cwd reporting.
- `TerminalShellExecutionEndEvent.exitCode` provides the shell-reported exit code. It can be `undefined` for several reasons (misbehaving script, subshell, Ctrl+C, empty command).

## Verified: Shell integration prerequisites and reliability
- Shell integration provides command detection and working directory detection; it’s enabled via automatic script injection by default and can be disabled with `terminal.integrated.shellIntegration.enabled = false`.
- Supported shells are listed in the shell integration docs (Linux/macOS: bash, fish, pwsh, zsh; Windows: Git Bash, pwsh).
- Shell integration quality levels exist: None, Rich, Basic. Basic may only detect command location without exit status.

## Version requirement (best available evidence)
- The shell integration API (including these events) is described as “now available to use” in VS Code 1.93 release notes (August 2024). This is the earliest stable-release reference found.

### Uncertain / needs validation
- Whether the events existed in stable builds earlier than 1.93 (no `@since` tags found in public docs).
- Exact behavior differences between 1.93–current versions (needs checking in `vscode.d.ts` across versions).

## Alternatives if events are unavailable

### Verified constraints
- If `terminal.shellIntegration` never activates, the start/end events will not fire.

### Options (partial or opt-in)
- **Custom terminal profile / Pseudoterminal (extension-managed):** A Pseudoterminal lets an extension control a terminal instance. This can be used to run commands the extension initiates and track them directly.
- **Manual shell integration setup:** The docs note automatic injection does not work for some advanced cases and suggest manual installation for those scenarios. This can enable shell integration (and events) in otherwise unsupported setups.

### Uncertain / not verified
- Heuristic parsing of terminal output without shell integration is not supported by a stable API; if attempted, it would be best-effort only and likely fragile.

## Interaction with “Run Python File in Dedicated Terminal”

### Verified
- The Python extension creates a new terminal for each file run and reuses that dedicated terminal on subsequent runs, and exposes “Run Python File in Dedicated Terminal.”

### Inference (needs validation)
- Because this feature uses integrated terminals, shell integration events should fire for those runs when shell integration is active in that terminal. This must be validated in VS Code + Python extension in practice.

Learning task: Identify the best available VS Code extension APIs to detect when a terminal starts executing a command and what that command is.

Goals:
- Determine if window.onDidStartTerminalShellExecution and window.onDidEndTerminalShellExecution exist, their stability, required VS Code version, and what data they provide (commandLine, cwd, exit code).
- If unavailable, find alternative event sources (e.g., custom shell integration scripts, heuristics, or pseudo-terminal).
- Determine how this interacts with “Run Python File in Dedicated Terminal”.

Deliverables:
- docs/learning_vscode_shell_execution_events.md
- CHECKPOINTS/020_shell_execution_events.md
- Update SKILLS.md

Do not code yet.
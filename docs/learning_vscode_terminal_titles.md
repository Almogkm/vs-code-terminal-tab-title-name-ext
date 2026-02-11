# Learning: VS Code Terminal Tab Titles & Variables

> **Status (partially historical):** The `${sequence}` focus below reflects a prior design that used OSC title sequences. We now rename terminals via VS Code’s `workbench.action.terminal.renameWithArg`. Content is preserved for reference.

## Sources
- VS Code Terminal Appearance: https://code.visualstudio.com/docs/terminal/appearance
- VS Code Terminal Shell Integration: https://code.visualstudio.com/docs/terminal/shell-integration
- xterm.js Supported Terminal Sequences (OSC title behavior context): https://xtermjs.org/docs/api/vtfeatures/
- xterm.js Terminal.onTitleChange: https://xtermjs.org/docs/api/terminal/interfaces/iterminal/#ontitlechange

## Key quotes (short)
> "Other terminals often display the escape sequence sent by the shell as the title." (VS Code Terminal Appearance)

> "${sequence}: the name provided to the terminal by the process." (VS Code Terminal Appearance)

> "This additional information enables some useful features such as working directory detection and command detection." (VS Code Terminal Shell Integration)

## Verified: Settings and variables for tab titles/description

### Tab title and description settings
- `terminal.integrated.tabs.title`: tab title text.
- `terminal.integrated.tabs.description`: text to the right of the title.
- `terminal.integrated.tabs.separator`: separator between title and description.
- Default title shows the shell's detected process name.
- You can set the title to `${sequence}` to show the title escape sequence sent by the shell.

### Variables available in `terminal.integrated.tabs.title` and `.description`
- `${cwd}`: terminal current working directory.
- `${cwdFolder}`: current working directory (multi-root or when different from initial). On Windows, only shown when shell integration is enabled.
- `${workspaceFolder}`: workspace where the terminal was launched.
- `${workspaceFolderName}`: name of the workspace where the terminal was launched.
- `${local}`: indicates a local terminal in a remote workspace.
- `${process}`: name of the terminal process.
- `${progress}`: progress state reported by OSC `9;4`.
- `${separator}`: conditional separator shown only when surrounded by variables with values or static text.
- `${sequence}`: name provided to the terminal by the process.
- `${task}`: indicates the terminal is associated with a task.
- `${shellType}`: detected shell type.
- `${shellCommand}`: command being executed per shell integration; requires high confidence and may not work in some prompt frameworks.
- `${shellPromptInput}`: shell's full prompt input per shell integration.

## Verified: Shell integration effects on command detection and metadata
- Shell integration lets the terminal understand what's happening inside the shell and enables working directory detection and command detection (plus decorations and navigation).
- Supported shells: bash, fish, pwsh, zsh (Linux/macOS); Git Bash, pwsh (Windows).
- Shell integration can be disabled with `terminal.integrated.shellIntegration.enabled = false`.
- Shell integration quality levels exist: None, Rich, Basic. Basic can have limited command detection (for example, detecting command location but not exit status).

## Verified: What `${sequence}` is and how it behaves
- `${sequence}` is the "name provided to the terminal by the process." It reflects the title escape sequence sent by the shell when configured to use `${sequence}`.
- Setting the tab title to `${sequence}` will show the shell/app-provided title sequence in the tab.

### Inference (needs validation in VS Code)
- The title escape sequence is typically OSC 0/2 (set window title). xterm.js supports OSC 0/2 and exposes title changes via `Terminal.onTitleChange`.
- Therefore, when a shell/app emits OSC title sequences, `${sequence}` should reflect the most recent title string and persist if the setting uses `${sequence}`.

## Limitations

### Documented
- Only the listed variables are supported for tab title/description templates.
- `${separator}` is the only built-in conditional behavior.
- `${shellCommand}` can fail in some prompt frameworks and requires high confidence in detected command lines.

### Inferred (from the variable model)
- No conditional templating beyond `${separator}`.
- No built-in basename/path transforms, regex, or string formatting functions.
- No documented truncation controls beyond whatever the UI applies.

## Uncertain / needs validation
- Exact mapping of `${sequence}` to OSC 0 vs OSC 2 in VS Code (and whether both are treated the same).
- Precedence when both shell and child processes emit title sequences.
- Reliability of `${shellCommand}` across shells and prompt frameworks in real-world setups.
- `${shellPromptInput}` behavior during multiline prompts or interactive input.

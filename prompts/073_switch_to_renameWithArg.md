We will STOP using OSC/printf title sequences. They are not reflected in VS Code terminal tabs reliably even with terminal.integrated.tabs.title="${sequence}", and they create recursion/spam.

Implement Cursor-like terminal tab titles by renaming the terminal via VS Code command:
  vscode.commands.executeCommand('workbench.action.terminal.renameWithArg', { name: '<TITLE>' })

Requirements:
1) Remove/disable all OSC/printf-based title emission (do not send printf to the terminal at all).
2) In the onDidStartTerminalShellExecution handler:
   - compute parsedTitle exactly as before (Python/R/bash rules)
   - rename the terminal tab to parsedTitle by calling:
       await vscode.commands.executeCommand('workbench.action.terminal.renameWithArg', { name: parsedTitle })
   - ensure the correct terminal is targeted:
       - call execution.terminal.show(true) before rename (preserve focus)
3) Add a manual command "Terminal Tab Titles: Rename Active Terminal Test" that renames active terminal to "Python: calculate_TVA_single.py" using renameWithArg.
4) Add robust anti-loop logic:
   - ignore any commandLine that starts with "printf " or matches OSC-title patterns, so user running printf won’t cause "Command: printf" spam.
   - Also ignore our own test command so it doesn’t immediately re-trigger renames if events fire.
5) Update docs/user_setup.md:
   - Remove "${sequence}" requirement.
   - State that the extension renames the terminal tab directly; no VS Code settings required.
6) Add CHECKPOINTS/073_switch_to_renameWithArg.md:
   - root cause (OSC/sequence unreliable)
   - what changed
   - test checklist

Constraints:
- JS/no-build only.
- No npm/tsc.
- No network.
- Do not modify user settings automatically.

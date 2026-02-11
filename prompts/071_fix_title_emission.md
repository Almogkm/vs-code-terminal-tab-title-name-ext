Historical note: This prompt addressed OSC/printf title emission, which is no longer used. Current implementation uses terminal rename via `workbench.action.terminal.renameWithArg`.

MVP does not work. Root cause: we are sending OSC sequences via terminal.sendText(sequence), which goes to shell stdin and does not set the terminal title. Fix by printing OSC from the shell using printf.

Requirements:
1) Modify extension/title.js:
   - sanitizeTitle must also remove ESC and newlines; max 120 chars.
   - Add a function escapeForSingleQuotes(s) to safely embed title in a single-quoted shell string.
   - Implement sendTitleToTerminal(terminal, title) to run a harmless printf that outputs OSC 2 with BEL terminator:
     printf '\033]2;%s\007' '<title>'
     Use: terminal.sendText(cmd, true) so it executes immediately.
   - Do NOT use the ST terminator; use BEL for compatibility.

2) Add a new command:
   - id: terminalTitles.setTitleTest
   - title: "Terminal Titles: Set Title Test"
   - behavior: sets active terminal title to "Python: calculate_TVA_single.py"
   - log success/failure

3) Add an OutputChannel "Terminal Titles" and log:
   - activation
   - whether onDidStartTerminalShellExecution exists
   - when an execution starts: log the commandLine and the parsed title
   - when title is applied: log the exact final sanitized title (not the printf command)

4) Keep existing auto behavior (onDidStartTerminalShellExecution) but:
   - if the API doesn’t exist, log a clear message to OutputChannel (not only console)

5) Update docs/user_setup.md:
   - explicitly say settings must be applied in the Extension Development Host to test
   - include the 2-step test:
     a) run "Set Title Test" to validate OSC+${sequence}
     b) run python3 some_script.py to validate execution detection

6) Write CHECKPOINTS/071_fix_title_emission.md with root cause + changes + test checklist.

Constraints:
- JS/no-build only. No npm, no tsc, no out/.
- No network.
- Don’t modify user settings automatically.

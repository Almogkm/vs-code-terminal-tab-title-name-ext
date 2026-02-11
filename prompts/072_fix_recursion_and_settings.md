Historical note: This prompt addressed OSC/printf recursion. Current implementation uses terminal rename via `workbench.action.terminal.renameWithArg`.

We have an infinite loop: onDidStartTerminalShellExecution fires for the `printf` command we send to set the title, so we keep re-applying title forever. Also, the user’s terminal tab title is set to ${process} so it stays "bash".

Fix requirements:
1) Add a re-entrancy guard so internal title-setting commands DO NOT trigger title parsing/applying:
   - Implement a module-level boolean `isApplyingTitle` OR a Set keyed by terminal id.
   - In onDidStartTerminalShellExecution handler:
     - if isApplyingTitle is true, ignore the event (and log one line: ignored internal title command).
     - additionally ignore any commandLine matching /^printf\s+'\\033\]2;/
2) In sendTitleToTerminal:
   - set isApplyingTitle=true before terminal.sendText(...)
   - use try/finally and clear isApplyingTitle shortly after sendText (setTimeout 0–50ms) to allow VS Code to schedule the command.
3) Ensure we do NOT parse our own printf command into "Command: printf".
4) Update docs/user_setup.md:
   - In Extension Development Host, set terminal.integrated.tabs.title = "${sequence}" (not ${process})
   - Provide exact steps to open User Settings (JSON) even with no folder open.
5) Add CHECKPOINTS/072_fix_recursion_and_settings.md with root cause + test plan.

Constraints:
- Keep JS/no-build.
- Keep using printf emission for OSC title (no direct OSC send).
- No settings auto-modification.

# User Setup (Extension Development Host)

## Settings
- No VS Code settings are required. The extension renames terminal tabs directly.

## Extension setting
- `terminalTabTitles.enabled` (boolean, default `true`): enable/disable title updates.
- `terminalTabTitles.debugLogging` (boolean, default `false`): verbose logs in the Output panel.

## Behavior summary
- **User-started terminals:** only rename when a command runs a file (e.g., `python3 my_script.py`), then revert to the terminal’s original name after it ends.
- **Dedicated editor terminals:** if the terminal starts with an editor‑owned name (e.g., `Python: my_script.py`), it becomes dedicated and the extension enforces a fixed title on start/end/name changes.

## Test steps
1) F5 to launch the Extension Development Host.
2) Open or focus an integrated terminal.
3) Run **"Terminal Tab Titles: Rename Active Terminal Temporary Test"**.
4) Run **"Terminal Tab Titles: Revert Active Terminal To Baseline"**.
5) Run `python3 some_script.py` and confirm title updates to `Python: some_script.py`, then reverts after exit.
6) Check the **Output** panel → **Terminal Tab Titles** for logs.

## Notes
- The extension uses VS Code’s terminal rename command; it does not send OSC/printf sequences.
- If shell integration is unavailable, no title updates will be performed.

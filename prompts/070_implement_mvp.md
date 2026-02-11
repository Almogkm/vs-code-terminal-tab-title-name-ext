Coding task: MVP — set terminal title based on executed command.

Goals:
- Subscribe to terminal shell execution start events (or best available alternative).
- For each execution:
  - read execution.commandLine
  - parse it using `extension/parser.js` (ported from `src/parser.ts`)
  - compute a safe title string
  - rename the terminal via `workbench.action.terminal.renameWithArg`
- Provide a configuration setting to enable/disable behavior.
- Add docs/user_setup.md (no VS Code settings required; shell integration still required).

Deliverables:
- extension/extension.js updated
- extension/title.js (sanitization + emitters)
- docs/user_setup.md
- CHECKPOINTS/070_mvp_title_setting.md

Constraints:
- Must not execute any part of the user command.
- Must sanitize title contents to avoid control characters and injection.
- Must fail gracefully if shell integration/events aren’t available.

Coding task: MVP — set terminal title based on executed command.

Goals:
- Subscribe to terminal shell execution start events (or best available alternative).
- For each execution:
  - read execution.commandLine
  - parse it using parser.ts
  - compute a safe title string
  - emit an OSC title sequence into the same terminal so VS Code can display it via ${sequence}
- Provide a configuration setting to enable/disable behavior.
- Add docs/user_setup.md that tells the user what setting to apply for tab titles (likely ${sequence}) and how to enable shell integration.

Deliverables:
- extension/src/extension.ts updated
- extension/src/title.ts (sanitization + emitters)
- docs/user_setup.md
- CHECKPOINTS/070_mvp_title_setting.md

Constraints:
- Must not execute any part of the user command.
- Must sanitize title contents to avoid control characters and injection.
- Must fail gracefully if shell integration/events aren’t available.
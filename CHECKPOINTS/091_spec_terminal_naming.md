# CHECKPOINTS/091_spec_terminal_naming.md

## Summary
- Defined two terminal modes:
  - Mode A (user-started): rename only for run-file commands and revert to baseline on end.
  - Mode B (dedicated/editor-owned): detect via initial name heuristic and never auto-rename/revert.
- Documented narrow dedicated-terminal detection regexes and state tracking requirements.

## Files updated
- `DECISIONS.md`
- `docs/spec_terminal_naming.md`
- `docs/user_setup.md`
- `CHECKPOINTS/091_spec_terminal_naming.md`

## TODOs / open questions
- Determine how to handle user manual renames after baseline capture.
- Decide how to treat multi-command lines where the run-file command is not first.
- Confirm reliable availability of terminal name at `onDidOpenTerminal`.

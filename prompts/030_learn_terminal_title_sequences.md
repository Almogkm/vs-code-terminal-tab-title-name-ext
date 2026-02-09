Learning task: Terminal title escape sequences.

Goals:
- Learn OSC sequences to set terminal title (OSC 0 / OSC 2) and their syntax.
- Determine safest ways to emit them from bash/zsh, PowerShell, cmd.
- Decide escaping strategy for arbitrary titles: prevent control chars, newlines, and shell injection.
- Understand how VS Code uses title sequences for ${sequence}.

Deliverables:
- docs/learning_terminal_title_sequences.md
- CHECKPOINTS/030_terminal_title_sequences.md
- Update RISKS_AND_GUARDRAILS.md with title-escape-specific guardrails.
- Update SKILLS.md if needed.

Do not code yet.
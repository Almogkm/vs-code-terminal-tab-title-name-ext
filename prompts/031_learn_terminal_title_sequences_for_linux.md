You wrote learning_terminal_title_sequences.md with a Windows-first bias (lots of PowerShell/cmd sources; no Linux/Ubuntu focus). My OS is Ubuntu 22.04.5 LTS and my primary shell is bash.

Please revise learning_terminal_title_sequences.md and CHECKPOINTS/030_terminal_title_sequences.md so they:
1) Are Ubuntu/bash-first.
2) Still include a short cross-platform appendix (PowerShell/cmd) but not as the main content.
3) Explicitly document the exact OSC sequences we will use (OSC 0 and/or OSC 2), their terminators (BEL vs ST), and safe emission in bash.
4) Explain how this interacts with VS Code terminal tabs and ${sequence}.
5) Update RISKS_AND_GUARDRAILS.md with Linux-relevant injection/escaping concerns for title setting.
6) Update SKILLS.md if you learned anything new.

Keep docs short (1–2 pages max) and focus on what we need to implement the extension safely.

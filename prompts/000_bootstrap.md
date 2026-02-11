You are an engineering agent. Create a new repository skeleton for a VS Code extension project to persistently set terminal tab titles based on executed commands (Cursor-like). 

Requirements:
- Create README.md, SKILLS.md, DECISIONS.md, RISKS_AND_GUARDRAILS.md, EVALS.md, TODO.md (optional), docs/ and CHECKPOINTS/ folders, prompts/ folder.
- In SKILLS.md: list initial skills you will need (VS Code extension anatomy, terminal shell integration, terminal rename via `workbench.action.terminal.renameWithArg`, parsing command lines, secure-by-default coding).
- In RISKS_AND_GUARDRAILS.md: write explicit non-negotiables (no destructive ops, no executing user strings, safe escaping, degrade gracefully if shell integration missing).
- In DECISIONS.md: record initial design hypotheses (use terminal rename via `workbench.action.terminal.renameWithArg`; detect command starts with terminal shell execution events; parse command line deterministically).
- Write CHECKPOINTS/000_bootstrap.md summarizing created structure and what is still unknown.

Output only the created file contents (as markdown sections) and the file tree.

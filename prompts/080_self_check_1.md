Self-check checkpoint (adapted to current repo state).

Actions:
1) Re-read docs/learning_*.md and docs/parsing_rules.md (if it exists).
2) Re-read all extension/*.js (and extension/**.js if there are subfolders).
   - Also scan extension/package.json and extension/.vscode/launch.json for consistency.
3) Verify that implementation matches DECISIONS.md and RISKS_AND_GUARDRAILS.md:
   - We are using terminal rename via VS Code command (renameWithArg), not OSC/${sequence}.
   - We do not execute user commands.
   - We have anti-loop/ignore rules for printf/OSC patterns.
4) List TODOs/risks/unknowns (include anything about shell integration/event availability, terminal targeting, parsing edge cases).
5) Update SKILLS.md with new skills learned.
6) Update DECISIONS.md if any assumption changed (e.g., switched from OSC/${sequence} to renameWithArg).
7) Update TODO.md if needed.

Deliverables:
- CHECKPOINTS/080_self_check_1.md
- Updated SKILLS.md, DECISIONS.md, TODO.md (as needed).

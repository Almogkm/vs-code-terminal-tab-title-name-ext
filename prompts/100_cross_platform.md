Cross-platform task.

Goals:
- Keep implementation Linux-first; Windows-specific handling can be appendix-only.
- Ensure parsing rules cover python/python3, R/Rscript, bash/sh/zsh, node, pytest.
- Explicit decision: DO NOT rename for `make` (treat it as non-file; document rationale).
- Document platform-aware script name extraction (spaces/quotes, tilde, relative paths; Windows drive letters in appendix).
- Document shell integration availability differences and expected behavior when unavailable.
- No shell-specific emitters; renaming uses `renameWithArg` across platforms.

Deliverables:
- docs/cross_platform.md
- Code updates (extension/extension.js, extension/parser.js) if parsing adjustments are needed
- CHECKPOINTS/100_cross_platform.md

Constraints:
- No filesystem existence checks.
- No network.

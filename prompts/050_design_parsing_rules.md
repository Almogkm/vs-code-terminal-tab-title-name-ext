Design task: command line parsing rules -> tab title.

Goals:
- Define deterministic parsing rules for a commandLine string into:
  - kind: python/r/bash/node/pytest/make/other
  - primary target: filename or module
  - title string: e.g., “Python: calculate_TVA_single.py”
- Handle quoting and paths robustly.
- Decide what to do when no filename is present.
- Keep it simple and extensible.

Deliverables:
- docs/parsing_rules.md
- A pure-function TypeScript parser module (src/parser.ts) with unit-test-friendly exports.
- CHECKPOINTS/050_parsing_rules.md

Do not touch VS Code APIs yet.
Evals + test plan.

Goals:
- Create a test matrix that covers:
  - “Run Python File in Dedicated Terminal”
  - Debug runs
  - Manual runs
  - Multiple terminals
  - python/R/bash/node/pytest/make commands
- Include the manual command **"Terminal Titles: Rename Active Terminal Test"**.
- Add negative tests: running `printf`/OSC should not rename to `Command: printf`.
- Add tests for shell integration disabled (should log and do nothing harmful).
- Provide step-by-step manual validation instructions and expected outputs.

Deliverables:
- EVALS.md
- docs/test_plan.md
- CHECKPOINTS/110_test_plan.md

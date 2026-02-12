Evals + test plan.

Goals:
- Create a test matrix that covers:
  - Mode A (user-started terminal): rename only for run-file commands; revert after exit.
  - Mode B (dedicated/editor terminal): fixed name is enforced and must remain stable.
  - “Run Python File in Dedicated Terminal”
  - Debug runs (F5 Extension Dev Host)
  - Manual runs
  - Multiple terminals (cross-effects / other terminals running commands)
  - python/R/bash(sh as interpreter+script)/node/pytest commands
  - make: explicitly verify NO rename (documented non-goal)

- Include manual commands that exist in the repo:
  - "Terminal Titles: Debug Info"
  - "Terminal Titles: Rename Active Terminal Temporary Test"
  - "Terminal Titles: Revert Active Terminal To Baseline"

- Negative tests:
  - Running printf/OSC-like commands must NOT cause rename to "Command: printf"
  - Builtins like cd/ls/grep/etc must NOT rename in Mode A
  - Dedicated terminals must NOT become “dynamic” due to actions in other terminals

- Shell integration disabled:
  - should log clearly and do nothing harmful (no renames, no spam, no crashes)

Deliverables:
- Update EVALS.md (matrix + pass/fail checklist)
- Create docs/test_plan.md (step-by-step manual validation + expected logs/titles)
- CHECKPOINTS/110_test_plan.md (summary + how to run)

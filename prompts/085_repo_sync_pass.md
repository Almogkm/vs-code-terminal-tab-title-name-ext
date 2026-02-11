Repository-wide synchronization pass.

Context (current truth):
- Extension is JS/no-build (entrypoint: extension/extension.js).
- Title setting is done by VS Code terminal rename command:
  vscode.commands.executeCommand('workbench.action.terminal.renameWithArg', { name: title })
- We do NOT rely on OSC sequences or terminal.integrated.tabs.title="${sequence}".
- We have anti-loop/ignore rules (printf/OSC patterns, internal test commands).
- Shell execution events are used when available; must fail gracefully otherwise.

Task:
1) Audit the repository for stale assumptions and update them.
   - Search for: "src/extension.ts", "extension/src", "tsc", "out/extension.js", "${sequence}", "OSC", "printf '\\033]2", "terminal.integrated.tabs.title", "sendText(printf", "vsce build assumes tsc", etc.
   - Use rg and report a brief hit summary.

2) Update all remaining prompts and docs to reflect current truth:
   - prompts/090_hardening.md
   - prompts/100_cross_platform.md
   - prompts/110_test_plan.md
   - prompts/120_release.md
   - TERMINAL_RENAME_EXT_INSTRUCTIONS_GRAND_SCHEME.md (where it still implies OSC/${sequence} or TS)
   - docs/* (especially user_setup.md) and EVALS.md if they mention the old approach
   - Ensure any “self-check” prompts reference JS files (extension/*.js) and not TS.

3) Hardening prompt (090) must include:
   - recursion protection principles for renameWithArg
   - command parsing security (never execute user command; sanitize titles)
   - correct terminal targeting behavior (execution.terminal vs activeTerminal)
   - logging expectations

4) Cross-platform prompt (100) must include:
   - parsing rules for python/python3, R/Rscript, bash/sh/zsh, node, etc.
   - platform-aware script name extraction (paths with spaces, quotes, Windows drive letters as appendix)
   - but keep implementation Linux-first.

5) Test plan prompt (110) must include:
   - manual command “Rename Active Terminal Test”
   - automatic rename tests for python3, Rscript, bash -c
   - negative tests (printf/OSC should not rename to Command: printf)
   - tests for shell integration disabled (should log and do nothing harmful)

6) Release prompt (120) must include:
   - packaging guidance consistent with JS/no-build (still likely uses vsce, but no tsc/out dir assumptions)
   - local install/uninstall steps
   - versioning notes
   - minimal required permissions

7) Update DECISIONS.md if any old decisions remain (OSC/${sequence} should be clearly superseded).
8) Update SKILLS.md if new techniques were used in this sweep.
9) Write a new checkpoint:
   - CHECKPOINTS/085_repo_sync_pass.md
   Include:
   - list of files changed
   - what was outdated and how it was corrected
   - any remaining TODOs/risks

Constraints:
- Do not change working extension behavior unless you find a real bug.
- No network.
- Keep docs concise.
Output:
- exact diffs for all changes.

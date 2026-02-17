Bugfix: correct handling of quoted script paths (spaces) in parser + dedicated detection.

Observed
- Running `python3 "with space.py"` yields `Python: space.py` (wrong; should be `Python: with space.py`).
- Running `/bin/python3 "/home/.../with space.py"` yields `Python: with` (wrong; should be `Python: with space.py`).
- Output shows “command normalized for parsing …” which appears to strip quotes and/or collapse tokens, causing loss of the real filename.

Goal
- Preserve filenames with spaces in titles for Mode A and Mode B.
- Do NOT regress existing behavior (Mode A temporary rename + revert; Mode B fixed title).
- Keep Linux-first; no network; JS/no-build; renameWithArg only.

Requirements

1) Parser must respect quotes
- Stop using any “normalization” that removes quotes and then splits on whitespace.
- Implement a minimal shell-like tokenizer that:
  - Treats text inside single quotes '...' as one token.
  - Treats text inside double quotes "..." as one token.
  - Supports backslash escapes inside double quotes minimally (at least \" and \\).
  - Does not attempt full bash parsing; just enough to keep file paths intact.

2) Title should use the true basename (including spaces)
- For run-file commands, derive `primaryTarget` as the script path token (may include spaces).
- Title should be `Python: <basename>` / `R: <basename>` / `Bash: <basename>` / `Node: <basename>`.
- Basename must retain spaces, e.g. `with space.py`.

3) Command segmentation rules stay the same (unless already decided otherwise)
- Keep “primary segment” parsing (e.g. before `&&`, `||`, `|`, `;`) as it is now.
- BUT: segmentation must also respect quotes so it doesn’t split inside `"..."`.

4) Dedicated detection must work with spaced filenames
- The “editor-run dedicated” heuristic should compare against active editor path robustly:
  - If active editor file is `/path/with space.py`, and parsed target is either:
    - `with space.py` (basename) OR
    - `/path/with space.py` (full path)
    then it should count as a match.
- Use Node `path.basename` and string `endsWith` comparisons on fsPath.
- Keep the safety window (<= 3000ms) and “first execution only” constraints.

5) Update docs/test_plan.md
Add regression tests:
- Mode A (user terminal):
  - `python3 "with space.py"` => `Python: with space.py` then revert to baseline
  - `/bin/python3 "/abs/path/with space.py"` => `Python: with space.py` then revert
- Mode B (dedicated):
  - Run “Run Python File in Dedicated Terminal” for `with space.py`
  - Title becomes and stays `Python: with space.py` after exit

6) Deliverables
- Exact diffs
- CHECKPOINTS/115_fix_quoted_paths_spaces.md:
  - repro commands
  - what changed (tokenizer + title extraction)
  - verification checklist

Constraints
- JS/no-build only.
- Keep `workbench.action.terminal.renameWithArg`.
- No OSC / ${sequence} / printf.
- No network.

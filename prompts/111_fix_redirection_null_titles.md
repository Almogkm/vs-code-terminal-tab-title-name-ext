Bugfix: prevent `Node: null` / `Python: null` titles caused by redirections and flag-only invocations.

Context (from docs/test_plan.md results):
- `node -v 2>/dev/null || true` currently renames to `Node: null` (FAIL).
- `python3 -V 2>/dev/null || true` can rename to `Python: null` (should never happen).
Root cause: the “primary command segment” truncation keeps redirection tokens like `2>/dev/null` in the segment, and the parser treats them as a script argument.

Constraints:
- JS/no-build only.
- Keep rename mechanism: `workbench.action.terminal.renameWithArg`.
- No OSC/printf emission.
- No network.

Implementation requirements:

1) Strip redirections from the segment before parsing
- In `extension/extension.js`, after `getPrimaryCommandSegment(...)`, add a function that removes common redirection operators and their targets OUTSIDE quotes:
  - `> file`, `>> file`, `< file`, `2> file`, `2>> file`, `&> file`, `1> file`
  - Also remove standalone `2>/dev/null`-style tokens.
- Do not remove pipes/&&/; here (already handled), only redirections.

2) Parser hardening: never treat non-path tokens as script files
- In `extension/parser.js`:
  - For node: only treat `mode: script` when the candidate token looks like a path or ends with `.js/.mjs/.cjs` (or at least does NOT contain `>` and does not match `^\d?>/?` redirection patterns).
  - For python: only treat as file-run when token ends with `.py` or looks like a filesystem path (not flags, not redirections).

3) Absolute guardrail: never apply null/empty titles
- In `extension/extension.js`, if `parsed.title` is falsy OR contains `: null` (or `primaryTarget` is null/empty), log (debug) and DO NOT rename.

4) Update docs + checkpoint
- Update `docs/test_plan.md` Negative Tests:
  - Replace the pytest line with:
    - `node -v 2>/dev/null || true` => NO rename
    - `python3 -V 2>/dev/null || true` => NO rename
- Write `CHECKPOINTS/111_fix_redirection_null_titles.md` with:
  - what changed
  - how to test
  - expected logs

Deliverables:
- Exact diffs
- Updated docs/test_plan.md
- CHECKPOINTS/111_fix_redirection_null_titles.md

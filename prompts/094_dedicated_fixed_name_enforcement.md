We need to redesign Mode B (dedicated terminals).

Observed behavior: dedicated terminals sometimes show `bash` → `Python: …` during run → back to `bash`. This indicates another extension (e.g., Python) is restoring the terminal name after execution. Therefore, we must enforce a stable dedicated title ourselves using renameWithArg, not by treating `Python: …` as baseline.

Goal:
- Mode A (user-started): temporary rename for run-file commands, revert to baseline on end (current behavior).
- Mode B (dedicated): compute a fixed title once from the first run-file execution in that terminal and keep it constant forever.

Implementation requirements:
1) State changes:
   - Extend per-terminal state with:
     - isDedicated: boolean
     - fixedName: string | null
2) Dedicated detection:
   - A terminal becomes dedicated if:
     a) Its initial name matches an editor-owned pattern (e.g. /^Python:\s+.+\.py\b/i), OR
     b) It is the terminal used by a “Run file in dedicated terminal” style execution (infer from commandLine containing an absolute script path and python interpreter path; treat as dedicated once we see the first python file-run in that terminal and the terminal was not user-created permanent name).
   - Practical rule: on first parsed.targetType==="file" execution in a terminal whose baselineName was "bash" (or similar), if the terminal.name or execution pattern indicates editor-run, set isDedicated=true.
   - Keep heuristic conservative and document it.

3) Fixed name derivation:
   - When isDedicated becomes true and fixedName is null:
     - compute fixedName from parsed.title but force format "Python: <file.py>" (and similar for R/Sh/Node/Java).
     - Use only the basename of the script.
   - Store fixedName and apply it via renameWithArg.

4) Enforcing fixed name:
   - On ANY execution end for a dedicated terminal, re-apply fixedName (because other extensions may restore it to bash).
   - If VS Code exposes a terminal-name-change event (e.g. onDidChangeTerminalName), listen and if state.isDedicated && fixedName, re-apply fixedName (rate-limited).
   - Also on execution start, if dedicated and fixedName exists, apply it (idempotent).

5) Mode A unchanged except:
   - If terminal isDedicated, never perform temporary rename/revert logic (only fixed-name enforcement).

6) Update docs/spec_terminal_naming.md:
   - Mode B now means “fixed title enforced” rather than “never touch”.
7) Update CHECKPOINTS/094_dedicated_fixed_name_enforcement.md:
   - root cause (Python extension restores name)
   - algorithm
   - tests

Tests:
- Dedicated terminal created by “Run Python File in Dedicated Terminal”:
  - it may briefly show bash, but should end up as "Python: original.py" and remain that after script exit
  - running commands in other terminals must not change it
  - running commands inside it must not change it
- User-started terminal:
  - python3 some_script.py => temporary rename then revert to baseline

Constraints:
- JS/no-build, renameWithArg only.
- No OSC/printf.
- No network.
- Keep anti-spam rate limiting.

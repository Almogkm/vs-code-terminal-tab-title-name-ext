# EVALS.md

## Test Matrix
| Case | Mode | Action | Expected title behavior | Notes |
| --- | --- | --- | --- | --- |
| Mode A python | User-started | `python3 some_script.py` | Rename to `Python: some_script.py`, then revert to baseline after exit | Baseline usually `bash` |
| Mode A R | User-started | `Rscript analyze.R` | Rename to `R: analyze.R`, then revert after exit | |
| Mode A shell | User-started | `bash run.sh` | Rename to `Sh: run.sh`, then revert after exit | |
| Mode A node | User-started | `node app.js` | Rename to `Node: app.js`, then revert after exit | |
| Mode A pytest | User-started | `pytest tests/test_example.py` | No rename | Pytest treated non-file for rename |
| Mode A make | User-started | `make build` | No rename | Explicit non-goal |
| Builtins | User-started | `cd tools`, `ls`, `grep foo file` | No rename | Prevents noise |
| OSC/printf | User-started | `printf '\033]2;X\007'` | No rename to `Command: printf` | Anti-loop guard |
| Mode B dedicated | Dedicated | “Run Python File in Dedicated Terminal” | Fixed title enforced and stable | Should persist after exit |
| Mode B cross-effects | Dedicated + user | Run commands in other terminals | Dedicated title remains unchanged | No cross-terminal leakage |
| Debug host | Both | F5 Extension Dev Host | Behaves same as above | Use OutputChannel logs |
| Shell integration disabled | Both | Disable shell integration | No renames, log once, no errors | Safe no-op |

## Pass/Fail Checklist
- Mode A renames only for run-file commands and reverts on exit.
- Mode A does not rename for builtins, `pytest`, or `make`.
- Mode B uses a fixed title and re-applies it on start/end/name changes.
- Dedicated terminal remains stable even if other terminals run commands.
- Manual commands operate as expected.
- With shell integration disabled, no renames or crashes occur.

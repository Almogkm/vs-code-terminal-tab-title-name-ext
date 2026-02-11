# Parsing Rules: Command Line -> Terminal Tab Title

## Goals
- Deterministic, simple parsing from a `commandLine` string to:
  - `kind`: python/r/bash/node/pytest/make/other
  - `primaryTarget`: filename or module
  - `title`: display string (e.g., `Python: calculate_TVA_single.py`)

## Tokenization (shell-like, minimal)
- Split on whitespace unless inside quotes.
- Single quotes: literal, no escapes.
- Double quotes: allow backslash to escape `"`, `\\`, `` ` ``, `$`, or newline.
- Backslash in normal mode escapes the next character.
- No expansion (no `$VAR`, `$(...)`, or globbing).
- Unmatched quotes are tolerated by treating the remainder as quoted text.

## Wrapper stripping (prefix handling)
Before parsing, strip common wrappers to find the real command:
- Environment assignments: `KEY=value`.
- Wrappers: `env`, `sudo`, `command`, `time`.
- For `env` and `sudo`, skip flags until the first non-flag token.

## Command classification (by executable name)
Normalize the command name by taking the basename and lowercasing:
- python: `python`, `python3*`, `py`
- r: `r`, `rscript`
- bash: `bash`, `sh`, `zsh`, `fish`
- node: `node`, `nodejs`
- pytest: `pytest`, `py.test`
- make: `make`, `gmake`
- otherwise: `other`

## Target extraction rules

### Python
- `python -m <module>` -> target is `<module>`.
- `python <script.py>` -> target is the script filename.
- `python -c ...` or no script -> no target.
- Special case: `python -m pytest ...` maps to **pytest** rules.

### Pytest
- First non-flag arg is the target (file/node id/dir).
- Skip values for common options: `-k`, `-m`, `-c`, `--confcutdir`, `--rootdir`, `--maxfail`.

### Node
- `node <script.js>` -> target is the script filename.
- `node -e/-p ...` -> no target.

### R
- `Rscript <script.R>` -> target is the script filename.
- `R -f <script.R>` -> target is the script filename.
- Otherwise no target.

### Bash (shell family)
- `bash <script.sh>` -> target is the script filename.
- `bash -c ...` -> no target.

### Make
- First non-flag arg is the target.
- Skip values for `-f`, `-C`, `-j`.

### Other
- No target.

## Title formatting
- `Python: <target>` / `Node: <target>` / `Pytest: <target>` / `Make: <target>` etc.
- If no target:
  - For known kinds: `Python`, `R`, `Bash`, `Node`, `Pytest`, `Make`.
  - For `other`: `Command: <command>`.
- File targets are displayed as basename only (strip directories).

## Limitations (intentional)
- Not a full shell parser (no subshells, pipes, redirects, or expansions).
- Conservative option handling; unknown flags are skipped only if they begin with `-`.
- Designed to be deterministic and extensible, not perfect.

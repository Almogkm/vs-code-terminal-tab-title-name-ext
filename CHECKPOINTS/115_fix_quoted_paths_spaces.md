# Checkpoint 115 — Quoted Script Paths With Spaces

## Reproduction
- `python3 "with space.py"` → previously titled `Python: space.py`.
- `/bin/python3 "/abs/path/with space.py"` → previously titled `Python: with`.

## Root Cause
Parsing rebuilt a command string from tokens, which dropped quotes and re-split on whitespace. That split the script path into multiple tokens and lost the true basename.

## Changes
- Added a token-based parsing path so we never re-stringify tokens for parsing.
- Redirection stripping now returns tokens, and parsing uses those tokens directly.
- Titles now use the correct basename (including spaces) from the preserved token.

## Verification Checklist
- Mode A: `python3 "with space.py"` → `Python: with space.py` then revert.
- Mode A: `/bin/python3 "/abs/path/with space.py"` → `Python: with space.py` then revert.
- Mode B: “Run Python File in Dedicated Terminal” for `with space.py` → title stays `Python: with space.py` after exit.

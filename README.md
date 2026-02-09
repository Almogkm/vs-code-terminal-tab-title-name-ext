# Terminal Rename Extension — Cursor-like Terminal Tab Titles

## What this is
A VS Code extension that sets integrated terminal **tab titles** based on the last command you ran (e.g., `Python: calculate_TVA_single.py`) and keeps the title after the process exits.

## Status
Design + learning plan included. Implementation steps are executed by an agent following `TERMINAL_RENAME_EXT_INSTRUCTIONS_GRAND_SCHEME.md`.

## Key idea
Use terminal title escape sequences (OSC) and VS Code terminal tab title variable `${sequence}` for persistence.

## How to run (later)
- Open `extension/` in VS Code
- Press F5 to run Extension Development Host
- Validate with `docs/test_plan.md` (once created)

## Safety
See `RISKS_AND_GUARDRAILS.md`.

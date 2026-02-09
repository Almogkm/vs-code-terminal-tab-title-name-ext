# TOKEN_BUDGETING.md

## Purpose

This project is designed to be executed by a coding agent over many prompts without exhausting the context window (target: ~192k–272k tokens per thread). These rules minimize context growth while preserving correctness.

## Non-negotiable rules

### 1) Never paste large files into the chat
- Do **not** dump full source files, long logs, or whole documentation pages into the conversation.
- Instead: read locally, then write a **summary artifact** (below).

### 2) Every learning step produces a concise markdown summary
- Each learning step must output:
  - `docs/learning_<topic>.md` (the durable summary)
  - `CHECKPOINTS/<nnn>_<topic>.md` (what changed, what matters, next actions)
- The summary must include:
  - **Verified facts** (with links / citations if applicable)
  - **Assumptions / uncertainties**
  - **Implications for our extension design**
  - **Actionable conclusions** (what we will implement / avoid)

### 3) Prefer “diffs + pointers” over “full reprints”
When making changes:
- Describe what changed briefly.
- Apply minimal diffs to files.
- If a reviewer needs details, point them to specific files/sections rather than reprinting everything.

## What the agent should keep in working memory

At any time, the agent should only “carry”:
- The current step prompt
- The latest `CHECKPOINTS/*.md` (most recent 1–3 checkpoints)
- The core control docs:
  - `DECISIONS.md`
  - `RISKS_AND_GUARDRAILS.md`
  - `SKILLS.md`
- The minimal code surface needed for the current change (usually 1–4 files)

Everything else should be re-loaded locally as needed.

## Checkpoint cadence

### After every 2–3 coding steps: mandatory SELF-CHECK
Perform a self-check and produce:
- `CHECKPOINTS/<nnn>_self_check_<k>.md`

Self-check procedure:
1) Re-read all `docs/learning_*.md` created so far.
2) Re-read all `extension/src/*.ts`.
3) Confirm code matches:
   - `DECISIONS.md`
   - `RISKS_AND_GUARDRAILS.md`
4) Create/update `TODO.md` with any issues found.
5) If new skills were learned, update `SKILLS.md`.

## Context-safe logging

If a run produces large logs:
- Save the full log locally (e.g., `logs/<timestamp>.txt`).
- In the chat, only paste:
  - the first ~20 lines
  - the last ~20 lines
  - any key error stack trace excerpt (minimal)
- Summarize the rest in a checkpoint file.

## “Stop and clarify” threshold (avoid compounding mistakes)

If any of these occur, stop coding and create a checkpoint that explains:
- Shell execution events are missing / not firing
- `${sequence}` does not update tab titles as expected
- The title escape sequence is not persisting
- The approach depends on proposed/unstable APIs

Then branch to an alternative plan (documented in `DECISIONS.md`).

## File size hygiene

- Keep learning docs short: aim for 1–2 pages each.
- Keep checkpoints very short: ≤ ~40 lines.
- Keep parser rules and tests compact; prefer a small set of robust patterns.
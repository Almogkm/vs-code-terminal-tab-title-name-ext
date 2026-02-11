# TERMINAL_RENAME_EXT_INSTRUCTIONS_GRAND_SCHEME.md

## Goal

Create a **VS Code extension** that makes integrated terminal **tab titles** behave like Cursor out-of-the-box:

- When a command is run (via *any* mechanism, including “Run Python File in Dedicated Terminal”), set the terminal tab title to something like:
  - `Python: calculate_TVA_single.py`
  - `R: analyze.R`
  - `bash: run_pipeline.sh`
  - `pytest: test_counts.py`
  - `make: build`
- The title should **persist after the process exits** (i.e., it must *not* revert to `bash` when the shell regains focus).
- Must be safe: **no destructive operations**, no shell injection risks, no breaking the IDE, robust error handling, clear rollback/uninstall steps.

This scheme is optimized for **token efficiency** in long agent sessions (context limit ~192k–272k). It splits work into many steps with checkpoint artifacts and self-checks.

---

## Background from our conversation (facts + conclusions)

### Observed behavior in VS Code
- Terminal tab title flips `bash → python → bash` as a process runs and exits.
- Settings like `"terminal.integrated.tabs.title": "${process}"` reflect the current foreground process, so the title naturally reverts to `bash` afterward.
- Using `${task}` only works for VS Code Tasks; **“Run Python File in Dedicated Terminal” is not a Task**, so `${task}` won’t be available.
- User wants Cursor-style **tab titles only**; description can remain default and is not used.

### Why Cursor “just works” (best inference)
Cursor is a VS Code fork; it likely:
- Auto-names terminals when launching commands, or
- Injects/maintains a persistent terminal title, or
- Uses internal/proposed APIs unavailable (or not used) in stock VS Code.

**Crucial conclusion:** In stock VS Code, to keep titles persistent after the command completes, you must set the title via a mechanism that is *not* tied to the active process name.

### Most robust mechanism (design decision)
Use **VS Code’s terminal rename command**:

- Rename terminals via `workbench.action.terminal.renameWithArg` using the parsed title.
- This avoids reliance on OSC title sequences or `${sequence}` settings.

---

## High-level architecture

### Primary strategy: Terminal rename + shell execution detection
1. **Detect command starts** in a terminal using VS Code’s terminal shell integration events.
2. **Parse** the command line to infer:
   - language/tool (python/R/bash/node/etc)
   - “primary” script file (basename)
3. **Rename the terminal tab** using `workbench.action.terminal.renameWithArg`.
4. Do **not** reset title on completion (so it remains).

### Key dependencies / prerequisites
- **Terminal shell integration** must be enabled (VS Code feature). Extension should detect if absent and degrade gracefully (no renaming).
- User is on Ubuntu (bash), but extension should aim for cross-shell support where feasible.

### Guardrails
- Never evaluate or execute user-provided command strings.
- Never run network calls.
- Never modify user files outside extension folder.
- Do not send OSC/printf sequences; use VS Code rename only.

---

## What the agent must learn first (comprehensive learning session)

The agent must do a structured learning phase before coding. Produce learning outputs as markdown files per step.

### Mandatory reading targets
1) Cursor docs:
- https://cursor.com/docs/
- https://cursor.com/docs/api/

2) VS Code extension authoring:
- https://code.visualstudio.com/api/get-started/your-first-extension
- https://code.visualstudio.com/api/get-started/extension-anatomy
- additional topics under https://code.visualstudio.com/api as needed

3) Local cloned Cursor repos:
- `/First upload`
- `/Last available open source version`

4) Uploaded agent-building guides (OpenAI + HF):
- `/mnt/data/a-practical-guide-to-building-agents.pdf`
- plus the other provided “Building good agents”, “Secure code execution”, “Tools”, “Inspecting runs with OpenTelemetry”, “Manage your agent's memory” files.

The OpenAI agent guide emphasizes that an agent is model + tools + instructions, and stresses incremental development, clear instructions, and guardrails. The agent should explicitly apply that to its own workflow (step outputs, self-checks, failure thresholds). fileciteturn0file0L70-L116

---

## Repo layout to create (inside a new workspace folder)

Create a new repo folder (any name), with at least:

- `README.md`
- `SKILLS.md`
- `DECISIONS.md`
- `RISKS_AND_GUARDRAILS.md`
- `EVALS.md`
- `CHECKPOINTS/` (markdown summaries per stage)
- `prompts/` (one prompt per step below, as `.md`)
- `extension/` (VS Code extension source)
  - `package.json`
  - `extension.js`
  - `title.js`
  - `parser.js`
  - `.vscode/launch.json`
- `docs/`
  - learning notes
  - API references
  - parsing rules
  - test plans

---

## Implementation plan (many small steps)

Each step below includes:
- **Goal**
- **Artifacts** (what to write/save)
- **Self-check** (periodic)
- **Prompt to run** (copy/paste into the agent)

### Step 0 — Bootstrap the agent workspace
**Goal**
- Create the repo skeleton and the control docs (SKILLS, DECISIONS, guardrails, etc.).

**Artifacts**
- `README.md` (one-paragraph goal + how to run)
- `SKILLS.md` (initial skills inventory)
- `DECISIONS.md` (initial architectural decisions; mark unknowns)
- `RISKS_AND_GUARDRAILS.md` (explicit do/don’t list)
- `CHECKPOINTS/000_bootstrap.md`

**Prompt**
See `prompts/000_bootstrap.md`.

---

### Step 1 — Learning: VS Code terminal tab titling + rename API
**Goal**
- Learn and summarize:
  - terminal tabs title variables
  - how terminal titles can be set or renamed
  - shell integration requirements
  - any limitations

**Artifacts**
- `docs/learning_vscode_terminal_titles.md`
- `CHECKPOINTS/010_vscode_terminal_titles.md`

**Prompt**
See `prompts/010_learn_vscode_terminal_titles.md`.

---

### Step 2 — Learning: VS Code terminal shell execution events APIs
**Goal**
- Identify stable APIs to detect command execution in terminal.
- Confirm event types and availability in current VS Code stable:
  - `window.onDidStartTerminalShellExecution`
  - `window.onDidEndTerminalShellExecution`
  - how to access `execution.commandLine`
- If not stable, find alternatives.

**Artifacts**
- `docs/learning_vscode_shell_execution_events.md`
- `CHECKPOINTS/020_shell_execution_events.md`

**Prompt**
See `prompts/020_learn_vscode_shell_execution_events.md`.

---

### Step 3 — Learning: terminal title escape sequences (OSC) — historical
**Goal**
- (Historical) Learn OSC sequences that set terminal title (OSC 0 / OSC 2).
- (Historical) Learn shell-safe ways to emit them (bash/zsh, powershell, cmd).
- (Historical) Decide escaping strategy for title text.

**Artifacts**
- `docs/learning_terminal_title_sequences.md` (historical reference)
- `CHECKPOINTS/030_terminal_title_sequences.md` (historical reference)

**Prompt**
See `prompts/030_learn_terminal_title_sequences.md` (historical).

---

### Step 4 — Learning: Cursor behavior & source archeology
**Goal**
- From Cursor docs + repo versions:
  - find references to terminal naming/title behavior
  - look for code that sets titles or uses VS Code terminal APIs
  - document findings; if Cursor uses internal APIs, note them.

**Artifacts**
- `docs/learning_cursor_terminal_titles.md`
- `CHECKPOINTS/040_cursor_archeology.md`

**Prompt**
See `prompts/040_learn_cursor_terminal_titles.md`.

---

### Step 5 — Design: parsing rules & normalization
**Goal**
- Define deterministic parsing rules to map a command line → title.
- Supported cases (initially):
  - `python file.py`, `python3 file.py`
  - `python -m module` (title `Python: -m module` or `Python: module`)
  - `Rscript file.R`, `R -f file.R`
  - `bash file.sh`, `sh file.sh`, `zsh file.sh`
  - `node file.js`
  - `pytest ...`, `snakemake ...`, `make ...` (fallback patterns)
- Decide whether to keep full basename only or include args.

**Artifacts**
- `docs/parsing_rules.md`
- `extension/parser.js` (pure functions used at runtime)
- `src/parser.ts` (legacy reference; not used at runtime)
- `CHECKPOINTS/050_parsing_rules.md`

**Prompt**
See `prompts/050_design_parsing_rules.md`.

---

### Step 6 — Implement extension skeleton (no functionality)
**Goal**
- Create minimal extension scaffolding with activation event and logging.

**Artifacts**
- `extension/package.json`
- `extension/extension.js`
- `CHECKPOINTS/060_extension_skeleton.md`

**Prompt**
See `prompts/060_build_extension_skeleton.md`.

---

### Step 6.5 — Pivot to JS no-build entrypoint
**Goal**
- Ensure the extension loads without running npm/tsc by using a CommonJS entrypoint.
- Keep TypeScript files in place but do not require compiled `out/` artifacts.

**Artifacts**
- `extension/extension.js`
- `CHECKPOINTS/061_no_build_js_entrypoint.md`

**Prompt**
See `prompts/061_no_build_js_entrypoint.md`.

---

### Step 7 — Implement detection + title setting (MVP)
**Goal**
- Listen for terminal shell execution start.
- Compute title.
- Rename the terminal via `workbench.action.terminal.renameWithArg`.

**Artifacts**
- `extension/extension.js`
- `extension/title.js`
- `docs/user_setup.md`
- `CHECKPOINTS/070_mvp_title_setting.md`

**Prompt**
See `prompts/070_implement_mvp.md`.

---

### Step 8 — Self-check + code review checkpoint
**Goal**
- Re-read all learning docs and the codebase.
- Validate decisions remain consistent.
- Identify TODOs + edge cases.
- Update `SKILLS.md` with any newly acquired capabilities.

**Artifacts**
- `CHECKPOINTS/080_self_check_1.md`
- `TODO.md` (if needed)
- `SKILLS.md` updates

**Prompt**
See `prompts/080_self_check_1.md`.

---

### Step 9 — Hardening: escaping + security + failure modes
**Goal**
- Ensure title content cannot break shells or execute unintended commands.
- Ensure behavior when shell integration is missing.
- Add rate limiting / debouncing.
- Add configuration toggles (enable/disable, per-language patterns).

**Artifacts**
- `RISKS_AND_GUARDRAILS.md` updated
- `docs/security_model.md`
- `CHECKPOINTS/090_hardening.md`

**Prompt**
See `prompts/090_hardening.md`.

---

### Step 10 — Cross-platform and shell coverage
**Goal**
- Support at least:
  - bash/zsh (Linux/macOS)
  - PowerShell (Windows)
  - cmd.exe (Windows) — if feasible
- Add per-shell emitters.

**Artifacts**
- `docs/cross_platform.md`
- `CHECKPOINTS/100_cross_platform.md`

**Prompt**
See `prompts/100_cross_platform.md`.

---

### Step 11 — Evals & manual test plan
**Goal**
- Create a repeatable test matrix:
  - different launch methods (Run Python File, run selection, typing in terminal)
  - different command forms
  - multiple terminals
  - long-running processes
- Add instructions for packaging and installing locally.

**Artifacts**
- `EVALS.md`
- `docs/test_plan.md`
- `CHECKPOINTS/110_test_plan.md`

**Prompt**
See `prompts/110_test_plan.md`.

---

### Step 12 — Release packaging
**Goal**
- Build vsix
- Provide install/uninstall instructions
- Document rollback steps

**Artifacts**
- `docs/release.md`
- `CHECKPOINTS/120_release.md`

**Prompt**
See `prompts/120_release.md`.

---

## Periodic self-check protocol (mandatory)

After every ~2–3 coding steps, run a self-check:
1. Re-read all `docs/learning_*.md` created so far.
2. Re-read all `.js` files in `extension/`.
3. Update:
   - `DECISIONS.md` if assumptions changed
   - `TODO.md` with discovered issues
   - `SKILLS.md` with newly learned skills
4. Add a checkpoint file `CHECKPOINTS/XXX_self_check_*.md` summarizing:
   - what was learned
   - what is implemented
   - what’s risky / uncertain
   - next steps

---

## Success criteria

Minimum:
- Running `python calculate_TVA_single.py` via “Run Python File in Dedicated Terminal” results in terminal tab title:
  - `Python: calculate_TVA_single.py` (or equivalent)
- Title persists after script finishes (does not revert to `bash`).
- Works across multiple terminals.
- Safe: does not execute arbitrary user strings; does not break shell history; does not modify user settings without explicit instruction.

Stretch:
- Works across python/R/bash/node/pytest.
- Per-terminal option: keep last title vs auto-reset.
- Pattern customization.

---

## Rollback / safety instructions
- Extension provides a “Disable” setting.
- Clear uninstall instructions.
- If anything goes wrong:
  - disable extension
  - reload window
  - confirm terminals are normal

---

## Prompts index
All step prompts are pre-generated in `prompts/` by this scheme.

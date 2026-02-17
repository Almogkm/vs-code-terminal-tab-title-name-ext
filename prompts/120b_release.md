Release + Packaging (VSIX) + Marketplace-Ready Prep — NO behavior changes.

Context
- Extension is JS/no-build.
- Entry point: extension/extension.js (CommonJS).
- Renaming mechanism MUST remain: workbench.action.terminal.renameWithArg.
- No OSC / no ${sequence} / no printf title emission.
- Functionality is stable. DO NOT change behavior unless required for packaging/install correctness.

Goals
A) Produce a working VSIX for local installation.
B) Make the repo “marketplace-ready” (metadata + docs), without publishing.
C) End-user install must be npm-free. It is acceptable that packaging uses vsce (npx) on the maintainer machine.

Constraints
- Do NOT introduce TypeScript build/webpack/out/.
- Do NOT add any scripts that run on install (no postinstall/prepare hooks).
- No network access during code changes. Docs may describe network-required steps, but do not fetch anything.

Implementation requirements

1) Decide packaging root + make it consistent
- Package from within the `extension/` folder using `vsce package`.
- Ensure `extension/package.json` is the packaged manifest.
- Ensure README/CHANGELOG/LICENSE are discoverable by vsce (either in extension/ or referenced correctly).

2) Sanity-check and polish `extension/package.json` (packaging-only)
Verify/ensure:
- "main": "./extension.js"
- "engines.vscode": pick a reasonable baseline compatible with the APIs used
- "activationEvents" includes our commands (and any required terminal shell integration activation event if used)
- "contributes.commands" includes all commands with correct IDs and titles
- "contributes.configuration" includes:
  - terminalTabTitles.enabled (boolean, default true)
  - terminalTabTitles.debugLogging (boolean, default false)
- Add/confirm metadata:
  - name (kebab-case), displayName, description, version
  - publisher (placeholder OK, but document it must match Marketplace publisher ID later)
  - categories, keywords
  - repository / bugs / homepage (if known; otherwise omit but add TODO comment in docs)
  - license field (SPDX) AND ensure a LICENSE file exists
- Remove/avoid ANY install-time scripts:
  - no postinstall, prepare, prepublishOnly, etc.
- Keep dependencies minimal; ensure no dependency is required to RUN.

3) Add/upgrade user-facing docs (marketplace-quality)
Create/verify (choose either repo root or extension/ — but be consistent and document the choice):
- README.md:
  - What it does
  - Mode A vs Mode B behavior (dynamic rename+revert vs dedicated fixed title)
  - Requirements (shell integration availability notes)
  - Settings (terminalTabTitles.enabled, terminalTabTitles.debugLogging)
  - Troubleshooting (OutputChannel “Terminal Tab Titles”, common logs)
  - Security model summary (no execution; sanitization; no network)
- CHANGELOG.md (at least v0.1.0 initial)
- LICENSE (MIT recommended unless user specifies another)
- docs/release.md:
  - Local packaging steps (VSIX)
  - Local install steps (Install from VSIX…)
  - Uninstall steps
  - Marketplace publishing steps (high-level only; no tokens/secrets):
    - create publisher, create PAT, set publisher in package.json, vsce publish
  - Clearly label which steps require network (installing vsce / publishing) and why.

4) Add `.vscodeignore` (or refine) to keep VSIX clean
- Exclude all dev-only / agent-only / large artifacts, e.g.:
  - CHECKPOINTS/, prompts/, Intermediate_results*.zip, extension_*.zip, screenshots, test logs, etc.
- Include ONLY what runtime needs + user docs:
  - extension/extension.js, extension/parser.js, extension/title.js (and any other runtime JS)
  - extension/package.json
  - README.md, CHANGELOG.md, LICENSE
  - docs/user_setup.md + docs/security_model.md + docs/test_plan.md (include only if you want shipped)
- Verify that ignored files don’t break runtime.

5) VSIX packaging instructions (do not actually publish)
In docs/release.md include exact commands, run from repo root:
- cd extension
- npx @vscode/vsce package
(or global vsce alternative)
State expected output filename (based on name+version).

6) Verification checklist (post-package, in normal VS Code)
Write a short checklist in CHECKPOINTS/120_release.md:
- Install VSIX in normal VS Code (not Extension Development Host)
- Confirm commands appear in Command Palette
- Confirm Mode A rename+revert works
- Confirm Mode B dedicated stays fixed
- Confirm debugLogging toggle works

Deliverables
- Exact file diffs for all changes.
- New/updated: README.md, CHANGELOG.md, LICENSE, .vscodeignore, docs/release.md, CHECKPOINTS/120_release.md.
- Confirm explicitly: “F5 still works without npm/tsc and runtime remains JS/no-build.”
- State the expected VSIX filename and where it will be created.

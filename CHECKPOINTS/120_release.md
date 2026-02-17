# Checkpoint 120 — Release & Packaging Prep

## Summary
- Added marketplace-ready README/CHANGELOG/LICENSE in `extension/` only.
- Added `extension/.vscodeignore` to keep VSIX clean.
- Added release instructions in `docs/release.md`.
- Polished `extension/package.json` metadata and activation events.

## Verification Checklist (Normal VS Code)
1. Install VSIX via **Install from VSIX…** (not Extension Development Host).
2. Confirm commands appear in Command Palette:
   - Terminal Tab Titles: Debug Info
   - Terminal Tab Titles: Rename Active Terminal Temporary Test
   - Terminal Tab Titles: Revert Active Terminal To Baseline
3. Mode A: run `python3 some_script.py` → temporary rename then revert to baseline.
4. Mode B: “Run Python File in Dedicated Terminal” → title stays fixed after exit.
5. Toggle `terminalTabTitles.debugLogging` and confirm logs appear in OutputChannel.

# CHECKPOINTS/062_align_after_js_switch.md

## Summary
- Switched to a zero-build JavaScript entrypoint because VS Code could not load `out/extension.js` without running a build.
- Current working entrypoint is `extension/extension.js` with command activation via `terminalTitles.debugInfo`.

# CHECKPOINTS/061_no_build_js_entrypoint.md

## Summary
- Added a zero-build CommonJS entrypoint at `extension/extension.js`.
- Updated `extension/package.json` to point `main` to `./extension.js` and kept command activation.
- Ensured `extension/.vscode/launch.json` has no build-related preLaunch task.

## How to test
1. Press F5 to launch the Extension Development Host.
2. Open Command Palette.
3. Run "Terminal Titles: Debug Info".
4. Confirm a notification appears with the same text.

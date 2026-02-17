# CHECKPOINTS/060_extension_skeleton.md

> Historical note: This step started with a TypeScript skeleton. The extension now uses a no-build JavaScript entrypoint at `extension/extension.js` (see `CHECKPOINTS/061_no_build_js_entrypoint.md`).

## Summary
- Created the VS Code extension skeleton under `extension/` with TypeScript setup.
- Added a minimal activation plus a command palette entry: "Terminal Tab Titles: Debug Info".
- No terminal renaming logic implemented yet.

## Files added
- `extension/package.json`
- `extension/tsconfig.json`
- `extension/src/extension.ts`
- `extension/.vscode/launch.json`

## Notes
- No automatic user setting changes.
- No network use.

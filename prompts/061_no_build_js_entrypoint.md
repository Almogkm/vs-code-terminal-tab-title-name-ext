We must get the extension to load WITHOUT running npm or any build tooling.

Current error: VS Code cannot find extension/out/extension.js. We currently have a TS skeleton (src/extension.ts, tsconfig.json), but no compiled JS output.

Task: Convert the extension to a zero-build JavaScript entrypoint so F5 works.

Requirements:
1) Create `extension/extension.js` (CommonJS) exporting `activate` and `deactivate`.
   - On activate: log `[terminal-titles] activated`
   - Register command id `terminalTitles.debugInfo`
   - Command shows `Terminal Titles: Debug Info` as an information message.
2) Update `extension/package.json`:
   - Set `"main": "./extension.js"`
   - Ensure `activationEvents` includes `onCommand:terminalTitles.debugInfo`
   - Ensure `contributes.commands` includes the command with title `Terminal Titles: Debug Info`
3) Update `extension/.vscode/launch.json`:
   - Remove any `preLaunchTask` that runs npm/tsc.
   - Keep standard “Run Extension” config working.
4) Do not delete the existing TS files yet; leave them in place.
5) Write a short checkpoint `CHECKPOINTS/061_no_build_js_entrypoint.md` explaining what changed and how to test (F5 → run command).

After edits, provide:
- the exact file diffs
- a 5-line test procedure for me.

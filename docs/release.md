# Release & Packaging (VSIX)

## Packaging Root
- Package from `extension/` using `vsce package`.
- `extension/package.json` is the manifest used for packaging.
- README/CHANGELOG/LICENSE live in `extension/` only. The repo root README is a short project overview.

## Local Packaging (VSIX)
Run from repo root:

```bash
cd extension
npx @vscode/vsce package
```

Expected output: `terminal-tab-titles-0.1.1.vsix` created in `extension/`.

**Network required:** the first time you run `npx @vscode/vsce package`, npm may download `@vscode/vsce`.

## Local Install (Normal VS Code)
1. Open VS Code.
2. Extensions view → “…” menu → **Install from VSIX…**
3. Select `extension/terminal-tab-titles-0.1.1.vsix`.

## Uninstall
1. Extensions view.
2. Locate **Terminal Tab Titles**.
3. Uninstall.

## Marketplace Publishing (High-Level)
1. Create a Marketplace publisher.
2. Create a Personal Access Token (PAT) for publishing.
3. Update `extension/package.json` with your real `publisher` ID.
4. Run:

```bash
cd extension
npx @vscode/vsce publish
```

**Network required:** publishing requires authentication and network access.

## Notes / TODOs
- If you have a public repo, add `repository`, `bugs`, and `homepage` fields in `extension/package.json`.
- Confirm `engines.vscode` matches the minimum VS Code version you want to support.

## v0.1.1 Behavior Fix Note
- v0.1.1 fixes undedicated-terminal revert regressions:
  - no literal `${process}` rename payloads
  - no empty rename payloads (which can fail with `No name argument provided` in some environments)
- Reset-to-default behavior is implemented with `RESET_NAME = " "` (single space) as a `renameWithArg` compatibility workaround.

## Troubleshooting
- If you still see `No name argument provided`, capture OutputChannel logs from **Terminal Tab Titles** and verify no empty/missing rename payload path is present in your installed build.

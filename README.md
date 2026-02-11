# VS Code Terminal Title Persistor

A VS Code extension skeleton to persist terminal tab titles based on the last executed command (Cursor-like behavior).

## Goal
- Set and persist terminal tab titles after a command finishes.

## Core idea
- Emit an OSC title sequence and rely on the terminal tab title variable `${sequence}` for persistence.

## Status
- Repository bootstrap only. See `CHECKPOINTS/000_bootstrap.md`.

# SKILLS.md

## Current skills inventory (initial)

### VS Code extension development
- Extension anatomy (activation events, contributes, commands)
- TypeScript extension scaffolding and debugging (launch.json)
- Reading and tracking VS Code API stability / proposed APIs

### VS Code terminal internals (target skills to acquire/verify)
- Terminal shell integration concept and configuration
- Terminal shell execution events (start/end) and their payloads
- Terminal tab title variables, especially `${sequence}`
- Safe ways to emit terminal title escape sequences in different shells

### Parsing & normalization
- Parsing quoted shell command lines (reasonable heuristics)
- Recognizing interpreter/runner patterns: python/Rscript/bash/node/pytest/make
- Extracting a primary filename/module and formatting a concise title

### Security & robustness
- Sanitizing terminal title strings (strip control chars, newlines)
- Avoiding shell injection when sending strings to a terminal
- Graceful degradation when APIs are unavailable
- Clear uninstall/rollback instructions

### Project hygiene
- Checkpointing learning notes
- Self-review loops and TODO tracking

## Skills to add as they are learned
(Agent updates this section during self-checks.)

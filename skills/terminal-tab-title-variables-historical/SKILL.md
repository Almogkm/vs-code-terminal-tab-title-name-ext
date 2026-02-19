---
name: terminal-tab-title-variables-historical
description: Historical reference for VS Code terminal tab/title variables such as ${sequence}, ${shellCommand}, and ${shellPromptInput}. Use when interpreting legacy docs or decisions, not current runtime behavior.
---

# Terminal Tab Title Variables (Historical)

## Purpose
This skill records historical knowledge about VS Code terminal tab/title variables, including `${sequence}`, `${shellCommand}`, and `${shellPromptInput}`. It exists as reference context, not as current runtime behavior.

## When to Use
- When reviewing historical design decisions.
- When interpreting older docs/checkpoints mentioning `${sequence}`.
- When comparing prior approach vs current rename-command approach.

## Inputs
- Historical docs/checkpoints mentioning terminal title variables.
- VS Code terminal tab title format references.

## Outputs
- Accurate historical context in docs and decisions.
- Reduced confusion when reading old checkpoints.

## Procedure
1. Identify variable references in historical notes.
2. Mark them as historical where current runtime no longer depends on them.
3. Preserve prior context without reintroducing deprecated behavior.

## Constraints
- Must:
  - Treat these variables as historical reference in this repository context.
  - Preserve prior documentation context non-destructively.
- Must Not:
  - Reintroduce `${sequence}` as the active rename mechanism without explicit design change.
- Avoid:
  - Mixing historical and current behavior statements without labels.

## Examples
- Example 1:
  - Context: A checkpoint references `${sequence}` for tab naming.
  - Steps:
    - Add a historical label next to that note.
    - Keep the original line accessible.
  - Expected result:
    - Readers can distinguish old approach from current implementation.

## Verification
- Search docs for `${sequence}` references and confirm historical labeling.

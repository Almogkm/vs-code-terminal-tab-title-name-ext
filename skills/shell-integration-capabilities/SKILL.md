---
name: shell-integration-capabilities
description: Shell integration capability and quality-level awareness (None/Basic/Rich). Use when gating behavior by metadata quality and diagnosing shell-specific differences.
---

# Shell Integration Capabilities and Quality Levels

## Purpose
This skill captures knowledge that shell integration capability can vary by shell and quality level (None/Basic/Rich). It informs feature gating and expected metadata quality.

## When to Use
- When handling shell-specific behavior differences.
- When diagnosing missing command metadata or event quality.
- When documenting expected behavior under capability levels.

## Inputs
- Shell integration capability observations.
- Supported shell context.
- Extension logs and event payload availability.

## Outputs
- Capability-aware behavior decisions.
- Clear expectations for None/Basic/Rich environments.

## Procedure
1. Detect available shell integration capability level.
2. Map behavior expectations to that level.
3. Gate advanced behavior on sufficient capability.
4. Log capability-driven decisions.

## Constraints
- Must:
  - Account for None/Basic/Rich quality-level differences.
  - Keep behavior safe when capability is low.
- Must Not:
  - Assume Rich-level metadata in all environments.
- Avoid:
  - Silent fallback behavior without operator-visible logs.

## Examples
- Example 1:
  - Context: Command-line metadata is absent for a terminal.
  - Steps:
    - Classify capability as insufficient.
    - Skip rename automation for that path.
  - Expected result:
    - No harmful behavior and clear debug output.

## Verification
- Validate log lines indicate capability level and chosen behavior path.

## Notes
The source statement names quality levels but does not define exact criteria mapping. Keep level handling explicit in docs/code comments where decisions are made.

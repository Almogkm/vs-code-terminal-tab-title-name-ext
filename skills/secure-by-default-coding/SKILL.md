---
name: secure-by-default-coding
description: Secure-by-default coding practices for this extension, including treating command text as untrusted and sanitizing derived titles. Use when implementing parsing, rename logic, and hardening changes.
---

# Secure-by-Default Coding Practices

## Purpose
This skill captures the repo’s secure-by-default expectation for extension logic. It keeps command-driven behavior safe, non-executing, and constrained.

## When to Use
- When handling user-provided terminal command text.
- When adding sanitization or title-construction logic.
- When evaluating hardening changes and failure modes.

## Inputs
- Command-line strings and parsed fields.
- Sanitization functions and title limits.
- Risk constraints documented across repo docs.

## Outputs
- Sanitized terminal titles.
- No execution of user command content.
- Safer failure behavior with explicit logs.

## Procedure
1. Treat command input as untrusted data.
2. Sanitize derived title fields before use.
3. Keep automation limited to rename commands only.
4. Log decisions needed for debugging without telemetry coupling.

## Constraints
- Must:
  - Keep coding secure-by-default.
  - Sanitize derived strings before applying terminal renames.
- Must Not:
  - Execute user command strings.
  - Add hidden side effects to user settings.
- Avoid:
  - Expanding trust boundaries without explicit need.

## Examples
- Example 1:
  - Context: A command line contains special characters.
  - Steps:
    - Parse command text.
    - Sanitize title output.
    - Apply rename using sanitized value only.
  - Expected result:
    - Safe rename behavior without command execution.

## Verification
- Confirm sanitization strips unsafe/control content.
- Confirm runtime path never executes parsed user command text.

## Notes
The source statement is high level and does not enumerate all controls. Preserve secure-by-default intent and document any additional controls separately when introduced.

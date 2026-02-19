---
name: shell-integration-activation-vscode-193-plus
description: Shell integration activation and version-availability signals (including VS Code 1.93+ reference). Use when validating API availability assumptions and compatibility constraints.
---

# Shell Integration Activation Constraints (VS Code 1.93+)

## Purpose
This skill records the learned constraint that shell-integration activation/version availability signals matter (including a VS Code 1.93+ reference point). It supports compatibility checks and guarded feature use.

## When to Use
- When validating API availability assumptions.
- When setting or reviewing extension engine/version constraints.
- When diagnosing differences across VS Code versions.

## Inputs
- VS Code version/engine constraints.
- Observed shell integration activation behavior.
- Event/API availability checks.

## Outputs
- Version-aware feature gating.
- Reduced breakage from unsupported API assumptions.

## Procedure
1. Check extension engine/version constraints.
2. Verify runtime API availability before use.
3. Log unavailable features with actionable wording.
4. Keep fallback behavior safe and non-destructive.

## Constraints
- Must:
  - Respect shell integration activation/version availability constraints.
  - Guard API usage with capability checks.
- Must Not:
  - Treat version-related assumptions as universally true without checks.
- Avoid:
  - Hard-coding behavior that requires unavailable APIs.

## Examples
- Example 1:
  - Context: Event API is unavailable in current host.
  - Steps:
    - Detect missing API.
    - Disable event-driven behavior.
    - Emit explicit diagnostic log.
  - Expected result:
    - Extension remains stable with clear diagnostics.

## Verification
- Confirm logs report feature unavailable state when APIs are missing.

## Notes
The source statement includes a version signal (`VS Code 1.93+`) but does not define full compatibility boundaries. Preserve the signal and keep checks runtime-based.

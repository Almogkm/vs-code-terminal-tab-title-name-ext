---
name: outputchannel-debugging
description: OutputChannel-based debugging for extension behavior, including activation/event/rename decision logging. Use when diagnosing runtime behavior without telemetry.
---

# OutputChannel-Based Debugging

## Purpose
This skill captures logging and diagnostics through a VS Code OutputChannel for extension behavior tracing. It supports telemetry-free debugging of rename decisions and event handling.

## When to Use
- When diagnosing rename behavior.
- When checking event availability and execution flow.
- When validating anti-loop/guard conditions.

## Inputs
- OutputChannel messages from the extension.
- Debug logging setting state.
- Event handling paths and state transitions.

## Outputs
- Readable operational traces for extension behavior.
- Faster root-cause analysis for naming/regression issues.

## Procedure
1. Initialize and use a dedicated OutputChannel.
2. Log key lifecycle points (activation, capability checks, start/end handling, rename decisions).
3. Keep logs concise and suppress unnecessary duplicates.
4. Use logs to verify behavior against expected scenarios.

## Constraints
- Must:
  - Use OutputChannel-based diagnostics for extension behavior.
  - Keep logs useful and telemetry-free.
- Must Not:
  - Depend on external telemetry systems for required debugging visibility.
- Avoid:
  - Noisy logs that obscure state transitions.

## Examples
- Example 1:
  - Context: Rename behavior appears inconsistent across terminals.
  - Steps:
    - Enable debug logging.
    - Reproduce command sequence.
    - Inspect OutputChannel sequence for terminal-specific decisions.
  - Expected result:
    - Clear trace of why rename/revert happened or was skipped.

## Verification
- Confirm OutputChannel contains expected lifecycle entries for test scenarios.

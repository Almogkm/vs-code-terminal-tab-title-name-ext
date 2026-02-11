# CHECKPOINTS/050_parsing_rules.md

## Summary
- Implemented a deterministic, unit-test-friendly parser for command lines.
- Parsing includes tokenization, wrapper stripping, command classification, target extraction, and title formatting.
- Handles core kinds: python/r/bash/node/pytest/make/other, with conservative rules.

## Implications for our design
- Titles can be derived consistently without VS Code APIs.
- File targets are normalized to basenames for cleaner tab labels.
- We can extend classification or option parsing without changing the core API.

## Open questions
- Whether to expand wrapper handling beyond `env/sudo/command/time`.
- Whether to add more pytest/make options in the skip list based on real usage.

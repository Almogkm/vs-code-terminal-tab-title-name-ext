# EVALS.md

## Evaluation targets
- Title persists after command completion.
- Works with common shells and VS Code tasks.
- Fails safely when shell integration is missing.

## Minimal manual checks
- Run `python script.py` and confirm the title updates and persists.
- Run `bash run.sh` and confirm the title updates and persists.
- Disable shell integration and confirm no errors or title changes.

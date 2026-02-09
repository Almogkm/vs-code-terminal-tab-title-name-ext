# DECISIONS.md

## Initial hypotheses (to verify during learning)

1) **Persistent titles require title sequences**  
VS Code’s default title behavior follows the foreground process and reverts to the shell after a command ends. To persist titles, we likely need to set the terminal title via an OSC title sequence and use `${sequence}` for terminal tab titles.

2) **Detect executions via shell execution events**  
Use VS Code terminal shell integration events (start/end) to access the executed command line in a stable way.

3) **Parsing should be deterministic and conservative**  
Prefer a small set of robust patterns; fall back to a safe generic title rather than guessing.

4) **Security-first**  
Never execute the command being observed; only emit fixed payloads into the terminal for title setting, with strict sanitization.

## Unknowns to resolve
- Are terminal shell execution events stable and available in current VS Code?
- How reliable is `${sequence}` across shells and platforms?
- Does “Run Python File in Dedicated Terminal” trigger shell execution events consistently?

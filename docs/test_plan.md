# Test Plan

**Setup**
1. Launch Extension Development Host with F5.
2. Open an integrated terminal.
3. Open the Output panel and select **Terminal Titles**.
4. Set `terminalTitles.debugLogging` to `true` for verbose logs.

**Manual Commands**
1. Run **"Terminal Titles: Debug Info"** and confirm the info message appears. PASS
2. Run **"Terminal Titles: Rename Active Terminal Temporary Test"** and confirm the active terminal title updates. PASS
3. Run **"Terminal Titles: Revert Active Terminal To Baseline"** and confirm the title reverts to the baseline. PASS

**Mode A — User-Started Terminal**
1. Run `cd tools` and confirm no rename occurs. PASS
2. Run `python3 missing.py` and confirm the title changes to `Python: missing.py`, then reverts after exit. Title didn't change - for me still a PASS
3. Run `python3 some_script.py` and confirm the title changes to `Python: some_script.py`, then reverts after exit. PASS
4. Run `Rscript analyze.R` and confirm the title changes to `R: analyze.R`, then reverts after exit. PASS
5. Run `bash run.sh` and confirm the title changes to `Sh: run.sh`, then reverts after exit. PASS
6. Run `node app.js` and confirm the title changes to `Node: app.js`, then reverts after exit. PASS

**Mode B — Dedicated Terminal**
1. Use **“Run Python File in Dedicated Terminal”** from the editor.
2. Confirm the terminal title becomes `Python: original.py` and stays fixed after the run completes. PASS
3. Run `cd tools` inside that same terminal and confirm the title remains `Python: original.py`. PASS
4. Run another script inside that same terminal and confirm the title remains `Python: original.py`. PASS

**Negative Tests**
1. Run `pytest tests/test_example.py` and confirm no rename occurs. Didn't know how to run this so ran:
```
cd Rosenlab PASS
ls -l PASS
cd ~ PASS
grep -n "foo" ~/.bashrc 2>/dev/null || true PASS
python3 -V PASS
node -v 2>/dev/null || true FAIL - changed title to `Node: null`. On `cd ~`, or any other command, title returns to `bash`.
```
New FAIL point: In un-dedicated terminal, when entering another "terminal" title should change. Examples: When running command `R` to write an R script, title should change to `R`, when running command `python3` to write a script in python title should change to `Python`, etc.
2. Run `make build` and confirm no rename occurs. PASS
3. Run `printf '\033]2;X\007'` and confirm the title does not change to `Command: printf`. PASS
4. Run builtins like `ls` or `grep` and confirm no rename occurs. PASS

**Multiple Terminals**
1. Open two terminals.
2. In terminal A, run `python3 some_script.py` and confirm only terminal A renames and reverts. PASS
3. In terminal B, run `bash run.sh` and confirm only terminal B renames and reverts. PASS
4. If terminal B is dedicated, confirm terminal A actions never change its fixed title. PASS

**Shell Integration Disabled**
1. Disable shell integration in VS Code settings.
2. Run `python3 some_script.py` and confirm no rename occurs. PASS - rename occures as in VS Code now - `bash` to `python3` back to `bash`
3. Confirm the OutputChannel reports shell execution events unavailable and no crashes occur. Not sure... After I disabled the shell integration I just see `[terminal-titles] terminal opened:` in the output channel.

**Expected Logs (debugLogging=true)**
1. `shell execution events available: yes/no`
2. `shell execution end events available: yes/no`
3. `terminal name change events available: yes/no`
4. `execution start: <command>` for run‑file commands.
5. `revert applied` after run‑file exit for Mode A.
6. `start event: dedicated terminal enforcement` and `end event: dedicated terminal enforcement` for Mode B.

Complete output channel log:
```
[terminal-titles] activated
[terminal-titles] shell execution events available: yes
[terminal-titles] shell execution end events available: yes
[terminal-titles] terminal name change events available: no
[terminal-titles] title applied: Python: calculate_TVA_single.py
[terminal-titles] title applied: bash
[terminal-titles] start event ignored: kind other
[terminal-titles] end event ignored: not temporarily renamed
[terminal-titles] execution start: python3 missing.py
[terminal-titles] parsed title: Python: missing.py
[terminal-titles] title applied: Python: missing.py
[terminal-titles] title applied: bash
[terminal-titles] revert applied
[terminal-titles] start event ignored: kind other
[terminal-titles] end event ignored: not temporarily renamed
[terminal-titles] execution start: python3 some_script.py
[terminal-titles] parsed title: Python: some_script.py
[terminal-titles] title applied: Python: some_script.py
[terminal-titles] title applied: bash
[terminal-titles] revert applied
[terminal-titles] start event ignored: kind other
[terminal-titles] end event ignored: not temporarily renamed
[terminal-titles] execution start: Rscript R_script.R
[terminal-titles] parsed title: R: R_script.R
[terminal-titles] title applied: R: R_script.R
[terminal-titles] title applied: bash
[terminal-titles] revert applied
[terminal-titles] execution start: bash ~/echo_bash.sh
[terminal-titles] parsed title: Bash: echo_bash.sh
[terminal-titles] title applied: Bash: echo_bash.sh
[terminal-titles] title applied: bash
[terminal-titles] revert applied
[terminal-titles] start event ignored: kind other
[terminal-titles] end event ignored: not temporarily renamed
[terminal-titles] execution start: node node_app.js
[terminal-titles] parsed title: Node: node_app.js
[terminal-titles] title applied: Node: node_app.js
[terminal-titles] title applied: bash
[terminal-titles] revert applied
[terminal-titles] terminal opened: 
[terminal-titles] start event: dedicated terminal enforcement
[terminal-titles] title applied: Python: some_script.py
[terminal-titles] end event: dedicated terminal enforcement
[terminal-titles] title applied: Python: some_script.py
[terminal-titles] start event: dedicated terminal enforcement
[terminal-titles] end event: dedicated terminal enforcement
[terminal-titles] title applied: Python: some_script.py
[terminal-titles] title applied: Python: some_script.py
[terminal-titles] start event: dedicated terminal enforcement
[terminal-titles] end event: dedicated terminal enforcement
[terminal-titles] title applied: Python: some_script.py
[terminal-titles] title applied: Python: some_script.py
[terminal-titles] start event: dedicated terminal enforcement
[terminal-titles] title applied: Python: some_script.py
[terminal-titles] end event: dedicated terminal enforcement
[terminal-titles] title applied: Python: some_script.py
[terminal-titles] start event: dedicated terminal enforcement
[terminal-titles] title applied: Python: some_script.py
[terminal-titles] end event: dedicated terminal enforcement
[terminal-titles] title applied: Python: some_script.py
[terminal-titles] start event ignored: targetType not file
[terminal-titles] end event ignored: not temporarily renamed
[terminal-titles] start event ignored: kind other
[terminal-titles] end event ignored: not temporarily renamed
[terminal-titles] start event ignored: kind other
[terminal-titles] end event ignored: not temporarily renamed
[terminal-titles] start event ignored: kind other
[terminal-titles] end event ignored: not temporarily renamed
[terminal-titles] start event ignored: targetType not file
[terminal-titles] end event ignored: not temporarily renamed
[terminal-titles] execution start: node -v 2>/dev/null || true
[terminal-titles] command truncated for parsing: node -v 2>/dev/null
[terminal-titles] parsed title: Node: null
[terminal-titles] end event ignored: not temporarily renamed
[terminal-titles] title applied: Node: null
[terminal-titles] start event ignored: kind other
[terminal-titles] title applied: bash
[terminal-titles] revert applied
[terminal-titles] execution start: node -v 2>/dev/null || true
[terminal-titles] command truncated for parsing: node -v 2>/dev/null
[terminal-titles] parsed title: Node: null
[terminal-titles] end event ignored: not temporarily renamed
[terminal-titles] title applied: Node: null
[terminal-titles] execution start: python3 -V 2>/dev/null || true
[terminal-titles] command truncated for parsing: python3 -V 2>/dev/null
[terminal-titles] parsed title: Python: null
[terminal-titles] title applied: Python: null
[terminal-titles] title applied: bash
[terminal-titles] revert applied
[terminal-titles] start event ignored: targetType not file
[terminal-titles] end event ignored: not temporarily renamed
[terminal-titles] start event ignored: targetType not file
[terminal-titles] end event ignored: not temporarily renamed
[terminal-titles] start event ignored: targetType not file
[terminal-titles] end event ignored: not temporarily renamed
[terminal-titles] ignored internal title command
[terminal-titles] end event ignored: not temporarily renamed
[terminal-titles] terminal opened: 
[terminal-titles] execution start: python3 some_script.py
[terminal-titles] parsed title: Python: some_script.py
[terminal-titles] title applied: Python: some_script.py
[terminal-titles] title applied: bash
[terminal-titles] revert applied
[terminal-titles] execution start: python3 other_script.py
[terminal-titles] parsed title: Python: other_script.py
[terminal-titles] title applied: Python: other_script.py
[terminal-titles] title applied: bash
[terminal-titles] revert applied
[terminal-titles] execution start: bash ~/echo_bash.sh
[terminal-titles] parsed title: Bash: echo_bash.sh
[terminal-titles] title applied: Bash: echo_bash.sh
[terminal-titles] title applied: bash
[terminal-titles] revert applied
[terminal-titles] start event: dedicated terminal enforcement
[terminal-titles] title applied: Python: some_script.py
[terminal-titles] end event: dedicated terminal enforcement
[terminal-titles] title applied: Python: some_script.py
[terminal-titles] start event: dedicated terminal enforcement
[terminal-titles] end event: dedicated terminal enforcement
[terminal-titles] title applied: Python: some_script.py
[terminal-titles] title applied: Python: some_script.py
[terminal-titles] execution start: python3 some_script.py
[terminal-titles] parsed title: Python: some_script.py
[terminal-titles] title applied: Python: some_script.py
[terminal-titles] title applied: bash
[terminal-titles] revert applied
[terminal-titles] terminal opened: 
[terminal-titles] terminal opened: 
[terminal-titles] terminal opened: 
[terminal-titles] terminal opened: 
[terminal-titles] terminal opened: 
```


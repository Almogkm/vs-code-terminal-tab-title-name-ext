# Test Plan

**Setup**
1. Launch Extension Development Host with F5.
2. Open an integrated terminal.
3. Open the Output panel and select **Terminal Tab Titles**.
4. Set `terminalTabTitles.debugLogging` to `true` for verbose logs.

**Manual Commands**
1. Run **"Terminal Tab Titles: Debug Info"** and confirm the info message appears.
2. Run **"Terminal Tab Titles: Rename Active Terminal Temporary Test"** and confirm the active terminal title updates.
3. Run **"Terminal Tab Titles: Revert Active Terminal To Baseline"** and confirm the title reverts to the baseline.

**Mode A — User-Started Terminal**
1. Run `cd tools` and confirm no rename occurs.
2. Run `python3 missing.py` and confirm the title changes to `Python: missing.py`, then reverts after exit.
3. Run `python3 some_script.py` and confirm the title changes to `Python: some_script.py`, then reverts after exit.
4. Run `Rscript analyze.R` and confirm the title changes to `R: analyze.R`, then reverts after exit.
5. Run `bash run.sh` and confirm the title changes to `Sh: run.sh`, then reverts after exit.
6. Run `node app.js` and confirm the title changes to `Node: app.js`, then reverts after exit.
7. Run `/bin/python3 /full/path/some_script.py` with a **different** active editor file (or none) and confirm temporary rename then revert; terminal must **not** become fixed/dedicated.
8. **Fresh EDH / first terminal baseline regression:** open the first terminal, run `python3 other_script.py`, and confirm the title reverts to `bash` (not `python3`).
9. Run `python3 "with space.py"` and confirm the title becomes `Python: with space.py`, then reverts.
10. Run `/bin/python3 "/abs/path/with space.py"` and confirm the title becomes `Python: with space.py`, then reverts.

**Mode B — Dedicated Terminal**
1. Use **“Run Python File in Dedicated Terminal”** from the editor.
2. Confirm the terminal title becomes `Python: original.py` and stays fixed after the run completes (even if it briefly shows `bash`).
3. Run `cd tools` inside that same terminal and confirm the title remains `Python: original.py`.
4. Run another script inside that same terminal and confirm the title remains `Python: original.py`.
5. Note: Dedicated mode is detected either from the baseline name at open or via the editor‑run heuristic (active editor match within ~3s of open).
6. Run “Run Python File in Dedicated Terminal” for `with space.py` and confirm the title becomes and stays `Python: with space.py`.

**Negative Tests**
1. Run `node -v 2>/dev/null || true` and confirm **no rename** occurs.
2. Run `python3 -V 2>/dev/null || true` and confirm **no rename** occurs.
3. Run `make build` and confirm no rename occurs.
4. Run `printf '\033]2;X\007'` and confirm the title does not change to `Command: printf`.
5. Run builtins like `ls` or `grep` and confirm no rename occurs.

**Multiple Terminals**
1. Open two terminals.
2. In terminal A, run `python3 some_script.py` and confirm only terminal A renames and reverts.
3. In terminal B, run `bash run.sh` and confirm only terminal B renames and reverts.
4. If terminal B is dedicated, confirm terminal A actions never change its fixed title.

**Shell Integration Disabled**
1. Disable shell integration in VS Code settings.
2. Run `python3 some_script.py` and confirm no rename occurs.
3. Confirm the OutputChannel reports shell execution events unavailable and no crashes occur.

**Expected Logs (debugLogging=true)**
1. `shell execution events available: yes/no`
2. `shell execution end events available: yes/no`
3. `terminal name change events available: yes/no`
4. `execution start: <command>` for run‑file commands.
5. `revert applied` after run‑file exit for Mode A.
6. `start event: dedicated terminal enforcement` and `end event: dedicated terminal enforcement` for Mode B.

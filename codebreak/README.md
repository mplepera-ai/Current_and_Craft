# CODEBREAK v0.3 — The Last Transmission

A static, client-side browser game for learning Python through a **complete, fictional nine-mission investigation**.

## Version reconciliation

This branch is based on **CODEBREAK v0.2 (PR #18)**. It integrates the larger v0.3 investigation from the earlier draft PR #17 with the v0.2 beginner/standard teaching selection, shared Python-error explanations (`learning-support.js`), and local test coverage.

**Merge order:** PR #18 first, then the integrated v0.3 PR (not the older standalone PR #17). After PR #18 is merged, the integrated PR can be retargeted from the v0.2 feature branch to `main`.

The `story-v02.js` module remains in the repository as the earlier short-case narrative reference. The new game uses the more complete story in `case-data.js`.

## Run and deploy

The Current & Craft static website hosts the game at `/codebreak/`. Serve the website over HTTP(S); opening `index.html` as `file://` will not reliably run module scripts or Web Workers.

From the website repository:

```bash
python -m http.server 8000
```

Open `http://localhost:8000/codebreak/`.

No new domain, backend, account, or GitHub Actions is required. Python runs in the player's browser using a Pyodide Web Worker, with an initial download from jsDelivr. Internet access is necessary on first load (and later unless the assets are cached).

## Files

- `index.html`: responsive terminal UI, code editor, case file explorer, chronology, notebook, and final report.
- `game.js`: browser state, mission progression, cumulative source file, output checking, evidence availability, diagnostics, localStorage.
- `case-data.js`: **fictional** story, staged case records, mission requirements, and the defined ending.
- `python-worker.mjs`: executes the entire user-authored `investigation.py` text in Pyodide with the allowed evidence supplied for the active phase.
- `reference.js`: shared searchable Python learning reference (16 explanations + 36 unrelated examples).
- `test-v03.mjs`: local structural and storyline regression checks.

## Continuous case programming model

The user edits a **single cumulative** `investigation.py` file. After each completed mission, the game saves a read-only snapshot and appends the next mission section. The old code is still present and can be modified or reused. Every Run executes the full current source from the top in a fresh Python namespace, just like running a saved script. Previous **variables created by the script** can therefore be used by later lines in the same file, but *state from a prior Run* isn't preserved independently.

The `evidence` dictionary includes all records unlocked so far. Previously unlocked records remain accessible throughout the case. `case_files` contains the corresponding simulated filenames with their text/JSON contents. Locked files are neither inserted into the Python namespace nor available in the explorer.

To avoid penalizing previously printed output, each mission checks the **last relevant lines** of the program's console output. The two function missions additionally check that their functions are defined. These are educational success checks, not a secure exam or proof of general correctness.

## Story progression

The first version ended without resolving the murder and reset evidence between challenges. v0.3 adds nine sequential chapters, timed source records, a closed-loop fictional culprit/motive/evidence chain, and a full unlockable case report. The story ending stays hidden in the UI until the final coding challenge has passed.

The original five-mission game data remains in the player's browser under `codebreak-live-case001-v1` and is *not erased*. v0.3 uses the independent storage key `codebreak-case001-v03`; existing v0.1 players begin this expanded case from chapter 1 and can inspect their archived prototype scripts in the notebook.

## Security and privacy

The game is a prototype, not a hardened multi-tenant code execution service.

- The game never sends user-authored Python to a Current & Craft backend.
- Code runs in a dedicated browser Web Worker using Pyodide, which is restarted for each execution exceeding nine seconds.
- The Web Worker is **not a comprehensive hostile-code sandbox**: browser scripting and resource-access risks still exist. Do not pass secrets, personal documents, privileged browser credentials, or private company data to its runtime.
- Evidence is fictional; there are no secret keys in case assets. Client-side source and story endings are inspectable by anyone using browser developer tools.
- Progress and saved scripts are in browser localStorage and are not synchronized across devices.
- Content is inserted into HTML as text, not evaluated as arbitrary markup.
- The production website's CSP must allow the game's static module/worker assets and Pyodide's jsDelivr dependencies. Test in the deployed environment.

## Local regression checks

```bash
node codebreak/test-v02.mjs
node codebreak/test-v03.mjs
```

Then test manually in a browser:

1. Python loads and a new case starts at Mission 1.
2. Complete the first challenge; a new file unlocks and Mission 2 is available.
3. Proceed and verify earlier evidence remains available as `evidence` and `case_files`.
4. Verify previously written code is still in `investigation.py` and notebook snapshots can be opened.
5. Reload the page in the middle of a mission; confirm code and progress persist.
6. Introduce indentation and syntax errors to inspect beginner-readable diagnostics.
7. Complete Mission 9 and confirm that the final report unlocks only then.
8. Reset v0.3; confirm earlier prototype data remains intact.
9. Check narrow/mobile responsive layout and search the Python reference library.

No automated GitHub Actions workflow is added or enabled.

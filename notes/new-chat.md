Zabon — v3 Multi-Target Baseline & Rules
v3 — Multi-Target Architecture, No Grammar Badges, Namespaced Storage 0. Session Recovery Log (read first)
The v3 app code is the active baseline.
Key v3 changes from v2:

- Multi-Target: The app now supports multiple target languages (Thai, Farsi, etc.) via a toolbar dropdown.
- No Legacy Migration: v3 starts with a clean slate. Existing v2 Thai progress is ignored.
- Namespaced Storage: All progress keys are now scoped to the target language (e.g., `zabon.th.srs`, `zabon.fa.srs`).
- Grammar Badges Removed: `cat_grammar` and all `grammar: []` tags have been removed. Study plans no longer inject grammar prerequisites.
- Manifest Routing: `manifest.json` uses `{lang}` templates for file paths (e.g., `lessons/{lang}/greetings/...`).
- Script Display Mode: A new `"displayMode": "script"` handles Perso-Arabic connection rules for Farsi.

1. Files attached at new-chat start
   `app.js` — the single IIFE (v3 baseline)
   `index.html` — the app shell
   `main.css` — language-agnostic design system
   `manifest.json` — multi-target language registry + categories
   `new-chat.md` — this document

2. Project overview
   Zabon is a language-learning web app: vanilla HTML/CSS/JS, no frameworks.
   The UI supports 7 app languages (`en, th, fa, ar, es, zh, ja`).
   The Target Language (what the user is learning) is selectable (e.g., `th`, `fa`).
   Content is routed dynamically based on the Target Language.

3. Architecture
   Single IIFE in `app.js`.
   State includes `state.settings.targetLanguage` (defaults to `th` on first launch after prompt).
   Storage keys are dynamically generated: `zabon.${targetLang}.srs`, etc.
   Manifest uses `{lang}` templating for lesson file paths.

4. Current verified state (v3 baseline)
   app.js: `STORAGE_KEYS` are dynamic. `UI_STRINGS` use `{targetLanguage}` placeholders. `cat_grammar` logic is fully removed. `loadLessonFile()` resolves `{lang}`.
   main.css: Includes `.script-cell` for Perso-Arabic connection rendering.
   manifest.json: Uses `"file": "lessons/{lang}/..."`. No `grammar` arrays.
   lessons/: Thai data exists in `lessons/th/`. Farsi data exists in `lessons/fa/`.

5. Storage-key map (Namespaced)
   | Key Pattern | Written by | Read by |
   | --- | --- | --- |
   | zabon.settings | saveState() | init() |
   | zabon.lessonLanguages | saveState() | init() |
   | zabon.${lang}.srs | SrsService | SrsService |
| zabon.${lang}.quiz | QuizProgressService | QuizProgressService |
   | zabon.${lang}.lessonsTried | markLessonTried() | init() |
| zabon.${lang}.studyPlan | StudyPlanService | StudyPlanService |
   | zabon.${lang}.studyPlanProgress | StudyPlanService | StudyPlanService |

6. Status model & key behaviors
   Lesson status values: `"complete" | "in-progress" | "skipped"`.
   Target Language Safeguard: `targetLanguage` cannot equal `appLanguage`.
   First Launch: If `targetLanguage` is missing, app halts at target selection view.
   Display Modes: `"phonetic"` (Thai script), `"script"` (Perso-Arabic connections), default (standard columns).

7. Architecture constraints
   `state.settings.targetLanguage` dictates data routing and storage namespacing.
   `state.lessonLanguages` dictates display columns and exercise pairs.
   All interactions through `bindGlobalEvents()`.
   Language-agnostic CSS only; direction via `dir` + logical CSS.

8. Process rules
   One stage at a time. Deliver one stage, then stop and wait for a completion report.
   No code/data is generated until the current stage is confirmed.
   Present the task description and file list before producing a deliverable.

9. Verification anchors (v3)
   Must return 0 hits in `app.js`: `cat_grammar`, `renderGrammarBadges`, `getUnmetGrammarPrerequisites`, `grammarTagToId`.
   Must return ≥1 hit in `app.js`: `state.settings.targetLanguage`, `zabon.${`, `lessons/{lang}`, `displayMode === "script"`.
   Must return ≥1 hit in `manifest.json`: `"file": "lessons/{lang}/`, `"displayMode": "script"`.

10. Data generation rules (v3 lesson format)
    Routing: All lesson files must be placed in `lessons/{lang}/` matching the manifest `{lang}` template.
    Display Modes:

- Default: standard word/sentence columns.
- `"phonetic"`: Large character + localized phonetic note (used for Thai).
- `"script"`: Base character + connection indicators (used for Farsi/Arabic). Requires `connections` object in item data.
  Validation: run `node tools/check-lessons.js` after saving.

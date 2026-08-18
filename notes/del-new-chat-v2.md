# Zabon — Restart Brief & Baseline Rules

**v10 — Post-LS4 TSL Conversion & Feature-Ready Baseline**

## 0. Session Recovery Log (read first)

- The v2 app code (`app.js`, `index.html`, `main.css`, `manifest.json`) is the frozen baseline.
- The `lessons/` directory is **100% compliant** with the v2 data rules. `check-lessons.js` reports **0 errors** across all **104** manifest lessons. The app is hosted and ready for end-user testing.
- **TSL Conversion Complete:** The legacy TSL books (LS1, LS2, LS3, LS4) have been fully converted from monolithic JSONs into atomic v2 lesson files (`lessons/TSL/LSX-lesson-Y.json`). They feature 7-language translations, explicit tokenization, and a minimum of 5 scenario headers per lesson. `manifest.json` has been updated to register `book_ls1` through `book_ls4` under `topic_tsl`.
- All data remediation and legacy conversion phases are **CLOSED**. Future sessions will focus on new feature development, PWA polish, or new content generation (e.g., LS5+).

### Scoped Exceptions to the Freeze (Recorded Baselines)

| Stage | File            | Change                                                                                                                        | Status       |
| :---- | :-------------- | :---------------------------------------------------------------------------------------------------------------------------- | :----------- |
| G1    | `app.js`        | `renderLesson()`: two-panel split (Words + Sentences) with per-kind dividers; `openLesson()`: Sentences panel open by default | ✅ confirmed |
| D1    | `README.md`     | Rewritten to accurately describe the v2 app, structure, and v2 data rules                                                     | ✅ confirmed |
| D2    | `index.html`    | `<head>` updated for SEO, Open Graph, Twitter Cards, and JSON-LD                                                              | ✅ confirmed |
| TSL   | `lessons/TSL/*` | Legacy LS1-LS4 converted to v2 atomic format & registered in `manifest.json`                                                  | ✅ confirmed |

## 1. Files attached at new-chat start (Stage 1)

- `app.js` — the single IIFE (post-Stage-G1 baseline)
- `index.html` — the app shell (post-Stage-D2 SEO baseline)
- `main.css` — Stage-15 language-agnostic design system
- `lessons/manifest.json` — language registry + categories + complete lesson set (including TSL LS1-LS4)
- `README.md` — project documentation
- `new-chat.md` — this document

## 2. Project overview

Zabon is a language-learning web app: vanilla HTML/CSS/JS, no frameworks, no build step. Target language Thai; the UI supports 7 app languages (`en, th, fa, ar, es, zh, ja`). Content is language-agnostic: every lesson item carries text in all 7 languages and the user toggles which languages display.

## 3. Architecture

- Single IIFE in `app.js`.
- Services: `DataService`, `MediaService`, `SrsService`, `FlashcardService`, `QuizService`, `QuizProgressService`, `StudyPlanService`.
- Rendering functions per view; one delegated click handler `bindGlobalEvents()`.
- Views (in `VIEW_IDS`): `onboarding`, `home`, `lesson`, `flashcard`, `quiz`, `build`, `progress`, `voicetest`, `help`.
- `window.ZabonV2` exposes `{ state, registry, manifest, dataService, mediaService, srsService, quizProgressService }`.

## 4. Current verified state (baseline for all stages)

- **app.js**: `STORAGE_KEYS` (11 keys), `UI_STRINGS` (full 7-language set), `CATEGORY_ICONS`, `groupCategoriesByProficiency()`, `renderItemColumn()`, `renderLesson()` (Stage G1), `getItemPool()` / `buildPlaybackUnits()` (filter headers), Quiz retry logic.
- **main.css**: Stage-15 language-agnostic design system; phonetic-mode styles; `.item-column--header`.
- **index.html**: App shell with full SEO/OG/Twitter/JSON-LD metadata in `<head>`.
- **manifest.json**: 7-language registry; `cat_test` skipped; `cat_grammar` feeds grammar subsections; `cat_reading_writing` standalone with `"displayMode": "phonetic"`; `topic_tsl` contains 4 books (LS1, LS2, LS3, LS4).
- **lessons/**: **104** validated lessons (55 thematic, 24 grammar, 2 phonetic, 23 TSL). All pass `check-lessons.js`.

## 5. Storage-key map

| Key                                                   | Written by            | Read by                                   |
| :---------------------------------------------------- | :-------------------- | :---------------------------------------- |
| `zabon.settings`, `zabon.lessonLanguages`             | `saveState()`         | `init()`                                  |
| `zabon.srs`                                           | `SrsService`          | `SrsService`                              |
| `zabon.quiz`                                          | `QuizProgressService` | `QuizProgressService`                     |
| `zabon.lessonsTried`                                  | `markLessonTried()`   | `init()`; cleared by `resetAllProgress()` |
| `zabon.onboardingComplete`, `zabon.onboardingAnswers` | onboarding flow       | `renderOnboarding()`, plan edit           |
| `zabon.studyPlan`, `zabon.studyPlanProgress`          | `StudyPlanService`    | everywhere status is shown                |
| `zabon.lessonBaseStatus`                              | `setLessonComplete()` | `setLessonComplete()`                     |
| `zabon.buildLanguages`                                | `saveBuildConfig()`   | `ensureBuildConfig()`                     |

## 6. Status model & key behaviors

- Lesson status values: `"complete" | "in-progress" | "skipped"`; `zabon.studyPlanProgress` is the single source of truth. Icons: ✅ / ⏭ / ▶.
- Complete? toggle in lesson bottom bar; `zabon.lessonBaseStatus` restores prior status on uncheck.
- Next Up card: with plan → `getNextLesson()`; without → `getNextBrowseLesson()`.
- Header Dividers (Stage G1): `"header": true` items render as non-interactive dividers, excluded from exercises/playback; lessons render two panels (Words + Sentences) with per-kind dividers; Sentences panel opens by default.
- Phonetic Display Mode: `"displayMode": "phonetic"` lessons render one Thai column with large character + localized phonetic note.

## 7. Architecture constraints (must not violate)

- `state.lessonLanguages` is the single source of truth for display/exercises.
- All interactions through `bindGlobalEvents()` via `data-action` delegation.
- Storage keys namespaced `zabon.*`; theme/font only via `documentElement.dataset`.
- Language-agnostic CSS only; direction via `dir` + logical CSS.
- UI strings respect the 7-language `UI_STRINGS` rule.
- Minimal, scoped changes.

## 8. Process rules

- One stage at a time. Deliver one stage, then stop and wait for a completion report.
- No code/data is generated until the current stage is confirmed.
- Do not refactor unrelated working content.
- Present the task description and file list before producing a deliverable.
- Clarify ambiguities before generating.

## 9. Verification anchors (run on the Stage-1 files)

- **Must return 0 hits** (`app.js` + `main.css`): `continueWhereLeftOff`, `continue-hint`, `continue-lesson`, `lastLesson`, `reviewHistory`, `completeOnboarding`, `generateStudyPlanFromAnswers`, `findLessonCategory`, `homeInitialized`, `lessonStatusNotStarted`, `flashcardSettings`, `planProgress`, `mark-complete-btn`, `plan-lesson-status`, `flashcard-start`, `quiz-start`, `startFlashcards`, `phoneticMode`.
- **Must return exactly 1 definition each** in `app.js`: `renderGrammarSubsection`, `renderStudyPlanProgressSection`, `renderNextUpCard`, `setLessonComplete`, `lessonStatusIcon`, `renderExerciseSettingsPanel`, `renderPhoneticCell`, `retryQuiz`.
- **Must return ≥1 hit** in `app.js`: `saveJSON(STORAGE_KEYS.lessonsTried`, `cat_reading_writing`, `displayMode`, `quiz-retry`, `item.header`.
- **Must return ≥1 hit** in `manifest.json`: `"displayMode": "phonetic"` for both `lesson_rw1` and `lesson_rw2`.

## 10. Two-stage restart protocol

**Stage 1 — Baseline confirmation**

- User attaches the base files (§1).
- Assistant reads all files, runs the §9 anchors, and reports: pass / expected deviation / cannot verify.
- Assistant confirms readiness and requests Stage-2 instructions/files. No data or code is generated in Stage 1.

**Stage 2 — Execution**

- If generating new lesson data: Assistant requests the target lesson file/topic, processes per §11, delivers the completed file, stops, and waits for the completion report.
- If executing code changes: Assistant awaits the specific task brief, executes with minimal scope, and stops for testing.

## 11. Data generation rules (v2 lesson format)

- **Scope:** one lesson file per stage; only that file changes.
- **Top level:** `{ "version": 2, "items": [...] }`.
- **Item kinds:**
  - Header divider: `{ "id": "header_*", "header": true, "texts": {...} }` — no `kind` field.
  - Word: `{ "id": "word_*", "kind": "word", "texts": {...} }`.
  - Sentence: `{ "id": "sentence_*", "kind": "sentence", "itemIds": [...], "texts": {...}, "tokens": {...} }`.
- **Structure:** `header_core_words` first, then numbered scenario headers (`header_scenario1..N`); within each scenario: sentences first, then the scenario's words.
- **Languages:** every `texts` and `tokens` block covers exactly the lesson's manifest `languages` array (`en, th, fa, ar, es, zh, ja`).
- **Tokens:** explicit array per language; th/zh/ja segmented into meaningful units; every `itemIds` entry must resolve to a word defined in the same file; all IDs unique.
- **Constraint:** every lesson requires a minimum of 5 scenario headers.
- **Validation:** run `node tools/check-lessons.js` after saving. It must report 0 errors.
- **Deliverable per stage:** gap-analysis table → task description & file list → full completed JSON → self-verification checklist. Then stop.

## 12. Future Roadmap & Potential Next Stages

With data remediation and TSL LS1-LS4 conversions complete, future sessions can tackle:

1. **New Content Generation:** Generating TSL LS5+ or new thematic/grammar lessons following the v2 rules.
2. **PWA Polish:** Service Worker for offline caching, `manifest.json` tweaks for install prompts, and icon generation.
3. **Audio Integration:** Replacing or supplementing Web Speech API with pre-recorded native audio files.
4. **Progress Export/Backup:** Allowing users to export/import their `zabon.*` localStorage data via JSON.
5. **UI/UX Enhancements:** New exercise types, keyboard shortcuts, or accessibility audits.

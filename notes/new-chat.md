# Zabon — Restart Brief, Baseline & Process Rules

v8 — Session Recovery & Remediation (resumes after v7)

## 0. Session Recovery Log (read first)

This project is in data remediation mode. The v2 app code (`app.js`, `index.html`, `main.css`, `manifest.json`) is the frozen baseline and must NOT be changed. Work is confined to lesson JSON files under `lessons/`, one file per stage.

One scoped exception to the freeze was granted in v6: `app.js` was updated (Stage G1) to render header-lessons as two panels (Words + Sentences) with per-kind dividers, and to open the Sentences panel by default for all lessons. This is recorded below and must be preserved as part of the baseline going forward.

All items marked ✅ below were delivered and user-confirmed in previous sessions.
Everything else is untouched.

### Priority 1 — Undefined word references & missing files (Completed in prior sessions)

| Lesson     | File                                           | Fix                                                        | Status              |
| ---------- | ---------------------------------------------- | ---------------------------------------------------------- | ------------------- |
| lesson_2_2 | lessons/food-dining/street-food.json           | created v2 (was missing)                                   | ✅ confirmed        |
| lesson_2_4 | lessons/shopping/grocery-market.json           | created v2 + `word_you`                                    | ✅ confirmed        |
| lesson_8_3 | lessons/greetings/opinions-debate.json         | added `word_discuss`                                       | ✅ confirmed        |
| lesson_2_6 | lessons/money-bank/currency-exchange.json      | added `core_request`, `core_not`                           | ✅ confirmed        |
| lesson_3_1 | lessons/transport/asking-directions.json       | added `s4_which`                                           | ✅ confirmed        |
| lesson_3_3 | lessons/transport/bus-train.json               | added `core_very`                                          | ✅ confirmed        |
| lesson_6_6 | lessons/travel-tourism/border-immigration.json | added `word_here`                                          | ✅ confirmed        |
| lesson_g19 | lessons/grammar/g19-conjunctions.json          | added `word_rice`                                          | ✅ confirmed        |
| lesson_6_1 | lessons/accommodation/hotel-checkin.json       | `word_see`, `word_here`                                    | ✅ verified on disk |
| lesson_6_2 | lessons/accommodation/hotel-requests.json      | `word_lock`                                                | ✅ verified on disk |
| lesson_4_4 | lessons/post-communication/post-office.json    | mapped `itemIds`, v2 IDs, reordered groups, added 11 words | ✅ confirmed        |
| lesson_4_5 | lessons/post-communication/phone-sim.json      | mapped `itemIds`, v2 IDs, reordered groups, added 6 words  | ✅ confirmed        |

### Stage G1 app.js change (scoped freeze lift)

| File   | Change                                                                                                                        | Status       |
| ------ | ----------------------------------------------------------------------------------------------------------------------------- | ------------ |
| app.js | `renderLesson()`: two-panel split (Words + Sentences) with per-kind dividers; `openLesson()`: Sentences panel open by default | ✅ confirmed |

### Context Drift & Truncation Note (v7 → v8 transition)

During the v7 session, remediation was attempted on the remaining Priority 1 files (`lesson_9_3`, `lesson_5_6`, `lesson_6_5`, `lesson_9_1`). However, due to context window limits and output truncation:

- The generated JSON for `lesson_6_5` (Lost Items) was partial/incomplete.
- The generated JSON for `lesson_9_1` (Hospital Emergency) was cut off mid-stream.
- **Action for v8:** The new session must verify the actual state of these files on disk. If they remain legacy v1 (with whitespace artifacts, `w_`/`s_` prefixes, empty `itemIds`, or `kind: "header"`), they must be fully regenerated and remediated from scratch according to the v2 rules.

### Remaining Priority 1 (not started / incomplete on disk)

These files currently exhibit legacy v1 traits (whitespace artifacts, noncanonical IDs, missing `itemIds`, invalid header formats, or <5 scenarios) and require full v2 remediation:

1. `lesson_5_6` (Phone Calls) — Map `itemIds`, fix `w_`/`s_` IDs, strip whitespace.
2. `lesson_6_5` (Lost Items) — Fix header format (`"header": true`), map missing `itemIds`, strip whitespace. _(Previous output incomplete)_
3. `lesson_9_1` (Hospital Emergency) — Fix header format, map `itemIds`, strip whitespace. _(Previous output truncated)_
4. `lesson_9_2` (Police Report) — Fix header format, map `itemIds`, strip whitespace.
5. `lesson_8_4` (News & Events) — Add scenarios to reach 5-header minimum, fix IDs, strip whitespace.
6. `lesson_9_3` (Natural Disaster) — Add scenarios to reach 5-header minimum, fix IDs, strip whitespace.

Priorities 2, 3, 4 (below) are entirely untouched.

## 1. Files attached at new-chat start (Stage 1)

- `app.js` — the single IIFE (post-Stage-G1 baseline; unchanged during data generation)
- `index.html` — the app shell
- `main.css` — Stage-15 language-agnostic design system
- `lessons/manifest.json` — language registry + categories + complete lesson set
- `new-chat.md` — this document

## 2. Project overview

Zabon is a language-learning web app: vanilla HTML/CSS/JS, no frameworks, no build step.
Target language Thai; the UI supports 7 app languages (`en, th, fa, ar, es, zh, ja`).
Content is language-agnostic: every lesson item carries text in all 7 languages and the user toggles which languages display.

## 3. Architecture

- Single IIFE in `app.js`.
- Services: `DataService`, `MediaService`, `SrsService`, `FlashcardService`, `QuizService`, `QuizProgressService`, `StudyPlanService`.
- Rendering functions per view; one delegated click handler `bindGlobalEvents()`.
- Views (in `VIEW_IDS`): `onboarding`, `home`, `lesson`, `flashcard`, `quiz`, `build`, `progress`, `voicetest`, `help`.
- `window.ZabonV2` exposes `{ state, registry, manifest, dataService, mediaService, srsService, quizProgressService }`.

## 4. Current verified state (baseline for all stages)

**app.js**

- `STORAGE_KEYS` — exactly 11 keys.
- `UI_STRINGS` — full set; lesson-status strings 3-state only.
- `CATEGORY_ICONS` — includes `cat_reading_writing: "🔤"`.
- `groupCategoriesByProficiency()` returns `{ tiers, standalone }`.
- `renderItemColumn()` handles `item.header` (non-interactive divider) and `displayMode === "phonetic"`.
- `renderLesson()` (Stage G1): all lessons render two sections (Words + Sentences); header dividers are duplicated into each panel they govern; Sentences panel opens by default.
- `getItemPool()` / `buildPlaybackUnits()` filter out `item.header === true`.
- Quiz retry logic (`renderQuizFinished()` / `retryQuiz()`).

**main.css** — Stage-15 language-agnostic design system; phonetic-mode styles finalized; `.item-column--header` present.
**index.html** — app shell: toolbar, action bar, bottom bar, hamburger panel, settings sheet, view containers.
**manifest.json** — 7-language registry; `cat_test` skipped; `cat_grammar` feeds grammar subsections; `cat_reading_writing` standalone with `"displayMode": "phonetic"`.

## 5. Storage-key map

| Key                                               | Written by          | Read by                               |
| ------------------------------------------------- | ------------------- | ------------------------------------- |
| zabon.settings, zabon.lessonLanguages             | saveState()         | init()                                |
| zabon.srs                                         | SrsService          | SrsService                            |
| zabon.quiz                                        | QuizProgressService | QuizProgressService                   |
| zabon.lessonsTried                                | markLessonTried()   | init(); cleared by resetAllProgress() |
| zabon.onboardingComplete, zabon.onboardingAnswers | onboarding flow     | renderOnboarding(), plan edit         |
| zabon.studyPlan, zabon.studyPlanProgress          | StudyPlanService    | everywhere status is shown            |
| zabon.lessonBaseStatus                            | setLessonComplete() | setLessonComplete()                   |
| zabon.buildLanguages                              | saveBuildConfig()   | ensureBuildConfig()                   |

## 6. Status model & key behaviors

- Lesson status values: `"complete" | "in-progress" | "skipped"`; `zabon.studyPlanProgress` is the single source of truth. Icons: ✅ / ⏭ / ▶.
- Complete? toggle in lesson bottom bar; `zabon.lessonBaseStatus` restores prior status on uncheck.
- Next Up card: with plan → `getNextLesson()`; without → `getNextBrowseLesson()`.
- Header Dividers (Stage G1): `"header": true` items render as non-interactive dividers, are excluded from exercises/playback; lessons render two panels (Words + Sentences) with per-kind dividers; Sentences panel opens by default (Words if no sentences).
- Phonetic Display Mode: `"displayMode": "phonetic"` lessons render one Thai column with large character + localized phonetic note.

## 7. Context Stray Resolution & Current Reality

Previous session logs marked several thematic categories as "complete," but a validation run revealed widespread context stray: many files were still legacy v1, lacked required v2 properties (`itemIds`, `tokens`, `version: 2`), contained broken word references, or were missing from disk.
Priority shifted to data remediation/migration. No new thematic categories are generated until the validation errors in §13 are resolved. See §0 for the live completion log.

## 8. Architecture constraints (must not violate)

- `state.lessonLanguages` is the single source of truth for display/exercises.
- All interactions through `bindGlobalEvents()` via `data-action` delegation.
- Storage keys namespaced `zabon.*`; theme/font only via `documentElement.dataset`.
- Language-agnostic CSS only; direction via `dir` + logical CSS.
- UI strings respect the 7-language `UI_STRINGS` rule.
- Minimal, scoped changes. Data-generation stages modify exactly one lesson JSON file; no app code changes.

## 9. Process rules

1. One stage at a time. Deliver one stage, then stop and wait for a completion report.
2. No code/data is generated until the current stage is confirmed.
3. Do not refactor unrelated working content.
4. Present the task description and file list before producing a deliverable.
5. Clarify ambiguities before generating.

## 10. Verification anchors (run on the Stage-1 files)

- **Must return 0 hits** (`app.js` + `main.css`): `continueWhereLeftOff`, `continue-hint`, `continue-lesson`, `lastLesson`, `reviewHistory`, `completeOnboarding`, `generateStudyPlanFromAnswers`, `findLessonCategory`, `homeInitialized`, `lessonStatusNotStarted`, `flashcardSettings`, `planProgress`, `mark-complete-btn`, `plan-lesson-status`, `flashcard-start`, `quiz-start`, `startFlashcards`, `phoneticMode`.
- **Must return exactly 1 definition each** in `app.js`: `renderGrammarSubsection`, `renderStudyPlanProgressSection`, `renderNextUpCard`, `setLessonComplete`, `lessonStatusIcon`, `renderExerciseSettingsPanel`, `renderPhoneticCell`, `retryQuiz`.
- **Must return ≥1 hit** in `app.js`: `saveJSON(STORAGE_KEYS.lessonsTried`, `cat_reading_writing`, `displayMode`, `quiz-retry`, `item.header`.
- **Must return ≥1 hit** in `manifest.json`: `"displayMode": "phonetic"` for both `lesson_rw1` and `lesson_rw2`.

## 11. Two-stage restart protocol

**Stage 1 — Baseline confirmation**

1. User attaches the base files (§1).
2. Assistant reads all files, runs the §10 anchors, and reports: pass / expected deviation / cannot verify.
3. Assistant confirms readiness and requests Stage-2 instructions/files. No data or code is generated in Stage 1.

**Stage 2 — Execution**

- If generating/fixing lesson data: Assistant requests the target lesson file, processes per §12, delivers the completed file, stops, and waits for the completion report.
- If executing code changes: Assistant awaits the specific task brief, executes with minimal scope, and stops for testing.

## 12. Data generation rules (v2 lesson format)

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
- **Deliverable per stage:** gap-analysis table → task description & file list → full completed JSON → self-verification checklist. Then stop.

## 13. Remaining Tasks & Remediation Plan

## Session Recovery Log Update (Add to Section 0)

| Priority 3 — TSL (Listening & Speaking) Migration    | Status                                          |
| ---------------------------------------------------- | ----------------------------------------------- |
| `lesson_ls1_1` to `lesson_ls1_5` (Book 1, 5 lessons) | ✅ migrated & passing (TSL_ID_SCHEME info only) |
| `lesson_ls2_1` to `lesson_ls2_6` (Book 2, 6 lessons) | ✅ migrated & passing (TSL_ID_SCHEME info only) |

_Note: The TSL migration phase is now fully closed. All 11 TSL lessons pass the `check-lessons.js` validation script._

---

## Remaining Tasks & Remediation Plan (Replace Section 13)

### Priority 1: Critical Data Fixes — ✅ COMPLETED

All broken references, missing properties, whitespace artifacts, and invalid headers have been resolved.

### Priority 2: Reading/Writing & Grammar — ✅ COMPLETED

Phonetic lessons (`lesson_rw1`, `lesson_rw2`) and all 24 grammar lessons (`lesson_g01`–`lesson_g24`) are fully migrated to v2 and passing.

### Priority 3: TSL (Listening & Speaking) Migration — ✅ COMPLETED

All 11 TSL lessons (`lesson_ls1_1`–`lesson_ls2_6`) have been migrated to v2 format (explicit `tokens` arrays for all 7 languages, `itemIds` mapped). They pass validation with the expected `TSL_ID_SCHEME` info notes.

### Priority 4: Final Thematic Remediation (5th Scenario Additions)

Only **3 lessons** remain failing in the entire manifest. They currently contain 4 scenarios and require a 5th scenario (header + sentences + words) to satisfy the `MIN_SCENARIOS` (≥5) rule:

1. **`lesson_4_7`** (`lessons/entertainment/gym-fitness.json`)
   - _Current state:_ 4 scenarios. Needs Scenario 5 (e.g., "Wrapping Up / Memberships").
2. **`lesson_5_3`** (`lessons/entertainment/cinema.json`)
   - _Current state:_ 4 scenarios. Needs Scenario 5 (e.g., "Concessions / Leaving").
3. **`lesson_8_1`** (`lessons/religion-culture/temple.json`)
   - _Current state:_ 4 scenarios. Needs Scenario 5 (e.g., "Monk Interactions / Donations").

_Once these 3 scenarios are added, the `lessons/` directory will be 100% compliant with the v2 data rules, and `check-lessons.js` will report 0 errors._

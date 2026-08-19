# Zabon — v3 Multi-Target Baseline & Rules

## Session Recovery Log (read first)

The v3 app code is the active baseline.

- **Task 1 (Blank Page Bug):** FIXED. The `init()` flow correctly halts at the target selection view if no language is chosen.
- **Task 2 (Grammar Restructure):** FIXED. Grammar lessons are consolidated into `cat_grammar_intro`, `cat_grammar_inter`, and `cat_grammar_adv`.
- **Task 3 (Routing & "Not Implemented" Guard):** IMPLEMENTED. `IMPLEMENTED_TARGET_LANGUAGES` guards the Home view.
- **CRITICAL REGRESSION (Language Selection Inactive):** Selecting a language does nothing.
  - **Root Cause 1:** `handleTargetSelection` was calling a non-existent `renderTargetLanguageControl()` function. (This line has been deleted by the user, but the issue persists).
  - **Root Cause 2 (Confirmed):** The provided `app.js` and `manifest.json` files contain **trailing spaces** in string literals (e.g., `"th "` instead of `"th"`, `"code ": "en "`). This causes `registry.has(langCode)` and `IMPLEMENTED_TARGET_LANGUAGES.includes()` to fail silently.
  - **Root Cause 3 (Architecture):** The app uses a **single `<main>` element** containing multiple `<section>` elements for views. Previous AI responses hallucinated 10 separate `<main>` tags, which is incorrect and breaks the DOM.

## Immediate Fix Required (Stage 3 Recovery)

Before proceeding to Farsi, we must fix the target selection. Provide exact, safe find/replace blocks for:

**Step 1: Fix Trailing Spaces in `app.js` and `manifest.json`**
Instruct the user to perform a global find/replace to remove trailing spaces inside string quotes for language codes and keys.

- Find: `"th "` -> Replace: `"th"`
- Find: `"fa "` -> Replace: `"fa"`
- Find: `"en "` -> Replace: `"en"`
- Find: `"code "` -> Replace: `"code"`
  _(Provide a safe regex or explicit instructions to clean these up without breaking the JSON/JS syntax)._

**Step 2: Verify `IMPLEMENTED_TARGET_LANGUAGES` in `app.js`**
Ensure it is clean and includes Farsi:
`const IMPLEMENTED_TARGET_LANGUAGES = Object.freeze(["th", "fa"]);`

**Step 3: Verify `index.html` Structure**
Confirm that `index.html` has exactly **one** `<main>` container (e.g., `<main id="app-main" class="app-main">`) that holds the view `<section>` elements. Do not generate or suggest multiple `<main>` tags.

**Step 4: Ensure `handleTargetSelection` is clean**
Verify that `handleTargetSelection` in `app.js` correctly updates `state.settings.targetLanguage`, calls `saveState()`, re-initializes the namespaced services, and calls `goHome()` without calling any missing functions.

## Next Stage Goals (Remaining v3 Stages)

### Task 1: Stage 4 - Farsi Data & Script Display Mode

- **Farsi (`fa`) is the next language to implement.**
- Update `renderScriptCell()` in `app.js`. Currently, it just dumps the raw `connections` string as text. It needs to parse the `connections` string (e.g., `"isolated: ب | initial: بـ | medial: ـبـ | final: ـب"`) and render the 4 Perso-Arabic forms in a clean CSS grid.
- Generate the Farsi `cat_reading_writing` JSON data (`lessons/fa/reading-writing/consonants-vowels-tones.json`) utilizing the `"displayMode": "script"` structure.
- Generate a starter set of Farsi thematic lessons (`lessons/fa/greetings/meeting-people.json` and `introductions.json`).

### Task 2: Stage 5 - i18n Polish & Edge Cases

- Update `UI_STRINGS` to use dynamic placeholders (e.g., `"Your current {targetLanguage} level?"`).
- Ensure `MediaService` and Voice Test dynamically query the BCP47 code of the Target Language.
- Verify RTL/LTR mixed-direction rendering in the lesson columns.

## Crucial Architecture Rules (Do Not Hallucinate)

1. **Single Main Container:** The DOM has one `<main>` element. Views are rendered as `<section>` elements within it, or dynamically swapped. Never suggest multiple `<main>` tags.
2. **The Manifest is GLOBAL:** `manifest.json` contains all categories and lessons for all languages. **DO NOT** filter categories by target language in `app.js`. **DO NOT** duplicate categories per language in `manifest.json`.
3. **Routing is handled by tokens:** Lesson files use the `lessons/{lang}/...` path. The `{lang}` token is replaced dynamically by `loadLessonFile()` based on `state.settings.targetLanguage`.
4. **Data Generation Rules:**
   - Top level: `{ "version": 2, "items": [...] }`.
   - Item kinds: `Header`, `Word`, `Sentence`, and `Character` (exception: used specifically for alphabet/reading lessons, paired with `"displayMode": "phonetic"` or `"script"`).
   - Languages: every `texts` and `tokens` block must cover exactly the lesson's manifest `languages` array.

## Process rules

1. One stage at a time. Deliver one stage, then stop and wait for a completion report.
2. No code/data is generated until the current stage is confirmed.
3. Do not refactor unrelated working content.
4. Present the task description and file list before producing a deliverable.
5. When providing code changes, give **exact** find/replace blocks or explicit line locations. Do not say "find the place where it reads...".
6. Keep markdown output cohesive and avoid complex nested HTML that might split the response.

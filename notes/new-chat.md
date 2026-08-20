# Zabon — v3.1 Data Compliance & Grammatical Targeting

## Session Recovery Log (read first)

The v3.1 Architecture and UI are fully complete and verified.

- **v3.1 Stage 1 (Architecture):** COMPLETED. Decoupled App/Target/Lesson languages. Flattened manifest (removed `{lang}` tokens). Introduced `translations` (data constraints) and `targets` (pedagogical routing).
- **v3.1 Stage 2 (UI/UX):** COMPLETED. Implemented the Enhanced Next Up Card (compact mobile-first design) and the interactive Grammar Rule Overlay (bottom sheet).
- **Current Goal (Stage 3):** Data Compliance & Grammatical Validation. We must audit all existing lesson JSON files against the strict constraints defined in the Lesson Creation Guide, and ensure the `targets` array in the manifest perfectly aligns with the lesson's `rules`.

## Crucial Architecture Rules (Do Not Hallucinate)

1. **Language-Agnostic Entities:** A lesson is a single logical entity containing all languages. Files are stored by domain (e.g., `lessons/greetings/meeting-people.json`), NEVER by language.
2. **Manifest Schema:** Uses `translations` (array of available languages in the JSON) and `targets` (array of languages this lesson is pedagogically meant for).
3. **Grammar Registry:** `manifest.json` contains a global `grammar_rules` array. Lessons link to this via the `rules: ["Rule_ID"]` array.
4. **Single Main Container:** The DOM has one `<main>` element. Views are `<section>` elements.
5. **No `{lang}` tokens:** The `{lang}` routing token is obsolete. `loadLessonFile()` fetches the static path directly.

## Grammatical Targeting Logic (How `rules` dictate `targets`)

A lesson's `targets` array MUST be derived from its `rules` array. If a lesson teaches a grammatical structure that only applies to specific language families, it must be hidden from learners of other families.

- **Universal Rules:** If a lesson has no specific structural rules (e.g., "Numbers", "Greetings"), `targets` includes all available languages.
- **Structural Rules:** If a lesson has `rules: ["SVO"]`, the `targets` array must ONLY include languages that follow SVO word order (e.g., `["en", "es", "th"]`). It must explicitly exclude SOV languages like Farsi (`fa`) or Japanese (`ja`).
- **Language-Specific Rules:** If a lesson has `rules: ["Politeness_Particles"]` (which is specific to Thai), the `targets` array must be strictly `["th"]`.

## The "Rule of 5" & Scenario-Based Design Constraints

Every thematic lesson JSON file MUST adhere to this structure to ensure the exercise engines (Flashcards, Quizzes, Build) have enough data to generate distractors:

1. **5 Conversational Scenarios:** The lesson must be divided into exactly 5 distinct, realistic scenarios (represented by `header` items).
2. **Natural Volume:** Each scenario must contain enough `Word` and `Sentence` items (minimum 5 words and 5 sentences per scenario is the baseline).
3. **Everyday Language:** Prioritize natural, everyday expressions over stiff textbook phrases.
4. **Exception:** Reading/Writing (Script/Phonetic) lessons are exempt from conversational scenarios but require a minimum of 5 characters/glyphs with their connection forms.

---

## Immediate Tasks for the Next Session (Stage 3)

Before manually editing any JSON files, the first task is to write **Two Node.js Validation Scripts** (`tools/validate-lessons.js` and `tools/validate-targets.js`) to audit the entire codebase.

### Task 1: Grammatical Target Audit (`tools/validate-targets.js`)

This script will read `manifest.json` and verify that every lesson's `targets` array matches its `rules` array based on a defined linguistic map.

- **Input:** `manifest.json` and a hardcoded `GRAMMAR_TO_LANGUAGES` map inside the script (e.g., `SVO: ["en", "es", "th"]`, `SOV: ["ja", "fa"]`, `Politeness_Particles: ["th"]`).
- **Action:** If a lesson has `rules: ["SVO"]` but its `targets` array includes `"fa"`, the script should flag it as an error and auto-correct the `targets` array to remove `"fa"`.
- **Output:** A console report of corrected lessons, and an updated `manifest.json`.

### Task 2: "Rule of 5" Content Audit (`tools/validate-lessons.js`)

This script will read every physical lesson JSON file referenced in the manifest.

- **Action:** Count the number of `header` items (scenarios). Count the number of `kind: "word"` and `kind: "sentence"` items under each header.
- **Output:** A console report categorizing every lesson as either `COMPLIANT` or `NEEDS_EXPANSION` (detailing exactly which scenarios are missing words/sentences).

---

## Process Rules for the Next Session

1. **Script First:** Deliver the Node.js validation scripts first. Wait for the user to run them and provide the console output.
2. **No Data Generation until Audit is Complete:** Only rewrite/expand the JSON files that the scripts flag as non-compliant.
3. **Strict adherence to `new-lesson.md`.** All generated JSON must follow the `version: 2`, `items: [...]` schema, including `tokens` for unsegmented languages (th, zh, ja).
4. **Present exact find/replace blocks or full file replacements** when fixing non-compliant JSON files.

## Files Attached for Context

- `app.js` (v3.1 Baseline - Architecture & UI complete)
- `main.css` (v3.1 Baseline - Compact Card & Overlay styles included)
- `manifest.json` (v3.1 Schema - `translations`, `targets`, `grammar_rules`)
- `new-lesson.md` (The definitive guide for lesson creation)
- `index.html` (App shell)

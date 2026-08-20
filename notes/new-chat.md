# Zabon — v3.1 Data Compliance & Scenario Expansion

## Session Recovery Log (read first)

The v3.1 Architecture and UI are fully complete and verified.

- **v3.1 Stage 1 (Architecture):** COMPLETED. Decoupled App/Target/Lesson languages. Flattened manifest (removed `{lang}` tokens). Introduced `translations` (data constraints) and `targets` (pedagogical routing).
- **v3.1 Stage 2 (UI/UX):** COMPLETED. Implemented the Enhanced Next Up Card (compact mobile-first design) and the interactive Grammar Rule Overlay (bottom sheet).
- **Current Goal (Stage 3):** Data Compliance. We must audit all existing lesson JSON files against the strict constraints defined in the Lesson Creation Guide (`new-lesson.md`), specifically the **"Rule of 5" (Scenario-Based Design)**.

## Crucial Architecture Rules (Do Not Hallucinate)

1. **Language-Agnostic Entities:** A lesson is a single logical entity containing all languages. Files are stored by domain (e.g., `lessons/greetings/meeting-people.json`), NEVER by language.
2. **Manifest Schema:** Uses `translations` (array of available languages in the JSON) and `targets` (array of languages this lesson is pedagogically meant for).
3. **Grammar Registry:** `manifest.json` contains a global `grammar_rules` array. Lessons link to this via the `rules: ["Rule_ID"]` array.
4. **Single Main Container:** The DOM has one `<main>` element. Views are `<section>` elements.
5. **No `{lang}` tokens:** The `{lang}` routing token is obsolete. `loadLessonFile()` fetches the static path directly.

## The "Rule of 5" Constraints (From new-lesson.md)

Every thematic lesson JSON file MUST adhere to this structure:

1. **5 Conversational Scenarios:** The lesson must be divided into exactly 5 distinct, realistic scenarios (represented by `header` items).
   - _Example (Hotel):_ 1. Check-in, 2. Check-out, 3. Reservation, 4. Room service, 5. Pickup.
2. **Natural Volume:** Each scenario must contain enough `Word` and `Sentence` items to satisfy the exercise engines (minimum 5 words and 5 sentences per scenario is a good baseline to ensure enough distractors for Quizzes).
3. **Everyday Language:** Prioritize natural, everyday expressions over stiff textbook phrases.
4. **Exception:** Reading/Writing (Script/Phonetic) lessons are exempt from conversational scenarios but require a minimum of 5 characters/glyphs with their connection forms.

## Immediate Task for the New Session: Data Validation Script

Before manually editing any JSON files, we need to write a Node.js script (`tools/validate-lessons.js`) that:

1. Reads `manifest.json` to get all lesson file paths.
2. Parses each lesson JSON file.
3. Checks if the file contains exactly 5 `header` items (representing the 5 scenarios).
4. Checks if the word/sentence count meets the minimum threshold for the exercise engines.
5. Outputs a report of which files are "Compliant" and which need "Expansion/Restructuring".

## Process Rules

1. **One step at a time.** Deliver the validation script first, wait for the user to run it and provide the output.
2. **No data generation until the audit is complete.** We only rewrite/expand the JSON files that the script flags as non-compliant.
3. **Strict adherence to `new-lesson.md`.** All generated JSON must follow the `version: 2`, `items: [...]` schema, including `tokens` for unsegmented languages (th, zh, ja).
4. **Present exact find/replace blocks or full file replacements** when fixing non-compliant JSON files.

## Files Attached for Context

- `app.js` (v3.1 Baseline - Architecture & UI complete)
- `main.css` (v3.1 Baseline - Compact Card & Overlay styles included)
- `manifest.json` (v3.1 Schema - `translations`, `targets`, `grammar_rules`)
- `new-lesson.md` (The definitive guide for lesson creation)
- `index.html` (App shell)

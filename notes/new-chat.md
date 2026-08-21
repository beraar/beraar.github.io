# Zabon v3.1 — User Testing & Final Polish (Session Recovery Context)

**Document Purpose:** This is the definitive recovery context for Zabon v3.1 Stage 4. The architecture, UI/UX, and data compliance rollouts are 100% complete. The app is now ready for end-user testing.
**Usage:** Upload this file at the start of a new chat to instantly restore the project state, process rules, and exact next steps.

---

## ✅ Current Project Status (Completed)

1. **Architecture (Stage 1):** Decoupled App/Target/Lesson languages. Flattened manifest. Introduced `translations` (data constraints) and `targets` (pedagogical routing).
2. **UI/UX (Stage 2):** Enhanced Next Up Card and interactive Grammar Rule Overlay implemented.
3. **Data Compliance (Stage 3):**
   - All 7 languages (`en`, `th`, `fa`, `ar`, `es`, `zh`, `ja`) are fully activated and compliant.
   - Strict "Rule of 5" adherence (5 scenarios, 5 words, 5 sentences per lesson) verified across all files.
   - Mandatory `tokens` arrays added for unsegmented languages (`th`, `zh`, `ja`) for word-by-word TTS highlighting.
   - Grammar file naming standardized (e.g., `universal-svo.json`, `th-politeness-particles.json`, `es-ser-estar.json`).
   - 5 legacy "ghost" files (`negation`, `quantifiers`, `relative-clauses`, `passive`, `causative`) have been fully populated with Rule of 5 compliant data and wired into `manifest.json`.
   - `lesson_rw1` correctly restricted to `targets: ["th"]`.

---

## 🛑 Process Rules for User Testing (Strictly Enforced)

1. **Feedback-Driven Updates:** Wait for the user to provide _specific_ feedback from user testing (e.g., "In `es-ser-estar.json`, scenario 3 has an unnatural Spanish translation", or "The `zh` tokens in `universal-passive.json` are misaligned").
2. **Targeted Fixes Only:** Modify _only_ the specific JSON files, `manifest.json` entries, or `app.js` constants flagged by the feedback. **Do not** regenerate entire compliant files unnecessarily.
3. **Strict Schema Adherence:** All modified JSON must strictly follow the `version: 2`, `items: [...]` schema. Unsegmented languages (`th`, `zh`, `ja`) **must** retain or receive corrected `tokens` arrays.
4. **Mandatory Re-validation:** After _every_ fix, the user will be prompted to run:
   - `node tools/validate-lessons.js`
   - `node tools/validate-targets.js`
     to guarantee the changes did not break the "Rule of 5" or grammatical targeting constraints.

---

## 📂 Files in Scope for Fixes

- `app.js` (Only `IMPLEMENTED_TARGET_LANGUAGES` or UI strings if requested)
- `manifest.json` (Grammar rules, lesson routing, file paths)
- `lessons/grammar/*.json` (Targeted vocabulary, sentence, or token corrections)
- `lessons/reading-writing/*.json` (If Thai reading feedback arises)
- `tools/validate-lessons.js` / `tools/validate-targets.js` (Only if validation logic needs a minor tweak)

---

## 🚀 Next Steps

1. The user will provide specific user testing feedback (e.g., translation tweaks, missing tokens, structural bugs).
2. The AI will generate _only_ the targeted JSON/manifest updates required to resolve the feedback.
3. The AI will provide the exact terminal commands to re-validate the changes.

**Ready for User Testing Feedback.** Please provide the first piece of feedback or bug report.

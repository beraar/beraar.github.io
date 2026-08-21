# Zabon — v3.1 Data Compliance & User Testing Finalization

## Session Recovery Log (read first)

The v3.1 Architecture, UI/UX, and Data Compliance stages are fully complete and verified and await end user testing.

- **v3.1 Stage 1 (Architecture):** COMPLETED. Decoupled App/Target/Lesson languages. Flattened manifest (removed `{lang}` tokens). Introduced `translations` (data constraints) and `targets` (pedagogical routing).
- **v3.1 Stage 2 (UI/UX):** COMPLETED. Implemented the Enhanced Next Up Card (compact mobile-first design) and the interactive Grammar Rule Overlay (bottom sheet).
- **v3.1 Stage 3 (Data Compliance & Grammatical Targeting):** COMPLETED and await end user testing.
  - Created and ran `tools/validate-lessons.js` and `tools/validate-targets.js`.
  - Expanded all thematic lesson JSON files to strictly meet the "Rule of 5" (exactly 5 distinct conversational scenarios, with a minimum of 5 words and 5 sentences per scenario).
  - Ensured all 7 languages (`en`, `th`, `fa`, `ar`, `es`, `zh`, `ja`) are fully translated in every applicable item.
  - Added mandatory `tokens` arrays for unsegmented languages (Thai, Chinese, Japanese) to support word-by-word TTS highlighting.
  - Validated and auto-corrected `manifest.json` `targets` arrays to perfectly align with grammatical `rules` (e.g., restricting Thai-specific particle lessons to `["th"]`).

## Current Goal (Stage 4): Final Completion of Data Compliance After User Testing

The codebase is now structurally compliant and awaits user testing. The immediate next step is to incorporate feedback from user testing and perform the final polish of the data compliance and resolve any hidden bugs.

## Process Rules for the Next Session

1. **Feedback-Driven Updates:** Wait for the user to provide specific feedback from user testing (e.g., specific lessons needing vocabulary tweaks, missing translations, or minor structural adjustments). Address any user discovered bugs or requests for change.
2. **Targeted Fixes Only:** Only rewrite/expand the specific JSON files or manifest entries that are flagged by the user testing feedback. Do not regenerate compliant files unnecessarily.
3. **Strict Schema Adherence:** All generated or modified JSON must strictly follow the `version: 2`, `items: [...]` schema defined in `new-lesson.md`, including `tokens` for unsegmented languages.
4. **Re-validation:** After applying any fixes, the user will be prompted to run `node tools/validate-lessons.js` and `node tools/validate-targets.js` to guarantee the changes did not break the "Rule of 5" or grammatical targeting constraints.

## Files Available for Context

- `app.js` (v3.1 Baseline - Architecture & UI complete)
- `main.css` (v3.1 Baseline - Compact Card & Overlay styles included)
- `manifest.json` (v3.1 Schema - `translations`, `targets`, `grammar_rules`)
- `new-lesson.md` (The definitive guide for lesson creation)
- `index.html` (App shell)
- `tools/validate-lessons.js` (Rule of 5 & 7-language audit script)
- `tools/validate-targets.js` (Grammatical targeting audit script)

---

### Next Steps

You can now save this content as `new-chat.md`. When you are ready to begin the next phase, simply start a new chat, upload this `new-chat.md` file, and provide the user testing feedback you'd like to address!

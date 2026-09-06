# 📘 Document 1: `new-lesson.md` (Finalized Data Generation Runbook)

This document is the single source of truth for generating milestone data. It is strictly aligned with the provided `manifest.json` structure and the `app.js` parsing logic.

## 1. Core Architectural Constraints

- **Manifest Integrity**: The `manifest.json` is the central registry. It must retain its exact top-level structure (`name`, `version`, `architecture`, `priority_tags`, `zabon.languages`, `tiers`, `milestones`). The _only_ required modification to the provided `manifest.json` is ensuring every milestone object includes the `"file": "milestones/MX.json"` property for routing (currently only M1 has it).
- **Conversation-First Pipeline**: Every lesson is generated using a strict 3-step process:
  1. **Draft**: Write 3–5 natural, culturally adapted 2-person dialogues per milestone.
  2. **Review**: Ensure idiomatic flow, appropriate register, and logical context.
  3. **Extract**: Derive the `items` and `grammar_questions` _directly_ from the finalized dialogue to ensure 100% consistency with what the user reads.
- **Front-End Interdependence**: The JSON will contain both a `dialogues` array (for the new conversational UI) and an `items` array (for backward compatibility with existing `app.js` exercise engines).

## 2. Tiered Complexity Constraints

- **Beginner (M1-M5)**: 3–4 dialogues. 4–6 turns per dialogue. Focus: Survival, high-frequency vocab, simple tenses.
- **Intermediate (M6-M10)**: 4 dialogues. 8–12 turns per dialogue. Focus: Daily routines, opinions, compound sentences, polite requests.
- **Advanced (M11-M15)**: 4–5 dialogues. 12+ turns per dialogue. Focus: Abstract concepts, negotiations, humor, idioms, nuanced register shifts.

## 3. Tokenization & Multi-Language Rules

- **Universal JSON**: Every lesson JSON file contains translations for all 7 supported languages (`en`, `th`, `fa`, `zh`, `ja`, `ar`, `es`).
- **Segmenter Languages (`th`, `zh`, `ja`)**: Explicit `tokens` arrays are **mandatory** for all target sentences. This is required by `app.js` (`dataService.tokenize`) to guarantee correct word-boundary extraction for TTS highlighting and "Build a Sentence" exercises.
- **Whitespace Languages (`en`, `fa`, `ar`, `es`)**: Explicit `tokens` are optional but recommended for complex compounds.

## 4. Lesson JSON Schema (Dual-Structure)

This schema is explicitly designed to be parsed by the provided `app.js` `openLesson` and `buildGrammarQuizSession` functions without breaking existing functionality, while introducing the new conversational data.

```json
{
  "milestone_id": "M1",
  "displayMode": "default",
  "unlock_requirements": {
    "srs_box_level": 4,
    "grammar_quiz_pass_pct": 80
  },
  "cultural_context": {
    "en": "In Thai, greetings change based on the time of day and the speaker's gender.",
    "th": "ในภาษาไทย การทักทายจะเปลี่ยนไปตามเวลาของวันและเพศของผู้พูด"
  },
  "dialogues": [
    {
      "id": "M1_d1",
      "context": "Meeting a colleague in the morning",
      "turns": [
        {
          "speaker": "A",
          "texts": {
            "en": "Good morning. How are you?",
            "th": "สวัสดีครับ สบายดีไหมครับ"
          },
          "tokens": { "th": ["สวัสดี", "ครับ", "สบายดี", "ไหม", "ครับ"] }
        },
        {
          "speaker": "B",
          "texts": {
            "en": "Good morning. I am well, thank you.",
            "th": "สวัสดีครับ สบายดี ขอบคุณครับ"
          },
          "tokens": { "th": ["สวัสดี", "ครับ", "สบายดี", "ขอบคุณ", "ครับ"] }
        }
      ]
    }
  ],
  "items": [
    {
      "header": true,
      "id": "M1_h1",
      "texts": {
        "en": "Dialogue 1: Morning Greeting",
        "th": "บทสนทนา 1: การทักทายตอนเช้า"
      }
    },
    {
      "id": "M1_t1",
      "role": "target",
      "texts": {
        "en": "Good morning. How are you?",
        "th": "สวัสดีครับ สบายดีไหมครับ"
      },
      "tokens": { "th": ["สวัสดี", "ครับ", "สบายดี", "ไหม", "ครับ"] }
    },
    {
      "id": "M1_t2",
      "role": "target",
      "texts": {
        "en": "Good morning. I am well, thank you.",
        "th": "สวัสดีครับ สบายดี ขอบคุณครับ"
      },
      "tokens": { "th": ["สวัสดี", "ครับ", "สบายดี", "ขอบคุณ", "ครับ"] }
    },
    {
      "header": true,
      "id": "M1_h2",
      "texts": { "en": "Grammar Focus", "th": "จุดเน้นไวยากรณ์" }
    },
    {
      "id": "M1_g1",
      "role": "grammar",
      "texts": {
        "en": "Polite particle (male): ครับ (khrap)",
        "th": "คำสุภาพ (ชาย): ครับ"
      }
    }
  ],
  "grammar_questions": [
    {
      "id": "M1_gq1",
      "question": {
        "en": "Which word is the polite particle for males?",
        "th": "คำใดเป็นคำสุภาพสำหรับเพศชาย?"
      },
      "options": [
        { "text": { "en": "ครับ", "th": "ครับ" } },
        { "text": { "en": "ค่ะ", "th": "ค่ะ" } }
      ],
      "correctOptionIndex": 0
    }
  ]
}
```

## 5. Execution Runbook (Copy & Paste Templates)

### 📋 Template A: Front-End Update & M1 Sample Test (IMMEDIATE NEXT STEP)

> **Prompt:**
> "We are executing the Zabon Lesson Generation Runbook.
> **Goal**: Update the front-end to support the new conversational data structure, and generate the M1 sample lesson to test the full pipeline.
> **Git Branch**: `feature/ui-dialogue-and-m1-sample`
> **Files Attached**: `manifest.json`, `app.js`, `new-lesson.md`, `new-front-end.md`.
>
> **Tasks**:
>
> 1. **Manifest Patch**: Update `manifest.json` to add `"file": "milestones/MX.json"` to all milestones (M2-M15), preserving all existing metadata.
> 2. **Front-End Update**: Apply the changes defined in `new-front-end.md` to `app.js` to render the `dialogues` array and `cultural_context`.
> 3. **M1 Data Generation**: Generate `milestones/M1.json` following the 3-step pipeline and Dual-Structure Schema. Include 3-4 micro-dialogues across all 7 languages with explicit `tokens` for `th`, `zh`, `ja`.
>
> **Testing Criteria**:
>
> - Verify M1 loads and renders the chat-bubble UI and cultural context correctly.
> - Verify TTS highlighting works using the explicit `tokens`.
> - Verify Flashcards and Grammar Quizzes still function using the extracted `items` and `grammar_questions`.
>
> **Action**: Output the updated `manifest.json`, the updated `app.js` code snippets, and the complete `M1.json`. Wait for my approval to commit and test."

---

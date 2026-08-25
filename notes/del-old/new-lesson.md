# 📘 Zabon v3.1: Lesson Creation & Modification Guide

This document serves as the single source of truth for adding, modifying, and structuring content in the Zabon v3.1 language-agnostic platform.

## 1. Core Philosophy

- **Language-Agnostic Entities:** A lesson is a single logical entity. It is not "The Thai Greeting Lesson"; it is "The Greeting Lesson" which _contains_ Thai, Farsi, English, etc.
- **Separation of Concerns:**
  - `translations`: What languages have text data inside the JSON file? (Data constraint).
  - `targets`: What languages is this lesson pedagogically appropriate for? (Routing constraint).
- **Physical Storage:** Files are stored by domain/topic (e.g., `lessons/hotel/check-in.json`), **never** by language. The `{lang}` token is obsolete.

## 2. The "Rule of 5" & Scenario-Based Design

To ensure exercises (Flashcards, Quizzes, Sentence Building) function correctly, and for the lesson to be a meaningful learning experience, every thematic lesson must adhere to the following scenario-based constraints:

- **5 Conversational Scenarios:** All thematic lessons must be built around 5 distinct, realistic conversational scenarios.
  - _Example (Hotel Accommodation):_ 1. Check-in conversation, 2. Check-out, 3. Reservation, 4. Room service, 5. Pickup and departure.
- **Everyday Language:** Each conversation must be realistic and prioritize everyday, natural language over overly formal or textbook-stiff expressions.
- **Natural Volume:** Sentences and vocabulary extracted from these 5 conversations will, by definition, exceed the minimum limits required for the exercise engines to generate distractors.
- **Exception (Reading/Writing):** Script/Phonetic lessons (e.g., Alphabets) are exempt from conversational scenarios. They require a minimum of **5 characters/glyphs** with their connection forms or phonetic notes.
- **Schema Compliance:** All lesson creation must strictly follow the v3.1 Manifest Schema process outlined below.

## 3. The v3.1 Manifest Schema (`manifest.json`)

The manifest uses a flat, relational architecture.

### A. The Lesson Entity

When adding a new lesson, it must follow this structure:

```json
{
  "id": "lesson_6_1",
  "title": {
    "en": "Hotel Check-in",
    "th": "การเช็คอินโรงแรม",
    "fa": "پذیرش هتل"
  },
  "file": "lessons/accommodation/hotel-checkin.json",
  "level": 6,
  "proficiency": "intermediate",
  "translations": ["en", "th", "fa", "ar", "es", "zh", "ja"],
  "targets": ["en", "th", "fa", "ar", "es", "zh", "ja"],
  "rules": ["Formal_Register", "Question_Formation"]
}
```

- **`file`**: Static path. No `{lang}` tokens.
- **`translations`**: Array of languages present in the physical JSON file.
- **`targets`**: Array of target languages this lesson applies to. (e.g., Hide Thai-specific particle lessons from Farsi learners here).
- **`rules`**: Array of IDs linking to the global `grammar_rules` registry (powers the interactive Grammar Overlay on the Next Up Card).

### B. The Global Grammar Registry (`manifest.json`)

Grammar concepts are centralized to power the UI badges and overlays.

```json
"grammar_rules": [
  {
    "id": "Formal_Register",
    "title": { "en": "Formal Register", "fa": "لحن رسمی" },
    "description": { "en": "Used in professional or respectful contexts...", "fa": "..." },
    "examples": [
      { "target": "I would like to check in, please.", "bridge": "می‌خواهم چک‌این کنم، لطفاً." }
    ]
  }
]
```

## 4. The Lesson JSON Payload (`lessons/topic/file.json`)

The physical JSON file contains the multilingual payload based on the 5 scenarios.

```json
{
  "version": 2,
  "items": [
    {
      "id": "h1",
      "header": true,
      "texts": {
        "en": "Scenario 1: At the Front Desk",
        "th": "สถานการณ์ที่ 1: ที่แผนกต้อนรับ"
      }
    },
    {
      "id": "w1",
      "kind": "Word",
      "texts": { "en": "Reservation", "th": "การจอง", "fa": "رزرو" }
    },
    {
      "id": "s1",
      "kind": "Sentence",
      "texts": {
        "en": "I have a reservation under Smith.",
        "th": "ฉันจองภายใต้ชื่อสมิธ",
        "fa": "من یک رزرو به نام اسمیت دارم."
      },
      "tokens": { "th": ["ฉัน", "จอง", "ภายใต้", "ชื่อ", "สมิธ"] }
    }
  ]
}
```

- **`tokens`**: Mandatory for languages without spaces (Thai, Chinese, Japanese) to enable word-by-word TTS highlighting.
- **`connections`**: Used only for `"displayMode": "script"` (Perso-Arabic).
- **`phonetic`**: Used only for `"displayMode": "phonetic"` (Thai).

## 5. UI/UX Integration (The Enhanced Next Up Card)

The data structured above directly feeds the v3.1 Enhanced Next Up Card:

- **Title & Proficiency:** Pulled from `lesson.title` and `lesson.proficiency`.
- **Grammar Badges:** Pulled from `lesson.rules` -> mapped to `grammar_rules` registry. Tapping a badge opens the bottom-sheet overlay showing the `description` and `examples` in the user's App Language.
- **Navigation:** Prev/Next buttons navigate linearly through the Study Plan array, falling back to the Category's `lesson_ids` array if no plan exists.

---

### 📋 Stages 7 to 13: Data Implementation

````text
Context: We are building a vanilla JS language learning SPA. We have implemented the core UI and logic for `kind: "letter"` exercises (Flashcards, Quiz, and an Audio-only "Spell" exercise).

Stage Goal: Create the [Chinese] ([zh]) alphabet JSON data file.

Git Branch: `feat/letter-data`

Reference JSON Schema for `kind: "letter"`:

```json
{
  "id": "zh_ren",
  "kind": "letter",
  "role": "target",
  "texts": { "zh": "人", "en": "person" },
  "phonetic": { "en": "rén" },
  "connections": {
    "isolated": "人",
    "initial": "人",
    "medial": "人",
    "final": "人"
  },
  "meta": { "category": "radical", "strokes": 2 }
}
```

[STRICT CODE OUTPUT RULES]
Only output the new JSON file content. Do not modify `app.js` or `main.css`.

````

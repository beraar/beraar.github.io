I am working on the Zabon language learning app. I need you to generate a lesson data file (JSON) for a specific lesson path defined in my `manifest.json` uploaded in this message.

The lesson path is:
lessons/accommodation/hotel-requests.json

Here are the strict constraints and instructions you MUST follow:

🚨 METADATA ADHERENCE (Length & Linguistic Complexity)
You MUST read the target lesson's `proficiency` and `level` fields from the `manifest.json` to determine the length and complexity of the generated content.
LENGTH (Based on `proficiency`):
`"beginner"` (Introductory): Generate a MINIMUM of 25 sentences.
`"intermediate"`: Generate a MINIMUM of 35 sentences.
`"advanced"`: Generate a MINIMUM of 50 sentences.
LINGUISTIC COMPLEXITY (Based on `level` 1-9):
Levels 1-3 (Beginner): Simple SVO structures, high-frequency survival vocabulary, short sentences, concrete topics.
Levels 4-6 (Intermediate): Compound sentences, natural conversational flow, specific situational vocabulary, common idioms.
Levels 7-9 (Advanced): Complex grammar (conditionals, passive voice, reported speech), nuanced dialogue, formal/informal register switching, specialized/professional vocabulary.

🚨 GRAMMAR & RULES ALIGNMENT
If the target lesson in `manifest.json` has a `"rules"` array (e.g., `"rules": ["rule_universal_svo"]`), you MUST look up that rule ID in the top-level `grammar_rules` registry. Read the `description` field carefully—it contains the strict linguistic constraints and pedagogical boundaries for that specific concept. The generated sentences MUST explicitly demonstrate these rules.

🚨 CONVERSATION SCENARIO REQUIREMENT (Thematic Lessons)
The lesson MUST be based on a realistic, everyday conversation scenario between 2 or more people. The sentences must represent actual spoken dialogue in natural, informal language (not formal, isolated, or textbook-style statements). The sequence of sentences must flow cohesively and read as a continuous, natural conversation.

🚨 STRICT STRUCTURAL & NAMING CONVENTIONS (CRITICAL FOR FRONTEND)
You MUST follow this exact JSON structure and ID naming scheme. Do NOT use lazy IDs like "h1", "s1", or "w1".
The JSON `"items"` array MUST follow this exact sequential order:
A. Scenario Sections (MUST come first):
Generate at least 5 distinct conversational scenarios.
Each scenario MUST start with a header using the prefix `"header_scenario_"` (e.g., `"header_scenario_1"`, `"header_scenario_2"`).
Under each scenario header, provide the conversational sentences.
Sentence IDs MUST use the prefix `"sentence_"` (e.g., `"sentence_1"`, `"sentence_2"`).
"CRITICAL: The dialogue MUST strictly alternate between at least two distinct speakers (e.g., Person A and Person B). Do not generate monologues. Each sentence must be a direct response, question, or natural continuation of the previous speaker's turn."

B. Words Section (MUST come last):
After all scenarios and sentences are complete, add the words header:
`{"id": "header_words", "header": true, "texts": {"en": "Words", "th": "คำศัพท์", "fa": "واژگان", "ar": "المفردات", "es": "Palabras", "zh": "词汇", "ja": "語彙"}}`
Immediately following this header, list the words extracted from the scenarios.
Word IDs MUST use the prefix `"word_"` (e.g., `"word_1"`, `"word_2"`).
Do NOT put any words at the beginning of the file. All words must be under `"Words"` at the end.
Do NOT limit the number of words to an arbitrary number. This ensures the vocabulary list is a comprehensive, exact reflection of the words actually used in the lesson's dialogue.

🚨 EXHAUSTIVE WORD EXTRACTION (CRITICAL)
You MUST extract EVERY distinct word that appears in the generated sentences.

- DO NOT limit the vocabulary list to the number of sentences.
- Include ALL words used in the text: nouns, verbs, adjectives, adverbs, pronouns, prepositions, conjunctions, and articles.
- The ONLY things you must exclude are pure punctuation marks.
- Do not arbitrarily stop adding words from the sentences to keep the list short. If a distinct word appears in the spoken sentences, it MUST have a corresponding `word_*` entry under the Words header.
- Do not duplicate words in the word list.
- Ensure the text for every word is an exact substring of the text in at least one sentence (do not use dictionary/infinitive forms if they differ from the spoken text).
  (Note: If the target lesson is a Grammar lesson belonging to `cat_grammar_*`, omit the scenario headers and words header. Simply provide a flat list of `word_*` and `sentence_*` items demonstrating the grammar rule).

SENTENCE-FIRST EXTRACTION METHOD
Because the JSON requires sentences first and vocabulary last, you will naturally generate the content in the correct order.
Step 1: Define the conversation scenarios and generate the conversational sentences FIRST.
Step 2: Review the sentences you just generated.
Step 3: Extract the core words DIRECTLY from these spoken sentences. Do NOT use dictionary/infinitive forms. The word text for every language must be an exact substring of the text in at least one sentence.

TOKENS & FORMATTING RULES
Whitespace Languages (`en`, `fa`, `ar`, `es`): You MUST generate a `"tokens"` array for these languages in every sentence. The tokens must be the exact words that reconstruct the sentence when joined by spaces.
🚨 CRITICAL TOKENIZATION RULE: Punctuation marks (., ?, !, ,, etc.) MUST remain attached to the word they follow. Do NOT separate punctuation into its own token. For example, "Excuse me." must be tokenized as `["Excuse", "me."]`, NOT `["Excuse", "me", "."]`. Joining the tokens with a single space MUST perfectly reconstruct the original text without adding erroneous spaces before punctuation.
Segmenter Languages (`th`, `zh`, `ja`): DO NOT generate the `"tokens"` array for these languages. My post-processing pipeline will handle word segmentation.
Formatting: Ensure absolutely NO trailing or leading spaces in any of the translation strings or token strings.

OUTPUT FORMAT
To ensure perfect alignment and prevent context drift, you MUST use a scratchpad before generating the JSON.
Output your response in exactly this format. Do NOT include any other conversational text, apologies, or notes outside of these blocks:
{
"items": [
{
"id": "header_scenario_1",
"header": true,
"texts": { "en": "Scenario 1: ...", "th": "...", "fa": "...", "ar": "...", "es": "...", "zh": "...", "ja": "..." }
},
{
"id": "sentence_1",
"kind": "sentence",
"texts": { "en": "...", "th": "...", "fa": "...", "ar": "...", "es": "...", "zh": "...", "ja": "..." },
"tokens": { "en": ["..."], "fa": ["..."], "ar": ["..."], "es": ["..."] }
},
...
{
"id": "header_words",
"header": true,
"texts": { "en": "Words", "th": "คำศัพท์", "fa": "واژگان", "ar": "المفردات", "es": "Palabras", "zh": "词汇", "ja": "語彙" }
},
{
"id": "word_1",
"kind": "word",
"texts": { "en": "...", "th": "...", "fa": "...", "ar": "...", "es": "...", "zh": "...", "ja": "..." }
}
]
}

### 🚨 ERROR HANDLING & PARTIAL REGENERATION (CRITICAL FOR TOKEN SAVING)

When the validation script (`validate-lessons.js`) returns a failure report with specific item errors (e.g., `[TOKEN_MISMATCH] items[17] (sentence_15)` or `[TEXT_MISMATCH] items[42] (word_12)`):

**DO NOT regenerate or output the entire JSON file.**
Outputting the whole file wastes tokens and risks context drift.

Instead, **ONLY output the specific JSON block(s) that need fixing.**

**Rules for Partial Output:**

1. **Identify the broken items:** Look at the validation report (e.g., `items[17] (sentence_15)`).
2. **Output ONLY the corrected block(s):** Provide just the JSON object for the broken `sentence_*` or `word_*`.
3. **Cascading Fixes:** If you change the `texts` of a `sentence_*` to fix a tokenization or spelling error, you **MUST** also output the corresponding `word_*` blocks that contain the modified text so they remain in sync.
4. **Format:** Output the corrected blocks as a simple JSON array or individual JSON objects, clearly labeled so I can easily copy-paste and replace them in the main file.

**Example Response for a Fix:**

```json
// Fix for sentence_15 and its affected words
[
  {
    "id": "sentence_15",
    "kind": "sentence",
    "texts": {
      "en": "Wait, let me write it down.",
      "th": "เดี๋ยว ขอจดก่อน",
      "fa": "صبر کن، بگذار بنویسم.",
      "ar": "انتظر، دعني أكتبه.",
      "es": "Espera, déjame anotarlo.",
      "zh": "等等，我记一下。",
      "ja": "待ってください、書きますので。"
    },
    "tokens": {
      "en": ["Wait,", "let", "me", "write", "it", "down."],
      "fa": ["صبر", "کن،", "بگذار", "بنویسم."],
      "ar": ["انتظر،", "دعني", "أكتبه."],
      "es": ["Espera,", "déjame", "anotarlo."]
    }
  }
]
```

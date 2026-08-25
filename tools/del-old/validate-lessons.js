#!/usr/bin/env node
/**
 * Zabon v3.1 — Structural Lesson Validator (Single File)
 *
 * Usage: node validate-lessons.js <path-to-lesson.json>
 * Example: node validate-lessons.js lessons/grammar/universal-svo.json
 */
const fs = require("fs");
const path = require("path");

// --- Constants ---
const APP_LANGUAGES = ["en", "th", "fa", "ar", "es", "zh", "ja"];
const UNSEGMENTED_LANGUAGES = ["th", "zh", "ja"];
const PROFICIENCY_THRESHOLDS = {
  beginner: 25,
  intermediate: 35,
  advanced: 50,
};

// --- Helpers ---
function cleanText(text) {
  if (typeof text !== "string") return "";
  return text
    .replace(/[\p{P}\p{S}]/gu, "")
    .toLowerCase()
    .trim();
}

function getTokenText(token) {
  if (typeof token === "string") return token;
  if (token && typeof token.text === "string") return token.text;
  return "";
}

// --- Main Execution ---
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("❌ Usage: node validate-lessons.js <path-to-lesson.json>");
  console.error(
    "   Example: node validate-lessons.js lessons/grammar/universal-svo.json",
  );
  process.exit(1);
}

const targetFileArg = args[0];
const rootDir = path.join(__dirname, "..");
const manifestPath = path.join(rootDir, "lessons/manifest.json");

if (!fs.existsSync(manifestPath)) {
  console.error("❌ FATAL: manifest.json not found at root directory.");
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const proficiencyMap = new Map();

// Build a map of filePath -> proficiency from manifest
function extractLessons(lessons) {
  if (!Array.isArray(lessons)) return;
  for (const lesson of lessons) {
    if (lesson.file && lesson.proficiency) {
      proficiencyMap.set(lesson.file, lesson.proficiency);
    }
  }
}

if (manifest.categories) {
  for (const cat of manifest.categories) extractLessons(cat.lessons);
}
if (manifest.topics) {
  for (const topic of manifest.topics) {
    if (topic.books) {
      for (const book of topic.books) extractLessons(book.lessons);
    }
  }
}

// Resolve the target file path
const targetFilePath = path.resolve(rootDir, targetFileArg);
const relativePath = path.relative(rootDir, targetFilePath).replace(/\\/g, "/");

if (!fs.existsSync(targetFilePath)) {
  console.error(`❌ FATAL: File not found: ${targetFilePath}`);
  process.exit(1);
}

console.log(`🔍 Validating: ${relativePath}\n`);

let data;
try {
  data = JSON.parse(fs.readFileSync(targetFilePath, "utf8"));
} catch (e) {
  console.error(`❌ ${relativePath}: Invalid JSON format.`);
  process.exit(1);
}

const proficiency = proficiencyMap.get(relativePath) || "beginner"; // Default fallback
const errors = validateLesson(data, proficiency);

if (errors.length > 0) {
  console.error(`❌ FAILED: ${relativePath} (Proficiency: ${proficiency})`);
  errors.forEach((err) => console.error(`   ⚠️  ${err}`));
  process.exit(1);
} else {
  console.log(`✅ PASSED: ${relativePath} (Proficiency: ${proficiency})`);
  process.exit(0);
}

// --- Validation Logic ---
function validateLesson(data, proficiency) {
  const errors = [];
  const items = data.items;

  // Rule 1 (Partial): Schema Adherence
  if (!Array.isArray(items)) {
    errors.push(`FATAL: Missing or invalid 'items' array.`);
    return errors;
  }

  let wordCount = 0;
  let sentenceCount = 0;
  const words = [];
  const sentences = [];

  // Categorize items
  for (const item of items) {
    if (item.kind === "character" || item.header) continue;
    if (item.kind === "sentence") {
      sentenceCount++;
      sentences.push(item);
    } else if (item.kind === "word") {
      wordCount++;
      words.push(item);
    }
  }

  // Rule 2: Presence of Both Kinds
  if (wordCount === 0 || sentenceCount === 0) {
    errors.push(
      `FATAL: Lesson must contain both 'word' and 'sentence' items. Found ${wordCount} words, ${sentenceCount} sentences.`,
    );
    return errors; // Stop here, cohesion check will fail anyway
  }

  // Rule 4: Level-Based Sentence Floor
  const threshold = PROFICIENCY_THRESHOLDS[proficiency] || 25;
  if (sentenceCount < threshold) {
    errors.push(
      `FATAL: ${proficiency} lesson requires at least ${threshold} sentences, found ${sentenceCount}.`,
    );
  }

  // Rule 1 & 5: Iterate items for completeness and token integrity
  for (const item of items) {
    if (item.kind === "character" || item.header) continue;
    const itemId = item.id || "unknown";
    const texts = item.texts;

    if (!texts || typeof texts !== "object") {
      errors.push(`Item ${itemId}: Missing 'texts' object.`);
      continue;
    }

    // Rule 1: 7-Language Completeness
    for (const lang of APP_LANGUAGES) {
      const val = texts[lang];
      if (typeof val !== "string" || val.trim() === "") {
        errors.push(
          `Item ${itemId}: Missing or empty translation for language '${lang}'.`,
        );
      }
    }

    // Rule 5: Token Integrity (Unsegmented Languages)
    if (item.kind === "sentence") {
      for (const lang of UNSEGMENTED_LANGUAGES) {
        if (!texts[lang] || typeof texts[lang] !== "string") continue; // Already caught by Rule 1
        const tokens = item.tokens?.[lang];
        if (!Array.isArray(tokens) || tokens.length === 0) {
          errors.push(
            `Item ${itemId}: Missing 'tokens' array for unsegmented language '${lang}'.`,
          );
          continue;
        }
        const concatenated = tokens.map(getTokenText).join("");
        // Normalize whitespace for comparison
        const cleanConcat = concatenated.replace(/\s+/g, "");
        const cleanText = texts[lang].replace(/\s+/g, "");
        if (cleanConcat !== cleanText) {
          errors.push(
            `Item ${itemId}: Token concatenation mismatch for language '${lang}'. Expected "${texts[lang]}", got "${concatenated}".`,
          );
        }
      }
    }
  }

  // Rule 3: Word-Sentence Cohesion (The "Derived From" Check)
  for (const wordItem of words) {
    const wordId = wordItem.id || "unknown";
    for (const lang of APP_LANGUAGES) {
      const wordText = wordItem.texts?.[lang];
      if (!wordText || typeof wordText !== "string" || wordText.trim() === "")
        continue;

      let found = false;

      if (UNSEGMENTED_LANGUAGES.includes(lang)) {
        // FIX: Substring match for unsegmented languages to prevent segmenter mismatch
        const cleanWord = wordText.replace(/[\p{P}\p{S}\s]/gu, "");
        if (!cleanWord) continue;

        for (const sentItem of sentences) {
          const sentText = sentItem.texts?.[lang];
          if (!sentText) continue;
          const cleanSent = sentText.replace(/[\p{P}\p{S}\s]/gu, "");

          if (cleanSent.includes(cleanWord)) {
            found = true;
            break;
          }
        }
      } else {
        // Segmented: check substring ignoring punctuation
        const cleanWord = cleanText(wordText);
        if (!cleanWord) continue;

        for (const sentItem of sentences) {
          const sentText = sentItem.texts?.[lang];
          if (!sentText) continue;
          if (cleanText(sentText).includes(cleanWord)) {
            found = true;
            break;
          }
        }
      }

      if (!found) {
        errors.push(
          `Cohesion fail: Word '${wordText}' (ID: ${wordId}) in language '${lang}' not found in any sentence.`,
        );
      }
    }
  }

  return errors;
}

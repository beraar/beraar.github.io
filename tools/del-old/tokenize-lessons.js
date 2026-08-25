#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

// --- 1. Load Real Word-Level Segmenters ---
let thSegmenter, zhSegmenter, jaSegmenter;
let missingPackages = [];

try {
  thSegmenter = require("wordcut");
  thSegmenter.init();
} catch (e) {
  console.error("❌ Failed to load/init 'wordcut':", e.message);
  missingPackages.push("wordcut");
}

try {
  const { Segment, useDefault } = require("segmentit");
  zhSegmenter = useDefault(new Segment());
} catch (e) {
  console.error("❌ Failed to load 'segmentit':", e.message);
  missingPackages.push("segmentit");
}

try {
  const TinySegmenter = require("tiny-segmenter");
  jaSegmenter = new TinySegmenter();
} catch (e) {
  console.error("❌ Failed to load 'tiny-segmenter':", e.message);
  missingPackages.push("tiny-segmenter");
}

if (missingPackages.length > 0) {
  console.error(
    `\n❌ FATAL: Missing or broken word-level segmentation packages.`,
  );
  console.error(`   Please run: npm install ${missingPackages.join(" ")}`);
  process.exit(1);
}

// --- 2. Main Execution ---
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("❌ Usage: node tokenize-lessons.js <path-to-lesson.json>");
  process.exit(1);
}

const targetFile = path.resolve(args[0]);
if (!fs.existsSync(targetFile)) {
  console.error(`❌ File not found: ${targetFile}`);
  process.exit(1);
}

console.log(`🔧 Tokenizing (Word-Level): ${targetFile}`);
const data = JSON.parse(fs.readFileSync(targetFile, "utf8"));
const UNSEGMENTED = ["th", "zh", "ja"];
let updatedCount = 0;

for (const item of data.items) {
  if (item.kind !== "sentence" || !item.texts) continue;
  if (!item.tokens) item.tokens = {};

  for (const lang of UNSEGMENTED) {
    const rawText = item.texts[lang];
    if (typeof rawText !== "string") continue;

    // 🔥 CRITICAL FIX: Clean text thoroughly to prevent invisible character mismatches
    let cleanText = rawText.trim();

    // 1. Remove zero-width spaces, zero-width joiners, and BOM
    cleanText = cleanText.replace(/[\u200B\u200C\u200D\uFEFF]/g, "");

    // 2. Normalize all whitespace (tabs, multiple spaces) to regular single spaces
    cleanText = cleanText.replace(/\s+/g, " ");

    // Update the text in the JSON so the validator compares against the clean text
    item.texts[lang] = cleanText;

    let tokens = [];

    if (lang === "th") {
      let result = thSegmenter.cut(cleanText);

      // 🔥 FIX: wordcut sometimes returns a pipe-delimited string instead of an array
      if (typeof result === "string") {
        tokens = result.split("|");
      } else if (Array.isArray(result)) {
        tokens = result;
      } else {
        tokens = [];
      }
    } else if (lang === "zh") {
      let result = zhSegmenter.doSegment(cleanText, { simple: true });
      tokens = Array.isArray(result) ? result : [];
    } else if (lang === "ja") {
      let result = jaSegmenter.segment(cleanText);
      tokens = Array.isArray(result) ? result : [];
    }

    // Filter out empty strings and pure whitespace tokens.
    // This ensures the UI highlights actual words cleanly without highlighting empty gaps.
    tokens = tokens.filter((t) => typeof t === "string" && t.trim().length > 0);

    item.tokens[lang] = tokens;
  }
  updatedCount++;
}

fs.writeFileSync(targetFile, JSON.stringify(data, null, 2), "utf8");
console.log(
  `✅ Success! Injected word-level tokens for ${updatedCount} sentences.`,
);
console.log(`👉 Now run: node tools/validate-lessons.js ${args[0]}`);

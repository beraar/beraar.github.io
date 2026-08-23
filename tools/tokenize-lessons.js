#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

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

console.log(`🔧 Tokenizing: ${targetFile}`);
const data = JSON.parse(fs.readFileSync(targetFile, "utf8"));

const UNSEGMENTED = ["th", "zh", "ja"];
let updatedCount = 0;

for (const item of data.items) {
  if (item.kind !== "sentence" || !item.texts) continue;

  if (!item.tokens) item.tokens = {};

  for (const lang of UNSEGMENTED) {
    const rawText = item.texts[lang];
    if (typeof rawText !== "string") continue;

    // 🔥 CRITICAL FIX: Trim whitespace before processing
    const cleanText = rawText.trim();

    // Update the text in the JSON to ensure no trailing spaces persist
    item.texts[lang] = cleanText;

    // --- SEGMENTATION LOGIC ---
    // Replace this with your actual segmenter (e.g., jieba, kuromoji, or API call)
    // For now, this is a fallback that splits by characters for CJK and words for Thai
    let tokens = [];
    if (lang === "zh" || lang === "ja") {
      // Basic character split (replace with your real segmenter)
      tokens = cleanText.split("").filter((c) => c.trim() !== "");
    } else if (lang === "th") {
      // Basic word split (replace with your real Thai segmenter)
      tokens = cleanText.split(/(?<=\s)|(?=\s)/).filter((t) => t.trim() !== "");
    }

    // Inject tokens
    item.tokens[lang] = tokens;
  }
  updatedCount++;
}

fs.writeFileSync(targetFile, JSON.stringify(data, null, 2), "utf8");
console.log(`✅ Success! Injected tokens for ${updatedCount} sentences.`);
console.log(`👉 Now run: node tools/validate-lessons.js ${args[0]}`);

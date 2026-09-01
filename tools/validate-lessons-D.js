#!/usr/bin/env node
/**
 * tools/validate-lessons.js — Unified Zabon Lesson Pipeline
 * Combines structural validation, tokenization, and data integrity checks.
 *
 * Usage: node tools/validate-lessons.js <path-to-lesson.json>
 */
"use strict";
const fs = require("fs");
const path = require("path");

// --- 1. Load Word-Level Segmenters ---
let thSegmenter, zhSegmenter, jaSegmenter;
let missingPackages = [];
try {
  thSegmenter = require("wordcut");
  thSegmenter.init();
} catch (e) {
  missingPackages.push("wordcut");
}
try {
  const { Segment, useDefault } = require("segmentit");
  zhSegmenter = useDefault(new Segment());
} catch (e) {
  missingPackages.push("segmentit");
}
try {
  const TinySegmenter = require("tiny-segmenter");
  jaSegmenter = new TinySegmenter();
} catch (e) {
  missingPackages.push("tiny-segmenter");
}
if (missingPackages.length > 0) {
  console.error(
    `❌ FATAL: Missing packages. Run: npm install ${missingPackages.join(" ")}`,
  );
  process.exit(1);
}

// --- 2. CLI Setup ---
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error(
    "❌ Usage: node tools/validate-lessons.js <path-to-lesson.json>",
  );
  process.exit(1);
}
const targetFile = path.resolve(args[0]);
if (!fs.existsSync(targetFile)) {
  console.error(`❌ File not found: ${targetFile}`);
  process.exit(1);
}

const errors = [];
const warnings = [];

// --- 3. Helper Functions ---
function addError(code, detail, pathStr) {
  errors.push({ code, detail, path: pathStr || "" });
}
function addWarning(code, detail, pathStr) {
  warnings.push({ code, detail, path: pathStr || "" });
}
function scanWhitespace(node, p) {
  if (node === null || node === undefined) return;
  if (typeof node === "string") {
    if (node !== node.trim())
      addError(
        "WHITESPACE",
        `Value has leading/trailing whitespace: "${node.substring(0, 30)}..."`,
        p,
      );
    return;
  }
  if (Array.isArray(node)) {
    node.forEach((v, i) => scanWhitespace(v, `${p}[${i}]`));
    return;
  }
  if (typeof node === "object") {
    for (const key of Object.keys(node)) {
      if (key !== key.trim())
        addError("WHITESPACE_KEY", `Key has whitespace: "${key}"`, p);
      scanWhitespace(node[key], p ? `${p}.${key}` : key);
    }
  }
}

// --- 4. Main Execution Pipeline ---
console.log(`🔧 [1/4] Parsing and scanning whitespace: ${targetFile}`);
let data;
try {
  data = JSON.parse(fs.readFileSync(targetFile, "utf8"));
} catch (e) {
  console.error(`❌ PARSE_ERROR: Invalid JSON: ${e.message}`);
  process.exit(1);
}
scanWhitespace(data, "");
if (errors.length > 0) {
  console.error(`❌ Failed at Step 1 (Whitespace). Fix errors and retry.`);
  printReport();
  process.exit(1);
}

console.log(
  `🔧 [2/4] Validating structural integrity (IDs, Headers, Scenarios, Scenario Words)...`,
);
const items = data.items || [];
if (!Array.isArray(items) || items.length === 0) {
  addError("ITEMS", '"items" must be a non-empty array');
  printReport();
  process.exit(1);
}

// Structural Checks
const seenIds = new Set();
const headers = [],
  words = [],
  sentences = [];
let scenarioCount = 0;
let scenarioWordHeaders = [];
let currentScenarioIdx = -1;

items.forEach((item, idx) => {
  const p = `items[${idx}]`;
  if (!item || typeof item !== "object")
    return addError("BAD_ITEM", "Not an object", p);
  const id = typeof item.id === "string" ? item.id.trim() : "";
  if (!id) return addError("MISSING_ID", "Missing ID", p);
  if (seenIds.has(id)) return addError("DUP_ID", `Duplicate ID: "${id}"`, p);
  seenIds.add(id);

  if (item.header === true) {
    // Check header type
    if (id.startsWith("header_scenario_") && !id.endsWith("_words")) {
      // scenario header
      headers.push({ id, idx, type: "scenario" });
      const num = id.replace("header_scenario_", "");
      if (!/^\d+$/.test(num)) {
        addError(
          "INVALID_HEADER_ID",
          `Scenario header ID must end with a number: "${id}"`,
          p,
        );
      } else {
        scenarioCount++;
        // ensure scenario headers are in order
        if (parseInt(num) !== scenarioCount) {
          addError(
            "SCENARIO_ORDER",
            `Expected scenario number ${scenarioCount}, got "${num}"`,
            p,
          );
        }
      }
      if (item.kind !== undefined)
        addError("HEADER_KIND", "Header must not have a 'kind' field", p);
    } else if (id.startsWith("header_scenario_") && id.endsWith("_words")) {
      // scenario word header
      headers.push({ id, idx, type: "scenario_words" });
      const num = id.replace("header_scenario_", "").replace("_words", "");
      if (!/^\d+$/.test(num)) {
        addError(
          "INVALID_HEADER_ID",
          `Scenario word header ID must end with a number: "${id}"`,
          p,
        );
      } else {
        scenarioWordHeaders.push({ id, num: parseInt(num), idx });
      }
    } else {
      addError(
        "INVALID_HEADER",
        `Header ID must start with "header_scenario_" or "header_scenario_*_words": "${id}"`,
        p,
      );
    }
  } else if (item.kind === "word") {
    words.push({ id, idx });
    if (!id.startsWith("word_"))
      addError("ID_PREFIX", `Word ID must start with "word_": "${id}"`, p);
  } else if (item.kind === "sentence") {
    sentences.push({ id, idx });
    if (!id.startsWith("sentence_"))
      addError(
        "ID_PREFIX",
        `Sentence ID must start with "sentence_": "${id}"`,
        p,
      );
    // Speaker field removed – no validation
  } else {
    addError("BAD_KIND", `Invalid/missing kind: "${item.kind}"`, p);
  }
});

// Validate that we have at least 5 scenario headers
if (scenarioCount < 5) {
  addError(
    "MIN_SCENARIOS",
    `Needs >= 5 scenario headers (e.g., header_scenario_1), found ${scenarioCount}`,
  );
}

// Validate that every scenario header has a matching word header
for (let i = 1; i <= scenarioCount; i++) {
  const scenarioHeaderId = `header_scenario_${i}`;
  const wordHeaderId = `header_scenario_${i}_words`;
  const hasScenario = headers.some((h) => h.id === scenarioHeaderId);
  const hasWords = headers.some((h) => h.id === wordHeaderId);
  if (!hasScenario) {
    addError(
      "MISSING_SCENARIO_HEADER",
      `Missing scenario header "${scenarioHeaderId}"`,
    );
  }
  if (!hasWords) {
    addError(
      "MISSING_WORD_HEADER",
      `Missing scenario word header "${wordHeaderId}"`,
    );
  }
  // Ensure ordering: word header must come after its scenario's last sentence
  // We'll check that later.
}

// Also ensure no extra word headers without scenario
// (implicitly covered)

// --- Order checks: all sentences must come before any word headers ---
let firstWordHeaderIdx = Infinity;
headers.forEach((h) => {
  if (h.type === "scenario_words" && h.idx < firstWordHeaderIdx) {
    firstWordHeaderIdx = h.idx;
  }
});
// Check that no sentence appears after the first word header
for (let i = 0; i < items.length; i++) {
  if (i >= firstWordHeaderIdx) {
    // after first word header, we should only see word headers and word items
    if (items[i].kind === "sentence") {
      addError(
        "ORDER",
        `Sentence "${items[i].id}" appears after the first scenario word header (items[${firstWordHeaderIdx}])`,
        `items[${i}]`,
      );
    }
  }
}

// --- Within each scenario group: sentences must precede words ---
// We'll track groups: we already have headers; we can iterate and find boundaries
let groupStart = 0;
for (let i = 0; i < items.length; i++) {
  const item = items[i];
  if (
    item &&
    item.header === true &&
    item.id.startsWith("header_scenario_") &&
    !item.id.endsWith("_words")
  ) {
    // Start of a scenario group
    groupStart = i;
  } else if (
    item &&
    item.header === true &&
    item.id.startsWith("header_scenario_") &&
    item.id.endsWith("_words")
  ) {
    // End of scenario group (words start)
    // Check that within groupStart..i-1, no word items appear
    for (let j = groupStart; j < i; j++) {
      if (items[j].kind === "word") {
        addError(
          "ORDER",
          `Word "${items[j].id}" appears before its scenario's word header (${item.id})`,
          `items[${j}]`,
        );
      }
    }
  }
}

if (errors.length > 0) {
  console.error(`❌ Failed at Step 2 (Structure). Fix errors and retry.`);
  printReport();
  process.exit(1);
}

console.log(
  `🔧 [3/4] Tokenizing segmenter languages (th, zh, ja) in-memory...`,
);
const UNSEGMENTED = ["th", "zh", "ja"];
let tokenizedCount = 0;
// Ensure every sentence has tokens for all languages; if missing, generate them (but we'll also check after)
for (const item of items) {
  if (item.kind !== "sentence" || !item.texts) continue;
  // Initialize tokens if missing
  if (!item.tokens) item.tokens = {};
  // For all languages, ensure tokens exist
  for (const lang of Object.keys(item.texts)) {
    if (!item.tokens[lang]) {
      item.tokens[lang] = [];
    }
  }
  // Generate for segmenter languages if not already provided
  for (const lang of UNSEGMENTED) {
    const rawText = item.texts[lang];
    if (typeof rawText !== "string") continue;
    let cleanText = rawText
      .trim()
      .replace(/[\u200B\u200C\u200D\uFEFF]/g, "")
      .replace(/\s+/g, " ");
    item.texts[lang] = cleanText; // Update clean text
    // Only generate if tokens array is empty (or we could always regenerate, but we'll check later)
    if (!item.tokens[lang] || item.tokens[lang].length === 0) {
      let tokens = [];
      if (lang === "th") {
        let res = thSegmenter.cut(cleanText);
        tokens =
          typeof res === "string"
            ? res.split("|")
            : Array.isArray(res)
              ? res
              : [];
      } else if (lang === "zh") {
        let res = zhSegmenter.doSegment(cleanText, { simple: true });
        tokens = Array.isArray(res) ? res : [];
      } else if (lang === "ja") {
        let res = jaSegmenter.segment(cleanText);
        tokens = Array.isArray(res) ? res : [];
      }
      item.tokens[lang] = tokens.filter(
        (t) => typeof t === "string" && t.trim().length > 0,
      );
    }
  }
  tokenizedCount++;
}

console.log(
  `🔧 [4/4] Validating text coverage, token existence, and reconstruction...`,
);
const expectedLangs = ["en", "th", "fa", "ar", "es", "zh", "ja"];

for (let i = 0; i < items.length; i++) {
  const item = items[i];
  if (item.header) continue; // headers don't need tokens
  const p = `items[${i}] (${item.id})`;
  if (!item.texts || typeof item.texts !== "object") {
    addError("MISSING_TEXTS", "Missing 'texts' object", p);
    continue;
  }
  // Check text coverage for all expected languages
  for (const code of expectedLangs) {
    if (typeof item.texts[code] !== "string" || !item.texts[code].trim()) {
      addError("MISSING_TEXT", `texts.${code} is missing or empty`, p);
    }
  }

  // For sentences, check tokens
  if (item.kind === "sentence") {
    // Ensure tokens exist for all languages
    for (const code of expectedLangs) {
      const arr = item.tokens && item.tokens[code];
      if (!Array.isArray(arr) || arr.length === 0) {
        addError("MISSING_TOKEN", `tokens.${code} is missing or empty`, p);
      }
    }
    // Check reconstruction for whitespace languages
    const whitespaceLangs = expectedLangs.filter(
      (l) => !UNSEGMENTED.includes(l),
    );
    for (const code of whitespaceLangs) {
      const arr = item.tokens[code];
      if (!Array.isArray(arr) || arr.length === 0) continue;
      const fullText = item.texts[code] || "";
      const expected = fullText.trim().replace(/\s+/g, " ");
      const got = arr.join(" ").trim().replace(/\s+/g, " ");
      if (got !== expected) {
        addError(
          "TOKEN_MISMATCH",
          `tokens.${code} do not reconstruct the text. Expected: "${expected}", Got: "${got}"`,
          p,
        );
      }
    }
    // For segmenter languages, we don't check reconstruction but we already ensured existence
  }

  // For words, check that each word appears in at least one sentence of its scenario
  if (item.kind === "word") {
    // Find which scenario this word belongs to (by searching backward for a scenario word header)
    let scenarioWordHeaderIdx = -1;
    for (let j = i; j >= 0; j--) {
      if (
        items[j].header &&
        items[j].id &&
        items[j].id.startsWith("header_scenario_") &&
        items[j].id.endsWith("_words")
      ) {
        scenarioWordHeaderIdx = j;
        break;
      }
    }
    if (scenarioWordHeaderIdx === -1) {
      addError(
        "WORD_NO_HEADER",
        `Word "${item.id}" is not under any scenario word header`,
        p,
      );
      continue;
    }
    // Get the scenario number from that header
    const headerId = items[scenarioWordHeaderIdx].id;
    const match = headerId.match(/header_scenario_(\d+)_words/);
    if (!match) {
      addError(
        "WORD_HEADER_MALFORMED",
        `Malformed scenario word header: ${headerId}`,
        p,
      );
      continue;
    }
    const scenarioNum = parseInt(match[1]);
    // Find the corresponding scenario header to locate its sentences
    let scenarioHeaderIdx = -1;
    for (let j = 0; j < items.length; j++) {
      if (items[j].header && items[j].id === `header_scenario_${scenarioNum}`) {
        scenarioHeaderIdx = j;
        break;
      }
    }
    if (scenarioHeaderIdx === -1) {
      addError(
        "WORD_NO_SCENARIO",
        `No scenario header found for word header ${headerId}`,
        p,
      );
      continue;
    }
    // Now find all sentences between scenarioHeaderIdx and scenarioWordHeaderIdx
    let found = false;
    for (let j = scenarioHeaderIdx + 1; j < scenarioWordHeaderIdx; j++) {
      if (items[j].kind === "sentence") {
        // Check if the word's text appears in any language of that sentence
        const sentTexts = items[j].texts;
        if (sentTexts && typeof sentTexts === "object") {
          for (const lang of expectedLangs) {
            const wordText = item.texts[lang];
            const sentText = sentTexts[lang];
            if (
              typeof wordText === "string" &&
              wordText.trim() &&
              typeof sentText === "string" &&
              sentText.includes(wordText.trim())
            ) {
              found = true;
              break;
            }
          }
        }
        if (found) break;
      }
    }
    if (!found) {
      addError(
        "WORD_NOT_IN_SENTENCE",
        `Word "${item.id}" does not appear in any sentence of scenario ${scenarioNum}`,
        p,
      );
    }
  }
}

// --- Check for duplicate word texts across scenarios (error) ---
const wordTextMap = new Map(); // key: language+text -> wordId
for (const item of items) {
  if (item.kind === "word") {
    for (const lang of expectedLangs) {
      const text = item.texts && item.texts[lang];
      if (typeof text === "string" && text.trim()) {
        const key = `${lang}:${text.trim()}`;
        if (wordTextMap.has(key)) {
          const existingId = wordTextMap.get(key);
          addError(
            "DUPLICATE_WORD",
            `Word "${item.id}" has duplicate text "${text.trim()}" in language ${lang} (also in word "${existingId}")`,
            `items[${items.indexOf(item)}]`,
          );
        } else {
          wordTextMap.set(key, item.id);
        }
      }
    }
  }
}

// --- 5. Write to Disk & Report ---
if (errors.length === 0) {
  fs.writeFileSync(targetFile, JSON.stringify(data, null, 2), "utf8");
  console.log(
    `✅ SUCCESS! Tokenized ${tokenizedCount} sentences and saved to disk.`,
  );
} else {
  console.error(
    `❌ FAILED with ${errors.length} errors. File was NOT overwritten.`,
  );
}
printReport();
process.exit(errors.length > 0 ? 1 : 0);

// --- 6. LLM-Optimized Report Generator ---
function printReport() {
  if (errors.length === 0 && warnings.length === 0) return;
  console.log("\n========================================");
  console.log("📋 VALIDATION REPORT (Copy-paste to LLM)");
  console.log("========================================\n");
  if (errors.length > 0) {
    console.log("### ERRORS (Must Fix):\n");
    errors.forEach((e, i) => {
      console.log(`${i + 1}. [${e.code}] ${e.path}`);
      console.log(`   ${e.detail}\n`);
    });
  }
  if (warnings.length > 0) {
    console.log("### WARNINGS (Review):\n");
    warnings.forEach((e, i) => {
      console.log(`${i + 1}. [${e.code}] ${e.path}`);
      console.log(`   ${e.detail}\n`);
    });
  }
  console.log(
    `Total errors: ${errors.length}, Total warnings: ${warnings.length}`,
  );
  console.log("========================================\n");
}

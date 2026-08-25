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
  `🔧 [2/4] Validating structural integrity (IDs, Headers, Scenarios)...`,
);
const items = data.items || [];
if (!Array.isArray(items) || items.length === 0) {
  addError("ITEMS", '"items" must be a non-empty array');
  printReport();
  process.exit(1);
}

// Structural Checks (Derived from check-lessons.js)
const seenIds = new Set();
const headers = [],
  words = [],
  sentences = [],
  characters = [];

items.forEach((item, idx) => {
  const p = `items[${idx}]`;
  if (!item || typeof item !== "object")
    return addError("BAD_ITEM", "Not an object", p);

  const id = typeof item.id === "string" ? item.id.trim() : "";
  if (!id) return addError("MISSING_ID", "Missing ID", p);
  if (seenIds.has(id)) return addError("DUP_ID", `Duplicate ID: "${id}"`, p);
  seenIds.add(id);

  if (item.header === true) {
    headers.push({ id, idx });
    if (item.kind !== undefined)
      addError("HEADER_KIND", "Header must not have a 'kind' field", p);
    if (!id.startsWith("header_"))
      addError("ID_PREFIX", `Header ID must start with "header_": "${id}"`, p);
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
  } else if (item.kind === "character") {
    characters.push({ id, idx });
  } else {
    addError("BAD_KIND", `Invalid/missing kind: "${item.kind}"`, p);
  }
});

// Thematic Structure Checks (Updated for Sentences-First architecture)
// NOTE: Strictly expects the header ID to be "Words" to align with new-chat.md
const coreWordsHeaderIndex = items.findIndex(
  (item) => item.id && item.id.trim() === "Words",
);
/*
if (coreWordsHeaderIndex === -1) {
  addError(
    "STRUCTURE",
    'Thematic lesson MUST contain {"id": "header_words", "header": true}',
  );
} else {
  // Ensure no words appear before the core words header
  for (let i = 0; i < coreWordsHeaderIndex; i++) {
    if (items[i].kind === "word") {
      addError(
        "ORDER",
        `Word "${items[i].id}" appears BEFORE "Words"`,
        `items[${i}]`,
      );
    }
  }
}
*/
const scenarioHeaders = headers.filter((h) =>
  /^header_scenario_\d+/i.test(h.id),
);
if (scenarioHeaders.length < 5) {
  addError(
    "MIN_SCENARIOS",
    `Needs >= 5 scenario headers (e.g., header_scenario_1), found ${scenarioHeaders.length}`,
  );
}

// Scenario Order Check (Sentences must precede words within a header group)
let inGroup = false,
  seenWord = false,
  groupId = "";
items.forEach((item, idx) => {
  if (item && item.header === true) {
    inGroup = true;
    seenWord = false;
    groupId = item.id;
    return;
  }
  if (!inGroup || !item) return;
  if (item.kind === "word") seenWord = true;
  else if (item.kind === "sentence" && seenWord) {
    addError(
      "ORDER",
      `Sentence "${item.id}" appears AFTER a word in group "${groupId}"`,
      `items[${idx}]`,
    );
  }
});

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

for (const item of items) {
  if (item.kind !== "sentence" || !item.texts) continue;
  if (!item.tokens) item.tokens = {};

  for (const lang of UNSEGMENTED) {
    const rawText = item.texts[lang];
    if (typeof rawText !== "string") continue;

    let cleanText = rawText
      .trim()
      .replace(/[\u200B\u200C\u200D\uFEFF]/g, "")
      .replace(/\s+/g, " ");
    item.texts[lang] = cleanText; // Update clean text

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
  tokenizedCount++;
}

console.log(`🔧 [4/4] Validating text coverage and token reconstruction...`);
// (Assuming standard manifest languages for the lesson, e.g., en, th, fa, ar, es, zh, ja)
const expectedLangs = ["en", "th", "fa", "ar", "es", "zh", "ja"];

for (let i = 0; i < items.length; i++) {
  const item = items[i];
  if (item.header) continue;

  const p = `items[${i}] (${item.id})`;
  if (!item.texts || typeof item.texts !== "object") {
    addError("MISSING_TEXTS", "Missing 'texts' object", p);
    continue;
  }

  // Check text coverage
  for (const code of expectedLangs) {
    if (typeof item.texts[code] !== "string" || !item.texts[code].trim()) {
      addError("MISSING_TEXT", `texts.${code} is missing or empty`, p);
    }
  }

  // Check token reconstruction for whitespace languages
  if (item.kind === "sentence" && item.tokens) {
    const whitespaceLangs = expectedLangs.filter(
      (l) => !UNSEGMENTED.includes(l),
    );
    for (const code of whitespaceLangs) {
      const arr = item.tokens[code];
      if (!Array.isArray(arr) || arr.length === 0) {
        addError("MISSING_TOKEN_LANG", `tokens.${code} missing or empty`, p);
        continue;
      }

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

  console.log("========================================\n");
}

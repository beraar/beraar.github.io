#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const LESSONS_DIR = path.join(__dirname, "..", "lessons");
const WHITESPACE_LANGS = ["en", "fa", "ar", "es"];

function walk(dir, cb) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, cb);
    else if (
      entry.isFile() &&
      full.endsWith(".json") &&
      !full.endsWith("manifest.json")
    )
      cb(full);
  }
}

function fixFile(filePath) {
  let content;
  try {
    content = JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return;
  }

  if (!Array.isArray(content.items)) return;

  let changed = false;
  const idMap = new Map();

  // 1. Fix s\d+_ prefixes (e.g., s1_what -> word_what)
  for (const item of content.items) {
    if (!item.id) continue;
    const match = item.id.match(/^s(\d+)_(.*)$/);
    if (match) {
      const newId = "word_" + match[2];
      idMap.set(item.id, newId);
      item.id = newId;
      changed = true;
    }
  }

  // Apply ID map to itemIds references
  if (idMap.size > 0) {
    for (const item of content.items) {
      if (Array.isArray(item.itemIds)) {
        item.itemIds = item.itemIds.map((ref) => idMap.get(ref) || ref);
      }
    }
  }

  // 2. Fix TOKEN_MISMATCH for whitespace languages
  // Forces tokens to exactly match the text string by splitting on spaces.
  for (const item of content.items) {
    if (item.kind !== "sentence" || !item.texts || !item.tokens) continue;
    for (const lang of WHITESPACE_LANGS) {
      const text = item.texts[lang];
      if (typeof text === "string" && text.trim()) {
        const currentTokens = item.tokens[lang];
        const expectedTokens = text.trim().split(/\s+/);
        if (
          !Array.isArray(currentTokens) ||
          currentTokens.join(" ") !== text.trim()
        ) {
          item.tokens[lang] = expectedTokens;
          changed = true;
        }
      }
    }
  }

  // 3. Fix ORDER (sentences before words in every group)
  const newItems = [];
  let currentGroup = [];

  const flushGroup = () => {
    if (currentGroup.length === 0) return;
    const header = currentGroup[0];
    const rest = currentGroup.slice(1);
    const sentences = rest.filter((i) => i.kind === "sentence");
    const words = rest.filter((i) => i.kind === "word");
    const others = rest.filter(
      (i) => i.kind !== "sentence" && i.kind !== "word",
    );
    newItems.push(header, ...sentences, ...words, ...others);
    currentGroup = [];
  };

  for (const item of content.items) {
    if (item.header === true) {
      flushGroup();
      currentGroup.push(item);
    } else {
      currentGroup.push(item);
    }
  }
  flushGroup();

  if (newItems.length > 0) {
    const isDifferent = newItems.some(
      (item, idx) => content.items[idx] !== item,
    );
    if (isDifferent) {
      content.items = newItems;
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, JSON.stringify(content, null, 2), "utf8");
    console.log(`[FIXED] ${path.relative(LESSONS_DIR, filePath)}`);
  }
}

console.log("Running comprehensive mechanical fixes...");
walk(LESSONS_DIR, fixFile);
console.log("Done. Please re-run the validator.");

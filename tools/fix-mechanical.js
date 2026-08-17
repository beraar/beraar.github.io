#!/usr/bin/env node
/**
 * tools/fix-mechanical.js
 * Automatically fixes ID prefixes, header names, and item ordering
 * for thematic lessons that failed the v2 validation.
 */
const fs = require("fs");
const path = require("path");

const LESSONS_DIR = path.join(__dirname, "..", "lessons");

// The 16 files identified in the report with PREFIX/ORDER/STRUCTURE errors
const targetFiles = [
  "food-dining/street-food.json",
  "food-dining/paying-bill.json",
  "shopping/grocery-market.json",
  "shopping/bargaining.json",
  "money-bank/currency-exchange.json",
  "money-bank/bank-basics.json",
  "transport/asking-directions.json",
  "transport/taxi-ride.json",
  "transport/bus-train.json",
  "transport/airport.json",
  "weather/weather-talk.json",
  "home-daily/daily-routine.json",
  "health/pharmacy.json",
  "health/doctor-clinic.json",
  "personal-care/hair-salon.json",
  "religion-culture/idioms-slang.json",
];

function fixFile(filePath) {
  const fullPath = path.join(LESSONS_DIR, filePath);
  if (!fs.existsSync(fullPath)) {
    console.log(`[SKIP] ${filePath} (not found)`);
    return;
  }

  const content = JSON.parse(fs.readFileSync(fullPath, "utf8"));
  let changed = false;

  // 1. ID Renaming Map
  const idMap = new Map();
  for (const item of content.items) {
    if (!item.id) continue;
    let newId = item.id;

    if (newId === "header_core") newId = "header_core_words";
    else if (newId.startsWith("core_")) newId = "word_" + newId.slice(5);
    else if (newId.startsWith("pb_sent_")) newId = "sentence_" + newId.slice(8);
    else if (newId.startsWith("pb_")) newId = "word_" + newId.slice(3);
    else if (newId.startsWith("sent_")) newId = "sentence_" + newId.slice(5);

    if (newId !== item.id) {
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

  // 2. Reorder within scenario groups (sentences before words)
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
    const orderChanged = newItems.some(
      (item, idx) => content.items[idx] !== item,
    );
    if (orderChanged) {
      content.items = newItems;
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(fullPath, JSON.stringify(content, null, 2), "utf8");
    console.log(`[FIXED] ${filePath}`);
  } else {
    console.log(`[CLEAN] ${filePath}`);
  }
}

console.log("Running mechanical fixes...");
targetFiles.forEach(fixFile);
console.log("Done. Please re-run the validator.");

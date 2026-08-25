#!/usr/bin/env node
/**
 * tools/audit-manifest.js — Zabon Manifest Auditor & Fixer
 *
 * Audits lessons/manifest.json for structural integrity, focusing on the
 * grammar_rules registry and lesson-to-rule mappings.
 *
 * Usage:
 *   node tools/audit-manifest.js           # Dry run (report only)
 *   node tools/audit-manifest.js --fix     # Apply auto-fixes and save
 */
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
// Note: Using 'lessons/manifest.json' to align with check-lessons.js and tokenize-lessons.js
const MANIFEST_PATH = path.join(ROOT, "lessons", "manifest.json");

const args = process.argv.slice(2);
const shouldFix = args.includes("--fix");

if (!fs.existsSync(MANIFEST_PATH)) {
  console.error(`❌ FATAL: Manifest not found at ${MANIFEST_PATH}`);
  process.exit(1);
}

console.log(`🔍 Auditing manifest: ${path.relative(ROOT, MANIFEST_PATH)}`);
console.log(
  `🛠️  Mode: ${shouldFix ? "AUTO-FIX ENABLED" : "DRY RUN (Report Only)"}\n`,
);

let manifest;
try {
  manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
} catch (e) {
  console.error(`❌ FATAL: Cannot parse manifest.json: ${e.message}`);
  process.exit(1);
}

const errors = [];
const warnings = [];
const fixesApplied = [];

// ---------------------------------------------------------------------------
// 1. Collect all Lesson Rules & Metadata
// ---------------------------------------------------------------------------
const allLessons = [];
const referencedRuleIds = new Set();

function collectLessons(lessonsArray, categoryId) {
  if (!Array.isArray(lessonsArray)) return;
  for (const lesson of lessonsArray) {
    allLessons.push({ ...lesson, _categoryId: categoryId });
    if (Array.isArray(lesson.rules)) {
      for (const ruleId of lesson.rules) {
        referencedRuleIds.add(ruleId);
      }
    }
  }
}

for (const cat of manifest.categories || []) {
  collectLessons(cat.lessons, cat.id);
}
for (const topic of manifest.topics || []) {
  for (const book of topic.books || []) {
    collectLessons(book.lessons, `${topic.id}/${book.id}`);
  }
}

// ---------------------------------------------------------------------------
// 2. Audit grammar_rules Registry
// ---------------------------------------------------------------------------
const grammarRules = manifest.grammar_rules || [];
const definedRuleIds = new Map(); // id -> { index, rule }
const duplicateIds = new Set();

for (let i = 0; i < grammarRules.length; i++) {
  const rule = grammarRules[i];
  if (!rule.id) continue;

  if (definedRuleIds.has(rule.id)) {
    duplicateIds.add(rule.id);
  } else {
    definedRuleIds.set(rule.id, { index: i, rule });
  }

  // Check for legacy/non-standard IDs
  if (!rule.id.startsWith("rule_")) {
    warnings.push({
      code: "LEGACY_ID",
      detail: `Rule "${rule.id}" does not use the standard "rule_" prefix.`,
      context: rule.title?.en || rule.id,
    });
  }

  // Check for vague descriptions (Useless for LLM generation)
  const descEn = rule.description?.en || "";
  if (/^this lesson covers:?/i.test(descEn.trim())) {
    warnings.push({
      code: "VAGUE_DESC",
      detail: `Description is a lazy placeholder. It must explain the linguistic constraint for the LLM.`,
      context: rule.id,
    });
  }
}

// ---------------------------------------------------------------------------
// 3. Cross-Reference & Identify Orphans / Missing Links
// ---------------------------------------------------------------------------
const missingDefinitions = [];
for (const refId of referencedRuleIds) {
  if (!definedRuleIds.has(refId)) {
    missingDefinitions.push(refId);
    errors.push({
      code: "MISSING_RULE_DEF",
      detail: `Lesson references "${refId}", but it is NOT defined in grammar_rules.`,
    });
  }
}

const orphanedRules = [];
for (const [defId] of definedRuleIds) {
  if (!referencedRuleIds.has(defId)) {
    orphanedRules.push(defId);
    warnings.push({
      code: "ORPHAN_RULE",
      detail: `Rule "${defId}" is defined but NEVER referenced by any lesson.`,
    });
  }
}

// ---------------------------------------------------------------------------
// 4. Apply Auto-Fixes (If --fix is passed)
// ---------------------------------------------------------------------------
if (shouldFix) {
  console.log("🔧 Applying structural auto-fixes...\n");

  // FIX A: Resolve Duplicate IDs (Specifically the Ability/Conjunctions bug)
  if (duplicateIds.has("rule_universal_ability")) {
    const indices = [];
    grammarRules.forEach((r, i) => {
      if (r.id === "rule_universal_ability") indices.push(i);
    });

    // Find the one that is actually Conjunctions
    const conjunctionsIndex = indices.find((i) =>
      /conjunction/i.test(grammarRules[i].title?.en || ""),
    );

    if (conjunctionsIndex !== undefined) {
      grammarRules[conjunctionsIndex].id = "rule_universal_conjunctions";
      definedRuleIds.delete("rule_universal_ability"); // Reset map
      definedRuleIds.set("rule_universal_conjunctions", {
        index: conjunctionsIndex,
        rule: grammarRules[conjunctionsIndex],
      });
      fixesApplied.push(
        `Renamed duplicate "rule_universal_ability" to "rule_universal_conjunctions" (Title: ${grammarRules[conjunctionsIndex].title.en})`,
      );
    }
  }

  // FIX B: Update Lessons referencing the wrong Rule ID
  for (const lesson of allLessons) {
    if (
      lesson.id === "lesson_universal_conjunctions" &&
      lesson.rules?.includes("rule_universal_ability")
    ) {
      const cat = manifest.categories.find((c) => c.lessons?.includes(lesson));
      if (cat) {
        const l = cat.lessons.find((x) => x.id === lesson.id);
        l.rules = l.rules.map((r) =>
          r === "rule_universal_ability" ? "rule_universal_conjunctions" : r,
        );
        fixesApplied.push(
          `Updated lesson "lesson_universal_conjunctions" to reference "rule_universal_conjunctions" instead of "rule_universal_ability".`,
        );
      }
    }
  }

  // FIX C: Remove Orphaned Legacy Rules (SVO, Politeness_Particles)
  const legacyOrphans = ["SVO", "Politeness_Particles"];
  manifest.grammar_rules = grammarRules.filter((rule) => {
    if (legacyOrphans.includes(rule.id) && !referencedRuleIds.has(rule.id)) {
      fixesApplied.push(
        `Removed orphaned legacy rule definition: "${rule.id}"`,
      );
      return false;
    }
    return true;
  });

  // Write back to disk
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), "utf8");
  console.log(`✅ Manifest saved to disk.\n`);
}

// ---------------------------------------------------------------------------
// 5. Print Report
// ---------------------------------------------------------------------------
console.log("=".repeat(60));
console.log("📋 MANIFEST AUDIT REPORT");
console.log("=".repeat(60));

if (fixesApplied.length > 0) {
  console.log("\n✅ AUTO-FIXES APPLIED:");
  fixesApplied.forEach((f) => console.log(`   - ${f}`));
}

if (errors.length > 0) {
  console.log("\n❌ ERRORS (Must Fix):");
  errors.forEach((e) => console.log(`   [${e.code}] ${e.detail}`));
} else {
  console.log("\n✅ No structural errors found.");
}

if (warnings.length > 0) {
  console.log("\n⚠️  WARNINGS (Review Required):");
  warnings.forEach((w) =>
    console.log(`   [${w.code}] ${w.detail} (Context: ${w.context})`),
  );
}

console.log("\n" + "=".repeat(60));
console.log(`Summary: ${errors.length} errors, ${warnings.length} warnings.`);

if (
  !shouldFix &&
  (duplicateIds.size > 0 ||
    missingDefinitions.length > 0 ||
    orphanedRules.length > 0)
) {
  console.log(
    "\n💡 Tip: Run with --fix to automatically resolve structural ID mismatches and remove legacy orphans.",
  );
  console.log(`   Command: node tools/audit-manifest.js --fix`);
}

process.exit(errors.length > 0 ? 1 : 0);

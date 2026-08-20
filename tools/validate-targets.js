// tools/validate-targets.js
const fs = require("fs");
const path = require("path");

// CORRECTED PATH: Points to lessons/manifest.json
const MANIFEST_PATH = path.join(__dirname, "../lessons/manifest.json");
const ALL_LANGUAGES = ["en", "th", "fa", "ar", "es", "zh", "ja"];

// Linguistic Map: Rule ID -> Allowed Target Languages
const RULE_TO_LANGUAGES = {
  rule_g01: ["en", "es", "th", "ar", "zh"], // Basic SVO
  rule_g02: ["th"], // Politeness Particles (Thai specific)
  rule_g03: ALL_LANGUAGES, // Yes/No Questions (Universal)
  rule_g05: ALL_LANGUAGES, // Wh- Questions (Universal)
  rule_g06: ALL_LANGUAGES, // Descriptive (Universal)
  rule_g07: ALL_LANGUAGES, // Possession (Universal)
  rule_g08: ALL_LANGUAGES, // Tense & Aspect (Universal)
  rule_g09: ["th", "zh", "ja"], // Classifiers
  rule_g10: ["th", "zh", "ja"], // Topic-Comment
  rule_g11: ["th", "zh"], // Serial Verbs
  rule_g12: ALL_LANGUAGES, // Comparatives (Universal)
  rule_g16: ALL_LANGUAGES, // Conditionals (Universal)
  rule_g17: ALL_LANGUAGES, // Ability (Universal)
  rule_g19: ALL_LANGUAGES, // Conjunctions (Universal)
  rule_g20: ALL_LANGUAGES, // Reported Speech (Universal)
  rule_g21: ["th"], // Emphasis Particles (Thai specific)
  rule_g22: ALL_LANGUAGES, // Requests & Imperatives (Universal)
  rule_g23: ALL_LANGUAGES, // Exclamations (Universal)
  rule_g24: ["th"], // Register Switching (Thai specific)
};

function getIntersection(arrays) {
  if (!arrays.length) return ALL_LANGUAGES;
  return arrays.reduce((acc, curr) =>
    acc.filter((lang) => curr.includes(lang)),
  );
}

function getAllowedTargets(rules) {
  if (!rules || rules.length === 0) return ALL_LANGUAGES;
  const allowedSets = rules.map((r) => {
    // FIX: Trim spaces to handle the trailing spaces in the current manifest.json
    const ruleId = r.trim();
    return RULE_TO_LANGUAGES[ruleId] || ALL_LANGUAGES;
  });
  return getIntersection(allowedSets);
}

function processLessons(lessons) {
  let changed = false;
  for (const lesson of lessons) {
    const allowed = getAllowedTargets(lesson.rules);
    const currentTargets = lesson.targets || [];

    // Filter targets, trimming spaces for comparison
    const validTargets = currentTargets.filter((lang) =>
      allowed.includes(lang.trim()),
    );

    if (validTargets.length !== currentTargets.length) {
      const removed = currentTargets.filter(
        (lang) => !allowed.includes(lang.trim()),
      );
      console.log(
        `[FIXED] ${lesson.id.trim()}: Removed invalid targets [${removed.map((r) => r.trim()).join(", ")}] due to rules [${(lesson.rules || []).map((r) => r.trim()).join(", ")}]`,
      );
      lesson.targets = validTargets;
      changed = true;
    }
  }
  return changed;
}

function run() {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
  let manifestChanged = false;

  for (const cat of manifest.categories || []) {
    if (processLessons(cat.lessons)) manifestChanged = true;
  }
  for (const topic of manifest.topics || []) {
    for (const book of topic.books || []) {
      if (processLessons(book.lessons)) manifestChanged = true;
    }
  }

  if (manifestChanged) {
    // Write back with 1-space indentation
    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 1));
    console.log("\n✅ manifest.json has been updated with corrected targets.");
  } else {
    console.log(
      "\n✅ All lesson targets are already compliant with grammatical rules.",
    );
  }
}

run();

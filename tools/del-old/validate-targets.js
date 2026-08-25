// tools/validate-targets.js
const fs = require("fs");
const path = require("path");

// CORRECTED PATH: Points to lessons/manifest.json
const MANIFEST_PATH = path.join(__dirname, "../lessons/manifest.json");
const ALL_LANGUAGES = ["en", "th", "fa", "ar", "es", "zh", "ja"];

// Linguistic Map: Rule ID -> Allowed Target Languages
const RULE_TO_LANGUAGES = {
  // Universal Rules
  rule_universal_svo: ["en", "es", "th", "ar", "zh"],
  rule_universal_yes_no_questions: ALL_LANGUAGES,
  rule_universal_negation: ALL_LANGUAGES,
  rule_universal_wh_questions: ALL_LANGUAGES,
  rule_universal_descriptive: ALL_LANGUAGES,
  rule_universal_possession: ALL_LANGUAGES,
  rule_universal_tense_aspect: ALL_LANGUAGES,
  rule_universal_comparatives: ALL_LANGUAGES,
  rule_universal_conditionals: ALL_LANGUAGES,
  rule_universal_ability: ALL_LANGUAGES,
  rule_universal_conjunctions: ALL_LANGUAGES,
  rule_universal_reported_speech: ALL_LANGUAGES,
  rule_universal_requests_imperatives: ALL_LANGUAGES,
  rule_universal_negation: ALL_LANGUAGES,
  rule_universal_relative_clauses: ALL_LANGUAGES,
  rule_universal_passive: ALL_LANGUAGES,
  rule_universal_causative: ALL_LANGUAGES,
  rule_universal_quantifiers: ALL_LANGUAGES,

  // Multi-Language Typological Rules
  rule_universal_classifiers: ["th", "zh", "ja"],
  rule_universal_topic_comment: ["th", "zh", "ja"],
  rule_universal_serial_verbs: ["th", "zh"],
  rule_universal_relative_clauses: ALL_LANGUAGES,
  rule_universal_passive: ALL_LANGUAGES,
  rule_universal_causative: ALL_LANGUAGES,
  rule_universal_quantifiers: ALL_LANGUAGES,

  // Thai-Specific Rules
  rule_th_politeness_particles: ["th"],
  rule_th_emphasis_particles: ["th"],
  rule_th_exclamations: ["th"],
  rule_th_register_switching: ["th"],

  // Phase 1: English
  rule_en_articles: ["en"],
  rule_en_sva: ["en"],

  // Phase 2: Persian
  rule_fa_ezafe: ["fa"],
  rule_fa_sov: ["fa"],
  rule_fa_formality: ["fa"],

  // Phase 3: Chinese
  rule_zh_aspect: ["zh"],

  // Phase 4: Japanese
  rule_ja_particles: ["ja"],
  rule_ja_conjugation: ["ja"],

  // Phase 5: Arabic
  rule_ar_idafa: ["ar"],
  rule_ar_agreement: ["ar"],
  rule_ar_definite: ["ar"],

  // Phase 6: Spanish
  rule_es_ser_estar: ["es"],
  rule_es_agreement: ["es"],
  rule_es_pronouns: ["es"],
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

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

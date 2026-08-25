const fs = require("fs");
const path = require("path");

const MANIFEST_PATH = path.join(__dirname, "..", "lessons", "manifest.json");
const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));

if (!Array.isArray(manifest.grammar_rules)) manifest.grammar_rules = [];

// Helper to generate a consistent Rule ID from a Lesson ID
const toRuleId = (lessonId) => `rule_${lessonId.replace("lesson_", "")}`;

console.log("Scanning manifest for grammar lessons...\n");

// 1. Scan Categories for Grammar Lessons
(manifest.categories || []).forEach((cat) => {
  const isGrammarCat = cat.id.includes("grammar");

  (cat.lessons || []).forEach((lesson) => {
    // Target: Grammar categories OR specific grammar lesson IDs (e.g., lesson_g01)
    if (isGrammarCat || lesson.id.startsWith("lesson_g")) {
      const ruleId = toRuleId(lesson.id);

      // Check if rule already exists in the registry
      const exists = manifest.grammar_rules.some((r) => r.id === ruleId);

      if (!exists) {
        // Create Rule using the Lesson's Multilingual Title
        const rule = {
          id: ruleId,
          title: lesson.title, // Reuse the lesson title (e.g., "Grammar: Yes/No Questions")
          description: {
            en: `This lesson covers: ${lesson.title.en || lesson.id}`,
            th: `บทเรียนนี้ครอบคลุม: ${lesson.title.th || lesson.id}`,
            fa: `این درس شامل: ${lesson.title.fa || lesson.id}`,
            ar: `يغطي هذا الدرس: ${lesson.title.ar || lesson.id}`,
            es: `Esta lección cubre: ${lesson.title.es || lesson.id}`,
            zh: `本课程涵盖：${lesson.title.zh || lesson.id}`,
            ja: `このレッスンでカバーする内容：${lesson.title.ja || lesson.id}`,
          },
        };
        manifest.grammar_rules.push(rule);
        console.log(`  + Created rule: ${ruleId}`);
      }

      // Link Rule to Lesson
      if (!Array.isArray(lesson.rules)) lesson.rules = [];
      if (!lesson.rules.includes(ruleId)) {
        lesson.rules.push(ruleId);
      }
    }
  });
});

// 2. Save
fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
console.log("\n✅ Grammar rules synced from lesson metadata!");

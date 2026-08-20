const fs = require("fs");
const path = require("path");

// Project root = parent of tools/
const ROOT = path.join(__dirname, "..");
const MANIFEST_PATH = path.join(ROOT, "lessons", "manifest.json");

// Grammatical Routing Rules (v3.1 Blueprint)
const THAI_SPECIFIC = new Set([
  "lesson_g02",
  "lesson_g09",
  "lesson_g21",
  "lesson_g23",
  "lesson_g24",
]);
const SVO_LESSONS = new Set(["lesson_g01"]);
const TSL_BOOKS = new Set(["book_ls1", "book_ls2", "book_ls3", "book_ls4"]);

const GRAMMAR_RULES = [
  {
    id: "SVO",
    title: {
      en: "Subject-Verb-Object",
      th: "ประธาน-กริยา-กรรม",
      fa: "نهاد-فعل-مفعول",
    },
    description: {
      en: "The standard sentence structure placing the subject first, followed by the action, and then the object.",
      fa: "در زبان‌های SVO، ساختار استاندارد جمله فاعل را در ابتدا، سپس فعل و در نهایت مفعول قرار می‌دهد.",
    },
  },
  {
    id: "Politeness_Particles",
    title: { en: "Politeness Particles", th: "คำลงท้าย", fa: "ذرات ادب" },
    description: {
      en: "Words added to the end of sentences to convey respect or soften the tone. Highly specific to Thai grammar.",
      th: "คำที่เติมต่อท้ายประโยคเพื่อแสดงความสุภาพหรือลดความรุนแรงของประโยค",
    },
  },
];

// Helper: Dynamically extract all language codes present in a lesson's items
function extractLanguages(items) {
  const langs = new Set();
  if (!Array.isArray(items)) return [];
  for (const item of items) {
    if (item.texts && typeof item.texts === "object") {
      Object.keys(item.texts).forEach((k) => langs.add(k));
    }
  }
  return Array.from(langs);
}

function processLesson(lesson, isTSL = false) {
  const oldPathTemplate = lesson.file;
  if (!oldPathTemplate) return;

  // If it doesn't have {lang}, it might already be migrated. Skip to avoid overwriting.
  if (!oldPathTemplate.includes("{lang}")) {
    console.log(
      `ℹ ${lesson.id}: Path already static ("${oldPathTemplate}"). Skipping move.`,
    );
    return;
  }

  // 1. Define Source (lessons/th/...) and Destination (lessons/...)
  const srcRelPath = oldPathTemplate.replace("{lang}", "th");
  const srcAbsPath = path.join(ROOT, srcRelPath);

  const destRelPath = oldPathTemplate.replace("{lang}/", "");
  const destAbsPath = path.join(ROOT, destRelPath);

  // 2. Check if source exists
  if (!fs.existsSync(srcAbsPath)) {
    console.warn(
      `⚠ ${lesson.id}: Source file not found at ${srcRelPath}. Skipping.`,
    );
    return;
  }

  // 3. Read, Move, and Update
  try {
    const rawData = fs.readFileSync(srcAbsPath, "utf8");
    const data = JSON.parse(rawData);

    // Ensure destination directory exists
    const destDir = path.dirname(destAbsPath);
    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

    // Write to the new flattened location
    fs.writeFileSync(destAbsPath, JSON.stringify(data, null, 2));

    // 4. Update Manifest Metadata
    lesson.file = destRelPath;
    lesson.translations = extractLanguages(data.items);

    // Apply Pedagogical Routing (targets)
    if (isTSL || THAI_SPECIFIC.has(lesson.id)) {
      lesson.targets = ["th"];
    } else if (SVO_LESSONS.has(lesson.id)) {
      lesson.targets = ["en", "es", "ar"];
    } else {
      lesson.targets = [...lesson.translations];
    }

    // Clean up legacy keys
    delete lesson.languages;
    delete lesson.displayMode; // displayMode is now handled inside the JSON file itself

    console.log(
      `✓ ${lesson.id}: Moved to ${destRelPath} | Translations: [${lesson.translations.join(", ")}]`,
    );
  } catch (e) {
    console.error(`✗ Failed to process ${lesson.id}: ${e.message}`);
  }
}

// ---- Execute Migration ----
console.log(`Reading manifest: ${MANIFEST_PATH}`);
if (!fs.existsSync(MANIFEST_PATH)) {
  console.error("Manifest not found! Please check the path.");
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));

console.log("\n--- Processing Categories ---");
(manifest.categories || []).forEach((cat) => {
  (cat.lessons || []).forEach((l) => processLesson(l));
});

console.log("\n--- Processing Topics/Books (TSL) ---");
(manifest.topics || []).forEach((topic) => {
  (topic.books || []).forEach((book) => {
    const isTSL = TSL_BOOKS.has(book.id);
    (book.lessons || []).forEach((l) => processLesson(l, isTSL));
  });
});

// Inject Global Grammar Registry
if (!Array.isArray(manifest.grammar_rules)) manifest.grammar_rules = [];
const existingRuleIds = new Set(manifest.grammar_rules.map((r) => r.id));
for (const rule of GRAMMAR_RULES) {
  if (!existingRuleIds.has(rule.id)) manifest.grammar_rules.push(rule);
}

fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
console.log("\n✅ v3.1 Migration Complete!");
console.log(
  "👉 Next Step: You can now safely delete the 'lessons/th/' folder.",
);

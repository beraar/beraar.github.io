const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const MANIFEST_PATH = path.join(ROOT, "lessons", "manifest.json");

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

function extractLanguages(filePath) {
  const absPath = path.join(ROOT, filePath);
  if (!fs.existsSync(absPath)) return [];
  try {
    const data = JSON.parse(fs.readFileSync(absPath, "utf8"));
    const langs = new Set();
    if (Array.isArray(data.items)) {
      for (const item of data.items) {
        if (item.texts && typeof item.texts === "object") {
          Object.keys(item.texts).forEach((k) => langs.add(k));
        }
      }
    }
    return Array.from(langs);
  } catch (e) {
    return [];
  }
}

function processLesson(lesson, isTSL = false) {
  const filePath = lesson.file;
  if (!filePath) return;

  // Extract languages from the physical file
  const availableLangs = extractLanguages(filePath);

  if (availableLangs.length === 0) {
    console.warn(`⚠ ${lesson.id}: No languages found in ${filePath}`);
  }

  // Update metadata
  lesson.translations =
    availableLangs.length > 0 ? availableLangs : ["en", "th"];

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
    `✓ ${lesson.id}: translations=[${lesson.translations.join(", ")}], targets=[${lesson.targets.join(", ")}]`,
  );
}

console.log(`Reading manifest: ${MANIFEST_PATH}`);
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

// Inject grammar registry
if (!Array.isArray(manifest.grammar_rules)) manifest.grammar_rules = [];
const existingRuleIds = new Set(manifest.grammar_rules.map((r) => r.id));
for (const rule of GRAMMAR_RULES) {
  if (!existingRuleIds.has(rule.id)) manifest.grammar_rules.push(rule);
}

fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
console.log("\n✅ v3.1 Metadata Migration Complete!");

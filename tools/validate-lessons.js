// tools/validate-lessons.js
const fs = require("fs");
const path = require("path");

const MANIFEST_PATH = path.join(__dirname, "../lessons/manifest.json");
const REQUIRED_LANGS = ["en", "th", "fa", "ar", "es", "zh", "ja"];

function getAllLessonFiles(manifest) {
  const files = [];
  for (const cat of manifest.categories || []) {
    if (cat.id.trim() === "cat_test") continue;
    for (const lesson of cat.lessons || []) {
      files.push({
        id: lesson.id.trim(),
        file: lesson.file.trim(),
        categoryId: cat.id.trim(),
        isReadingWriting: cat.id.trim() === "cat_reading_writing",
      });
    }
  }
  for (const topic of manifest.topics || []) {
    // UPDATE 1: Ignore TSL (Listening and Speaking) topics entirely
    if (topic.id.trim() === "topic_tsl") continue;

    for (const book of topic.books || []) {
      for (const lesson of book.lessons || []) {
        files.push({
          id: lesson.id.trim(),
          file: lesson.file.trim(),
          categoryId: `topic_${topic.id.trim()}_book_${book.id.trim()}`,
          isReadingWriting: false,
        });
      }
    }
  }
  return files;
}

function checkTranslationCoverage(items) {
  const missingLangs = new Set();
  let itemsChecked = 0;

  for (const item of items) {
    // Check headers, words, sentences, and characters
    const isRelevantItem =
      item.header ||
      ["word", "sentence", "character"].includes(
        (item.kind || "").toLowerCase(),
      );

    if (isRelevantItem) {
      itemsChecked++;
      const texts = item.texts || {};
      for (const lang of REQUIRED_LANGS) {
        if (typeof texts[lang] !== "string" || texts[lang].trim() === "") {
          missingLangs.add(lang);
        }
      }
    }
  }

  return { itemsChecked, missingLangs: Array.from(missingLangs) };
}

function run() {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
  const lessonFiles = getAllLessonFiles(manifest);

  const report = [];

  for (const lessonInfo of lessonFiles) {
    const filePath = path.join(__dirname, "..", lessonInfo.file);

    if (!fs.existsSync(filePath)) {
      report.push({
        id: lessonInfo.id,
        status: "❌ MISSING FILE",
        details: filePath,
      });
      continue;
    }

    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    const items = data.items || [];

    // --- CHECK 1: Translation Coverage ---
    const { itemsChecked, missingLangs } = checkTranslationCoverage(items);
    let translationStatus = null;
    if (missingLangs.length > 0) {
      translationStatus = `Missing [${missingLangs.join(", ")}] in ${itemsChecked} items.`;
    }

    // --- CHECK 2: Content Structure (Rule of 5 & RW Exception) ---
    let contentStatus = null;

    // UPDATE 3: Exception for Reading/Writing (Script/Phonetic)
    if (lessonInfo.isReadingWriting) {
      let charCount = items.filter(
        (i) => (i.kind || "").toLowerCase() === "character",
      ).length;
      if (charCount === 0) charCount = items.filter((i) => !i.header).length; // Fallback

      if (charCount < 5) {
        contentStatus = `Only ${charCount} characters, need minimum 5.`;
      }
    } else {
      // UPDATE 2: Standard Rule of 5 Validation (Minimum 5 scenarios)
      const headers = items.filter((i) => i.header);

      if (headers.length < 5) {
        contentStatus = `Has ${headers.length} scenarios (headers), minimum of 5 required.`;
      } else {
        let isCompliant = true;
        const details = [];
        let currentScenario = null;
        let scenarioStats = [];

        for (const item of items) {
          if (item.header) {
            if (currentScenario) scenarioStats.push(currentScenario);
            currentScenario = {
              title: item.texts?.en?.trim() || item.id.trim(),
              words: 0,
              sentences: 0,
            };
          } else if (currentScenario) {
            const kind = (item.kind || "").toLowerCase();
            if (kind === "word") currentScenario.words++;
            else if (kind === "sentence") currentScenario.sentences++;
          }
        }
        if (currentScenario) scenarioStats.push(currentScenario);

        for (const stat of scenarioStats) {
          if (stat.words < 5 || stat.sentences < 5) {
            isCompliant = false;
            details.push(
              `"${stat.title}": ${stat.words}W/${stat.sentences}S (Need 5/5)`,
            );
          }
        }

        if (!isCompliant) {
          contentStatus = details.join(" | ");
        }
      }
    }

    // --- COMPILE REPORT ---
    if (!translationStatus && !contentStatus) {
      report.push({
        id: lessonInfo.id,
        status: "✅ COMPLIANT",
        details: "All 7 languages present & Rule of 5 met.",
      });
    } else {
      let finalDetails = [];
      if (translationStatus) finalDetails.push(`[LANG] ${translationStatus}`);
      if (contentStatus) finalDetails.push(`[CONTENT] ${contentStatus}`);

      // Use a specific tag if it's purely a translation issue, otherwise NEEDS_EXPANSION
      const status =
        translationStatus && !contentStatus
          ? "⚠️ MISSING_TRANSLATIONS"
          : "⚠️ NEEDS_EXPANSION";
      report.push({
        id: lessonInfo.id,
        status: status,
        details: finalDetails.join(" | "),
      });
    }
  }

  console.log("\n--- ZABON v3.1 COMPREHENSIVE LESSON AUDIT ---\n");
  for (const r of report) {
    console.log(`${r.status} | ${r.id}`);
    console.log(`   └─ ${r.details}\n`);
  }

  const compliant = report.filter((r) => r.status.includes("COMPLIANT")).length;
  const needsExpansion = report.filter((r) =>
    r.status.includes("NEEDS_EXPANSION"),
  ).length;
  const missingTrans = report.filter((r) =>
    r.status.includes("MISSING_TRANSLATIONS"),
  ).length;
  const missingFile = report.filter((r) =>
    r.status.includes("MISSING FILE"),
  ).length;

  console.log("-------------------------------------");
  console.log(
    `Total: ${report.length} | Compliant: ${compliant} | Missing Translations: ${missingTrans} | Needs Content Expansion: ${needsExpansion} | Missing Files: ${missingFile}`,
  );
}

run();

#!/usr/bin/env node
/**
 * tools/check-lessons.js — Zabon lesson-data validator (Stage V1, revised)
 *
 * Usage (run from anywhere, e.g. VS Code terminal):
 *   node tools/check-lessons.js
 *   node tools/check-lessons.js --only tsl        # thematic | grammar | tsl | phonetic
 *   node tools/check-lessons.js --json            # machine-readable output
 *
 * Exit code: 1 if any ERROR-severity finding, else 0.
 *
 * Revision notes:
 *  - "version" is no longer checked (single version; legacy prototype deleted).
 *  - Reading/Writing lessons use kind "character" (no words/sentences/scenarios).
 *  - Segmenter-language token reconstruction check removed (too noisy); the
 *    deterministic whitespace-language reconstruction check is kept.
 */
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const MANIFEST_PATH = path.join(ROOT, "lessons", "manifest.json");
const LESSONS_DIR = path.join(ROOT, "lessons");
const REPORT_PATH = path.join(ROOT, "tools", "lessons-report.md");

const MAX_EXAMPLES = 3; // examples shown per issue-code in the report

// ---------------------------------------------------------------------------
// tiny issue helpers
// ---------------------------------------------------------------------------
function makeIssue(severity, code, detail, p, extra) {
  return Object.assign({ severity, code, path: p || "", detail }, extra || {});
}
const err = (code, detail, p, extra) =>
  makeIssue("error", code, detail, p, extra);
const warn = (code, detail, p, extra) =>
  makeIssue("warning", code, detail, p, extra);
const info = (code, detail, p, extra) =>
  makeIssue("info", code, detail, p, extra);

function relToRoot(fp) {
  return path.relative(ROOT, fp).split(path.sep).join("/");
}
function normRel(p) {
  return String(p || "")
    .split("\\")
    .join("/")
    .replace(/^\.\//, "");
}

// ---------------------------------------------------------------------------
// deep whitespace scan (keys + string values)
// ---------------------------------------------------------------------------
function scanWhitespace(node, p, out) {
  if (node === null || node === undefined) return;
  if (typeof node === "string") {
    if (node !== node.trim()) {
      out.push(
        err(
          "WHITESPACE",
          "value has leading/trailing whitespace: " + JSON.stringify(node),
          p,
        ),
      );
    }
    return;
  }
  if (Array.isArray(node)) {
    node.forEach((v, i) => scanWhitespace(v, p + "[" + i + "]", out));
    return;
  }
  if (typeof node === "object") {
    for (const key of Object.keys(node)) {
      if (key !== key.trim()) {
        out.push(
          err(
            "WHITESPACE_KEY",
            "object key has leading/trailing whitespace: " +
              JSON.stringify(key),
            p,
          ),
        );
      }
      scanWhitespace(node[key], p ? p + "." + key : key, out);
    }
  }
}

// ---------------------------------------------------------------------------
// texts / tokens coverage helpers
// ---------------------------------------------------------------------------
function checkTextsCoverage(item, id, langs, langSet, issues, p) {
  const texts = item.texts;
  if (!texts || typeof texts !== "object" || Array.isArray(texts)) {
    issues.push(
      err("MISSING_TEXTS", '"' + id + '": missing "texts" object', p),
    );
    return;
  }
  for (const code of langs) {
    const v = texts[code];
    if (typeof v !== "string" || !v.trim()) {
      issues.push(
        err(
          "MISSING_TEXT",
          '"' + id + '": texts.' + code + " is missing or empty",
          p,
        ),
      );
    }
  }
  for (const key of Object.keys(texts)) {
    if (!langSet.has(key.trim())) {
      issues.push(
        warn(
          "EXTRA_TEXT_LANG",
          '"' + id + '": texts has language "' + key + '" not in manifest',
          p,
        ),
      );
    }
  }
}

function tokenText(t) {
  if (typeof t === "string") return t;
  if (t && typeof t === "object" && typeof t.text === "string") return t.text;
  return null;
}

function checkSentenceTokens(item, id, langs, segByCode, issues, p) {
  const tokens = item.tokens;
  if (!tokens || typeof tokens !== "object" || Array.isArray(tokens)) {
    issues.push(
      err("MISSING_TOKENS", '"' + id + '": missing "tokens" object', p),
    );
    return;
  }
  for (const code of langs) {
    const arr = tokens[code];
    if (!Array.isArray(arr) || arr.length === 0) {
      issues.push(
        err(
          "MISSING_TOKEN_LANG",
          '"' + id + '": tokens.' + code + " missing or empty",
          p,
          { lang: code },
        ),
      );
      continue;
    }
    const texts = [];
    let ok = true;
    for (const t of arr) {
      const tx = tokenText(t);
      if (tx === null) {
        issues.push(
          err(
            "BAD_TOKEN",
            '"' + id + '": tokens.' + code + " has a non-string token",
            p,
          ),
        );
        ok = false;
      } else {
        texts.push(tx);
      }
    }
    if (!ok) continue;

    // Token -> text consistency for WHITESPACE languages only (deterministic).
    // Segmenter languages (th/zh/ja) are intentionally NOT reconstruction-checked:
    // word boundaries are ambiguous and exact matching produced heavy false noise.
    const fullText =
      item.texts && typeof item.texts[code] === "string"
        ? item.texts[code]
        : "";
    if (!fullText) continue;
    const seg = segByCode[code] || "";
    if (seg === "whitespace") {
      const expected = fullText.trim().replace(/\s+/g, " ");
      const got = texts.join(" ").trim().replace(/\s+/g, " ");
      if (got !== expected) {
        issues.push(
          err(
            "TOKEN_MISMATCH",
            '"' + id + '": tokens.' + code + " do not reconstruct the text",
            p,
          ),
        );
      }
    }
  }
}

// ---------------------------------------------------------------------------
// thematic scenario ordering: within a group, sentences must precede words
// ---------------------------------------------------------------------------
function checkScenarioOrder(items, issues) {
  let inGroup = false;
  let seenWord = false;
  let groupId = "";
  items.forEach((item, idx) => {
    if (item && item.header === true) {
      inGroup = true;
      seenWord = false;
      groupId = (item.id || "").trim();
      return;
    }
    if (!inGroup || !item) return;
    if (item.kind === "word") {
      seenWord = true;
    } else if (item.kind === "sentence") {
      if (seenWord) {
        issues.push(
          err(
            "ORDER",
            'sentence "' +
              (item.id || "") +
              '" appears after a word in group "' +
              groupId +
              '"',
            "items[" + idx + "]",
          ),
        );
      }
    }
  });
}

// ---------------------------------------------------------------------------
// per-lesson validation
// ---------------------------------------------------------------------------
function validateLesson(lesson, segByCode) {
  const issues = [];
  const langs = Array.isArray(lesson.languages) ? lesson.languages : [];
  const langSet = new Set(langs.map((c) => String(c).trim()));
  const type = lesson.type;

  // open + parse
  const full = path.join(ROOT, normRel(lesson.file));
  if (!fs.existsSync(full)) {
    issues.push(err("FILE_MISSING", "file not found: " + normRel(lesson.file)));
    return issues;
  }
  let content;
  try {
    content = JSON.parse(fs.readFileSync(full, "utf8"));
  } catch (e) {
    issues.push(err("PARSE_ERROR", "invalid JSON: " + e.message));
    return issues;
  }

  // whitespace deep scan (ground truth on disk)
  scanWhitespace(content, "", issues);

  // Bypass all structural/prefix checks for the tone-rules lesson
  if (lesson.id === "lesson_rw2") {
    return issues;
  }

  // NOTE: "version" is intentionally NOT validated (single version).

  // items array
  if (!Array.isArray(content.items) || content.items.length === 0) {
    issues.push(err("ITEMS", '"items" must be a non-empty array'));
    return issues;
  }
  const items = content.items;

  // classify items
  const seenIds = new Map();
  const words = [];
  const sentences = [];
  const headers = [];
  const characters = [];
  items.forEach((item, idx) => {
    const p = "items[" + idx + "]";
    if (!item || typeof item !== "object") {
      issues.push(err("BAD_ITEM", "item is not an object", p));
      return;
    }
    const id = typeof item.id === "string" ? item.id : "";
    if (!id.trim()) {
      issues.push(err("MISSING_ID", 'item has no valid "id"', p));
    } else if (seenIds.has(id)) {
      issues.push(
        err(
          "DUP_ID",
          'duplicate id "' + id + '" (first at items[' + seenIds.get(id) + "])",
          p,
        ),
      );
    } else {
      seenIds.set(id, idx);
    }

    if (item.header === true) {
      headers.push({ id, idx, item });
      if (item.kind !== undefined) {
        issues.push(
          err(
            "HEADER_KIND",
            'header "' + id + '" must not have a "kind" field',
            p,
          ),
        );
      }
    } else if (item.kind === "word") {
      words.push({ id, idx, item });
    } else if (item.kind === "sentence") {
      sentences.push({ id, idx, item });
    } else if (item.kind === "character") {
      characters.push({ id, idx, item });
    } else {
      issues.push(
        err(
          "BAD_KIND",
          'item "' + id + '" has invalid/missing kind "' + item.kind + '"',
          p,
        ),
      );
    }
  });

  const wordIds = new Set(words.map((w) => w.id.trim()));

  // words: texts coverage
  for (const w of words) {
    checkTextsCoverage(
      w.item,
      w.id,
      langs,
      langSet,
      issues,
      "items[" + w.idx + "]",
    );
  }

  // sentences: itemIds + texts + tokens
  for (const s of sentences) {
    const p = "items[" + s.idx + "]";
    const refs = s.item.itemIds;
    if (!Array.isArray(refs) || refs.length === 0) {
      issues.push(
        err(
          "MISSING_ITEMIDS",
          'sentence "' + s.id + '": missing or empty "itemIds"',
          p,
        ),
      );
    } else {
      for (const ref of refs) {
        const rid = typeof ref === "string" ? ref.trim() : "";
        if (!wordIds.has(rid)) {
          issues.push(
            err(
              "UNRESOLVED_REF",
              'sentence "' + s.id + '" references undefined word "' + ref + '"',
              p,
            ),
          );
        }
      }
    }
    checkTextsCoverage(s.item, s.id, langs, langSet, issues, p);
    checkSentenceTokens(s.item, s.id, langs, segByCode, issues, p);
  }

  // "character" items belong only to phonetic lessons
  if (type !== "phonetic" && characters.length > 0) {
    issues.push(
      err(
        "CHARACTER_WRONG_TYPE",
        characters.length +
          ' "character" item(s) found in a non-phonetic lesson',
      ),
    );
  }

  // ---------------- type-specific structural rules ----------------
  if (type === "thematic") {
    const first = items[0];
    if (
      !(
        first &&
        first.header === true &&
        (first.id || "").trim() === "header_core_words"
      )
    ) {
      issues.push(
        err("STRUCTURE", "thematic lesson must start with header_core_words"),
      );
    }
    const scenarioHeaders = headers.filter((h) =>
      /^header_scenario/i.test((h.id || "").trim()),
    );
    if (scenarioHeaders.length < 5) {
      issues.push(
        err(
          "MIN_SCENARIOS",
          "needs >=5 scenario headers, found " + scenarioHeaders.length,
        ),
      );
    }
    const otherHeaders = headers.filter(
      (h) =>
        (h.id || "").trim() !== "header_core_words" &&
        !/^header_scenario/i.test((h.id || "").trim()),
    );
    for (const h of otherHeaders) {
      issues.push(
        warn(
          "HEADER_NAME",
          'unusual header id "' + h.id + '"',
          "items[" + h.idx + "]",
        ),
      );
    }
    for (const w of words) {
      if (!w.id.trim().startsWith("word_"))
        issues.push(
          err(
            "ID_PREFIX",
            'word "' + w.id + '" should use word_ prefix',
            "items[" + w.idx + "]",
          ),
        );
    }
    for (const s of sentences) {
      if (!s.id.trim().startsWith("sentence_"))
        issues.push(
          err(
            "ID_PREFIX",
            'sentence "' + s.id + '" should use sentence_ prefix',
            "items[" + s.idx + "]",
          ),
        );
    }
    for (const h of headers) {
      if (!h.id.trim().startsWith("header_"))
        issues.push(
          err(
            "ID_PREFIX",
            'header "' + h.id + '" should use header_ prefix',
            "items[" + h.idx + "]",
          ),
        );
    }
    checkScenarioOrder(items, issues);
  } else if (type === "grammar") {
    if (words.length < 1)
      issues.push(
        err(
          "MIN_WORDS",
          "grammar lesson needs >=1 word, found " + words.length,
        ),
      );
    if (sentences.length < 1)
      issues.push(
        err(
          "MIN_EXAMPLES",
          "grammar lesson needs >=1 sentence example, found " +
            sentences.length,
        ),
      );
    if (headers.length > 0) {
      issues.push(
        warn(
          "GRAMMAR_HEADERS",
          "grammar lesson has " +
            headers.length +
            " header(s); grammar format expects none",
        ),
      );
    }
    for (const w of words) {
      if (!w.id.trim().startsWith("word_"))
        issues.push(
          err(
            "ID_PREFIX",
            'word "' + w.id + '" should use word_ prefix',
            "items[" + w.idx + "]",
          ),
        );
    }
    for (const s of sentences) {
      if (!s.id.trim().startsWith("sentence_"))
        issues.push(
          err(
            "ID_PREFIX",
            'sentence "' + s.id + '" should use sentence_ prefix',
            "items[" + s.idx + "]",
          ),
        );
    }
  } else if (type === "tsl") {
    if (words.length < 1)
      issues.push(
        err("MIN_WORDS", "TSL lesson needs >=1 word, found " + words.length),
      );
    if (sentences.length < 1)
      issues.push(
        err(
          "MIN_SENTENCES",
          "TSL lesson needs >=1 sentence, found " + sentences.length,
        ),
      );
    // book-specific IDs are allowed; just note the scheme once
    const nonCanonical = words
      .concat(sentences)
      .filter((x) => !/^(word_|sentence_)/.test(x.id.trim()));
    if (nonCanonical.length > 0) {
      issues.push(
        info(
          "TSL_ID_SCHEME",
          nonCanonical.length +
            " item(s) use book-specific IDs (allowed for TSL)",
        ),
      );
    }
  } else if (type === "phonetic") {
    // Reading/Writing: kind "character" only; no words/sentences/scenarios.
    if (characters.length < 1) {
      issues.push(
        err(
          "MIN_CHARACTERS",
          'phonetic lesson needs >=1 "character" item, found ' +
            characters.length,
        ),
      );
    }
    for (const c of characters) {
      const p = "items[" + c.idx + "]";
      const texts = c.item.texts;
      if (!texts || typeof texts.th !== "string" || !texts.th.trim()) {
        issues.push(
          err("CHARACTER_TH", 'character "' + c.id + '" missing texts.th', p),
        );
      }
      if (
        !c.item.phonetic ||
        typeof c.item.phonetic !== "object" ||
        Array.isArray(c.item.phonetic)
      ) {
        issues.push(
          warn(
            "CHARACTER_PHONETIC",
            'character "' + c.id + '" missing "phonetic" map',
            p,
          ),
        );
      }
    }
    if (words.length + sentences.length > 0) {
      issues.push(
        info(
          "PHONETIC_EXTRA",
          words.length +
            sentences.length +
            " word/sentence item(s) in a character lesson",
        ),
      );
    }
  }

  return issues;
}

// ---------------------------------------------------------------------------
// grouping for a readable report
// ---------------------------------------------------------------------------
function summarize(issues) {
  const byCode = {};
  for (const iss of issues) {
    if (!byCode[iss.code]) {
      byCode[iss.code] = {
        severity: iss.severity,
        count: 0,
        examples: [],
        langCounts: {},
      };
    }
    const g = byCode[iss.code];
    g.count += 1;
    if (g.examples.length < MAX_EXAMPLES) g.examples.push(iss);
    if (iss.code === "MISSING_TOKEN_LANG" && iss.lang) {
      g.langCounts[iss.lang] = (g.langCounts[iss.lang] || 0) + 1;
    }
  }
  return byCode;
}

function severityRank(s) {
  return s === "error" ? 0 : s === "warning" ? 1 : 2;
}

// ---------------------------------------------------------------------------
// orphan scan
// ---------------------------------------------------------------------------
function walk(dir, cb) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, cb);
    else if (entry.isFile()) cb(full);
  }
}

function findOrphans(referenced) {
  const orphans = [];
  walk(LESSONS_DIR, (full) => {
    if (!full.endsWith(".json")) return;
    const rel = relToRoot(full);
    if (rel === "lessons/manifest.json") return;
    if (!referenced.has(rel)) orphans.push(rel);
  });
  return orphans.sort();
}

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------
function main() {
  const argv = process.argv.slice(2);
  const asJson = argv.includes("--json");
  const onlyIdx = argv.indexOf("--only");
  const onlyType = onlyIdx >= 0 ? argv[onlyIdx + 1] : null;

  if (!fs.existsSync(MANIFEST_PATH)) {
    console.error("ERROR: manifest not found at " + MANIFEST_PATH);
    process.exit(2);
  }
  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
  } catch (e) {
    console.error("ERROR: cannot parse manifest.json: " + e.message);
    process.exit(2);
  }

  // manifest whitespace (informational safety net)
  const manifestIssues = [];
  scanWhitespace(manifest, "", manifestIssues);

  // segmentation map
  const segByCode = {};
  const regLangs = (manifest.zabon && manifest.zabon.languages) || [];
  for (const l of regLangs) {
    const code = String(l.code || "").trim();
    if (code) segByCode[code] = String(l.segmentation || "").trim();
  }

  // build registry
  const allLessons = [];
  for (const category of manifest.categories || []) {
    for (const lesson of category.lessons || []) {
      let type = "thematic";
      if (lesson.id === "lesson_rw2") {
        // rw2 is a word/sentence lesson despite having displayMode:"phonetic"
        type = "grammar";
      } else if (lesson.displayMode === "phonetic") {
        type = "phonetic";
      } else if (category.id === "cat_grammar") {
        type = "grammar";
      }

      allLessons.push({
        id: lesson.id,
        file: lesson.file,
        languages: lesson.languages || [],
        type,
        category: category.id,
        skip: category.id === "cat_test",
      });
    }
  }
  for (const topic of manifest.topics || []) {
    for (const book of topic.books || []) {
      for (const lesson of book.lessons || []) {
        allLessons.push({
          id: lesson.id,
          file: lesson.file,
          languages: lesson.languages || [],
          type: "tsl",
          category: topic.id + "/" + book.id,
          skip: false,
        });
      }
    }
  }

  const referenced = new Set();
  for (const l of allLessons) if (l.file) referenced.add(normRel(l.file));

  const validatable = allLessons.filter(
    (l) => !l.skip && (!onlyType || l.type === onlyType),
  );

  // validate
  const results = [];
  for (const lesson of validatable) {
    results.push({ lesson, issues: validateLesson(lesson, segByCode) });
  }

  const orphans = findOrphans(referenced);

  // totals
  let errorCount = 0,
    warnCount = 0,
    infoCount = 0;
  for (const r of results) {
    for (const i of r.issues) {
      if (i.severity === "error") errorCount++;
      else if (i.severity === "warning") warnCount++;
      else infoCount++;
    }
  }
  const failLessons = results.filter((r) =>
    r.issues.some((i) => i.severity === "error"),
  );
  const warnLessons = results.filter(
    (r) => !r.issues.some((i) => i.severity === "error") && r.issues.length > 0,
  );
  const passLessons = results.filter((r) => r.issues.length === 0);

  if (asJson) {
    console.log(
      JSON.stringify(
        {
          manifestIssues,
          errorCount,
          warnCount,
          infoCount,
          lessons: results.map((r) => ({
            id: r.lesson.id,
            type: r.lesson.type,
            file: normRel(r.lesson.file),
            status: r.issues.some((i) => i.severity === "error")
              ? "fail"
              : r.issues.length
                ? "warn"
                : "pass",
            issues: r.issues,
          })),
          orphans,
        },
        null,
        2,
      ),
    );
    process.exitCode = errorCount > 0 ? 1 : 0;
    return;
  }

  // markdown report
  const lines = [];
  lines.push("# Zabon Lessons Validation Report");
  lines.push("");
  lines.push("Generated: " + new Date().toISOString());
  lines.push(
    "Manifest lessons: " +
      allLessons.length +
      " (validated: " +
      validatable.length +
      (onlyType ? ", only=" + onlyType : "") +
      ")",
  );
  lines.push(
    "Errors: " +
      errorCount +
      "   Warnings: " +
      warnCount +
      "   Info: " +
      infoCount,
  );
  lines.push(
    "Failing lessons: " +
      failLessons.length +
      "   Warning-only: " +
      warnLessons.length +
      "   Passing: " +
      passLessons.length,
  );
  lines.push("Orphan files: " + orphans.length);
  lines.push("");

  if (manifestIssues.length) {
    lines.push("## Manifest whitespace findings");
    manifestIssues
      .slice(0, 20)
      .forEach((i) =>
        lines.push("- [" + i.code + "] " + i.path + " — " + i.detail),
      );
    if (manifestIssues.length > 20)
      lines.push("- … and " + (manifestIssues.length - 20) + " more");
    lines.push("");
  }

  function renderLessonBlock(r) {
    const sum = summarize(r.issues);
    const codes = Object.keys(sum).sort(
      (a, b) =>
        severityRank(sum[a].severity) - severityRank(sum[b].severity) ||
        a.localeCompare(b),
    );
    lines.push(
      "### " +
        r.lesson.id +
        "  (" +
        r.lesson.type +
        ") — " +
        normRel(r.lesson.file),
    );
    const status = r.issues.some((i) => i.severity === "error")
      ? "FAIL"
      : r.issues.length
        ? "WARN"
        : "PASS";
    lines.push(
      "Status: **" +
        status +
        "**  (" +
        r.issues.filter((i) => i.severity === "error").length +
        " errors, " +
        r.issues.filter((i) => i.severity === "warning").length +
        " warnings)",
    );
    for (const code of codes) {
      const g = sum[code];
      let head =
        "- [" + g.severity.toUpperCase() + "] " + code + " ×" + g.count;
      if (code === "MISSING_TOKEN_LANG" && Object.keys(g.langCounts).length) {
        const per = Object.entries(g.langCounts)
          .map(([lc, n]) => lc + "(" + n + ")")
          .join(", ");
        head += " — missing tokens for: " + per;
      }
      lines.push(head);
      for (const ex of g.examples) {
        lines.push("    - " + (ex.path ? ex.path + ": " : "") + ex.detail);
      }
    }
    lines.push("");
  }

  lines.push("## Lessons with ERRORS");
  if (!failLessons.length) lines.push("_none_");
  lines.push("");
  failLessons.forEach(renderLessonBlock);

  lines.push("## Lessons with WARNINGS only");
  if (!warnLessons.length) lines.push("_none_");
  lines.push("");
  warnLessons.forEach(renderLessonBlock);

  lines.push("## Passing lessons");
  if (!passLessons.length) lines.push("_none_");
  passLessons.forEach((r) =>
    lines.push("- " + r.lesson.id + " (" + r.lesson.type + ")"),
  );
  lines.push("");

  lines.push("## Orphan files (on disk, not referenced by manifest.json)");
  if (!orphans.length) lines.push("_none_");
  orphans.forEach((o) => lines.push("- " + o));
  lines.push("");

  const report = lines.join("\n");
  try {
    fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
    fs.writeFileSync(REPORT_PATH, report, "utf8");
  } catch (e) {
    console.error("WARNING: could not write report file: " + e.message);
  }

  console.log(report);
  console.log("\nReport written to: " + relToRoot(REPORT_PATH));
  process.exitCode = errorCount > 0 ? 1 : 0;
}

main();

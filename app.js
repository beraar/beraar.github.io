// app.js
(() => {
  "use strict";
  const STORAGE_KEYS = {
    get settings() {
      return "zabon.settings";
    },
    get lessonLanguages() {
      return "zabon.lessonLanguages";
    },
    get onboardingComplete() {
      return "zabon.onboardingComplete";
    },
    get onboardingAnswers() {
      return "zabon.onboardingAnswers";
    },
    get buildLanguages() {
      return "zabon.buildLanguages";
    },
    get srs() {
      return `zabon.${state?.settings?.targetLanguage || "th"}.srs`;
    },
    get quiz() {
      return `zabon.${state?.settings?.targetLanguage || "th"}.quiz`;
    },
    get lessonsTried() {
      return `zabon.${state?.settings?.targetLanguage || "th"}.lessonsTried`;
    },
    get studyPlan() {
      return `zabon.${state?.settings?.targetLanguage || "th"}.studyPlan`;
    },
    get studyPlanProgress() {
      return `zabon.${state?.settings?.targetLanguage || "th"}.studyPlanProgress`;
    },
    get lessonBaseStatus() {
      return `zabon.${state?.settings?.targetLanguage || "th"}.lessonBaseStatus`;
    },
  };

  const DEFAULT_LESSON_LANGUAGES = Object.freeze(["en", "th"]);
  const THEME_CYCLE = Object.freeze(["auto", "light", "dark"]);
  const SPEED_PRESETS = Object.freeze({
    normal: { rate: 1, pitch: 1 },
    slow: { rate: 0.75, pitch: 1.05 },
    slower: { rate: 0.5, pitch: 1.1 },
  });

  const CATEGORY_ICONS = Object.freeze({
    cat_grammar_intro: "📜",
    cat_grammar_inter: "📜",
    cat_grammar_adv: "📜",

    cat_greetings: "👋",
    cat_basics: "🧭",
    cat_food: "🍜",
    cat_shopping: "🛍️",
    cat_money: "💰",
    cat_transport: "🚌",
    cat_weather: "⛅",
    cat_home: "🏠",
    cat_health: "💊",
    cat_personal: "💇",
    cat_post: "📮",
    cat_entertainment: "🎬",
    cat_family: "👪",
    cat_accommodation: "🏨",
    cat_travel: "✈️",
    cat_emergency: "🚨",
    cat_work: "💼",
    cat_religion_culture: "🛕",
    cat_reading_writing: "🔤",
  });

  const TIER_ICONS = Object.freeze({
    introductory: "🌱",
    intermediate: "🌿",
    advanced: "🌳",
  });
  const TOPIC_ICON = "📚";
  const BOOK_ICON = "📖";
  const SCROLL_SUPPRESSION_MS = 900;

  // Replace the existing VIEW_IDS array with this:
  const VIEW_IDS = Object.freeze([
    "targetSelect",
    "onboarding",
    "home",
    "lesson",
    "flashcard",
    "quiz",
    "build",
    "progress",
    "voicetest",
    "help",
  ]);
  const IMPLEMENTED_TARGET_LANGUAGES = Object.freeze([
    "th",
    "fa",
    "en",
    "zh",
    "ja",
    "ar",
    "es",
  ]);
  const UI_STRINGS = Object.freeze({
    appTitle: {
      en: "Zabon",
      th: "ซาบอน",
      fa: "زبون",
      ar: "زابون",
      es: "Zabon",
      zh: "扎邦",
      ja: "ザボン",
    },
    appLanguage: {
      en: "App language",
      th: "ภาษาของแอป",
      fa: "زبان برنامه",
      ar: "لغة التطبيق",
      es: "Idioma de la app",
      zh: "应用语言",
      ja: "アプリ言語",
    },
    lessonsTried: {
      en: "Lessons tried",
      th: "บทเรียนที่ลองแล้ว",
      fa: "درس‌های امتحان‌شده",
      ar: "الدروس المُجرَّبة",
      es: "Lecciones probadas",
      zh: "已尝试的课程",
      ja: "試したレッスン",
    },
    onboardingTitle: {
      en: "Welcome to Zabon",
      th: "ยินดีต้อนรับสู่ Zabon",
      fa: "به زبون خوش آمدید",
      ar: "مرحبًا بك في زبون",
      es: "Bienvenido a Zabon",
      zh: "欢迎使用 Zabon",
      ja: "Zabonへようこそ",
    },
    onboardingIntro: {
      en: "Answer a few questions to help Zabon suggest a study plan. You can skip this and browse freely.",
      th: "ตอบคำถามสองสามข้อเพื่อช่วยให้ Zabon แนะนำแผนการเรียน คุณสามารถข้ามและเรียกดูได้อย่างอิสระ",
      fa: "برای کمک به زبون در پیشنهاد برنامه مطالعه، به چند سؤال پاسخ دهید. می‌توانید رد کنید و آزادانه مرور کنید.",
      ar: "أجب عن بضعة أسئلة لمساعدة زبون في اقتراح خطة دراسة. يمكنك التخطي والتصفح بحرية.",
      es: "Responde algunas preguntas para que Zabon sugiera un plan de estudio. Puedes omitir esto y explorar libremente.",
      zh: "回答几个问题，帮助 Zabon 推荐学习计划。你可以跳过并自由浏览。",
      ja: "Zabonが学習プランを提案できるように、いくつかの質問にお答えください。スキップして自由に閲覧することもできます。",
    },
    onboardingGoal: {
      en: "What is your main goal?",
      th: "เป้าหมายหลักของคุณคืออะไร",
      fa: "هدف اصلی شما چیست؟",
      ar: "ما هدفك الرئيسي؟",
      es: "¿Cuál es tu objetivo principal?",
      zh: "你的主要目标是什么？",
      ja: "主な目標は何ですか？",
    },
    onboardingGoalTravel: {
      en: "Travel & tourism",
      th: "การเดินทางและท่องเที่ยว",
      fa: "سفر و گردشگری",
      ar: "السفر والسياحة",
      es: "Viajes y turismo",
      zh: "旅行与旅游",
      ja: "旅行・観光",
    },
    onboardingGoalBusiness: {
      en: "Business & work",
      th: "ธุรกิจและการทำงาน",
      fa: "کسب‌وکار و کار",
      ar: "الأعمال والعمل",
      es: "Negocios y trabajo",
      zh: "商务与工作",
      ja: "ビジネスと仕事",
    },
    onboardingGoalEveryday: {
      en: "Everyday conversation",
      th: "การสนทนาในชีวิตประจำวัน",
      fa: "مکالمه روزمره",
      ar: "محادثة يومية",
      es: "Conversación cotidiana",
      zh: "日常会话",
      ja: "日常会話",
    },
    onboardingGoalExam: {
      en: "Exam preparation",
      th: "การเตรียมสอบ",
      fa: "آماده‌سازی آزمون",
      ar: "التحضير للامتحان",
      es: "Preparación de exámenes",
      zh: "考试准备",
      ja: "試験準備",
    },
    onboardingLevel: {
      en: "Your current {targetLanguage} level?",
      th: "ระดับ{targetLanguage}ปัจจุบันของคุณคืออะไร",
      fa: "سطح فعلی شما در {targetLanguage} چیست؟",
      ar: "ما مستواك الحالي في {targetLanguage}؟",
      es: "¿Cuál es tu nivel actual de {targetLanguage}?",
      zh: "你目前的{targetLanguage}水平是什么？",
      ja: "現在の{targetLanguage}レベルは何ですか？",
    },
    onboardingLevelBeginner: {
      en: "Complete beginner",
      th: "ผู้เริ่มต้น",
      fa: "مبتدی کامل",
      ar: "مبتدئ تمامًا",
      es: "Principiante absoluto",
      zh: "完全零基础",
      ja: "完全な初心者",
    },
    onboardingLevelSome: {
      en: "Some words & phrases",
      th: "รู้คำและวลีบ้าง",
      fa: "برخی کلمات و عبارت‌ها",
      ar: "بعض الكلمات والعبارات",
      es: "Algunas palabras y frases",
      zh: "会一些单词和短语",
      ja: "いくつかの単語とフレーズ",
    },
    onboardingLevelBasic: {
      en: "Basic conversations",
      th: "การสนทนาพื้นฐาน",
      fa: "مکالمه‌های پایه",
      ar: "محادثات أساسية",
      es: "Conversaciones básicas",
      zh: "基本会话",
      ja: "基本的な会話",
    },
    onboardingLevelAdvanced: {
      en: "Advanced refinement",
      th: "ปรับปรุงขั้นสูง",
      fa: "اصلاح پیشرفته",
      ar: "تحسين متقدم",
      es: "Perfeccionamiento avanzado",
      zh: "高级提升",
      ja: "上級の仕上げ",
    },

    onboardingUsage: {
      en: "How will you mainly use {targetLanguage}?",
      th: "คุณจะใช้{targetLanguage}เป็นหลักอย่างไร",
      fa: "چگونه عمدتاً از {targetLanguage} استفاده خواهید کرد؟",
      ar: "كيف ستستخدم {targetLanguage} بشكل أساسي؟",
      es: "¿Cómo usarás principalmente el {targetLanguage}?",
      zh: "你将主要如何使用{targetLanguage}？",
      ja: "{targetLanguage}を主にどのように使いますか؟",
    },

    onboardingUsageReading: {
      en: "Reading menus & signs",
      th: "อ่านเมนูและป้าย",
      fa: "خواندن منو و تابلوها",
      ar: "قراءة القوائم واللافتات",
      es: "Leer menús y letreros",
      zh: "阅读菜单和标识",
      ja: "メニューや標識を読む",
    },
    onboardingUsageSpeaking: {
      en: "Speaking with locals",
      th: "พูดคุยกับคนท้องถิ่น",
      fa: "صحبت با مردم محلی",
      ar: "التحدث مع السكان المحليين",
      es: "Hablar con locales",
      zh: "与当地人交流",
      ja: "地元の人と話す",
    },

    onboardingUsageMedia: {
      en: "Watching {targetLanguage} media",
      th: "ดูสื่อ{targetLanguage}",
      fa: "تماشای رسانه‌های {targetLanguage}",
      ar: "مشاهدة وسائط {targetLanguage}",
      es: "Ver medios en {targetLanguage}",
      zh: "观看{targetLanguage}媒体",
      ja: "{targetLanguage}のメディアを見る",
    },

    onboardingUsageWriting: {
      en: "Writing & formal contexts",
      th: "การเขียนและบริบททางการ",
      fa: "نوشتن و موقعیت‌های رسمی",
      ar: "الكتابة والسياقات الرسمية",
      es: "Escribir y contextos formales",
      zh: "书写和正式场合",
      ja: "書き言葉と公式な場面",
    },
    generateStudyPlan: {
      en: "Generate my study plan",
      th: "สร้างแผนการเรียนของฉัน",
      fa: "برنامه مطالعه من را بساز",
      ar: "أنشئ خطتي الدراسية",
      es: "Generar mi plan de estudio",
      zh: "生成我的学习计划",
      ja: "学習プランを作成",
    },
    skipOnboarding: {
      en: "Skip — browse freely",
      th: "ข้าม — เรียกดูอย่างอิสระ",
      fa: "رد شدن — مرور آزاد",
      ar: "تخطٍ — تصفح بحرية",
      es: "Omitir — explorar libremente",
      zh: "跳过——自由浏览",
      ja: "スキップして自由に閲覧",
    },
    onboardingGenerateHint: {
      en: "Select a goal and level to continue.",
      th: "เลือกเป้าหมายและระดับเพื่อดำเนินการต่อ",
      fa: "برای ادامه، هدف و سطح را انتخاب کنید.",
      ar: "اختر هدفًا ومستوى للمتابعة.",
      es: "Selecciona un objetivo y un nivel para continuar.",
      zh: "选择目标和水平以继续。",
      ja: "続けるには目標とレベルを選択してください。",
    },
    nextUp: {
      en: "Next Up",
      th: "ถัดไป",
      fa: "بعدی",
      ar: "التالي",
      es: "Siguiente",
      zh: "下一个",
      ja: "次へ",
    },
    skipLesson: {
      en: "Skip",
      th: "ข้าม",
      fa: "رد کردن",
      ar: "تخطي",
      es: "Omitir",
      zh: "跳过",
      ja: "スキップ",
    },
    studyPlan: {
      en: "Study Plan",
      th: "แผนการเรียน",
      fa: "برنامه مطالعه",
      ar: "خطة الدراسة",
      es: "Plan de estudio",
      zh: "学习计划",
      ja: "学習プラン",
    },
    browseByLevel: {
      en: "Browse by Level",
      th: "เรียกดูตามระดับ",
      fa: "مرور بر اساس سطح",
      ar: "تصفح حسب المستوى",
      es: "Explorar por nivel",
      zh: "按级别浏览",
      ja: "レベル別に閲覧",
    },
    browseByTopic: {
      en: "Browse by Topic",
      th: "เรียกดูตามหัวข้อ",
      fa: "مرور بر اساس موضوع",
      ar: "تصفح حسب الموضوع",
      es: "Explorar por tema",
      zh: "按主题浏览",
      ja: "トピック別に閲覧",
    },
    completeQuestion: {
      en: "Complete?",
      th: "เสร็จแล้ว?",
      fa: "کامل شد؟",
      ar: "مكتمل؟",
      es: "¿Completado?",
      zh: "已完成？",
      ja: "完了？",
    },
    createStudyPlan: {
      en: "Create Study Plan",
      th: "สร้างแผนการเรียน",
      fa: "ساخت برنامه مطالعه",
      ar: "إنشاء خطة دراسة",
      es: "Crear plan de estudio",
      zh: "创建学习计划",
      ja: "学習プランを作成",
    },
    editStudyPlan: {
      en: "Edit Study Plan",
      th: "แก้ไขแผนการเรียนรู้",
      fa: "ویرایش برنامه مطالعه",
      ar: "تعديل خطة الدراسة",
      es: "Editar plan de estudio",
      zh: "编辑学习计划",
      ja: "学習プランを編集",
    },
    studyPlanAndProgress: {
      en: "Study Plan & Progress",
      th: "แผนการเรียนและความคืบหน้า",
      fa: "برنامه مطالعه و پیشرفت",
      ar: "خطة الدراسة والتقدم",
      es: "Plan de estudio y progreso",
      zh: "学习计划与进度",
      ja: "学習プランと進捗",
    },
    gettingStarted: {
      en: "Getting Started",
      th: "เริ่มต้นใช้งาน",
      fa: "شروع کار",
      ar: "البدء",
      es: "Primeros pasos",
      zh: "入门指南",
      ja: "はじめに",
    },
    deleteStudyPlan: {
      en: "Delete Study Plan",
      th: "ลบแผนการเรียน",
      fa: "حذف برنامه مطالعه",
      ar: "حذف خطة الدراسة",
      es: "Eliminar plan de estudio",
      zh: "删除学习计划",
      ja: "学習プランを削除",
    },
    deleteStudyPlanConfirm: {
      en: "Delete this study plan? All lesson progress will be removed.",
      th: "ลบแผนการเรียนนี้หรือไม่? ความคืบหน้าของบทเรียนทั้งหมดจะถูกลบออก",
      fa: "این برنامه مطالعه حذف شود؟ تمام پیشرفت درس‌ها حذف خواهد شد.",
      ar: "هل تريد حذف خطة الدراسة هذه؟ ستُزال كل تطورات الدروس.",
      es: "¿Eliminar este plan de estudio? Se eliminará todo el progreso de las lecciones.",
      zh: "删除此学习计划？所有课程进度都将被移除。",
      ja: "この学習プランを削除しますか？すべてのレッスン進捗が削除されます。",
    },
    noStudyPlan: {
      en: "No study plan yet.",
      th: "ยังไม่มีแผนการเรียน",
      fa: "هنوز برنامه مطالعه‌ای وجود ندارد.",
      ar: "لا توجد خطة دراسة بعد.",
      es: "Aún no hay plan de estudio.",
      zh: "尚无学习计划。",
      ja: "学習プランはまだありません。",
    },
    exercises: {
      en: "Exercises",
      th: "แบบฝึกหัด",
      fa: "تمرین‌ها",
      ar: "التمارين",
      es: "Ejercicios",
      zh: "练习",
      ja: "練習",
    },
    lessonStatusComplete: {
      en: "Complete",
      th: "สำเร็จสมบูรณ์",
      fa: "کامل",
      ar: "مكتمل",
      es: "Completado",
      zh: "已完成",
      ja: "完了",
    },
    lessonStatusInProgress: {
      en: "In Progress",
      th: "กำลังดำเนินการ",
      fa: "در حال انجام",
      ar: "قيد التنفيذ",
      es: "En progreso",
      zh: "进行中",
      ja: "進行中",
    },
    lessonStatusSkipped: {
      en: "Skipped",
      th: "ข้ามแล้ว",
      fa: "رد شده",
      ar: "تم التخطي",
      es: "Omitido",
      zh: "已跳过",
      ja: "スキップ済み",
    },
    tierIntroductory: {
      en: "Introductory",
      th: "ระดับต้น",
      fa: "مقدماتی",
      ar: "تمهيدي",
      es: "Introducción",
      zh: "入门",
      ja: "初級",
    },
    tierIntermediate: {
      en: "Intermediate",
      th: "ระดับกลาง",
      fa: "متوسط",
      ar: "متوسط",
      es: "Intermedio",
      zh: "中级",
      ja: "中級",
    },
    tierAdvanced: {
      en: "Advanced",
      th: "ระดับสูง",
      fa: "پیشرفته",
      ar: "متقدم",
      es: "Avanzado",
      zh: "高级",
      ja: "上級",
    },
    theme: {
      en: "Theme",
      th: "ธีม",
      fa: "پوسته",
      ar: "السمة",
      es: "Tema",
      zh: "主题",
      ja: "テーマ",
    },
    themeAuto: {
      en: "Auto",
      th: "อัตโนมัติ",
      fa: "خودکار",
      ar: "تلقائي",
      es: "Automático",
      zh: "自动",
      ja: "自動",
    },
    themeLight: {
      en: "Light",
      th: "สว่าง",
      fa: "روشن",
      ar: "فاتح",
      es: "Claro",
      zh: "浅色",
      ja: "ライト",
    },
    themeDark: {
      en: "Dark",
      th: "มืด",
      fa: "تیره",
      ar: "داكن",
      es: "Oscuro",
      zh: "深色",
      ja: "ダーク",
    },
    font: {
      en: "Font",
      th: "แบบอักษร",
      fa: "قلم",
      ar: "الخط",
      es: "Fuente",
      zh: "字体",
      ja: "フォント",
    },
    fontMode: {
      en: "Font mode",
      th: "โหมดแบบอักษร",
      fa: "حالت قلم",
      ar: "وضع الخط",
      es: "Modo de fuente",
      zh: "字体模式",
      ja: "フォントモード",
    },
    fontModern: {
      en: "Modern",
      th: "ทันสมัย",
      fa: "مدرن",
      ar: "حديث",
      es: "Moderna",
      zh: "现代",
      ja: "モダン",
    },
    fontTraditional: {
      en: "Traditional",
      th: "ดั้งเดิม",
      fa: "سنتی",
      ar: "تقليدي",
      es: "Tradicional",
      zh: "传统",
      ja: "トラディショナル",
    },
    flashcards: {
      en: "Flashcards",
      th: "บัตรคำ",
      fa: "فلش‌کارت‌ها",
      ar: "البطاقات",
      es: "Tarjetas",
      zh: "闪卡",
      ja: "フラッシュカード",
    },
    wordFlashcards: {
      en: "Word flashcards",
      th: "บัตรคำศัพท์",
      fa: "فلش‌کارت واژه‌ها",
      ar: "بطاقات الكلمات",
      es: "Tarjetas de palabras",
      zh: "单词闪卡",
      ja: "単語フラッシュカード",
    },
    sentenceFlashcards: {
      en: "Sentence flashcards",
      th: "บัตรประโยค",
      fa: "فلش‌کارت جمله‌ها",
      ar: "بطاقات الجمل",
      es: "Tarjetas de oraciones",
      zh: "句子闪卡",
      ja: "文フラッシュカード",
    },
    quiz: {
      en: "Quiz",
      th: "แบบทดสอบ",
      fa: "آزمون",
      ar: "اختبار",
      es: "Cuestionario",
      zh: "测验",
      ja: "クイズ",
    },
    wordQuiz: {
      en: "Word quiz",
      th: "แบบทดสอบคำศัพท์",
      fa: "آزمون واژه‌ها",
      ar: "اختبار الكلمات",
      es: "Cuestionario de palabras",
      zh: "单词测验",
      ja: "単語クイズ",
    },
    sentenceQuiz: {
      en: "Sentence quiz",
      th: "แบบทดสอบประโยค",
      fa: "آزمون جمله‌ها",
      ar: "اختبار الجمل",
      es: "Cuestionario de oraciones",
      zh: "句子测验",
      ja: "文クイズ",
    },
    buildSentence: {
      en: "Build a sentence",
      th: "แต่งประโยค",
      fa: "جمله بسازید",
      ar: "كوّن جملة",
      es: "Construye una oración",
      zh: "组句",
      ja: "文を作ろう",
    },
    yourSentence: {
      en: "Your sentence",
      th: "ประโยคของคุณ",
      fa: "جمله شما",
      ar: "جملتك",
      es: "Tu oración",
      zh: "你的句子",
      ja: "あなたの文",
    },
    buildPlaceholder: {
      en: "Tap words below to build your sentence",
      th: "แตะคำด้านล่างเพื่อแต่งประโยค",
      fa: "برای ساختن جمله، واژه‌های زیر را لمس کنید",
      ar: "اضغط على الكلمات أدناه لتكوين جملتك",
      es: "Toca las palabras de abajo para construir tu oración",
      zh: "点击下方单词组成你的句子",
      ja: "下の単語をタップして文を作りましょう",
    },
    hint: {
      en: "Hint",
      th: "คำใบ้",
      fa: "راهنمایی",
      ar: "تلميح",
      es: "Pista",
      zh: "提示",
      ja: "ヒント",
    },
    buildCorrect: {
      en: "Correct sentence!",
      th: "ประโยคถูกต้อง!",
      fa: "جمله درست است!",
      ar: "جملة صحيحة!",
      es: "¡Oración correcta!",
      zh: "句子正确！",
      ja: "正しい文です！",
    },
    buildIncorrect: {
      en: "Not quite right — try again.",
      th: "ยังไม่ถูกต้อง — ลองอีกครั้ง",
      fa: "کاملاً درست نیست — دوباره تلاش کنید.",
      ar: "ليست صحيحة تمامًا — حاول مرة أخرى.",
      es: "No es correcta — inténtalo de nuevo.",
      zh: "不太对——再试一次。",
      ja: "まだ正しくありません——もう一度。",
    },
    buildFinished: {
      en: "All sentences completed.",
      th: "ครบทุกประโยคแล้ว",
      fa: "همه جمله‌ها کامل شدند.",
      ar: "اكتملت جميع الجمل.",
      es: "Todas las oraciones completadas.",
      zh: "所有句子已完成。",
      ja: "すべての文が完了しました。",
    },
    buildRestart: {
      en: "Restart exercise",
      th: "เริ่มแบบฝึกหัดใหม่",
      fa: "شروع دوباره تمرین",
      ar: "إعادة بدء التمرين",
      es: "Reiniciar ejercicio",
      zh: "重新开始练习",
      ja: "練習を再開",
    },
    buildNoSentences: {
      en: "No sentences are available for this exercise.",
      th: "ไม่มีประโยคสำหรับแบบฝึกหัดนี้",
      fa: "جمله‌ای برای این تمرین موجود نیست.",
      ar: "لا توجد جمل متاحة لهذا التمرين.",
      es: "No hay oraciones disponibles para este ejercicio.",
      zh: "此练习没有可用的句子。",
      ja: "この練習に使える文がありません。",
    },
    words: {
      en: "Words",
      th: "คำศัพท์",
      fa: "واژه‌ها",
      ar: "الكلمات",
      es: "Palabras",
      zh: "单词",
      ja: "単語",
    },
    sentences: {
      en: "Sentences",
      th: "ประโยค",
      fa: "جمله‌ها",
      ar: "الجمل",
      es: "Oraciones",
      zh: "句子",
      ja: "文",
    },
    phoneticNote: {
      en: "Phonetics",
      th: "เสียงอ่าน",
      fa: "آوانگاری",
      ar: "الصوتيات",
      es: "Fonética",
      zh: "注音",
      ja: "音声表記",
    },
    lessonSettings: {
      en: "Lesson settings",
      th: "การตั้งค่าบทเรียน",
      fa: "تنظیمات درس",
      ar: "إعدادات الدرس",
      es: "Ajustes de la lección",
      zh: "课程设置",
      ja: "レッスン設定",
    },
    exerciseSettings: {
      en: "Exercise settings",
      th: "การตั้งค่าแบบฝึกหัด",
      fa: "تنظیمات تمرین",
      ar: "إعدادات التمرين",
      es: "Ajustes del ejercicio",
      zh: "练习设置",
      ja: "練習設定",
    },
    languages: {
      en: "Languages",
      th: "ภาษา",
      fa: "زبان‌ها",
      ar: "اللغات",
      es: "Idiomas",
      zh: "语言",
      ja: "言語",
    },
    selectTargetLanguage: {
      en: "What do you want to learn?",
      th: "คุณต้องการเรียนภาษาอะไร?",
      fa: "چه زبانی می‌خواهید یاد بگیرید؟",
      ar: "ماذا تريد أن تتعلم؟",
      es: "¿Qué quieres aprender?",
      zh: "你想学什么？",
      ja: "何を学びたいですか？",
    },
    selectTargetLanguageIntro: {
      en: "Select a target language to begin your study plan.",
      th: "เลือกภาษาเป้าหมายเพื่อเริ่มแผนการเรียนของคุณ",
      fa: "یک زبان هدف را برای شروع برنامه مطالعه خود انتخاب کنید.",
      ar: "اختر لغة هدف لبدء خطة دراستك.",
      es: "Selecciona un idioma objetivo para comenzar tu plan de estudio.",
      zh: "选择一门目标语言以开始你的学习计划。",
      ja: "学習プランを開始するには、目標言語を選択してください。",
    },
    repeatCount: {
      en: "Repeat count",
      th: "จำนวนครั้งซ้ำ",
      fa: "تعداد تکرار",
      ar: "عدد التكرار",
      es: "Número de repeticiones",
      zh: "重复次数",
      ja: "繰り返し回数",
    },
    speechSpeed: {
      en: "Speech speed",
      th: "ความเร็วเสียง",
      fa: "سرعت گفتار",
      ar: "سرعة النطق",
      es: "Velocidad de voz",
      zh: "语速",
      ja: "読み上げ速度",
    },
    speedNormal: {
      en: "Normal",
      th: "ปกติ",
      fa: "عادی",
      ar: "عادي",
      es: "Normal",
      zh: "正常",
      ja: "普通",
    },
    speedSlow: {
      en: "Slow",
      th: "ช้า",
      fa: "آهسته",
      ar: "بطيء",
      es: "Lenta",
      zh: "慢速",
      ja: "遅い",
    },
    speedSlower: {
      en: "Slower",
      th: "ช้าลง",
      fa: "آهسته‌تر",
      ar: "أبطأ",
      es: "Más lenta",
      zh: "更慢",
      ja: "さらに遅い",
    },
    voices: {
      en: "Voices",
      th: "เสียง",
      fa: "صداها",
      ar: "الأصوات",
      es: "Voces",
      zh: "语音",
      ja: "音声",
    },
    defaultVoice: {
      en: "Default voice",
      th: "เสียงเริ่มต้น",
      fa: "صدای پیش‌فرض",
      ar: "الصوت الافتراضي",
      es: "Voz predeterminada",
      zh: "默认语音",
      ja: "既定の音声",
    },
    resetVoices: {
      en: "Reset voices",
      th: "รีเซ็ตเสียง",
      fa: "بازنشانی صداها",
      ar: "إعادة تعيين الأصوات",
      es: "Restablecer voces",
      zh: "重置语音",
      ja: "音声をリセット",
    },
    play: {
      en: "Play",
      th: "เล่น",
      fa: "پخش",
      ar: "تشغيل",
      es: "Reproducir",
      zh: "播放",
      ja: "再生",
    },
    pause: {
      en: "Pause",
      th: "หยุดชั่วคราว",
      fa: "توقف موقت",
      ar: "إيقاف مؤقت",
      es: "Pausa",
      zh: "暂停",
      ja: "一時停止",
    },
    stop: {
      en: "Stop",
      th: "หยุด",
      fa: "توقف",
      ar: "إيقاف",
      es: "Detener",
      zh: "停止",
      ja: "停止",
    },
    noPlayableMedia: {
      en: "Nothing is available to play.",
      th: "ไม่มีเนื้อหาให้เล่น",
      fa: "موردی برای پخش وجود ندارد.",
      ar: "لا يوجد محتوى للتشغيل.",
      es: "No hay nada disponible para reproducir.",
      zh: "没有可播放的内容。",
      ja: "再生できる項目がありません。",
    },
    noLanguagesSelected: {
      en: "No languages are selected.",
      th: "ยังไม่ได้เลือกภาษา",
      fa: "هیچ زبانی انتخاب نشده است.",
      ar: "لم يتم اختيار أي لغة.",
      es: "No se han seleccionado idiomas.",
      zh: "未选择任何语言。",
      ja: "言語が選択されていません。",
    },
    noItems: {
      en: "No items.",
      th: "ไม่มีรายการ",
      fa: "موردی وجود ندارد.",
      ar: "لا توجد عناصر.",
      es: "No hay elementos.",
      zh: "没有条目。",
      ja: "項目がありません。",
    },
    selectTwoLanguages: {
      en: "Select at least two languages to use this exercise.",
      th: "เลือกอย่างน้อยสองภาษาเพื่อใช้แบบฝึกหัดนี้",
      fa: "برای استفاده از این تمرین حداقل دو زبان انتخاب کنید.",
      ar: "اختر لغتين على الأقل لاستخدام هذا التمرين.",
      es: "Selecciona al menos dos idiomas para usar este ejercicio.",
      zh: "请至少选择两种语言以使用此练习。",
      ja: "この練習を使うには少なくとも2つの言語を選択してください。",
    },
    promptLanguage: {
      en: "Prompt language",
      th: "ภาษาถาม",
      fa: "زبان پرسش",
      ar: "لغة المطالبة",
      es: "Idioma de pregunta",
      zh: "提示语言",
      ja: "プロンプト言語",
    },
    revealLanguages: {
      en: "Reveal languages",
      th: "ภาษาตอบกลับ",
      fa: "زبان‌های پاسخ",
      ar: "لغات الإجابة",
      es: "Idiomas de respuesta",
      zh: "回答语言",
      ja: "回答言語",
    },
    showAnswer: {
      en: "Show answer",
      th: "แสดงคำตอบ",
      fa: "نمایش پاسخ",
      ar: "عرض الإجابة",
      es: "Mostrar respuesta",
      zh: "显示答案",
      ja: "答えを表示",
    },
    again: {
      en: "Again",
      th: "อีกครั้ง",
      fa: "دوباره",
      ar: "مرة أخرى",
      es: "Otra vez",
      zh: "重来",
      ja: "もう一度",
    },
    hard: {
      en: "Hard",
      th: "ยาก",
      fa: "سخت",
      ar: "صعب",
      es: "Difícil",
      zh: "困难",
      ja: "難しい",
    },
    good: {
      en: "Good",
      th: "ดี",
      fa: "خوب",
      ar: "جيد",
      es: "Bien",
      zh: "良好",
      ja: "普通",
    },
    easy: {
      en: "Easy",
      th: "ง่าย",
      fa: "آسان",
      ar: "سهل",
      es: "Fácil",
      zh: "简单",
      ja: "簡単",
    },
    noPromptText: {
      en: "No items have text in the prompt language.",
      th: "ไม่มีรายการใดมีข้อความในภาษาถาม",
      fa: "هیچ موردی متن زبان پرسش ندارد.",
      ar: "لا توجد عناصر تحتوي على نص لغة المطالبة.",
      es: "Ningún elemento tiene texto en el idioma de pregunta.",
      zh: "没有条目包含提示语言的文本。",
      ja: "プロンプト言語にテキストがある項目がありません。",
    },
    noRevealText: {
      en: "No items have text in the selected reveal languages.",
      th: "ไม่มีรายการใดมีข้อความในภาษาตอบกลับที่เลือก",
      fa: "هیچ موردی متن زبان‌های پاسخ انتخاب‌شده ندارد.",
      ar: "لا توجد عناصر تحتوي على نص في لغات الإجابة المحددة.",
      es: "Ningún elemento tiene texto en los idiomas de respuesta seleccionados.",
      zh: "没有条目包含所选回答语言的文本。",
      ja: "選択された回答言語にテキストがある項目がありません。",
    },
    selectRevealLanguage: {
      en: "Select at least one reveal language different from the prompt language.",
      th: "เลือกภาษาตอบกลับอย่างน้อยหนึ่งภาษาที่ไม่ซ้ำกับภาษาถาม",
      fa: "حداقل یک زبان پاسخ متفاوت از زبان پرسش انتخاب کنید.",
      ar: "اختر لغة إجابة واحدة على الأقل مختلفة عن لغة المطالبة.",
      es: "Selecciona al menos un idioma de respuesta diferente del idioma de pregunta.",
      zh: "请至少选择一个与提示语言不同的回答语言。",
      ja: "プロンプト言語と異なる回答言語を少なくとも1つ選択してください。",
    },
    noDueCards: {
      en: "No flashcards are due for this language configuration.",
      th: "ไม่มีบัตรคำที่ครบกำหนดสำหรับการตั้งค่าภาษาครั้งนี้",
      fa: "هیچ فلش‌کارتی برای این پیکربندی زبان سررسید نشده است.",
      ar: "لا توجد بطاقات مستحقة لهذا الإعداد اللغوي.",
      es: "No hay tarjetas vencidas para esta configuración de idioma.",
      zh: "此语言配置下没有到期的闪卡。",
      ja: "この言語設定で期限が来たフラッシュカードはありません。",
    },
    questionLanguage: {
      en: "Question language",
      th: "ภาษาถาม",
      fa: "زبان پرسش",
      ar: "لغة السؤال",
      es: "Idioma de pregunta",
      zh: "问题语言",
      ja: "質問言語",
    },
    answerLanguage: {
      en: "Answer language",
      th: "ภาษาตอบกลับ",
      fa: "زبان پاسخ",
      ar: "لغة الإجابة",
      es: "Idioma de respuesta",
      zh: "答案语言",
      ja: "回答言語",
    },
    selectAnswer: {
      en: "Select answer",
      th: "เลือกคำตอบ",
      fa: "پاسخ را انتخاب کنید",
      ar: "اختر الإجابة",
      es: "Selecciona la respuesta",
      zh: "选择答案",
      ja: "答えを選択",
    },
    quizCorrect: {
      en: "Correct",
      th: "ถูกต้อง",
      fa: "درست",
      ar: "صحيح",
      es: "Correcto",
      zh: "正确",
      ja: "正解",
    },
    quizIncorrect: {
      en: "Incorrect",
      th: "ไม่ถูกต้อง",
      fa: "نادرست",
      ar: "غير صحيح",
      es: "Incorrecto",
      zh: "错误",
      ja: "不正解",
    },
    quizNext: {
      en: "Next",
      th: "ถัดไป",
      fa: "بعدی",
      ar: "التالي",
      es: "Siguiente",
      zh: "下一个",
      ja: "次へ",
    },
    quizFinished: {
      en: "Quiz finished.",
      th: "แบบทดสอบเสร็จสิ้น",
      fa: "آزمون تمام شد.",
      ar: "اكتمل الاختبار.",
      es: "Cuestionario terminado.",
      zh: "测验完成。",
      ja: "クイズが終了しました。",
    },
    quizScore: {
      en: "Score",
      th: "คะแนน",
      fa: "امتیاز",
      ar: "النتيجة",
      es: "Puntuación",
      zh: "得分",
      ja: "スコア",
    },
    examples: {
      en: "Examples",
      th: "ตัวอย่าง",
      fa: "مثال‌ها",
      ar: "أمثلة",
      es: "Ejemplos",
      zh: "示例",
      ja: "例",
    },
    quizRestart: {
      en: "Restart quiz",
      th: "เริ่มแบบทดสอบใหม่",
      fa: "شروع دوباره آزمون",
      ar: "إعادة بدء الاختبار",
      es: "Reiniciar cuestionario",
      zh: "重新开始测验",
      ja: "クイズを再開",
    },
    quizRetry: {
      en: "Retry quiz",
      th: "ลองทำแบบทดสอบใหม่",
      fa: "تلاش دوباره آزمون",
      ar: "إعادة المحاولة",
      es: "Reintentar cuestionario",
      zh: "重试测验",
      ja: "クイズを再挑戦",
    },
    quizSelectAnswerLanguage: {
      en: "Select an answer language different from the question language.",
      th: "เลือกภาษาตอบกลับที่ไม่ซ้ำกับภาษาถาม",
      fa: "یک زبان پاسخ متفاوت از زبان پرسش انتخاب کنید.",
      ar: "اختر لغة إجابة مختلفة عن لغة السؤال.",
      es: "Selecciona un idioma de respuesta diferente del idioma de pregunta.",
      zh: "请选择与问题语言不同的答案语言。",
      ja: "質問言語と異なる回答言語を選択してください。",
    },
    quizNotEnoughOptions: {
      en: "Not enough items have text in the selected answer language.",
      th: "มีรายการที่มีข้อความในภาษาตอบกลับที่เลือกไม่เพียงพอ",
      fa: "موارد کافی با متن در زبان پاسخ انتخاب‌شده وجود ندارد.",
      ar: "لا توجد عناصر كافية تحتوي على نص بلغة الإجابة المحددة.",
      es: "No hay suficientes elementos con texto en el idioma de respuesta seleccionado.",
      zh: "所选答案语言中没有足够包含文本的条目。",
      ja: "選択した回答言語にテキストがある項目が十分ではありません。",
    },
    quizNoQuestions: {
      en: "No questions are available for this language pair.",
      th: "ไม่มีคำถามสำหรับคู่ภาษานี้",
      fa: "هیچ پرسشی برای این جفت زبان موجود نیست.",
      ar: "لا توجد أسئلة متاحة لهذا الزوج اللغوي.",
      es: "No hay preguntas disponibles para este par de idiomas.",
      zh: "此语言对没有可用问题。",
      ja: "この言語ペアには質問がありません。",
    },
    primaryLanguage: {
      en: "Primary language",
      th: "ภาษาหลัก",
      fa: "زبان اصلی",
      ar: "اللغة الأساسية",
      es: "Idioma principal",
      zh: "主要语言",
      ja: "主要言語",
    },
    secondaryLanguage: {
      en: "Secondary language",
      th: "ภาษารอง",
      fa: "زبان ثانویه",
      ar: "اللغة الثانوية",
      es: "Idioma secundario",
      zh: "次要语言",
      ja: "補助言語",
    },
    none: {
      en: "None",
      th: "ไม่มี",
      fa: "هیچ‌کدام",
      ar: "لا شيء",
      es: "Ninguno",
      zh: "无",
      ja: "なし",
    },
    open: {
      en: "Open",
      th: "เปิด",
      fa: "باز کردن",
      ar: "فتح",
      es: "Abrir",
      zh: "打开",
      ja: "開く",
    },
    noProgress: {
      en: "No progress yet.",
      th: "ยังไม่มีความคืบหน้า",
      fa: "هنوز پیشرفتی وجود ندارد.",
      ar: "لا يوجد تقدم بعد.",
      es: "Aún no hay progreso.",
      zh: "尚无进度。",
      ja: "まだ進捗がありません。",
    },
    resetProgress: {
      en: "Reset all progress",
      th: "รีเซ็ตความคืบหน้าทั้งหมด",
      fa: "بازنشانی همه پیشرفت",
      ar: "إعادة تعيين كل التقدم",
      es: "Restablecer todo el progreso",
      zh: "重置所有进度",
      ja: "すべての進捗をリセット",
    },
    resetFlashcardsConfirm: {
      en: "Reset flashcard progress? All flashcard schedules will be erased.",
      th: "รีเซ็ตความคืบหน้าบัตรคำหรือไม่? กำหนดการบัตรคำทั้งหมดจะถูกลบออก",
      fa: "پیشرفت فلش‌کارت‌ها بازنشانی شود؟ همه زمان‌بندی کارت‌ها حذف خواهد شد.",
      ar: "هل تريد إعادة تعيين تقدم البطاقات؟ سيُمحى كل جدولات البطاقات.",
      es: "¿Restablecer el progreso de tarjetas? Se borrarán todas las programaciones.",
      zh: "重置闪卡进度？所有卡片的学习安排都将被清除。",
      ja: "フラッシュカードの進捗をリセットしますか？すべてのスケジュールが削除されます。",
    },
    resetQuizConfirm: {
      en: "Reset quiz progress? All quiz history will be erased.",
      th: "รีเซ็ตความคืบหน้าแบบทดสอบหรือไม่? ประวัติแบบทดสอบทั้งหมดจะถูกลบออก",
      fa: "پیشرفت آزمون بازنشانی شود؟ همه تاریخچه آزمون‌ها حذف خواهد شد.",
      ar: "هل تريد إعادة تعيين تقدم الاختبارات؟ سيُمحى كل سجل الاختبارات.",
      es: "¿Restablecer el progreso de cuestionarios? Se borrará todo el historial.",
      zh: "重置测验进度？所有测验记录都将被清除。",
      ja: "クイズの進捗をリセットしますか？すべての履歴が削除されます。",
    },
    resetProgressConfirm: {
      en: "Reset all progress? Flashcards, quiz history and lessons tried will be erased.",
      th: "รีเซ็ตความคืบหน้าทั้งหมดหรือไม่? บัตรคำ แบบทดสอบ และบทเรียนที่ลองแล้วจะถูกลบออก",
      fa: "همه پیشرفت بازنشانی شود؟ فلش‌کارت‌ها، تاریخچه آزمون و درس‌های امتحان‌شده حذف خواهد شد.",
      ar: "هل تريد إعادة تعيين كل التقدم؟ سيُمحى تقدم البطاقات والاختبارات والدروس المُجرَّبة.",
      es: "¿Restablecer todo el progreso? Se borrarán tarjetas, historial de cuestionarios y lecciones probadas.",
      zh: "重置所有进度？闪卡、测验记录和已尝试的课程都将被清除。",
      ja: "すべての進捗をリセットしますか？フラッシュカード、クイズ履歴、試したレッスンが削除されます。",
    },
    lessonLoadError: {
      en: "This lesson could not be loaded. Please try again.",
      th: "ไม่สามารถโหลดบทเรียนนี้ได้ กรุณาลองอีกครั้ง",
      fa: "این درس بارگیری نشد. لطفاً دوباره تلاش کنید.",
      ar: "تعذّر تحميل هذا الدرس. يرجى المحاولة مرة أخرى.",
      es: "No se pudo cargar esta lección. Inténtalo de nuevo.",
      zh: "无法加载此课程。请重试。",
      ja: "このレッスンを読み込めませんでした。もう一度お試しください。",
    },
    tryAgain: {
      en: "Try again",
      th: "ลองอีกครั้ง",
      fa: "تلاش دوباره",
      ar: "إعادة المحاولة",
      es: "Reintentar",
      zh: "重试",
      ja: "再試行",
    },
    resetFlashcards: {
      en: "Reset flashcard progress",
      th: "รีเซ็ตความคืบหน้าบัตรคำ",
      fa: "بازنشانی پیشرفت فلش‌کارت‌ها",
      ar: "إعادة تعيين تقدم البطاقات",
      es: "Restablecer progreso de tarjetas",
      zh: "重置闪卡进度",
      ja: "フラッシュカードの進捗をリセット",
    },
    resetQuiz: {
      en: "Reset quiz progress",
      th: "รีเซ็ตความคืบหน้าแบบทดสอบ",
      fa: "بازنشانی پیشرفت آزمون",
      ar: "إعادة تعيين تقدم الاختبار",
      es: "Restablecer progreso de cuestionario",
      zh: "重置测验进度",
      ja: "クイズの進捗をリセット",
    },
    back: {
      en: "Back",
      th: "กลับ",
      fa: "بازگشت",
      ar: "رجوع",
      es: "Volver",
      zh: "返回",
      ja: "戻る",
    },
    testVoices: {
      en: "Test voices",
      th: "ทดสอบเสียง",
      fa: "آزمایش صداها",
      ar: "اختبار الأصوات",
      es: "Probar voces",
      zh: "测试语音",
      ja: "音声をテスト",
    },
    voiceAvailableStatus: {
      en: "Available",
      th: "พร้อมใช้งาน",
      fa: "در دسترس",
      ar: "متوفر",
      es: "Disponible",
      zh: "可用",
      ja: "利用可能",
    },
    voiceMissingStatus: {
      en: "No voice",
      th: "ไม่มีเสียง",
      fa: "بدون صدا",
      ar: "لا يوجد صوت",
      es: "Sin voz",
      zh: "无语音",
      ja: "音声なし",
    },
    playVoiceTest: {
      en: "Play test messages",
      th: "เล่นข้อความทดสอบ",
      fa: "پخش پیام‌های آزمایشی",
      ar: "تشغيل رسائل الاختبار",
      es: "Reproducir mensajes de prueba",
      zh: "播放测试消息",
      ja: "テストメッセージを再生",
    },
    voiceInstallTitle: {
      en: "Install missing voices",
      th: "ติดตั้งเสียงที่ขาดไป",
      fa: "نصب صداها",
      ar: "تثبيت الأصوات المفقودة",
      es: "Instalar las voces que faltan",
      zh: "安装缺失的语音",
      ja: "不足している音声をインストール",
    },
    voiceInstallIntro: {
      en: "Follow the steps for your device to install the missing voices:",
      th: "ทำตามขั้นตอนสำหรับอุปกรณ์ของคุณเพื่อติดตั้งเสียงที่ขาดไป:",
      fa: "برای نصب صداهای موردياز، مراحل مربوط به دستگاه خود را دنبال کنید:",
      ar: "اتبع الخطوات الخاصة بجهازك لتثبيت الأصوات المفقودة:",
      es: "Sigue los pasos para tu dispositivo para instalar las voces que faltan:",
      zh: "请按照你的设备步骤安装缺失的语音：",
      ja: "お使いのデバイスの手順に従って、不足している音声をインストールしてください：",
    },
    device: {
      en: "Device",
      th: "อุปกรณ์",
      fa: "دستگاه",
      ar: "الجهاز",
      es: "Dispositivo",
      zh: "设备",
      ja: "デバイス",
    },
  });

  const VOICE_TEST_MESSAGES = Object.freeze({
    en: "{language} is available",
    th: "{language} พร้อมใช้งาน",
    fa: "{language} در دسترس است",
    ar: "{language} متوفرة",
    es: "{language} está disponible",
    zh: "{language}可用",
    ja: "{language}は利用可能です",
  });

  const VOICE_OS_LABELS = Object.freeze([
    ["android", "Android"],
    ["ios", "iOS (iPhone/iPad)"],
    ["macos", "macOS"],
    ["windows", "Windows"],
    ["linux", "Linux"],
  ]);

  const VOICE_OS_INSTRUCTIONS = Object.freeze({
    android: {
      steps: [
        {
          en: "Open the Settings app.",
          th: "เปิดแอปการตั้งค่า",
          fa: "برنامه تنظیمات را باز کنید.",
          ar: "افتح تطبيق الإعدادات.",
          es: "Abre la aplicación Ajustes.",
          zh: "打开“设置”应用。",
          ja: "設定アプリを開きます。",
        },
        {
          en: "Search for “Text-to-speech” and open Text-to-speech output.",
          th: "ค้นหา “การอ่านออกเสียงข้อความ” แล้วเปิด",
          fa: "عبارت «Text-to-speech» را جستجو کنید و «خروجی نوشتار به گفتار» را باز کنید.",
          ar: "ابحث عن “تحويل النص إلى كلام” وافتحه.",
          es: "Busca “Salida de voz” y ábrela.",
          zh: "搜索“文字转语音”并打开该设置。",
          ja: "「テキスト読み上げ」を検索して開きます。",
        },
        {
          en: "In your TTS engine settings (for example Google Speech Services), open “Install voice data” and download the language.",
          th: "ในการตั้งค่าเครื่องมือ TTS (เช่น บริการเสียงพูดของ Google) ให้เปิด “ติดตั้งข้อมูลเสียง” แล้วดาวน์โหลดภาษาที่ต้องการ",
          fa: "در تنظیمات موتور TTS (مثلاً خدمات گفتار گوگل) گزینه «نصب داده صوتی» را باز کنید و زبان موردنظر را دانلود کنید.",
          ar: "في إعدادات محرك TTS (مثل خدمات كلام Google)، افتح “تثبيت بيانات الصوت” وحمّل اللغة.",
          es: "En los ajustes del motor TTS (p. ej., Servicios de voz de Google), abre “Instalar datos de voz” y descarga el idioma.",
          zh: "在 TTS 引擎设置中（例如 Google 语音服务），打开“安装语音数据”并下载所需语言。",
          ja: "TTSエンジン（例：Google音声サービス）の設定で「音声データのインストール」を開き、必要な言語をダウンロードします。",
        },
      ],
    },
    ios: {
      steps: [
        {
          en: "Open the Settings app.",
          th: "เปิดแอปการตั้งค่า",
          fa: "برنامه تنظیمات را باز کنید.",
          ar: "افتح تطبيق الإعدادات.",
          es: "Abre la aplicación Ajustes.",
          zh: "打开“设置”应用。",
          ja: "設定アプリを開きます。",
        },
        {
          en: "Go to Accessibility → Spoken Content.",
          th: "ไปที่ การช่วยการเข้าถึง → เนื้อหาที่อ่านออกเสียง",
          fa: "به دسترسی‌پذیری → محتوای گفتاری بروید.",
          ar: "انتقل إلى إمكانية الوصول → المحتوى المقروء.",
          es: "Ve a Accesibilidad → Contenido leído.",
          zh: "前往“辅助功能”→“朗读内容”。",
          ja: "「アクセシビリティ」→「読み上げコンテンツ」を開きます。",
        },
        {
          en: "Tap Voices, choose the language and download a voice.",
          th: "แตะ เสียง แล้วเลือกภาษาและดาวน์โหลดเสียง",
          fa: "روی صداها بزنید، زبان را انتخاب کنید و یک صدا را دانلود کنید.",
          ar: "اضغط على الأصوات واختر اللغة وحمّل صوتًا.",
          es: "Toca Voces, elige el idioma y descarga una voz.",
          zh: "点按“语音”，选择语言并下载语音。",
          ja: "「声」をタップし、言語を選んで音声をダウンロードします。",
        },
      ],
    },
    macos: {
      steps: [
        {
          en: "Open System Settings.",
          th: "เปิดการตั้งค่าระบบ",
          fa: "تنظیمات سیستم را باز کنید.",
          ar: "افتح إعدادات النظام.",
          es: "Abre Ajustes del Sistema.",
          zh: "打开“系统设置”。",
          ja: "システム設定を開きます。",
        },
        {
          en: "Go to Accessibility → Spoken Content.",
          th: "ไปที่ การช่วยการเข้าถึง → เนื้อหาที่อ่านออกเสียง",
          fa: "به دسترسی‌پذیری → محتوای گفتاری بروید.",
          ar: "انتقل إلى إمكانية الوصول → المحتوى المقروء.",
          es: "Ve a Accesibilidad → Contenido leído.",
          zh: "前往“辅助功能”→“朗读内容”。",
          ja: "「アクセシビリティ」→「読み上げコンテンツ」を開きます。",
        },
        {
          en: "Open the Voice menu, choose the language, and pick a voice marked “Download” to install it.",
          th: "เปิดเมนูเสียง เลือกภาษา แล้วเลือกเสียงที่ระบุว่า “ดาวน์โหลด” เพื่อติดตั้ง",
          fa: "منوی صدا را باز کنید، زبان را انتخاب کنید و صدایی با برچسب «دانلود» را برای نصب انتخاب کنید.",
          ar: "افتح قائمة الصوت واختر اللغة ثم اختر صوتًا عليه علامة “تنزيل” لتثبيته.",
          es: "Abre el menú Voz, elige el idioma y selecciona una voz marcada como “Descargar” para instalarla.",
          zh: "打开“语音”菜单，选择语言，并选择标有“下载”的语音进行安装。",
          ja: "「声」メニューを開き、言語を選び、「ダウンロード」と表示された音声を選択してインストールします。",
        },
      ],
    },
    windows: {
      steps: [
        {
          en: "Open Settings.",
          th: "เปิดการตั้งค่า",
          fa: "تنظیمات را باز کنید.",
          ar: "افتح الإعدادات.",
          es: "Abre Configuración.",
          zh: "打开“设置”。",
          ja: "設定を開きます。",
        },
        {
          en: "Go to Time & language → Speech.",
          th: "ไปที่ เวลาและภาษา → เสียงพูด",
          fa: "به زمان و زبان → گفتار بروید.",
          ar: "انتقل إلى الوقت واللغة → الكلام.",
          es: "Ve a Hora e idioma → Voz.",
          zh: "前往“时间和语言”→“语音”。",
          ja: "「時刻と言語」→「音声」を開きます。",
        },
        {
          en: "Under Manage voices / Add voices, add the language to download its voice.",
          th: "ใต้ จัดการเสียง / เพิ่มเสียง ให้เพิ่มภาษาเพื่อดาวน์โหลดเสียง",
          fa: "در بخش مدیریت صداها / افزودن صداها، زبان موردنظر را اضافه کنید تا صدای آن دانلود شود.",
          ar: "ضمن إدارة الأصوات / إضافة الأصوات، أضف اللغة لتنزيل صوتها.",
          es: "En Administrar voces / Agregar voces, agrega el idioma para descargar su voz.",
          zh: "在“管理语音 / 添加语音”下，添加语言以下载其语音。",
          ja: "「音声の管理 / 音声の追加」で言語を追加し、その音声をダウンロードします。",
        },
      ],
    },
    linux: {
      steps: [
        {
          en: "Open your software manager or terminal.",
          th: "เปิดตัวจัดการซอฟต์แวร์หรือเทอร์มินัล",
          fa: "مدیر نرم‌افزار یا پایانه را باز کنید.",
          ar: "افتح مدير البرامج أو الطرفية.",
          es: "Abre el gestor de software o la terminal.",
          zh: "打开软件管理器或终端。",
          ja: "ソフトウェアマネージャーまたはターミナルを開きます。",
        },
        {
          en: "Install a speech engine with voices for your language (for example espeak-ng).",
          th: "ติดตั้งเครื่องมืออ่านออกเสียงที่มีเสียงสำหรับภาษาของคุณ (เช่น espeak-ng)",
          fa: "یک موتور گفتار همراه با صداهای زبان موردنظر نصب کنید (مثلاً espeak-ng).",
          ar: "ثبّت محرك كلام يحتوي على أصوات للّغة المطلوبة (مثل espeak-ng).",
          es: "Instala un motor de voz con voces para tu idioma (por ejemplo, espeak-ng).",
          zh: "为你的语言安装带语音的语音引擎（例如 espeak-ng）。",
          ja: "対象の言語の音声を含む音声エンジン（例：espeak-ng）をインストールします。",
        },
        {
          en: "Restart the browser so it can use the new speech service.",
          th: "รีสตาร์ทเบราว์เซอร์เพื่อให้ใช้บริการเสียงใหม่ได้",
          fa: "مرورگر را دوباره راه‌اندازی کنید تا از سرویس گفتار جدید استفاده کند.",
          ar: "أعد تشغيل المتصفح ليتمكن من استخدام خدمة الكلام الجديدة.",
          es: "Reinicia el navegador para que pueda usar el nuevo servicio de voz.",
          zh: "重新启动浏览器以使用新的语音服务。",
          ja: "新しい音声サービスを利用できるようにブラウザーを再起動します。",
        },
      ],
    },
  });

  const HELP_SECTIONS = Object.freeze([
    {
      key: "help:first-visit",
      title: {
        en: "Your first visit",
        th: "การเริ่มต้นใช้งานครั้งแรก",
        fa: "نخستین بازدید",
        ar: "زيارتك الأولى",
        es: "Tu primera visita",
        zh: "初次使用",
        ja: "初めての方へ",
      },
      items: [
        {
          en: "Open Zabon and land on Home — no setup needed.",
          th: "เปิด Zabon ขึ้นมาก็เริ่มได้เลย ไม่ต้องตั้งค่า",
          fa: "زبون را باز کنید و وارد صفحه اصلی شوید — نیازی به تنظیم نیست.",
          ar: "افتح زبون وستصل إلى الرئيسية — دون أي إعداد.",
          es: "Abre Zabon y llegarás a Inicio: no se necesita configuración.",
          zh: "打开 Zabon 即进入首页——无需设置。",
          ja: "Zabonを開くとホーム画面からすぐ始められます。設定は不要です。",
        },
        {
          en: "Next Up suggests what to study. Tap Open or Skip.",
          th: "ถัดไป แนะนำบทเรียน แตะ เปิด หรือ ข้าม",
          fa: "«بعدی» پیشنهاد می‌دهد چه بخوانید. روی باز کردن یا رد کردن بزنید.",
          ar: "يقترح «التالي» ما تدرسه. اضغط فتح أو تخطي.",
          es: "«Siguiente» sugiere qué estudiar. Toca Abrir u Omitir.",
          zh: "“下一个”推荐学习内容。点按“打开”或“跳过”。",
          ja: "「次へ」が学習内容を提案します。「開く」か「スキップ」をタップ。",
        },
        {
          en: "Browse by Level: 🌱 Introductory, 🌿 Intermediate, 🌳 Advanced.",
          th: "เรียกดูตามระดับ: 🌱 ระดับต้น 🌿 ระดับกลาง 🌳 ระดับสูง",
          fa: "مرور بر اساس سطح: 🌱 مقدماتی، 🌿 متوسط، 🌳 پیشرفته.",
          ar: "تصفح حسب المستوى: 🌱 تمهيدي، 🌿 متوسط، 🌳 متقدم.",
          es: "Explora por nivel: 🌱 Introducción, 🌿 Intermedio, 🌳 Avanzado.",
          zh: "按级别浏览：🌱 入门、🌿 中级、🌳 高级。",
          ja: "レベル別に閲覧：🌱 初級、🌿 中級、🌳 上級。",
        },
      ],
    },
    {
      key: "help:cycle",
      title: {
        en: "The learning cycle",
        th: "วงจรการเรียนรู้",
        fa: "چرخه یادگیری",
        ar: "دورة التعلم",
        es: "El ciclo de aprendizaje",
        zh: "学习循环",
        ja: "学習サイクル",
      },
      items: [
        {
          en: "Open a lesson — read and tap ▶ to listen.",
          th: "เปิดบทเรียน อ่านแล้วแตะ ▶ เพื่อฟัง",
          fa: "درس را باز کنید — بخوانید و برای شنیدن ▶ را بزنید.",
          ar: "افتح الدرس — اقرأ واضغط ▶ للاستماع.",
          es: "Abre una lección: lee y toca ▶ para escuchar.",
          zh: "打开课程——阅读并点按 ▶ 收听。",
          ja: "レッスンを開き、読んで ▶ をタップして聞きます。",
        },
        {
          en: "Practice: 🃏 flashcards · ❓ quiz · 🧩 build a sentence.",
          th: "ฝึกฝน: 🃏 บัตรคำ ❓ แบบทดสอบ 🧩 แต่งประโยค",
          fa: "تمرین کنید: 🃏 فلش‌کارت · ❓ آزمون · 🧩 جمله بسازید.",
          ar: "تدرب: 🃏 بطاقات · ❓ اختبار · 🧩 كوّن جملة.",
          es: "Practica: 🃏 tarjetas · ❓ cuestionario · 🧩 construye una oración.",
          zh: "练习：🃏 闪卡 · ❓ 测验 · 🧩 组句。",
          ja: "練習：🃏 フラッシュカード · ❓ クイズ · 🧩 文を作ろう。",
        },
        {
          en: "Check Complete? ✅ in the bottom bar.",
          th: "ทำเครื่องหมาย เสร็จแล้ว? ✅ ที่แถบด้านล่าง",
          fa: "در نوار پایین، «کامل شد؟» ✅ را علامت بزنید.",
          ar: "ضع علامة مكتمل؟ ✅ في الشريط السفلي.",
          es: "Marca ¿Completado? ✅ en la barra inferior.",
          zh: "在底栏勾选“已完成？” ✅。",
          ja: "下部バーの「完了？」✅ をチェック。",
        },
        {
          en: "Follow Next Up → repeat.",
          th: "ทำตาม ถัดไป แล้วทำซ้ำ",
          fa: "از «بعدی» پیروی کنید → تکرار.",
          ar: "اتبع «التالي» ← وكرر.",
          es: "Sigue «Siguiente» → repite.",
          zh: "跟随“下一个”→ 重复。",
          ja: "「次へ」に従って → 繰り返します。",
        },
      ],
    },
    {
      key: "help:plan",
      title: {
        en: "Study plan (optional)",
        th: "แผนการเรียน (ไม่บังคับ)",
        fa: "برنامه مطالعه (اختیاری)",
        ar: "خطة الدراسة (اختياري)",
        es: "Plan de estudio (opcional)",
        zh: "学习计划（可选）",
        ja: "学習プラン（任意）",
      },
      items: [
        {
          en: "Menu → Study Plan & Progress → Create Study Plan.",
          th: "เมนู → แผนการเรียนและความคืบหน้า → สร้างแผนการเรียน",
          fa: "منو → برنامه مطالعه و پیشرفت → ساخت برنامه مطالعه.",
          ar: "القائمة ← خطة الدراسة والتقدم ← إنشاء خطة دراسة.",
          es: "Menú → Plan de estudio y progreso → Crear plan de estudio.",
          zh: "菜单 → 学习计划与进度 → 创建学习计划。",
          ja: "メニュー → 学習プランと進捗 → 学習プランを作成。",
        },
        {
          en: "Answer goal & level questions to generate a plan.",
          th: "ตอบคำถามเป้าหมายและระดับเพื่อสร้างแผน",
          fa: "برای ساخت برنامه، به پرسش‌های هدف و سطح پاسخ دهید.",
          ar: "أجب عن أسئلة الهدف والمستوى لإنشاء الخطة.",
          es: "Responde las preguntas de objetivo y nivel para generar un plan.",
          zh: "回答目标与水平问题以生成计划。",
          ja: "目標とレベルの質問に答えるとプランが作成されます。",
        },
        {
          en: "Edit or delete anytime from Progress.",
          th: "แก้ไขหรือลบได้ทุกเมื่อจากหน้าความคืบหน้า",
          fa: "هر زمان از صفحه پیشرفت، ویرایش یا حذف کنید.",
          ar: "يمكنك التعديل أو الحذف في أي وقت من التقدم.",
          es: "Edita o elimina en cualquier momento desde Progreso.",
          zh: "可随时在进度页面编辑或删除。",
          ja: "進捗画面からいつでも編集・削除できます。",
        },
      ],
    },
    {
      key: "help:comfort",
      title: {
        en: "Make yourself comfortable",
        th: "ปรับให้เหมาะกับคุณ",
        fa: "راحت باشید",
        ar: "اجعل التطبيق مريحًا لك",
        es: "Ponte cómodo",
        zh: "个性化设置",
        ja: "快適に使おう",
      },
      items: [
        {
          en: "🌗 Theme · 🔤 Font · 🌐 App language in the menu.",
          th: "🌗 ธีม 🔤 แบบอักษร 🌐 ภาษาของแอป อยู่ในเมนู",
          fa: "🌗 پوسته · 🔤 قلم · 🌐 زبان برنامه در منو.",
          ar: "🌗 السمة · 🔤 الخط · 🌐 لغة التطبيق في القائمة.",
          es: "🌗 Tema · 🔤 Fuente · 🌐 Idioma de la app en el menú.",
          zh: "菜单中可设置 🌗 主题 · 🔤 字体 · 🌐 应用语言。",
          ja: "メニューに 🌗 テーマ · 🔤 フォント · 🌐 アプリ言語があります。",
        },
        {
          en: "⚙ Lesson settings: languages, speed, voices.",
          th: "⚙ การตั้งค่าบทเรียน: ภาษา ความเร็ว เสียง",
          fa: "⚙ تنظیمات درس: زبان‌ها، سرعت، صداها.",
          ar: "⚙ إعدادات الدرس: اللغات والسرعة والأصوات.",
          es: "⚙ Ajustes de la lección: idiomas, velocidad, voces.",
          zh: "⚙ 课程设置：语言、语速、语音。",
          ja: "⚙ レッスン設定：言語、速度、音声。",
        },
        {
          en: "🔊 Test voices if speech is silent.",
          th: "🔊 ทดสอบเสียงหากไม่ได้ยินเสียงพูด",
          fa: "🔊 اگر صدا پخش نمی‌شود، صداها را آزمایش کنید.",
          ar: "🔊 اختبر الأصوات إذا كان النطق صامتًا.",
          es: "🔊 Prueba las voces si no se oye nada.",
          zh: "🔊 如果没有声音，请测试语音。",
          ja: "🔊 音が出ないときは音声をテストしてください。",
        },
      ],
    },
  ]);

  let manifest = null;
  let registry = null;
  let dataService = null;
  let mediaService = null;
  let srsService = null;
  let flashcardService = null;
  let quizService = null;
  let quizProgressService = null;
  let studyPlanService = null;
  let state = null;
  let currentLesson = null;
  let availableVoices = [];
  let openCategories = new Set();
  let openProgressSections = new Set([
    "progress:lessons-tried",
    "progress:study-plan",
  ]);
  let openLessonSections = new Set();
  let openHelpSections = new Set(["help:first-visit"]);
  let flashcardSession = null;
  let quizSession = null;
  let nextUpPreviewId = null;
  let quizSessionSeed = "quiz:default";
  let flashcardConfig = { promptLanguage: "", revealLanguages: [] };
  let flashcardKind = "word";
  let quizConfig = { questionLanguage: "", answerLanguage: "" };
  let quizKind = "word";
  let buildConfig = null;
  let buildSession = null;
  let buildCurrent = null;
  let exerciseSettingsOpen = false;
  let lessonsTried = new Set();
  let playbackSessionCounter = 0;
  let playbackState = {
    status: "idle",
    units: [],
    index: 0,
    repeat: 0,
    session: 0,
    utterance: null,
    timerId: null,
    highlightTimerId: null,
  };
  let programmaticScrollUntil = 0;
  let exerciseHighlightTimerId = null;
  let exerciseUtterance = null;
  let voiceTestOs = "";
  let voiceTestReturn = "back-home";
  let voiceTestPlaying = false;
  let voiceTestQueue = [];
  let voiceTestTimer = null;
  let voiceTestUtterance = null;

  const elements = {};

  function loadJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }
  function saveJSON(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }
  function cssEscape(value) {
    const raw = String(value ?? "");
    if (window.CSS && typeof window.CSS.escape === "function")
      return window.CSS.escape(raw);
    return raw.replace(/[^a-zA-Z0-9_-]/g, (ch) => `\\${ch}`);
  }
  function normalizeRepeatCount(value) {
    const parsed = Number.parseInt(value, 10);
    if (!Number.isFinite(parsed)) return 1;
    return Math.max(1, parsed);
  }
  function truncateLabel(text, max = 28) {
    const str = String(text ?? "");
    if (str.length <= max) return str;
    return `${str.slice(0, max - 1).trimEnd()}\u2026`;
  }
  function createRegistry(languages) {
    const all = Array.isArray(languages)
      ? languages.filter((l) => l && typeof l.code === "string")
      : [];
    const byCode = new Map(all.map((l) => [l.code, l]));
    return {
      all,
      byCode,
      getLanguage(code) {
        return byCode.get(code) || null;
      },
      has(code) {
        return byCode.has(code);
      },
      allCodes() {
        return all.map((l) => l.code);
      },
      dir(code) {
        return byCode.get(code)?.dir || "ltr";
      },
      bcp47(code) {
        return byCode.get(code)?.bcp47 || code;
      },
      segmentation(code) {
        return byCode.get(code)?.segmentation || "none";
      },
    };
  }
  function languageDisplayName(code) {
    const language = registry.getLanguage(code);
    if (!language) return code;
    const appLang = state?.settings?.appLanguage;
    const names = language.names || {};
    return names[appLang] || names.en || language.label || code;
  }
  function flagEmoji(code) {
    const language = registry.getLanguage(code);
    const bcp47 = language?.bcp47 || "";
    const parts = String(bcp47).split("-");
    const region = parts.length > 1 ? parts[parts.length - 1] : "";
    if (!/^[A-Za-z]{2}$/.test(region)) return "\u{1F310}";
    const up = region.toUpperCase();
    const base = 127462;
    return String.fromCodePoint(
      base + up.charCodeAt(0) - 65,
      base + up.charCodeAt(1) - 65,
    );
  }
  function t(key) {
    const textMap = UI_STRINGS[key];
    if (!textMap) return key;
    const appLang = state?.settings?.appLanguage || "en";
    let text = textMap[appLang] || textMap.en || key;
    if (state?.settings?.targetLanguage) {
      const targetName = languageDisplayName(state.settings.targetLanguage);
      text = text.replace(/\{targetLanguage\}/g, targetName);
    }
    return text;
  }

  class DataService {
    constructor(content, languageRegistry) {
      this.content = content || { items: [] };
      this.registry = languageRegistry;
      this.itemsById = new Map(
        (this.content.items || [])
          .filter((item) => item && typeof item.id === "string")
          .map((item) => [item.id, item]),
      );
    }
    getAllItems() {
      return Array.isArray(this.content.items)
        ? this.content.items.filter((i) => i && typeof i.id === "string")
        : [];
    }
    getItem(id) {
      return this.itemsById.get(id) || null;
    }
    getItemKind(item) {
      return item?.kind || (item?.texts ? "sentence" : "word");
    }
    getTextMap(item) {
      return item?.texts || item?.labels || item?.strings || {};
    }
    getText(item, languageCode) {
      const value = this.getTextMap(item)?.[languageCode];
      return typeof value === "string" && value.trim() ? value : "";
    }
    hasText(item, languageCode) {
      return Boolean(this.getText(item, languageCode).trim());
    }
    getLocalizedText(textMap, preferredLanguageCodes) {
      if (!textMap || typeof textMap !== "object") return "";
      for (const code of preferredLanguageCodes || []) {
        const value = textMap[code];
        if (typeof value === "string" && value.trim()) return value;
      }
      return (
        Object.values(textMap).find((v) => typeof v === "string" && v.trim()) ||
        ""
      );
    }
    getExplicitTokens(item, languageCode) {
      return Array.isArray(item?.tokens?.[languageCode])
        ? item.tokens[languageCode]
        : null;
    }
    tokenize(item, languageCode) {
      const fullText = this.getText(item, languageCode);
      const explicit = this.getExplicitTokens(item, languageCode);
      if (explicit) {
        return explicit
          .map((token, index) => {
            let text = typeof token === "string" ? token : token?.text || "";
            if (
              !text &&
              token &&
              typeof token.start === "number" &&
              typeof token.end === "number"
            )
              text = fullText.slice(token.start, token.end);
            return { id: token?.id ?? String(index), text };
          })
          .filter((token) => token.text.trim());
      }
      if (!fullText) return [];
      const strategy = this.registry.segmentation(languageCode);
      if (strategy === "whitespace")
        return fullText
          .trim()
          .split(/\s+/)
          .filter(Boolean)
          .map((text, index) => ({ id: String(index), text }));
      if (strategy === "segmenter") {
        if (
          typeof Intl !== "undefined" &&
          typeof Intl.Segmenter === "function"
        ) {
          try {
            const segmenter = new Intl.Segmenter(
              this.registry.bcp47(languageCode),
              { granularity: "word" },
            );
            return Array.from(segmenter.segment(fullText))
              .map((segment, index) => ({
                id: String(index),
                text: segment.segment,
              }))
              .filter((token) => token.text.trim());
          } catch {}
        }
        return fullText
          .trim()
          .split(/\s+/)
          .filter(Boolean)
          .map((text, index) => ({ id: String(index), text }));
      }
      return [];
    }
  }

  class MediaService {
    constructor(languageRegistry) {
      this.registry = languageRegistry;
    }
    get supported() {
      return typeof window !== "undefined" && "speechSynthesis" in window;
    }
    getVoices() {
      if (
        !this.supported ||
        typeof window.speechSynthesis.getVoices !== "function"
      )
        return [];
      return window.speechSynthesis.getVoices() || [];
    }
    voicesForLanguage(code) {
      const bcp47 = this.registry.bcp47(code);
      const normalize = (v) =>
        String(v || "")
          .toLowerCase()
          .replace(/_/g, "-");
      const short = normalize(code);
      return this.getVoices().filter(
        (voice) =>
          normalize(voice.lang) === normalize(bcp47) ||
          normalize(voice.lang).startsWith(short),
      );
    }
    findVoice(code) {
      const wantedName = state?.settings?.voices?.[code];
      const matching = this.voicesForLanguage(code);
      if (wantedName) {
        const named =
          matching.find((v) => v.name === wantedName) ||
          this.getVoices().find((v) => v.name === wantedName);
        if (named) return named;
      }
      return matching[0] || null;
    }
    speakText(text, code, { onEnd, onError } = {}) {
      if (!this.supported) return false;
      if (typeof text !== "string" || !text.trim()) return false;
      if (!this.registry.has(code)) return false;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = this.registry.bcp47(code);
      const preset =
        SPEED_PRESETS[state?.settings?.speechSpeed] || SPEED_PRESETS.normal;
      utterance.rate = preset.rate;
      utterance.pitch = preset.pitch;
      const voice = this.findVoice(code);
      if (voice) utterance.voice = voice;
      if (typeof onEnd === "function") utterance.onend = onEnd;
      if (typeof onError === "function") utterance.onerror = onError;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
      return utterance;
    }
    speakImmediate(text, code) {
      this.speakText(text, code);
    }
    stop() {
      if (this.supported) window.speechSynthesis.cancel();
    }
  }

  class SrsService {
    constructor(storageKey) {
      this.storageKey = storageKey;
      this.records = loadJSON(storageKey, {});
      this.intervals = Object.freeze([0, 1, 3, 7, 14, 30, 60]);
      if (
        !this.records ||
        typeof this.records !== "object" ||
        Array.isArray(this.records)
      )
        this.records = {};
    }
    save() {
      saveJSON(this.storageKey, this.records);
    }
    getRecord(cardId) {
      return this.records[cardId] || null;
    }
    isDue(cardId, now = new Date()) {
      const record = this.getRecord(cardId);
      if (!record) return true;
      const dueTime = Date.parse(record.due);
      if (Number.isNaN(dueTime)) return true;
      return dueTime <= now.getTime();
    }
    getDueCards(cards, now = new Date()) {
      return (Array.isArray(cards) ? cards : []).filter((card) =>
        this.isDue(card.cardId, now),
      );
    }
    createRecord(card, now) {
      return {
        cardId: card.cardId,
        itemId: card.itemId,
        itemKind: card.itemKind,
        promptLanguage: card.promptLanguage,
        revealLanguages: [...card.revealLanguages],
        box: 1,
        lapses: 0,
        intervalDays: 0,
        due: now.toISOString(),
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        ratingHistory: [],
      };
    }
    rateCard(card, rating, now = new Date()) {
      const validRatings = new Set(["again", "hard", "good", "easy"]);
      if (!card?.cardId || !validRatings.has(rating)) return null;
      const existing = this.getRecord(card.cardId);
      const record = existing || this.createRecord(card, now);
      const previousBox = Number.isInteger(record.box) ? record.box : 1;
      let nextBox = previousBox;
      if (rating === "again") {
        nextBox = 1;
        record.lapses = (record.lapses || 0) + 1;
      }
      if (rating === "hard") nextBox = Math.max(1, previousBox);
      if (rating === "good") nextBox = previousBox + 1;
      if (rating === "easy") nextBox = previousBox + 2;
      record.box = Math.min(Math.max(nextBox, 1), this.intervals.length);
      record.intervalDays = this.intervals[record.box - 1];
      record.due = new Date(
        now.getTime() + record.intervalDays * 864e5,
      ).toISOString();
      record.updatedAt = now.toISOString();
      if (!Array.isArray(record.ratingHistory)) record.ratingHistory = [];
      record.ratingHistory.push({ rating, at: record.updatedAt });
      this.records[card.cardId] = record;
      this.save();
      return record;
    }
    reset() {
      this.records = {};
      this.save();
    }
  }

  class FlashcardService {
    constructor({ dataService: ds, registry: reg }) {
      this.dataService = ds;
      this.registry = reg;
    }
    buildCardId({ itemKind, itemId, promptLanguage, revealLanguages }) {
      const reveal = [...new Set(revealLanguages)].sort().join("+");
      return [itemKind, itemId, promptLanguage, reveal].join(":");
    }
    buildDeck({ itemIds, promptLanguage, revealLanguages }) {
      const selectedRevealLanguages = [
        ...new Set(
          (revealLanguages || []).filter(
            (code) => this.registry.has(code) && code !== promptLanguage,
          ),
        ),
      ];
      const stats = {
        totalItems: 0,
        withPromptText: 0,
        withRevealText: 0,
        cards: 0,
      };
      const cards = [];
      const result = {
        cards,
        stats,
        promptLanguage,
        revealLanguages: selectedRevealLanguages,
      };
      if (
        !this.registry.has(promptLanguage) ||
        selectedRevealLanguages.length === 0
      )
        return result;
      const sourceItems = Array.isArray(itemIds)
        ? itemIds.map((id) => this.dataService.getItem(id)).filter(Boolean)
        : this.dataService.getAllItems();
      for (const item of sourceItems) {
        stats.totalItems += 1;
        const promptText = this.dataService.getText(item, promptLanguage);
        if (!promptText.trim()) continue;
        stats.withPromptText += 1;
        const validRevealLanguages = selectedRevealLanguages.filter((code) =>
          this.dataService.hasText(item, code),
        );
        if (!validRevealLanguages.length) continue;
        stats.withRevealText += 1;
        const itemKind = this.dataService.getItemKind(item);
        cards.push({
          cardId: this.buildCardId({
            itemKind,
            itemId: item.id,
            promptLanguage,
            revealLanguages: validRevealLanguages,
          }),
          itemId: item.id,
          itemKind,
          promptLanguage,
          revealLanguages: [...validRevealLanguages],
          promptText,
          revealLines: validRevealLanguages.map((code) => ({
            languageCode: code,
            text: this.dataService.getText(item, code),
            dir: this.registry.dir(code),
            bcp47: this.registry.bcp47(code),
          })),
        });
      }
      stats.cards = cards.length;
      return result;
    }
  }

  function normalizePrimaryValue(value) {
    if (typeof value === "string") return value.trim();
    if (Array.isArray(value)) {
      for (const entry of value) {
        const text = normalizePrimaryValue(entry);
        if (text) return text;
      }
      return "";
    }
    if (value && typeof value === "object") {
      const direct = normalizePrimaryValue(
        value.text ?? value.label ?? value.value,
      );
      if (direct) return direct;
      for (const entryValue of Object.values(value)) {
        const text = normalizePrimaryValue(entryValue);
        if (text) return text;
      }
      return "";
    }
    return "";
  }
  function hashString(value) {
    let hash = 2166136261 >>> 0;
    const text = String(value);
    for (let index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 16777619) >>> 0;
    }
    return hash >>> 0;
  }
  function mulberry32(seed) {
    let a = seed >>> 0;
    return function next() {
      a = (a + 1831565813) | 0;
      let t2 = Math.imul(a ^ (a >>> 15), 1 | a);
      t2 = (t2 + Math.imul(t2 ^ (t2 >>> 7), 61 | t2)) ^ t2;
      return ((t2 ^ (t2 >>> 14)) >>> 0) / 4294967296;
    };
  }
  function deterministicShuffle(values, seed) {
    const result = [...values];
    const random = mulberry32(hashString(seed));
    for (let index = result.length - 1; index > 0; index -= 1) {
      const swap = Math.floor(random() * (index + 1));
      [result[index], result[swap]] = [result[swap], result[index]];
    }
    return result;
  }
  function resetQuizSessionSeed() {
    quizSessionSeed = `quiz:${Date.now()}:${Math.random().toString(36).slice(2)}`;
  }

  class QuizService {
    constructor({ dataService: ds, registry: reg }) {
      this.dataService = ds;
      this.registry = reg;
      this.minOptions = 4;
    }
    getPrimaryText(item, languageCode) {
      const map = this.dataService.getTextMap(item);
      return normalizePrimaryValue(map?.[languageCode]);
    }
    hasPrimaryText(item, languageCode) {
      return Boolean(this.getPrimaryText(item, languageCode));
    }
    buildOption(item, languageCode, isCorrect) {
      return {
        itemId: item.id,
        text: this.getPrimaryText(item, languageCode),
        dir: this.registry.dir(languageCode),
        bcp47: this.registry.bcp47(languageCode),
        isCorrect,
      };
    }
    buildSession({ itemIds, questionLanguage, answerLanguage, seed = "" }) {
      const stats = {
        totalItems: 0,
        withQuestionText: 0,
        withAnswerText: 0,
        questions: 0,
      };
      const questions = [];
      const result = {
        questions,
        stats,
        questionLanguage,
        answerLanguage,
        reason: "",
      };
      if (
        !this.registry.has(questionLanguage) ||
        !this.registry.has(answerLanguage) ||
        questionLanguage === answerLanguage
      ) {
        result.reason = "invalidPair";
        return result;
      }
      const sourceItems = Array.isArray(itemIds)
        ? itemIds.map((id) => this.dataService.getItem(id)).filter(Boolean)
        : this.dataService.getAllItems();
      const answerEntries = [];
      for (const item of sourceItems) {
        stats.totalItems += 1;
        const answerText = this.getPrimaryText(item, answerLanguage);
        if (!answerText) continue;
        stats.withAnswerText += 1;
        answerEntries.push({ item, answerText });
      }
      if (answerEntries.length === 0) {
        result.reason = "notEnoughOptions";
        return result;
      }
      for (const entry of answerEntries) {
        const item = entry.item;
        const questionText = this.getPrimaryText(item, questionLanguage);
        if (!questionText) continue;
        stats.withQuestionText += 1;
        const correctOption = this.buildOption(item, answerLanguage, true);
        const candidates = answerEntries.filter((c) => c.item.id !== item.id);
        const shuffledCandidates = deterministicShuffle(
          candidates,
          `${seed}:distractors:${item.id}:${questionLanguage}:${answerLanguage}`,
        );
        const distractors = [];
        const selectedIds = new Set([item.id]);
        const usedTexts = new Set([correctOption.text]);
        for (const candidate of shuffledCandidates) {
          if (distractors.length >= this.minOptions - 1) break;
          if (selectedIds.has(candidate.item.id)) continue;
          const option = this.buildOption(
            candidate.item,
            answerLanguage,
            false,
          );
          if (usedTexts.has(option.text)) continue;
          distractors.push(option);
          selectedIds.add(candidate.item.id);
          usedTexts.add(option.text);
        }
        const options = deterministicShuffle(
          [correctOption, ...distractors],
          `${seed}:options:${item.id}:${questionLanguage}:${answerLanguage}`,
        );
        questions.push({
          questionId: ["quiz", item.id, questionLanguage, answerLanguage].join(
            ":",
          ),
          itemId: item.id,
          itemKind: this.dataService.getItemKind(item),
          questionLanguage,
          answerLanguage,
          questionText,
          questionDir: this.registry.dir(questionLanguage),
          questionBcp47: this.registry.bcp47(questionLanguage),
          answerItemId: item.id,
          answerText: entry.answerText,
          answerDir: this.registry.dir(answerLanguage),
          answerBcp47: this.registry.bcp47(answerLanguage),
          options,
        });
      }
      stats.questions = questions.length;
      if (!questions.length) result.reason = "noQuestions";
      return result;
    }
  }

  class QuizProgressService {
    constructor(storageKey) {
      this.storageKey = storageKey;
      this.records = loadJSON(storageKey, {});
      if (
        !this.records ||
        typeof this.records !== "object" ||
        Array.isArray(this.records)
      )
        this.records = {};
    }
    save() {
      saveJSON(this.storageKey, this.records);
    }
    recordAnswer(
      { itemId, questionLanguage, answerLanguage, correct },
      now = new Date(),
    ) {
      if (!itemId || !questionLanguage || !answerLanguage) return null;
      const recordId = [itemId, questionLanguage, answerLanguage].join(":");
      const existing = this.records[recordId];
      const record = existing || {
        itemId,
        questionLanguage,
        answerLanguage,
        correct: 0,
        incorrect: 0,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      };
      if (correct) record.correct += 1;
      else record.incorrect += 1;
      record.updatedAt = now.toISOString();
      this.records[recordId] = record;
      this.save();
      return record;
    }
    reset() {
      this.records = {};
      this.save();
    }
  }

  class StudyPlanService {
    constructor() {
      this.planKey = STORAGE_KEYS.studyPlan;
      this.progressKey = STORAGE_KEYS.studyPlanProgress;
    }
    getPlan() {
      return loadJSON(this.planKey, []);
    }
    getProgress() {
      return loadJSON(this.progressKey, {});
    }
    hasPlan() {
      return this.getPlan().length > 0;
    }
    markLesson(lessonId, status) {
      const progress = this.getProgress();
      progress[lessonId] = status;
      saveJSON(this.progressKey, progress);
    }
    getNextLesson() {
      const plan = this.getPlan();
      const progress = this.getProgress();
      for (const lessonId of plan) {
        const status = progress[lessonId];
        if (status !== "complete" && status !== "skipped") return lessonId;
      }
      return null;
    }
    reset() {
      try {
        localStorage.removeItem(this.planKey);
        localStorage.removeItem(this.progressKey);
      } catch {}
    }
    generate(answers) {
      const plan = this._buildPlan(answers);
      saveJSON(this.planKey, plan);
      const progress = {};
      plan.forEach((id) => {
        progress[id] = "in-progress";
      });
      saveJSON(this.progressKey, progress);
      return plan;
    }
    _buildPlan(answers) {
      const allLessons = this._getAllLessons();
      const minLevel = this._getMinLevel(answers.level);
      const priorityCats = this._getPriorityCategories(answers.goal);
      let filtered = allLessons.filter((l) => (l.level || 1) >= minLevel);
      if (priorityCats.length > 0) {
        const priority = [];
        const rest = [];
        for (const lesson of filtered) {
          if (priorityCats.includes(lesson._categoryId)) priority.push(lesson);
          else rest.push(lesson);
        }
        filtered = [...priority, ...rest];
      }
      const plan = [];
      const added = new Set();
      for (const lesson of filtered) {
        if (!added.has(lesson.id)) {
          plan.push(lesson.id);
          added.add(lesson.id);
        }
      }
      return plan.slice(0, 30);
    }
    _getMinLevel(userLevel) {
      switch (userLevel) {
        case "beginner":
          return 1;
        case "some":
          return 2;
        case "basic":
          return 4;
        case "advanced":
          return 7;
        default:
          return 1;
      }
    }
    _getPriorityCategories(goal) {
      switch (goal) {
        case "travel":
          return [
            "cat_food",
            "cat_transport",
            "cat_accommodation",
            "cat_travel",
            "cat_emergency",
          ];
        case "business":
          return ["cat_work", "cat_post", "cat_money"];
        default:
          return [];
      }
    }
    _getAllLessons() {
      const lessons = [];
      for (const category of manifest.categories || []) {
        if (category.id === "cat_test") continue;
        for (const lesson of category.lessons || [])
          lessons.push({ ...lesson, _categoryId: category.id });
      }
      return lessons;
    }
  }

  function chooseDefaultAppLanguage() {
    const browserCode = (navigator.language || "").toLowerCase().split("-")[0];
    if (registry?.has(browserCode)) return browserCode;
    return registry?.allCodes()[0] || "";
  }

  function normalizeSettings(saved) {
    const s = saved || {};
    return {
      theme: THEME_CYCLE.includes(s.theme) ? s.theme : "auto",
      font: s.font === "traditional" ? "traditional" : "modern",
      appLanguage: registry.has(s.appLanguage)
        ? s.appLanguage
        : chooseDefaultAppLanguage(),
      // FIX 1: Decouple targetLanguage from appLanguage
      targetLanguage: registry.has(s.targetLanguage) ? s.targetLanguage : null,
      repeatCount: normalizeRepeatCount(s.repeatCount),
      speechSpeed: ["normal", "slow", "slower"].includes(s.speechSpeed)
        ? s.speechSpeed
        : "normal",
      voices:
        s.voices && typeof s.voices === "object" && !Array.isArray(s.voices)
          ? s.voices
          : {},
    };
  }

  function normalizeLessonLanguages(saved, targetLang) {
    if (!targetLang) return [];
    // Bridge language: browser default or 'en'
    const browserLang = (navigator.language || "").toLowerCase().split("-")[0];
    const bridgeLang =
      registry.has(browserLang) && browserLang !== targetLang
        ? browserLang
        : registry.has("en") && "en" !== targetLang
          ? "en"
          : null;
    const defaults = [targetLang];
    if (bridgeLang) defaults.push(bridgeLang);
    if (Array.isArray(saved)) {
      const filtered = saved.filter((code) => registry.has(code));
      if (filtered.length) return filtered;
    }
    return defaults;
  }

  function saveState() {
    saveJSON(STORAGE_KEYS.settings, state.settings);
    saveJSON(STORAGE_KEYS.lessonLanguages, state.lessonLanguages);
  }

  function resetTargetScopedServices() {
    srsService = new SrsService(STORAGE_KEYS.srs);
    quizProgressService = new QuizProgressService(STORAGE_KEYS.quiz);
    studyPlanService = new StudyPlanService();

    const savedTried = loadJSON(STORAGE_KEYS.lessonsTried, []);
    lessonsTried = new Set(Array.isArray(savedTried) ? savedTried : []);

    currentLesson = null;
    flashcardSession = null;
    quizSession = null;
    buildSession = null;
    buildCurrent = null;
    exerciseSettingsOpen = false;

    if (typeof resetQuizSessionSeed === "function") {
      resetQuizSessionSeed();
    }
  }

  function setTargetLanguage(code, source = "toolbar") {
    if (!registry.has(code)) return;
    // FIX 1: Removed safeguard that prevented targetLanguage === appLanguage

    const previousTarget = state.settings.targetLanguage;
    state.settings.targetLanguage = code;
    nextUpPreviewId = null; // v3.1 Stage 2: Reset card preview when target language changes

    // Reset lesson languages to [target, bridge]
    const browserLang = (navigator.language || "").toLowerCase().split("-")[0];
    const bridgeLang =
      registry.has(browserLang) && browserLang !== code
        ? browserLang
        : registry.has("en") && "en" !== code
          ? "en"
          : null;
    const desired = [code];
    if (bridgeLang) desired.push(bridgeLang);
    state.lessonLanguages = desired.filter((c) => registry.has(c));

    saveState();
    if (previousTarget !== code) {
      resetTargetScopedServices();
    }
    renderTargetLanguageControl();
    goHome();
  }

  function applyTheme() {
    document.documentElement.dataset.theme = state.settings.theme;
  }
  function applyFont() {
    document.documentElement.dataset.font = state.settings.font;
  }
  function applyDocumentLanguage() {
    const appLang = state.settings.appLanguage;
    const language = registry.getLanguage(appLang);
    document.documentElement.lang = language?.bcp47 || appLang || "";
    document.documentElement.dir = language?.dir || "ltr";
  }
  function cycleTheme() {
    const index = THEME_CYCLE.indexOf(state.settings.theme);
    state.settings.theme = THEME_CYCLE[(index + 1) % THEME_CYCLE.length];
    saveState();
    applyTheme();
    renderHamburger();
  }
  function cycleFont() {
    state.settings.font =
      state.settings.font === "modern" ? "traditional" : "modern";
    saveState();
    applyFont();
    renderHamburger();
    renderCurrent();
  }

  function setAppLanguage(code) {
    if (!registry.has(code)) return;
    state.settings.appLanguage = code;
    saveState();
    applyDocumentLanguage();
    renderStaticLabels();
    renderHamburger();
    renderTargetLanguageControl();
    if (elements.settingsSheet && !elements.settingsSheet.hidden)
      renderSettings();

    // FIX 2: If target language is missing or invalid after app language change,
    // redirect to the target selection page instead of rendering a disabled dropdown.
    if (
      !state.settings.targetLanguage ||
      !registry.has(state.settings.targetLanguage)
    ) {
      state.settings.targetLanguage = null;
      saveState();
      renderTargetSelect();
      return;
    }

    renderCurrent();
  }

  function selectedLessonLanguages() {
    if (!currentLesson?.meta?.translations) return state.lessonLanguages;
    // v3.1 Architecture: Use 'translations' for data constraints (available columns).
    const available = currentLesson.meta.translations || [];
    if (!available.length) return state.lessonLanguages;

    const filtered = state.lessonLanguages.filter(
      (code) => available.includes(code) && registry.has(code),
    );

    // FIX 3: Fallback to prevent "No languages are selected" error if the lesson's
    // translations array is out of sync with the user's selected lesson languages.
    if (filtered.length === 0 && state.lessonLanguages.length > 0) {
      return state.lessonLanguages.filter((c) => registry.has(c));
    }

    return filtered;
  }

  function setLessonLanguageEnabled(code, enabled) {
    if (!registry.has(code)) return;
    const set = new Set(state.lessonLanguages);
    if (enabled) set.add(code);
    else set.delete(code);
    state.lessonLanguages = registry.allCodes().filter((c) => set.has(c));
    flashcardSession = null;
    quizSession = null;
    ensureExerciseConfigs();
    saveState();
    stopPlayback();
    renderSettings();
    renderCurrent();
  }
  function preferredAppLanguages() {
    return [state.settings.appLanguage, "en", ...registry.allCodes()].filter(
      Boolean,
    );
  }

  /*
  function voicesForLanguage(code) {
    const bcp47 = registry.bcp47(code);
    const normalize = (value) =>
      String(value || "")
        .toLowerCase()
        .replace(/_/g, "-");
    const short = normalize(code);
    return availableVoices.filter(
      (voice) =>
        normalize(voice.lang) === normalize(bcp47) ||
        normalize(voice.lang).startsWith(short),
    );
  }
  function findSelectedVoice(code) {
    if (!mediaService?.supported || !availableVoices.length) return null;
    const wantedName = state.settings.voices?.[code];
    const matching = voicesForLanguage(code);
    if (wantedName) {
      const named =
        matching.find((voice) => voice.name === wantedName) ||
        availableVoices.find((voice) => voice.name === wantedName);
      if (named) return named;
    }
    return matching[0] || null;
  }
*/

  function setVoiceForLanguage(code, name) {
    if (!state.settings.voices) state.settings.voices = {};
    if (name) state.settings.voices[code] = name;
    else delete state.settings.voices[code];
    saveState();
  }
  function refreshVoices() {
    availableVoices = mediaService?.getVoices() || [];
  }
  function markLessonTried(lessonId) {
    if (!lessonId) return;
    if (!lessonsTried.has(lessonId)) {
      lessonsTried.add(lessonId);
      saveJSON(STORAGE_KEYS.lessonsTried, [...lessonsTried]);
    }
  }
  function showView(name) {
    if (name !== "voicetest") stopVoiceTestPlayback();
    stopPlayback();
    clearPlaybackHighlights();
    clearExerciseHighlights();
    if (name !== "lesson") {
      [elements.actionBar, elements.bottomBar].forEach((bar) => {
        if (bar) {
          const existing = bar.querySelector(".complete-toggle");
          if (existing) existing.remove();
        }
      });
    }
    VIEW_IDS.forEach((id) => {
      const el = elements[`${id}View`];
      if (el) el.hidden = id !== name;
    });
    const isLesson = name === "lesson";
    if (elements.actionBar) elements.actionBar.hidden = !isLesson;
    if (elements.bottomBar) elements.bottomBar.hidden = !isLesson;
  }
  function renderStaticLabels() {
    document.querySelectorAll("[data-ui-string]").forEach((el) => {
      el.textContent = t(el.dataset.uiString);
    });
    document.querySelectorAll("[data-ui-label]").forEach((el) => {
      el.setAttribute("aria-label", t(el.dataset.uiLabel));
    });
    document.title = t("appTitle");
  }
  function makeEmptyState(text) {
    const div = document.createElement("div");
    div.className = "empty-state";
    div.textContent = text;
    return div;
  }
  function createTextLine(text, code, extraClasses = []) {
    if (!registry.has(code)) return null;
    if (typeof text !== "string" || !text.trim()) return null;
    const line = document.createElement("div");
    line.className = "language-line";
    if (extraClasses.length) line.classList.add(...extraClasses);
    line.dir = registry.dir(code);
    line.dataset.action = "speak-text";
    line.dataset.lang = code;
    line.dataset.speakText = text;
    const span = document.createElement("span");
    span.className = "language-line__text";
    span.lang = registry.bcp47(code);
    span.textContent = text;
    line.appendChild(span);
    return line;
  }
  function createSentenceTextLine(item, text, code, extraClasses = []) {
    if (!registry.has(code)) return null;
    if (typeof text !== "string" || !text.trim()) return null;
    const line = document.createElement("div");
    line.className = "language-line";
    if (extraClasses.length) line.classList.add(...extraClasses);
    line.dir = registry.dir(code);
    line.dataset.action = "speak-text";
    line.dataset.lang = code;
    line.dataset.speakText = text;
    line.dataset.itemId = item.id;
    const span = document.createElement("span");
    span.className = "language-line__text";
    span.lang = registry.bcp47(code);
    const container = document.createElement("span");
    container.className = "sentence-text";
    if (registry.segmentation(code) === "segmenter")
      container.classList.add("sentence-text--compact");
    const tokens = dataService.tokenize(item, code);
    if (tokens.length) {
      tokens.forEach((token) => {
        const tokenEl = document.createElement("span");
        tokenEl.className = "sentence-token";
        tokenEl.dataset.tokenId = String(token.id);
        tokenEl.lang = registry.bcp47(code);
        tokenEl.textContent = token.text;
        container.appendChild(tokenEl);
      });
    } else {
      container.textContent = text;
    }
    span.appendChild(container);
    line.appendChild(span);
    return line;
  }
  function clearExerciseHighlights() {
    if (exerciseHighlightTimerId) {
      clearInterval(exerciseHighlightTimerId);
      exerciseHighlightTimerId = null;
    }
    exerciseUtterance = null;
    document
      .querySelectorAll(".language-line.is-speaking")
      .forEach((el) => el.classList.remove("is-speaking"));
    document
      .querySelectorAll(".quiz-option.is-speaking")
      .forEach((el) => el.classList.remove("is-speaking"));
    document
      .querySelectorAll(".sentence-token.is-highlighted")
      .forEach((el) => el.classList.remove("is-highlighted"));
  }
  function speakLineWithHighlight(lineEl, text, code) {
    clearExerciseHighlights();
    if (!lineEl) {
      mediaService.speakImmediate(text, code);
      return;
    }
    lineEl.classList.add("is-speaking");
    const tokens = Array.from(lineEl.querySelectorAll(".sentence-token"));
    if (tokens.length) {
      let idx = 0;
      const highlightCurrent = () => {
        tokens.forEach((tokenEl) => tokenEl.classList.remove("is-highlighted"));
        if (tokens[idx]) tokens[idx].classList.add("is-highlighted");
        if (idx < tokens.length - 1) idx += 1;
      };
      highlightCurrent();
      if (tokens.length > 1) {
        const preset =
          SPEED_PRESETS[state.settings.speechSpeed] || SPEED_PRESETS.normal;
        const textLength = String(text || " ").length;
        const estimated = Math.max(1200, textLength * 90) / (preset.rate || 1);
        const interval = Math.max(180, Math.floor(estimated / tokens.length));
        exerciseHighlightTimerId = setInterval(highlightCurrent, interval);
      }
    }
    const utterance = mediaService.speakText(text, code, {
      onEnd: () => {
        if (exerciseUtterance === utterance) clearExerciseHighlights();
      },
      onError: () => {
        if (exerciseUtterance === utterance) clearExerciseHighlights();
      },
    });
    exerciseUtterance = utterance || null;
    if (!utterance) {
      const delay = Math.max(800, String(text || " ").length * 80);
      setTimeout(clearExerciseHighlights, delay);
    }
  }
  function renderCurrent() {
    if (elements.flashcardView && !elements.flashcardView.hidden) {
      renderFlashcards();
      return;
    }
    if (elements.quizView && !elements.quizView.hidden) {
      renderQuiz();
      return;
    }
    if (elements.buildView && !elements.buildView.hidden) {
      renderBuildSentence();
      return;
    }
    if (elements.progressView && !elements.progressView.hidden) {
      renderProgress();
      return;
    }
    if (elements.voicetestView && !elements.voicetestView.hidden) {
      renderVoiceTest();
      return;
    }
    if (elements.helpView && !elements.helpView.hidden) {
      renderHelp();
      return;
    }
    if (elements.lessonView && !elements.lessonView.hidden) {
      renderLesson();
      return;
    }
    if (elements.onboardingView && !elements.onboardingView.hidden) {
      renderOnboarding();
      return;
    }
    renderHome();
  }
  function openHamburger() {
    renderHamburger();
    elements.hamburgerPanel.hidden = false;
    elements.hamburgerBackdrop.hidden = false;
    const toggle = document.querySelector('[data-action="toggle-hamburger"]');
    if (toggle) toggle.setAttribute("aria-expanded", "true");
  }
  function closeHamburger() {
    elements.hamburgerPanel.hidden = true;
    elements.hamburgerBackdrop.hidden = true;
    const toggle = document.querySelector('[data-action="toggle-hamburger"]');
    if (toggle) toggle.setAttribute("aria-expanded", "false");
  }
  function renderHamburger() {
    const theme = state.settings.theme;
    elements.themeIcon.textContent =
      theme === "auto"
        ? "\u{1F317}"
        : theme === "light"
          ? "\u2600\uFE0F"
          : "\u{1F319}";
    const themeName =
      theme === "auto"
        ? t("themeAuto")
        : theme === "light"
          ? t("themeLight")
          : t("themeDark");
    elements.themeLabel.textContent = `${t("theme")}: ${themeName}`;
    const font = state.settings.font;
    elements.fontIcon.textContent =
      font === "modern" ? "\u{1F524}" : "\u{1F4DC}";
    const fontName = font === "modern" ? t("fontModern") : t("fontTraditional");
    elements.fontLabel.textContent = `${t("font")}: ${fontName}`;
    renderAppLanguageControl();
  }
  function renderAppLanguageControl() {
    const container = elements.appLanguageControl;
    if (!container) return;
    container.innerHTML = "";
    const select = document.createElement("select");
    select.className = "select";
    registry.all.forEach((language) => {
      const option = document.createElement("option");
      option.value = language.code;
      option.textContent = `${flagEmoji(language.code)} ${languageDisplayName(language.code)}`;
      select.appendChild(option);
    });
    select.value = state.settings.appLanguage;
    select.addEventListener("change", () => setAppLanguage(select.value));
    container.appendChild(select);
  }
  async function loadManifest() {
    try {
      const response = await fetch("lessons/manifest.json", {
        cache: "no-cache",
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("Zabon: unable to load manifest.json.", error);
      return { zabon: { languages: [] }, categories: [] };
    }
  }

  function groupCategoriesByProficiency() {
    const tiers = {
      introductory: { thematic: [] },
      intermediate: { thematic: [] },
      advanced: { thematic: [] },
    };
    const standalone = [];
    const proficiencyToTier = {
      beginner: "introductory",
      intermediate: "intermediate",
      advanced: "advanced",
    };

    // v3 Architecture: Filter categories and lessons based on targetLanguage
    const filteredCategories = (manifest.categories || [])
      .map((cat) => {
        if (cat.id === "cat_test") return null;
        const validLessons = (cat.lessons || []).filter(
          lessonBelongsToActiveTarget,
        );
        if (validLessons.length === 0) return null; // Hide category if no lessons match
        return { ...cat, lessons: validLessons };
      })
      .filter(Boolean);

    for (const category of filteredCategories) {
      if (category.standalone) {
        standalone.push(category);
        continue;
      }
      const firstLesson = category.lessons[0];
      const proficiency = firstLesson?.proficiency || "beginner";
      const tier = proficiencyToTier[proficiency] || "introductory";
      tiers[tier].thematic.push(category);
    }
    return { tiers, standalone };
  }

  function countTierLessons(tier) {
    let count = 0;
    for (const category of tier.thematic)
      count += (category.lessons || []).length;
    return count;
  }
  function countTierLessonsTried(tier) {
    let count = 0;
    for (const category of tier.thematic) {
      for (const lesson of category.lessons || [])
        if (lessonsTried.has(lesson.id)) count += 1;
    }
    return count;
  }
  function renderProficiencyTier(tierKey, label, tier) {
    const wrap = document.createElement("div");
    wrap.className = "proficiency-tier";
    const openKey = "tier:" + tierKey;
    const isOpen = openCategories.has(openKey);
    const totalLessons = countTierLessons(tier);
    const triedLessons = countTierLessonsTried(tier);
    const header = document.createElement("button");
    header.type = "button";
    header.className = "proficiency-tier__header";
    header.dataset.action = "toggle-tier";
    header.dataset.tierId = tierKey;
    const icon = document.createElement("span");
    icon.className = "proficiency-tier__icon";
    icon.textContent = TIER_ICONS[tierKey] || "";
    const title = document.createElement("span");
    title.className = "proficiency-tier__title";
    title.textContent = label;
    const titleGroup = document.createElement("span");
    titleGroup.className = "proficiency-tier__title-group";
    titleGroup.append(icon, title);
    const progress = document.createElement("span");
    progress.className = "proficiency-tier__progress";
    progress.textContent = triedLessons + "/" + totalLessons;
    const chevron = document.createElement("span");
    chevron.className = "category__chevron";
    chevron.textContent = isOpen ? "\u25BE" : "\u25B8";
    header.append(titleGroup, progress, chevron);
    wrap.appendChild(header);
    if (isOpen) {
      const body = document.createElement("div");
      body.className = "proficiency-tier__body";
      for (const category of tier.thematic)
        body.appendChild(renderCategory(category));
      wrap.appendChild(body);
    }
    return wrap;
  }
  function renderHome() {
    showView("home");
    const view = elements.homeView;
    view.innerHTML = "";

    if (!IMPLEMENTED_TARGET_LANGUAGES.includes(state.settings.targetLanguage)) {
      const banner = document.createElement("div");
      banner.className = "empty-state";
      banner.style.marginBlockEnd = "1rem";
      banner.style.borderColor = "var(--accent)";
      banner.style.textAlign = "center";

      const langName = languageDisplayName(state.settings.targetLanguage);
      const msg = document.createElement("p");
      msg.style.margin = "0 0 0.5rem 0";
      msg.textContent = `${langName} is not implemented yet. Only Thai is currently available.`;
      banner.appendChild(msg);

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "button button--wide";
      btn.dataset.action = "change-target-language";
      btn.textContent = t("selectTargetLanguage");
      banner.appendChild(btn);

      view.appendChild(banner);
    }

    const { tiers, standalone } = groupCategoriesByProficiency();
    const tierOrder = ["introductory", "intermediate", "advanced"];
    const tierLabels = {
      introductory: t("tierIntroductory"),
      intermediate: t("tierIntermediate"),
      advanced: t("tierAdvanced"),
    };
    const nextUpCard = renderNextUpCard();
    if (nextUpCard) view.appendChild(nextUpCard);
    const planList = renderStudyPlanList();
    if (planList) view.appendChild(planList);
    const browseHeader = document.createElement("h3");
    browseHeader.className = "browse-by-level";
    browseHeader.textContent = t("browseByLevel");
    view.appendChild(browseHeader);
    const list = document.createElement("div");
    list.className = "category-list";
    for (const tierKey of tierOrder) {
      const tier = tiers[tierKey];
      if (!tier.thematic.length) continue;
      list.appendChild(
        renderProficiencyTier(tierKey, tierLabels[tierKey], tier),
      );
    }
    for (const category of standalone)
      list.appendChild(renderCategory(category));
    view.appendChild(list);
    const topicList = renderBrowseByTopic();
    if (topicList) {
      const topicHeader = document.createElement("h3");
      topicHeader.className = "browse-by-level";
      topicHeader.textContent = t("browseByTopic");
      view.appendChild(topicHeader);
      view.appendChild(topicList);
    }
  }

  function getSortedLanguages() {
    return [...manifest.zabon.languages]
      .filter((lang) => lang?.code)
      .sort((a, b) => {
        const nameA = languageDisplayName(a.code).toLowerCase();
        const nameB = languageDisplayName(b.code).toLowerCase();
        return nameA.localeCompare(nameB);
      });
  }

  function renderTargetLanguageControl() {
    const container = elements.targetLanguageControl;
    if (!container) return;
    container.innerHTML = "";
    const select = document.createElement("select");
    select.className = "select";
    select.dataset.control = "target-language";
    select.setAttribute("aria-label", t("selectTargetLanguage"));

    const appLang = state.settings.appLanguage;
    const targetLang = state.settings.targetLanguage;

    // FIX 1: Allow target language to be the same as app language
    const hasValidTarget = Boolean(targetLang && registry.has(targetLang));

    if (!hasValidTarget) {
      const placeholder = document.createElement("option");
      placeholder.value = "";
      placeholder.textContent = t("selectTargetLanguage");
      placeholder.disabled = true;
      placeholder.selected = true;
      select.appendChild(placeholder);
      select.disabled = true;
    } else {
      select.disabled = false;
    }

    const sortedLanguages = getSortedLanguages();

    sortedLanguages.forEach((lang) => {
      const option = document.createElement("option");
      option.value = lang.code;
      option.textContent = `${flagEmoji(lang.code)} ${languageDisplayName(lang.code)}`;
      select.appendChild(option);
    });

    if (hasValidTarget) {
      select.value = targetLang;
    }

    select.addEventListener("change", () => {
      setTargetLanguage(select.value, "toolbar");
    });

    container.appendChild(select);
  }

  function getNextBrowseLesson() {
    const progress = studyPlanService ? studyPlanService.getProgress() : {};
    const { tiers } = groupCategoriesByProficiency();
    const tierOrder = ["introductory", "intermediate", "advanced"];

    for (const tierKey of tierOrder) {
      const tier = tiers[tierKey];
      if (!tier) continue;

      for (const category of tier.thematic) {
        for (const lesson of category.lessons || []) {
          const status = progress[lesson.id];
          if (status !== "complete" && status !== "skipped") {
            return lesson;
          }
        }
      }
    }

    return null;
  }

  // v3.1 Stage 2: Determines the linear context (prev/next) for a given lesson.
  function getNavigationContext(lessonId) {
    // 1. Try Study Plan first
    if (studyPlanService && studyPlanService.hasPlan()) {
      const plan = studyPlanService.getPlan();
      const idx = plan.indexOf(lessonId);
      if (idx !== -1) {
        return {
          list: plan,
          index: idx,
          prevId: idx > 0 ? plan[idx - 1] : null,
          nextId: idx < plan.length - 1 ? plan[idx + 1] : null,
        };
      }
    }

    // 2. Fallback to Categories
    for (const cat of manifest.categories || []) {
      const lessons = (cat.lessons || []).filter(lessonBelongsToActiveTarget);
      const idx = lessons.findIndex((l) => l.id === lessonId);
      if (idx !== -1) {
        return {
          list: lessons.map((l) => l.id),
          index: idx,
          prevId: idx > 0 ? lessons[idx - 1].id : null,
          nextId: idx < lessons.length - 1 ? lessons[idx + 1].id : null,
        };
      }
    }

    // 3. Fallback to Topics/Books
    for (const topic of manifest.topics || []) {
      for (const book of topic.books || []) {
        const lessons = (book.lessons || []).filter(
          lessonBelongsToActiveTarget,
        );
        const idx = lessons.findIndex((l) => l.id === lessonId);
        if (idx !== -1) {
          return {
            list: lessons.map((l) => l.id),
            index: idx,
            prevId: idx > 0 ? lessons[idx - 1].id : null,
            nextId: idx < lessons.length - 1 ? lessons[idx + 1].id : null,
          };
        }
      }
    }

    return { list: [lessonId], index: 0, prevId: null, nextId: null };
  }

  function getTierLabelForLesson(lesson) {
    const prof = lesson.proficiency || "beginner";
    if (prof === "beginner") return t("tierIntroductory");
    if (prof === "intermediate") return t("tierIntermediate");
    return t("tierAdvanced");
  }
  function renderStudyPlanList() {
    if (!studyPlanService || !studyPlanService.hasPlan()) return null;
    const plan = studyPlanService.getPlan();
    const progress = studyPlanService.getProgress();
    const nextLessonId = studyPlanService.getNextLesson();
    const section = document.createElement("div");
    section.className = "study-plan-list";
    const heading = document.createElement("h3");
    heading.className = "browse-by-level";
    heading.textContent = t("studyPlan");
    section.appendChild(heading);
    for (const lessonId of plan) {
      const meta = findLessonMeta(lessonId);
      if (!meta) continue;
      const status = progress[lessonId] || "in-progress";
      const panel = document.createElement("div");
      panel.className = "study-plan-item";
      if (lessonId === nextLessonId)
        panel.classList.add("study-plan-item--next");
      if (status === "complete") panel.classList.add("is-complete");
      const statusIcon = document.createElement("span");
      statusIcon.className = "study-plan-item__status";
      statusIcon.textContent = statusToIcon(status);
      const title = document.createElement("span");
      title.className = "study-plan-item__title";
      title.textContent =
        dataService.getLocalizedText(meta.title, preferredAppLanguages()) ||
        meta.id;
      const openBtn = document.createElement("button");
      openBtn.type = "button";
      openBtn.className = "button study-plan-item__open";
      openBtn.dataset.action = "open-lesson";
      openBtn.dataset.lessonId = lessonId;
      openBtn.textContent = t("open");
      panel.append(statusIcon, title, openBtn);
      section.appendChild(panel);
    }
    return section;
  }
  function renderStudyPlanProgressSection() {
    if (!studyPlanService) return null;
    const section = document.createElement("section");
    section.className = "progress-section";
    const isOpen = openProgressSections.has("progress:study-plan");
    const header = document.createElement("button");
    header.type = "button";
    header.className = "progress-section__header";
    header.dataset.action = "toggle-progress-section";
    header.dataset.sectionKey = "progress:study-plan";
    const title = document.createElement("span");
    title.className = "progress-section__title";
    title.textContent = t("studyPlan");
    const chevron = document.createElement("span");
    chevron.className = "progress-section__chevron";
    chevron.textContent = isOpen ? "\u25BE" : "\u25B8";
    header.append(title, chevron);
    section.appendChild(header);
    if (!isOpen) return section;
    const body = document.createElement("div");
    body.className = "progress-section__body";
    if (!studyPlanService.hasPlan()) {
      body.appendChild(makeEmptyState(t("noStudyPlan")));
      const createBtn = document.createElement("button");
      createBtn.type = "button";
      createBtn.className = "button button--wide";
      createBtn.dataset.action = "create-plan";
      createBtn.textContent = t("createStudyPlan");
      body.appendChild(createBtn);
    } else {
      const plan = studyPlanService.getPlan();
      const progress = studyPlanService.getProgress();
      const completeCount = plan.filter(
        (id) => progress[id] === "complete",
      ).length;
      const totalCount = plan.length;
      const percentage =
        totalCount > 0 ? Math.round((completeCount / totalCount) * 100) : 0;
      const progressBar = document.createElement("div");
      progressBar.className = "plan-progress-bar";
      const progressFill = document.createElement("div");
      progressFill.className = "plan-progress-fill";
      progressFill.style.inlineSize = percentage + "%";
      progressBar.appendChild(progressFill);
      body.appendChild(progressBar);
      const progressLabel = document.createElement("div");
      progressLabel.className = "plan-progress-label";
      progressLabel.textContent =
        completeCount + "/" + totalCount + " \u00B7 " + percentage + "%";
      body.appendChild(progressLabel);
      const lessonList = document.createElement("div");
      lessonList.className = "plan-lesson-list";
      for (const lessonId of plan) {
        const meta = findLessonMeta(lessonId);
        if (!meta) continue;
        const status = progress[lessonId];
        const item = document.createElement("div");
        item.className = "plan-lesson-item";
        if (status === "complete") item.classList.add("is-complete");
        const statusIcon = document.createElement("span");
        statusIcon.className = "lesson-card__status";
        statusIcon.textContent = lessonStatusIcon(lessonId);
        let statusText;
        if (status === "complete") statusText = t("lessonStatusComplete");
        else if (status === "skipped") statusText = t("lessonStatusSkipped");
        else statusText = t("lessonStatusInProgress");
        statusIcon.setAttribute("aria-label", statusText);
        const titleEl = document.createElement("span");
        titleEl.className = "plan-lesson-title";
        titleEl.textContent =
          dataService.getLocalizedText(meta.title, preferredAppLanguages()) ||
          meta.id;
        item.append(statusIcon, titleEl);
        lessonList.appendChild(item);
      }
      body.appendChild(lessonList);
      const actions = document.createElement("div");
      actions.className = "plan-actions";
      const editBtn = document.createElement("button");
      editBtn.type = "button";
      editBtn.className = "button button--wide";
      editBtn.dataset.action = "edit-plan";
      editBtn.textContent = t("editStudyPlan");
      const deleteBtn = document.createElement("button");
      deleteBtn.type = "button";
      deleteBtn.className = "button button--wide";
      deleteBtn.dataset.action = "delete-plan";
      deleteBtn.textContent = t("deleteStudyPlan");
      actions.append(editBtn, deleteBtn);
      body.appendChild(actions);
    }
    section.appendChild(body);
    return section;
  }

  function renderNextUpCard() {
    // 1. Determine the lesson to preview
    let previewId = nextUpPreviewId;
    if (!previewId) {
      if (studyPlanService && studyPlanService.hasPlan()) {
        previewId = studyPlanService.getNextLesson();
      } else {
        const nextLesson = getNextBrowseLesson();
        if (nextLesson) previewId = nextLesson.id;
      }
    }
    if (!previewId) return null;

    const meta = findLessonMeta(previewId);
    if (!meta) return null;

    const context = getNavigationContext(previewId);

    // 2. Build DOM
    const card = document.createElement("div");
    card.className = "next-up-card";

    // Row 1: Title (h3)
    const title = document.createElement("h3");
    title.className = "next-up-card__title";
    title.textContent =
      dataService.getLocalizedText(meta.title, preferredAppLanguages()) ||
      meta.id;
    card.appendChild(title);

    // Row 2: Meta (Level + Grammar Badges)
    const metaRow = document.createElement("div");
    metaRow.className = "next-up-card__meta";

    const prof = meta.proficiency || "beginner";
    let tierIcon = TIER_ICONS.introductory;
    if (prof === "intermediate") tierIcon = TIER_ICONS.intermediate;
    else if (prof === "advanced") tierIcon = TIER_ICONS.advanced;

    const levelSpan = document.createElement("span");
    levelSpan.className = "next-up-card__level";
    levelSpan.textContent = `${tierIcon} ${getTierLabelForLesson(meta)}`;
    metaRow.appendChild(levelSpan);

    if (Array.isArray(meta.rules) && meta.rules.length > 0) {
      meta.rules.forEach((ruleId) => {
        const rule = (manifest.grammar_rules || []).find(
          (r) => r.id === ruleId,
        );
        if (!rule) return;
        const badge = document.createElement("button");
        badge.type = "button";
        badge.className = "grammar-badge";
        badge.dataset.action = "open-grammar-rule";
        badge.dataset.ruleId = ruleId;
        badge.textContent = `🧩 ${dataService.getLocalizedText(rule.title, preferredAppLanguages()) || ruleId}`;
        metaRow.appendChild(badge);
      });
    }
    card.appendChild(metaRow);

    // Row 3: Navigation (Prev, Progress, Next) + Open Button
    const navRow = document.createElement("div");
    navRow.className = "next-up-card__nav";

    const prevBtn = document.createElement("button");
    prevBtn.type = "button";
    prevBtn.className = "button";
    prevBtn.dataset.action = "next-up-preview-prev";
    prevBtn.textContent = "◀";
    prevBtn.disabled = !context.prevId;
    navRow.appendChild(prevBtn);

    const progress = document.createElement("span");
    progress.className = "next-up-card__progress";
    progress.textContent = `${context.index + 1} / ${context.list.length}`;
    navRow.appendChild(progress);

    const nextBtn = document.createElement("button");
    nextBtn.type = "button";
    nextBtn.className = "button";
    nextBtn.dataset.action = "next-up-preview-next";
    nextBtn.textContent = "▶";
    nextBtn.disabled = !context.nextId;
    navRow.appendChild(nextBtn);

    // Open Button (pushed to the right via CSS margin-inline-start: auto)
    const openBtn = document.createElement("button");
    openBtn.type = "button";
    openBtn.className = "button next-up-card__open";
    openBtn.dataset.action = "next-up-continue";
    openBtn.dataset.lessonId = previewId;
    openBtn.textContent = t("open");
    navRow.appendChild(openBtn);

    card.appendChild(navRow);

    return card;
  }

  function handleNextUpSkip(lessonId) {
    if (!studyPlanService) return;
    studyPlanService.markLesson(lessonId, "skipped");
    renderHome();
  }
  function handleEditPlan() {
    renderOnboarding();
  }
  function normalizeOnboardingAnswers(saved) {
    const validGoals = ["travel", "business", "everyday", "exam"];
    const validLevels = ["beginner", "some", "basic", "advanced"];
    const validUsage = ["reading", "speaking", "media", "writing"];
    return {
      goal: validGoals.includes(saved?.goal) ? saved.goal : "",
      level: validLevels.includes(saved?.level) ? saved.level : "",
      usage: Array.isArray(saved?.usage)
        ? saved.usage.filter((value) => validUsage.includes(value))
        : [],
    };
  }
  function collectOnboardingAnswers() {
    const view = elements.onboardingView;
    if (!view) return normalizeOnboardingAnswers({});
    const goal =
      view.querySelector('input[name="onboarding-goal"]:checked')?.value || "";
    const level =
      view.querySelector('input[name="onboarding-level"]:checked')?.value || "";
    const usage = Array.from(
      view.querySelectorAll('input[name="onboarding-usage"]:checked'),
    ).map((input) => input.value);
    return normalizeOnboardingAnswers({ goal, level, usage });
  }
  function saveCurrentOnboardingAnswers() {
    saveJSON(STORAGE_KEYS.onboardingAnswers, collectOnboardingAnswers());
  }
  function refreshOnboardingGenerateButton() {
    const view = elements.onboardingView;
    if (!view) return;
    const generateButton = view.querySelector('[data-action="generate-plan"]');
    const hint = view.querySelector(".onboarding-hint");
    if (!generateButton) return;
    const answers = collectOnboardingAnswers();
    const disabled = !answers.goal || !answers.level;
    generateButton.disabled = disabled;
    if (hint) hint.hidden = !disabled;
  }
  function renderOnboarding() {
    showView("onboarding");
    const view = elements.onboardingView;
    view.innerHTML = "";
    const saved = loadJSON(STORAGE_KEYS.onboardingAnswers, {});
    const answers = normalizeOnboardingAnswers(saved);
    const stage = document.createElement("div");
    stage.className = "onboarding-stage";
    const title = document.createElement("h2");
    title.className = "onboarding-title";
    title.textContent = t("onboardingTitle");
    stage.appendChild(title);
    const intro = document.createElement("p");
    intro.className = "onboarding-intro";
    intro.textContent = t("onboardingIntro");
    stage.appendChild(intro);
    const goalSection = document.createElement("section");
    goalSection.className = "sheet-section";
    const goalTitle = document.createElement("h3");
    goalTitle.className = "sheet-section__title";
    goalTitle.textContent = t("onboardingGoal");
    goalSection.appendChild(goalTitle);
    const goalOptions = document.createElement("div");
    goalOptions.className = "onboarding-options";
    const goalValues = [
      ["travel", t("onboardingGoalTravel")],
      ["business", t("onboardingGoalBusiness")],
      ["everyday", t("onboardingGoalEveryday")],
      ["exam", t("onboardingGoalExam")],
    ];
    goalValues.forEach(([value, label]) => {
      const option = document.createElement("label");
      option.className = "onboarding-option";
      const input = document.createElement("input");
      input.type = "radio";
      input.name = "onboarding-goal";
      input.value = value;
      input.checked = answers.goal === value;
      input.addEventListener("change", () => {
        saveCurrentOnboardingAnswers();
        refreshOnboardingGenerateButton();
      });
      const text = document.createElement("span");
      text.className = "onboarding-option__label";
      text.textContent = label;
      option.append(input, text);
      goalOptions.appendChild(option);
    });
    goalSection.appendChild(goalOptions);
    stage.appendChild(goalSection);
    const levelSection = document.createElement("section");
    levelSection.className = "sheet-section";
    const levelTitle = document.createElement("h3");
    levelTitle.className = "sheet-section__title";
    levelTitle.textContent = t("onboardingLevel");
    levelSection.appendChild(levelTitle);
    const levelOptions = document.createElement("div");
    levelOptions.className = "onboarding-options";
    const levelValues = [
      ["beginner", t("onboardingLevelBeginner")],
      ["some", t("onboardingLevelSome")],
      ["basic", t("onboardingLevelBasic")],
      ["advanced", t("onboardingLevelAdvanced")],
    ];
    levelValues.forEach(([value, label]) => {
      const option = document.createElement("label");
      option.className = "onboarding-option";
      const input = document.createElement("input");
      input.type = "radio";
      input.name = "onboarding-level";
      input.value = value;
      input.checked = answers.level === value;
      input.addEventListener("change", () => {
        saveCurrentOnboardingAnswers();
        refreshOnboardingGenerateButton();
      });
      const text = document.createElement("span");
      text.className = "onboarding-option__label";
      text.textContent = label;
      option.append(input, text);
      levelOptions.appendChild(option);
    });
    levelSection.appendChild(levelOptions);
    stage.appendChild(levelSection);
    const usageSection = document.createElement("section");
    usageSection.className = "sheet-section";
    const usageTitle = document.createElement("h3");
    usageTitle.className = "sheet-section__title";
    usageTitle.textContent = t("onboardingUsage");
    usageSection.appendChild(usageTitle);
    const usageOptions = document.createElement("div");
    usageOptions.className = "onboarding-options";
    const usageValues = [
      ["reading", t("onboardingUsageReading")],
      ["speaking", t("onboardingUsageSpeaking")],
      ["media", t("onboardingUsageMedia")],
      ["writing", t("onboardingUsageWriting")],
    ];
    usageValues.forEach(([value, label]) => {
      const option = document.createElement("label");
      option.className = "onboarding-option";
      const input = document.createElement("input");
      input.type = "checkbox";
      input.name = "onboarding-usage";
      input.value = value;
      input.checked = answers.usage.includes(value);
      input.addEventListener("change", () => {
        saveCurrentOnboardingAnswers();
        refreshOnboardingGenerateButton();
      });
      const text = document.createElement("span");
      text.className = "onboarding-option__label";
      text.textContent = label;
      option.append(input, text);
      usageOptions.appendChild(option);
    });
    usageSection.appendChild(usageOptions);
    stage.appendChild(usageSection);
    const actions = document.createElement("div");
    actions.className = "onboarding-actions";
    const generateButton = document.createElement("button");
    generateButton.type = "button";
    generateButton.className = "button button--wide";
    generateButton.dataset.action = "generate-plan";
    generateButton.textContent = t("generateStudyPlan");
    const skipButton = document.createElement("button");
    skipButton.type = "button";
    skipButton.className = "button button--wide";
    skipButton.dataset.action = "skip-onboarding";
    skipButton.textContent = t("skipOnboarding");
    actions.append(generateButton, skipButton);
    stage.appendChild(actions);
    const hint = document.createElement("p");
    hint.className = "onboarding-hint";
    hint.textContent = t("onboardingGenerateHint");
    stage.appendChild(hint);
    view.appendChild(stage);
    refreshOnboardingGenerateButton();
  }
  function generateStudyPlan() {
    const answers = collectOnboardingAnswers();
    if (!answers.goal || !answers.level) return;
    saveJSON(STORAGE_KEYS.onboardingAnswers, answers);
    const oldProgress = studyPlanService.getProgress();
    studyPlanService.generate(answers);
    const newPlan = studyPlanService.getPlan();
    const updatedProgress = studyPlanService.getProgress();
    for (const lessonId of newPlan) {
      const oldStatus = oldProgress[lessonId];
      if (oldStatus === "complete" || oldStatus === "skipped")
        updatedProgress[lessonId] = oldStatus;
    }
    saveJSON(STORAGE_KEYS.studyPlanProgress, updatedProgress);
    saveJSON(STORAGE_KEYS.onboardingComplete, true);
    renderHome();
  }
  function skipOnboarding() {
    saveCurrentOnboardingAnswers();
    saveJSON(STORAGE_KEYS.onboardingComplete, true);
    renderHome();
  }
  function goHome() {
    renderHome();
  }

  function lessonBelongsToActiveTarget(lesson) {
    const target = state?.settings?.targetLanguage;
    if (!target) return false;
    // v3.1 Architecture: Use 'targets' for pedagogical routing.
    const targets = lesson.targets || [];
    if (!targets.length) return true;
    return targets.includes(target);
  }

  function filterTopicsForActiveTarget(topics) {
    if (!Array.isArray(topics)) return [];
    return topics
      .map((topic) => {
        const validBooks = (topic.books || [])
          .map((book) => {
            const validLessons = (book.lessons || []).filter(
              lessonBelongsToActiveTarget,
            );
            if (!validLessons.length) return null; // Hide book if no lessons match
            return { ...book, lessons: validLessons };
          })
          .filter(Boolean);

        if (!validBooks.length) return null; // Hide topic if no books match
        return { ...topic, books: validBooks };
      })
      .filter(Boolean);
  }

  function filterCategoriesForActiveTarget(categories) {
    const source = Array.isArray(categories) ? categories : [];

    return source
      .map((category) => {
        const lessons = Array.isArray(category?.lessons)
          ? category.lessons.filter(lessonBelongsToActiveTarget)
          : [];

        if (!lessons.length) return null;

        return {
          ...category,
          lessons,
        };
      })
      .filter(Boolean);
  }

  function renderCategory(category) {
    const wrap = document.createElement("div");
    wrap.className = "category";
    const isOpen = openCategories.has(category.id);
    const progressMap = studyPlanService ? studyPlanService.getProgress() : {};
    const header = document.createElement("button");
    header.type = "button";
    header.className = "category__header";
    header.dataset.action = "toggle-category";
    header.dataset.categoryId = category.id;
    const icon = document.createElement("span");
    icon.className = "category__icon";
    icon.textContent = CATEGORY_ICONS[category.id] || "";
    const title = document.createElement("span");
    title.className = "category__title";
    title.textContent =
      dataService.getLocalizedText(category.title, preferredAppLanguages()) ||
      category.id;
    const titleGroup = document.createElement("span");
    titleGroup.className = "category__title-group";
    titleGroup.append(icon, title);
    const lessons = category.lessons || [];
    const tried = lessons.filter((lesson) =>
      lessonsTried.has(lesson.id),
    ).length;
    const counter = document.createElement("span");
    counter.className = "category__progress";
    counter.textContent = tried + "/" + lessons.length;
    const chevron = document.createElement("span");
    chevron.className = "category__chevron";
    chevron.textContent = isOpen ? "\u25BE" : "\u25B8";
    header.append(titleGroup, counter, chevron);
    wrap.appendChild(header);
    if (isOpen) {
      const lessonsEl = document.createElement("div");
      lessonsEl.className = "category__lessons";
      lessons.forEach((lesson) => {
        const status = progressMap[lesson.id];
        const button = document.createElement("button");
        button.type = "button";
        button.className = "lesson-card";
        if (status === "complete") button.classList.add("is-complete");
        button.dataset.action = "open-lesson";
        button.dataset.lessonId = lesson.id;
        const statusIcon = document.createElement("span");
        statusIcon.className = "lesson-card__status";
        statusIcon.textContent = statusToIcon(status);
        const titleEl = document.createElement("span");
        titleEl.className = "lesson-card__title";
        titleEl.textContent =
          dataService.getLocalizedText(lesson.title, preferredAppLanguages()) ||
          lesson.id;
        button.append(statusIcon, titleEl);
        lessonsEl.appendChild(button);
      });
      wrap.appendChild(lessonsEl);
    }
    return wrap;
  }

  function renderBrowseByTopic() {
    const topics = filterTopicsForActiveTarget(manifest.topics || []);
    if (!topics.length) return null;
    const wrap = document.createElement("div");
    wrap.className = "category-list";
    for (const topic of topics) wrap.appendChild(renderTopicPanel(topic));
    return wrap;
  }

  function renderTopicPanel(topic) {
    const wrap = document.createElement("div");
    wrap.className = "proficiency-tier";
    const openKey = "topic:" + topic.id;
    const isOpen = openCategories.has(openKey);
    const totalLessons = (topic.books || []).reduce(
      (sum, book) => sum + (book.lessons || []).length,
      0,
    );
    const triedLessons = (topic.books || []).reduce((sum, book) => {
      for (const lesson of book.lessons || [])
        if (lessonsTried.has(lesson.id)) sum += 1;
      return sum;
    }, 0);
    const header = document.createElement("button");
    header.type = "button";
    header.className = "proficiency-tier__header";
    header.dataset.action = "toggle-topic";
    header.dataset.topicId = topic.id;
    const icon = document.createElement("span");
    icon.className = "proficiency-tier__icon";
    icon.textContent = TOPIC_ICON;
    const title = document.createElement("span");
    title.className = "proficiency-tier__title";
    title.textContent =
      dataService.getLocalizedText(topic.title, preferredAppLanguages()) ||
      topic.id;
    const titleGroup = document.createElement("span");
    titleGroup.className = "proficiency-tier__title-group";
    titleGroup.append(icon, title);
    const progress = document.createElement("span");
    progress.className = "proficiency-tier__progress";
    progress.textContent = triedLessons + "/" + totalLessons;
    const chevron = document.createElement("span");
    chevron.className = "category__chevron";
    chevron.textContent = isOpen ? "\u25BE" : "\u25B8";
    header.append(titleGroup, progress, chevron);
    wrap.appendChild(header);
    if (isOpen) {
      const body = document.createElement("div");
      body.className = "proficiency-tier__body";
      for (const book of topic.books || [])
        body.appendChild(renderBookPanel(book));
      wrap.appendChild(body);
    }
    return wrap;
  }
  function renderBookPanel(book) {
    const wrap = document.createElement("div");
    wrap.className = "category";
    const openKey = "book:" + book.id;
    const isOpen = openCategories.has(openKey);
    const progressMap = studyPlanService ? studyPlanService.getProgress() : {};
    const header = document.createElement("button");
    header.type = "button";
    header.className = "category__header";
    header.dataset.action = "toggle-book";
    header.dataset.bookId = book.id;
    const icon = document.createElement("span");
    icon.className = "category__icon";
    icon.textContent = BOOK_ICON;
    const title = document.createElement("span");
    title.className = "category__title";
    title.textContent =
      dataService.getLocalizedText(book.title, preferredAppLanguages()) ||
      book.id;
    const titleGroup = document.createElement("span");
    titleGroup.className = "category__title-group";
    titleGroup.append(icon, title);
    const chevron = document.createElement("span");
    chevron.className = "category__chevron";
    chevron.textContent = isOpen ? "\u25BE" : "\u25B8";
    header.append(titleGroup, chevron);
    wrap.appendChild(header);
    if (isOpen) {
      const lessons = document.createElement("div");
      lessons.className = "category__lessons";
      for (const lesson of book.lessons || []) {
        const status = progressMap[lesson.id];
        const button = document.createElement("button");
        button.type = "button";
        button.className = "lesson-card";
        if (status === "complete") button.classList.add("is-complete");
        button.dataset.action = "open-lesson";
        button.dataset.lessonId = lesson.id;
        const statusIcon = document.createElement("span");
        statusIcon.className = "lesson-card__status";
        statusIcon.textContent = statusToIcon(status);
        const titleEl = document.createElement("span");
        titleEl.className = "lesson-card__title";
        titleEl.textContent =
          dataService.getLocalizedText(lesson.title, preferredAppLanguages()) ||
          lesson.id;
        button.append(statusIcon, titleEl);
        lessons.appendChild(button);
      }
      wrap.appendChild(lessons);
    }
    return wrap;
  }
  function statusToIcon(status) {
    if (status === "complete") return "\u2705";
    if (status === "skipped") return "\u23ED";
    return "\u25B6";
  }
  function lessonStatusIcon(lessonId) {
    const progress = studyPlanService ? studyPlanService.getProgress() : {};
    return statusToIcon(progress[lessonId]);
  }
  function toggleCategory(id) {
    if (openCategories.has(id)) openCategories.delete(id);
    else openCategories.add(id);
    renderHome();
  }
  function toggleTier(tierId) {
    const key = "tier:" + tierId;
    if (openCategories.has(key)) openCategories.delete(key);
    else openCategories.add(key);
    renderHome();
  }
  function toggleTopic(topicId) {
    const key = "topic:" + topicId;
    if (openCategories.has(key)) openCategories.delete(key);
    else openCategories.add(key);
    renderHome();
  }
  function toggleBook(bookId) {
    const key = "book:" + bookId;
    if (openCategories.has(key)) openCategories.delete(key);
    else openCategories.add(key);
    renderHome();
  }
  function toggleProgressSection(key) {
    if (openProgressSections.has(key)) openProgressSections.delete(key);
    else openProgressSections.add(key);
    renderProgress();
  }
  function toggleLessonSection(sectionKey) {
    if (openLessonSections.has(sectionKey))
      openLessonSections.delete(sectionKey);
    else openLessonSections.add(sectionKey);
    renderLesson();
  }
  function handleDeletePlan() {
    if (!studyPlanService) return;
    if (!window.confirm(t("deleteStudyPlanConfirm"))) return;
    studyPlanService.reset();
    clearProgressKeys([STORAGE_KEYS.lessonBaseStatus]);
    renderProgress();
  }
  function findLessonMeta(lessonId) {
    for (const category of manifest.categories || []) {
      for (const lesson of category.lessons || [])
        if (lesson.id === lessonId) return lesson;
    }
    for (const topic of manifest.topics || []) {
      for (const book of topic.books || []) {
        for (const lesson of book.lessons || [])
          if (lesson.id === lessonId) return lesson;
      }
    }
    return null;
  }

  async function loadLessonFile(path) {
    // v3.1: path is now static and absolute. No {lang} replacement needed.
    try {
      const response = await fetch(path, { cache: "no-cache" });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("Zabon: unable to load lesson file", resolvedPath, error);
      return { items: [], failed: true };
    }
  }
  async function openLesson(lessonId) {
    const lessonMeta = findLessonMeta(lessonId);
    if (!lessonMeta) return;
    markLessonTried(lessonMeta.id);
    const content = await loadLessonFile(lessonMeta.file);
    currentLesson = {
      meta: lessonMeta,
      items: Array.isArray(content.items) ? content.items : [],
      failed: Boolean(content.failed),
    };
    // Stage 4: Allow the lesson JSON file to override the manifest's displayMode
    if (content.displayMode) {
      currentLesson.meta = {
        ...currentLesson.meta,
        displayMode: content.displayMode,
      };
    }
    dataService = new DataService({ items: currentLesson.items }, registry);
    flashcardService = new FlashcardService({ dataService, registry });
    quizService = new QuizService({ dataService, registry });
    flashcardSession = null;
    quizSession = null;
    buildSession = null;
    buildCurrent = null;

    openLessonSections.clear();

    // Dynamically open all scenario and vocabulary sections by default on first load
    for (const item of currentLesson.items) {
      if (item.header) {
        openLessonSections.add(`lesson:section:${item.id}`);
      }
    }

    resetQuizSessionSeed();
    ensureExerciseConfigs();
    renderLesson();
  }
  function ensureExerciseConfigs() {
    const langs = selectedLessonLanguages();
    const appLang = state.settings.appLanguage;
    const targetLang = state.settings.targetLanguage;
    flashcardConfig.promptLanguage = langs.includes(targetLang)
      ? targetLang
      : langs[0] || "";
    flashcardConfig.revealLanguages = flashcardConfig.revealLanguages.filter(
      (code) => langs.includes(code) && code !== flashcardConfig.promptLanguage,
    );
    if (flashcardConfig.revealLanguages.length === 0) {
      const reveal =
        langs.find(
          (c) => c !== flashcardConfig.promptLanguage && c === appLang,
        ) || langs.find((c) => c !== flashcardConfig.promptLanguage);
      if (reveal) flashcardConfig.revealLanguages = [reveal];
    }
    if (!langs.includes(quizConfig.questionLanguage))
      quizConfig.questionLanguage = langs.includes(targetLang)
        ? targetLang
        : langs[0] || "";
    if (
      !langs.includes(quizConfig.answerLanguage) ||
      quizConfig.answerLanguage === quizConfig.questionLanguage
    ) {
      quizConfig.answerLanguage =
        langs.find((c) => c !== quizConfig.questionLanguage && c === appLang) ||
        langs.find((c) => c !== quizConfig.questionLanguage) ||
        "";
    }
  }

  function splitItemsByKind(items) {
    const list = Array.isArray(items) ? items : [];
    const headerTargets = new Map();

    // First pass: determine what follows each header
    for (let i = 0; i < list.length; i += 1) {
      const header = list[i];
      if (!header?.header) continue;

      let hasWord = false;
      let hasSentence = false;

      for (let j = i + 1; j < list.length; j += 1) {
        const nextItem = list[j];
        if (!nextItem) break;
        if (nextItem.header) break; // Stop at the next header

        const kind = dataService.getItemKind(nextItem);
        if (kind === "sentence") hasSentence = true;
        else hasWord = true;
      }

      // FIX: Always mark headers as having content if they are valid headers,
      // so they don't disappear if they are consecutive or at the end of the file.
      headerTargets.set(header, {
        hasWord: hasWord || !hasSentence,
        hasSentence,
      });
    }

    const wordItems = [];
    const sentenceItems = [];

    for (const item of list) {
      if (item.header) {
        const targets = headerTargets.get(item) || {
          hasWord: true,
          hasSentence: false,
        };
        if (targets.hasWord) wordItems.push(item);
        if (targets.hasSentence) sentenceItems.push(item);
        continue;
      }

      // Fallback: If an item lacks "kind" but has no spaces and is short, treat as word
      // to prevent it from being hidden in the "Sentences" section unexpectedly.
      const kind = dataService.getItemKind(item);
      if (kind === "sentence") {
        const text = dataService.getText(
          item,
          state.settings.targetLanguage || "en",
        );
        if (text && !text.includes(" ") && text.length < 15) {
          wordItems.push(item);
          continue;
        }
        sentenceItems.push(item);
      } else {
        wordItems.push(item);
      }
    }

    return { wordItems, sentenceItems };
  }

  function renderLesson() {
    showView("lesson");
    const view = elements.lessonView;
    view.innerHTML = "";
    const header = document.createElement("div");
    header.className = "document-header";
    const back = document.createElement("button");
    back.type = "button";
    back.className = "button";
    back.dataset.action = "back-home";
    back.textContent = "\u2190";
    back.setAttribute("aria-label", t("back"));
    const title = document.createElement("h2");
    title.className = "document-title";
    title.textContent =
      dataService.getLocalizedText(
        currentLesson.meta.title,
        preferredAppLanguages(),
      ) || currentLesson.meta.id;
    header.append(back, title);
    view.appendChild(header);
    if (currentLesson.failed) {
      view.appendChild(makeEmptyState(t("lessonLoadError")));
      const retry = document.createElement("button");
      retry.type = "button";
      retry.className = "button button--wide";
      retry.dataset.action = "retry-lesson";
      retry.textContent = t("tryAgain");
      view.appendChild(retry);
      return;
    }
    const langs = selectedLessonLanguages();
    if (!langs.length) {
      view.appendChild(makeEmptyState(t("noLanguagesSelected")));
      return;
    }

    const items = currentLesson.items;

    // --- DYNAMIC GROUPING: Group items sequentially by their headers ---
    const sections = [];
    let currentSection = { header: null, items: [] };

    for (const item of items) {
      if (item.header) {
        if (currentSection.header || currentSection.items.length > 0) {
          sections.push(currentSection);
        }
        currentSection = { header: item, items: [] };
      } else {
        currentSection.items.push(item);
      }
    }
    if (currentSection.header || currentSection.items.length > 0) {
      sections.push(currentSection);
    }

    // Render each grouped section as its own collapsible panel
    sections.forEach((section, index) => {
      const sectionKey = section.header
        ? `lesson:section:${section.header.id}`
        : `lesson:section:fallback:${index}`;

      const titleText = section.header
        ? dataService.getLocalizedText(
            section.header.texts,
            preferredAppLanguages(),
          ) || section.header.id
        : t("sentences");

      view.appendChild(
        renderLessonSection(titleText, section.items, langs, sectionKey),
      );
    });

    renderCompleteToggle();
  }
  function renderCompleteToggle() {
    [elements.actionBar, elements.bottomBar].forEach((bar) => {
      if (bar) {
        const existing = bar.querySelector(".complete-toggle");
        if (existing) existing.remove();
      }
    });
    const targetBar = elements.bottomBar;
    if (!targetBar || !currentLesson) return;
    const lessonId = currentLesson.meta.id;
    const progress = studyPlanService ? studyPlanService.getProgress() : {};
    const isComplete = progress[lessonId] === "complete";
    const label = document.createElement("label");
    label.className = "complete-toggle";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = isComplete;
    checkbox.addEventListener("change", () => {
      setLessonComplete(lessonId, checkbox.checked);
    });
    const text = document.createElement("span");
    text.className = "complete-toggle__label";
    text.textContent = t("completeQuestion");
    label.append(checkbox, text);
    const settingsBtn = targetBar.querySelector(
      '[data-action="open-settings"]',
    );
    if (settingsBtn) targetBar.insertBefore(label, settingsBtn);
    else targetBar.appendChild(label);
  }
  function setLessonComplete(lessonId, complete) {
    if (!studyPlanService) return;
    const baseStatusMap = loadJSON(STORAGE_KEYS.lessonBaseStatus, {});
    if (complete) {
      const currentStatus = studyPlanService.getProgress()[lessonId];
      if (currentStatus !== "complete") {
        baseStatusMap[lessonId] = currentStatus || "in-progress";
        saveJSON(STORAGE_KEYS.lessonBaseStatus, baseStatusMap);
      }
      studyPlanService.markLesson(lessonId, "complete");
    } else {
      const saved = baseStatusMap[lessonId];
      const restored =
        saved === "skipped" || saved === "in-progress" ? saved : "in-progress";
      delete baseStatusMap[lessonId];
      saveJSON(STORAGE_KEYS.lessonBaseStatus, baseStatusMap);
      studyPlanService.markLesson(lessonId, restored);
    }
  }

  function ensureAllSectionsOpen() {
    // Dynamically find all rendered lesson section headers and open them
    document
      .querySelectorAll("[data-action='toggle-lesson-section']")
      .forEach((btn) => {
        if (btn.dataset.sectionKey) {
          openLessonSections.add(btn.dataset.sectionKey);
        }
      });
  }

  function renderLessonSection(titleText, items, langs, sectionKey) {
    const section = document.createElement("section");
    section.className = "lesson-section";
    const isOpen = openLessonSections.has(sectionKey);
    const header = document.createElement("button");
    header.type = "button";
    header.className = "lesson-section__header";
    header.dataset.action = "toggle-lesson-section";
    header.dataset.sectionKey = sectionKey;
    const title = document.createElement("span");
    title.className = "lesson-section__title";
    title.textContent = titleText;
    const chevron = document.createElement("span");
    chevron.className = "lesson-section__chevron";
    chevron.textContent = isOpen ? "\u25BE" : "\u25B8";
    header.append(title, chevron);
    section.appendChild(header);
    if (!isOpen) return section;
    const body = document.createElement("div");
    body.className = "lesson-section__body";
    if (!items.length) body.appendChild(makeEmptyState(t("noItems")));
    else {
      const row = document.createElement("div");
      row.className = "item-row";
      // Stage 5: Force the structural row direction to match the App Language.
      // This ensures the column order (e.g., Farsi then English) stays consistent,
      // while the text inside each cell respects its own RTL/LTR direction.
      row.dir = registry.dir(state.settings.appLanguage);
      items.forEach((item) => row.appendChild(renderItemColumn(item, langs)));
      body.appendChild(row);
    }
    section.appendChild(body);
    return section;
  }
  function renderItemColumn(item, langs) {
    if (item.header) {
      const column = document.createElement("div");
      column.className = "item-column item-column--header";
      column.dataset.itemId = item.id;
      column.dataset.kind = "header";
      const heading = document.createElement("div");
      heading.className = "lesson-section__title";
      heading.textContent = dataService.getLocalizedText(
        item.texts,
        preferredAppLanguages(),
      );
      column.appendChild(heading);
      return column;
    }
    const column = document.createElement("div");
    column.className = "item-column";
    column.dataset.itemId = item.id;
    column.dataset.kind = dataService.getItemKind(item);
    if (currentLesson?.meta?.displayMode === "phonetic")
      column.appendChild(renderPhoneticCell(item));
    else if (currentLesson?.meta?.displayMode === "script")
      column.appendChild(renderScriptCell(item));
    else
      langs.forEach((code) =>
        column.appendChild(renderLanguageCell(item, code)),
      );
    return column;
  }

  function parseScriptConnections(connections) {
    const forms = {
      isolated: "",
      initial: "",
      medial: "",
      final: "",
    };

    if (!connections) return forms;

    if (typeof connections === "object") {
      Object.keys(forms).forEach((key) => {
        if (typeof connections[key] === "string") {
          forms[key] = connections[key].trim();
        }
      });
      return forms;
    }

    if (typeof connections === "string") {
      connections.split("|").forEach((pair) => {
        const index = pair.indexOf(":");
        if (index === -1) return;

        const key = pair.slice(0, index).trim().toLowerCase();
        const value = pair.slice(index + 1).trim();

        if (Object.prototype.hasOwnProperty.call(forms, key)) {
          forms[key] = value;
        }
      });
    }

    return forms;
  }

  function renderLanguageCell(item, code) {
    const kind = dataService.getItemKind(item);
    const text = dataService.getText(item, code);
    const cell = document.createElement("div");
    cell.className = "language-cell";
    cell.dataset.itemId = item.id;
    cell.dataset.lang = code;
    cell.dataset.action = "speak-cell";
    cell.dir = registry.dir(code);
    if (!text) {
      cell.classList.add("language-cell--missing");
      const span = document.createElement("span");
      span.className = "language-cell__text";
      span.lang = registry.bcp47(code);
      span.textContent = "\u2014";
      cell.appendChild(span);
      return cell;
    }
    if (kind === "sentence") {
      const container = document.createElement("span");
      container.className = "sentence-text";
      container.lang = registry.bcp47(code);
      if (registry.segmentation(code) === "segmenter")
        container.classList.add("sentence-text--compact");
      const tokens = dataService.tokenize(item, code);
      if (tokens.length) {
        tokens.forEach((token) => {
          const span = document.createElement("span");
          span.className = "sentence-token";
          span.dataset.tokenId = String(token.id);
          span.lang = registry.bcp47(code);
          span.textContent = token.text;
          container.appendChild(span);
        });
      } else {
        container.textContent = text;
      }
      cell.appendChild(container);
    } else {
      const span = document.createElement("span");
      span.className = "language-cell__text";
      span.lang = registry.bcp47(code);
      span.textContent = text;
      cell.appendChild(span);
    }
    return cell;
  }
  function renderPhoneticCell(item) {
    const code = state.settings.targetLanguage;
    const text = dataService.getText(item, code);
    const note = dataService.getLocalizedText(
      item.phonetic,
      preferredAppLanguages(),
    );
    const cell = document.createElement("div");
    cell.className = "language-cell phonetic-cell";
    cell.dataset.itemId = item.id;
    cell.dataset.lang = code;
    cell.dataset.action = "speak-cell";
    cell.dir = registry.dir(code);
    const charSpan = document.createElement("span");
    charSpan.className = "language-cell__text phonetic-cell__char";
    charSpan.lang = registry.bcp47(code);
    charSpan.textContent = text;
    cell.appendChild(charSpan);
    if (note) {
      const noteSpan = document.createElement("span");
      noteSpan.className = "phonetic-cell__note";
      noteSpan.textContent = note;
      cell.appendChild(noteSpan);
    }
    return cell;
  }

  function renderScriptCell(item) {
    const code = state.settings.targetLanguage;
    const text = dataService.getText(item, code);
    const cell = document.createElement("div");
    cell.className = "language-cell script-cell";
    cell.dataset.itemId = item.id;
    cell.dataset.lang = code;
    cell.dataset.action = "speak-cell";
    cell.dir = registry.dir(code);

    const charSpan = document.createElement("span");
    charSpan.className = "language-cell__text script-cell__char";
    charSpan.lang = registry.bcp47(code);
    charSpan.textContent = text;
    cell.appendChild(charSpan);

    // 1. Render the Perso-Arabic connections grid
    if (item.connections) {
      const forms = parseScriptConnections(item.connections);
      const grid = document.createElement("div");
      grid.className = "script-cell__forms";

      ["isolated", "initial", "medial", "final"].forEach((formName) => {
        const val = forms[formName];
        if (!val) return;

        const col = document.createElement("div");
        col.className = "script-cell__form-col";

        const glyph = document.createElement("span");
        glyph.lang = registry.bcp47(code);
        glyph.dir = "rtl";
        glyph.textContent = val;

        const label = document.createElement("span");
        label.className = "script-cell__form-label";
        label.textContent = formName;

        col.appendChild(glyph);
        col.appendChild(label);
        grid.appendChild(col);
      });
      cell.appendChild(grid);
    }

    // 2. Render the phonetic/translation note (Smart Fallback)
    let note = "";
    // Priority 1: Explicit phonetic field
    if (item.phonetic) {
      note = dataService.getLocalizedText(
        item.phonetic,
        preferredAppLanguages(),
      );
    }
    // Priority 2: Fallback to bridge language in texts (e.g., English)
    if (!note) {
      const bridgeLang = preferredAppLanguages().find(
        (l) => l !== code && dataService.hasText(item, l),
      );
      if (bridgeLang) {
        note = dataService.getText(item, bridgeLang);
      }
    }

    if (note) {
      const noteSpan = document.createElement("span");
      noteSpan.className = "script-cell__note";
      noteSpan.textContent = note;
      cell.appendChild(noteSpan);
    }

    return cell;
  }

  function getCellElement(itemId, lang) {
    return document.querySelector(
      `.language-cell[data-item-id="${cssEscape(itemId)}"][data-lang="${cssEscape(lang)}"]`,
    );
  }
  function openSettings() {
    renderSettings();
    elements.settingsSheet.hidden = false;
  }

  function closeSettings() {
    elements.settingsSheet.hidden = true;
  }

  // v3.1 Stage 2: Grammar Rule Overlay
  function openGrammarOverlay(ruleId) {
    const rule = (manifest.grammar_rules || []).find((r) => r.id === ruleId);
    if (!rule) return;

    const sheet = document.createElement("div");
    sheet.className = "sheet";
    sheet.id = "grammar-overlay";

    const backdrop = document.createElement("div");
    backdrop.className = "sheet__backdrop";
    backdrop.dataset.action = "close-grammar-overlay";
    sheet.appendChild(backdrop);

    const panel = document.createElement("div");
    panel.className = "sheet__panel";

    const header = document.createElement("div");
    header.className = "sheet__header";
    const title = document.createElement("h3");
    title.className = "sheet__title";
    title.textContent = `🧩 ${dataService.getLocalizedText(rule.title, preferredAppLanguages()) || rule.id}`;
    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "icon-button";
    closeBtn.dataset.action = "close-grammar-overlay";
    closeBtn.textContent = "✕";
    closeBtn.setAttribute("aria-label", t("back"));
    header.append(title, closeBtn);
    panel.appendChild(header);

    const body = document.createElement("div");
    body.className = "sheet__body";

    // Description
    const descText = dataService.getLocalizedText(
      rule.description,
      preferredAppLanguages(),
    );
    if (descText) {
      const descP = document.createElement("p");
      descP.className = "grammar-overlay__description";
      descP.textContent = descText;
      body.appendChild(descP);
    }

    // Examples
    if (Array.isArray(rule.examples) && rule.examples.length > 0) {
      const exTitle = document.createElement("h4");
      exTitle.className = "sheet-section__title";
      exTitle.textContent = t("examples");
      body.appendChild(exTitle);

      const exList = document.createElement("ul");
      exList.className = "grammar-overlay__examples";
      rule.examples.forEach((ex) => {
        const li = document.createElement("li");
        li.className = "grammar-overlay__example";
        // Handle both string examples and object examples {target, bridge}
        const text =
          typeof ex === "string"
            ? ex
            : ex.target || ex.en || JSON.stringify(ex);
        li.textContent = text;
        exList.appendChild(li);
      });
      body.appendChild(exList);
    }

    panel.appendChild(body);
    sheet.appendChild(panel);
    document.body.appendChild(sheet);
  }

  function closeGrammarOverlay() {
    const sheet = document.getElementById("grammar-overlay");
    if (sheet) sheet.remove();
  }

  function renderSettings() {
    const body = elements.settingsBody;
    body.innerHTML = "";
    const lessonLangs =
      currentLesson?.meta?.translations || registry.allCodes();

    body.appendChild(renderSettingsLanguagesSection(lessonLangs));
    body.appendChild(renderRepeatSection());
    body.appendChild(renderSpeedSection());
    body.appendChild(renderFontSection());
    body.appendChild(renderVoicesSection());
  }

  function renderLanguageCheckboxList(codes, onChangeHandler) {
    const list = document.createElement("div");
    list.className = "language-list";
    codes.forEach((code) => {
      if (!registry.has(code)) return;
      const label = document.createElement("label");
      label.className = "language-control";
      const input = document.createElement("input");
      input.type = "checkbox";
      input.checked = state.lessonLanguages.includes(code);
      input.addEventListener("change", () =>
        onChangeHandler(code, input.checked),
      );
      const flag = document.createElement("span");
      flag.className = "language-control__flag";
      flag.textContent = flagEmoji(code);
      const name = document.createElement("span");
      name.className = "language-control__label";
      name.textContent = languageDisplayName(code);
      label.append(input, flag, name);
      list.appendChild(label);
    });
    return list;
  }

  function renderSettingsLanguagesSection(lessonLangs) {
    const section = document.createElement("div");
    section.className = "sheet-section";
    const title = document.createElement("h3");
    title.className = "sheet-section__title";
    title.textContent = t("languages");
    section.appendChild(title);

    const list = renderLanguageCheckboxList(
      lessonLangs,
      setLessonLanguageEnabled,
    );

    section.appendChild(list);
    return section;
  }
  function renderRepeatSection() {
    const section = document.createElement("div");
    section.className = "sheet-section";
    const title = document.createElement("h3");
    title.className = "sheet-section__title";
    title.textContent = t("repeatCount");
    section.appendChild(title);
    const input = document.createElement("input");
    input.type = "number";
    input.className = "text-input";
    input.min = "1";
    input.step = "1";
    input.value = String(state.settings.repeatCount || 1);
    input.addEventListener("change", () => setRepeatCount(input.value));
    section.appendChild(input);
    return section;
  }
  function renderSpeedSection() {
    const section = document.createElement("div");
    section.className = "sheet-section";
    const title = document.createElement("h3");
    title.className = "sheet-section__title";
    title.textContent = t("speechSpeed");
    section.appendChild(title);
    const row = document.createElement("div");
    row.className = "radio-row";
    const speeds = [
      ["normal", t("speedNormal")],
      ["slow", t("speedSlow")],
      ["slower", t("speedSlower")],
    ];
    speeds.forEach(([value, label]) => {
      const labelEl = document.createElement("label");
      labelEl.className = "radio-control";
      const input = document.createElement("input");
      input.type = "radio";
      input.name = "speech-speed";
      input.value = value;
      input.checked = state.settings.speechSpeed === value;
      input.addEventListener("change", () => setSpeechSpeed(value));
      const text = document.createElement("span");
      text.textContent = label;
      labelEl.append(input, text);
      row.appendChild(labelEl);
    });
    section.appendChild(row);
    return section;
  }
  function renderFontSection() {
    const section = document.createElement("div");
    section.className = "sheet-section";
    const title = document.createElement("h3");
    title.className = "sheet-section__title";
    title.textContent = t("fontMode");
    section.appendChild(title);
    const row = document.createElement("div");
    row.className = "radio-row";
    const fonts = [
      ["modern", t("fontModern")],
      ["traditional", t("fontTraditional")],
    ];
    fonts.forEach(([value, label]) => {
      const labelEl = document.createElement("label");
      labelEl.className = "radio-control";
      const input = document.createElement("input");
      input.type = "radio";
      input.name = "font-mode";
      input.value = value;
      input.checked = state.settings.font === value;
      input.addEventListener("change", () => setFontMode(value));
      const text = document.createElement("span");
      text.textContent = label;
      labelEl.append(input, text);
      row.appendChild(labelEl);
    });
    section.appendChild(row);
    return section;
  }
  function renderVoicesSection() {
    const section = document.createElement("div");
    section.className = "sheet-section";
    const title = document.createElement("h3");
    title.className = "sheet-section__title";
    title.textContent = t("voices");
    section.appendChild(title);
    const langs = selectedLessonLanguages();
    if (!langs.length) {
      section.appendChild(makeEmptyState(t("noLanguagesSelected")));
      return section;
    }
    langs.forEach((code) => {
      const row = document.createElement("div");
      row.className = "voice-row";
      const label = document.createElement("span");
      label.className = "voice-row__label";
      label.textContent = `${flagEmoji(code)} ${languageDisplayName(code)}`;
      const select = document.createElement("select");
      select.className = "select";
      const defaultOption = document.createElement("option");
      defaultOption.value = "";
      defaultOption.textContent = t("defaultVoice");
      select.appendChild(defaultOption);
      const voices = mediaService.voicesForLanguage(code);
      voices.forEach((voice) => {
        const option = document.createElement("option");
        option.value = voice.name;
        option.textContent = truncateLabel(voice.name);
        select.appendChild(option);
      });
      select.value = state.settings.voices?.[code] || "";
      if (select.value && !voices.some((voice) => voice.name === select.value))
        select.value = "";
      select.addEventListener("change", () =>
        setVoiceForLanguage(code, select.value),
      );
      row.append(label, select);
      section.appendChild(row);
    });
    const reset = document.createElement("button");
    reset.type = "button";
    reset.className = "button button--wide";
    reset.dataset.action = "reset-voices";
    reset.textContent = t("resetVoices");
    section.appendChild(reset);
    return section;
  }
  function setRepeatCount(value) {
    state.settings.repeatCount = normalizeRepeatCount(value);
    saveState();
    renderSettings();
  }
  function setSpeechSpeed(value) {
    if (!["normal", "slow", "slower"].includes(value)) return;
    state.settings.speechSpeed = value;
    saveState();
  }
  function setFontMode(value) {
    if (value !== "modern" && value !== "traditional") return;
    state.settings.font = value;
    saveState();
    applyFont();
    renderHamburger();
  }
  function getItemPool(kind) {
    if (!currentLesson) return [];
    const items = kind
      ? currentLesson.items.filter(
          (item) => dataService.getItemKind(item) === kind && !item.header,
        )
      : currentLesson.items.filter((item) => !item.header);
    return items.map((item) => item.id);
  }
  function buildPlaybackUnits() {
    if (!currentLesson) return [];
    const items = currentLesson.items.filter((item) => !item.header);
    const langs = selectedLessonLanguages();
    const units = [];
    const wordItems = [];
    const sentenceItems = [];
    for (const item of items) {
      if (dataService.getItemKind(item) === "sentence")
        sentenceItems.push(item);
      else wordItems.push(item);
    }
    const orderedItems = [...wordItems, ...sentenceItems];
    for (const item of orderedItems) {
      const kind = dataService.getItemKind(item);
      for (const code of langs) {
        const text = dataService.getText(item, code);
        if (!text.trim()) continue;
        units.push({
          id: `${item.id}:${code}`,
          itemId: item.id,
          itemKind: kind,
          languageCode: code,
          text,
        });
      }
    }
    return units;
  }
  function startPlaybackFromBeginning() {
    ensureAllSectionsOpen();
    renderLesson();
    const units = buildPlaybackUnits();
    if (!units.length) {
      stopPlayback();
      return;
    }
    startPlaybackAt(units, 0);
  }
  function startPlaybackFromCell(itemId, code) {
    const units = buildPlaybackUnits();
    const index = units.findIndex(
      (unit) => unit.itemId === itemId && unit.languageCode === code,
    );
    if (index < 0) {
      stopPlayback();
      return;
    }
    startPlaybackAt(units, index);
  }
  function startPlaybackAt(units, index) {
    stopPlayback();
    playbackSessionCounter += 1;
    playbackState = {
      status: "playing",
      units,
      index,
      repeat: 0,
      session: playbackSessionCounter,
      utterance: null,
      timerId: null,
      highlightTimerId: null,
    };
    playCurrentUnit();
    refreshPlaybackUI();
  }
  function togglePlayPause() {
    if (playbackState.status === "playing") {
      pausePlayback();
      return;
    }
    if (playbackState.status === "paused") {
      resumePlayback();
      return;
    }
    startPlaybackFromBeginning();
  }
  function pausePlayback() {
    if (playbackState.status !== "playing") return;
    playbackSessionCounter += 1;
    playbackState.session = playbackSessionCounter;
    playbackState.status = "paused";
    cancelCurrentSpeech();
    refreshPlaybackUI();
  }
  function resumePlayback() {
    if (playbackState.status !== "paused") return;
    playbackSessionCounter += 1;
    playbackState.status = "playing";
    playbackState.session = playbackSessionCounter;
    playCurrentUnit();
    refreshPlaybackUI();
  }
  function stopPlayback() {
    if (playbackState) {
      playbackSessionCounter += 1;
      playbackState.session = playbackSessionCounter;
      playbackState.status = "idle";
      playbackState.units = [];
      playbackState.index = 0;
      playbackState.repeat = 0;
    }
    cancelCurrentSpeech();
    refreshPlaybackUI();
  }
  function cancelCurrentSpeech() {
    clearPlaybackHighlights();
    if (playbackState) {
      if (playbackState.timerId) {
        clearTimeout(playbackState.timerId);
        playbackState.timerId = null;
      }
      playbackState.utterance = null;
    }
    if (mediaService?.supported) window.speechSynthesis.cancel();
  }
  function clearPlaybackHighlights() {
    if (playbackState && playbackState.highlightTimerId) {
      clearInterval(playbackState.highlightTimerId);
      playbackState.highlightTimerId = null;
    }
    document
      .querySelectorAll(".language-cell.is-speaking")
      .forEach((el) => el.classList.remove("is-speaking"));
    document
      .querySelectorAll(".sentence-token.is-highlighted")
      .forEach((el) => el.classList.remove("is-highlighted"));
  }
  function scrollUnitIntoView(unit) {
    const cell = getCellElement(unit.itemId, unit.languageCode);
    if (!cell) return;
    const target = cell.closest(".item-column") || cell;
    programmaticScrollUntil = Date.now() + SCROLL_SUPPRESSION_MS;
    target.scrollIntoView({
      block: "center",
      inline: "nearest",
      behavior: "smooth",
    });
  }
  function playCurrentUnit() {
    if (!playbackState || playbackState.status !== "playing") return;
    const unit = playbackState.units?.[playbackState.index];
    if (!unit) {
      stopPlayback();
      return;
    }
    if (!String(unit.text || "").trim()) {
      nextUnit();
      return;
    }
    refreshPlaybackUI();
    scrollUnitIntoView(unit);
    speakUnit(unit);
  }
  function speakUnit(unit) {
    if (!playbackState || playbackState.status !== "playing") return;
    const session = playbackState.session ?? 0;
    const repeatTotal = normalizeRepeatCount(state.settings.repeatCount);
    cancelCurrentSpeech();
    highlightUnit(unit);
    const finish = () => {
      if (
        session !== playbackState.session ||
        playbackState.status !== "playing"
      )
        return;
      const rep = playbackState.repeat || 0;
      if (rep < repeatTotal - 1) {
        playbackState.repeat = rep + 1;
        speakUnit(unit);
      } else {
        playbackState.repeat = 0;
        nextUnit();
      }
    };
    const handleError = () => {
      if (
        session !== playbackState.session ||
        playbackState.status !== "playing"
      )
        return;
      playbackState.repeat = 0;
      nextUnit();
    };
    if (!mediaService.supported) {
      const delay = Math.max(500, String(unit.text || " ").length * 80);
      playbackState.timerId = setTimeout(finish, delay);
      return;
    }

    const utterance = mediaService.speakText(unit.text, unit.languageCode, {
      onEnd: () => {
        if (playbackState.utterance !== utterance) return;
        finish();
      },
      onError: () => {
        if (playbackState.utterance !== utterance) return;
        handleError();
      },
    });
    playbackState.utterance = utterance || null;
  }
  function highlightUnit(unit) {
    clearPlaybackHighlights();
    const cell = getCellElement(unit.itemId, unit.languageCode);
    if (!cell) return;
    cell.classList.add("is-speaking");
    if (unit.itemKind === "sentence") {
      const tokens = Array.from(cell.querySelectorAll(".sentence-token"));
      if (!tokens.length) return;
      let idx = 0;
      const highlightCurrent = () => {
        tokens.forEach((token) => token.classList.remove("is-highlighted"));
        if (tokens[idx]) tokens[idx].classList.add("is-highlighted");
        if (idx < tokens.length - 1) idx += 1;
      };
      highlightCurrent();
      if (tokens.length > 1) {
        const preset =
          SPEED_PRESETS[state.settings.speechSpeed] || SPEED_PRESETS.normal;
        const textLength = String(unit.text || " ").length;
        const estimated = Math.max(1200, textLength * 90) / (preset.rate || 1);
        const interval = Math.max(180, Math.floor(estimated / tokens.length));
        playbackState.highlightTimerId = setInterval(
          highlightCurrent,
          interval,
        );
      }
    }
  }
  function nextUnit() {
    if (playbackState.status !== "playing") return;
    playbackState.index += 1;
    playbackState.repeat = 0;
    if (playbackState.index >= playbackState.units.length) {
      stopPlayback();
      return;
    }
    playCurrentUnit();
  }
  function refreshPlaybackUI() {
    const playButton = document.querySelector('[data-action="media-play"]');
    if (playButton) {
      const isPlaying = playbackState.status === "playing";
      playButton.textContent = isPlaying ? "\u23F8" : "\u25B6";
      playButton.setAttribute("aria-label", isPlaying ? t("pause") : t("play"));
    }
    const stopButton = document.querySelector('[data-action="media-stop"]');
    if (stopButton) stopButton.disabled = playbackState.status === "idle";
  }
  function exerciseHeader(titleText, backAction) {
    const header = document.createElement("div");
    header.className = "document-header";
    const back = document.createElement("button");
    back.type = "button";
    back.className = "button";
    back.dataset.action = backAction;
    back.textContent = "\u2190";
    back.setAttribute("aria-label", t("back"));
    const title = document.createElement("h2");
    title.className = "document-title";
    title.textContent = titleText;
    header.append(back, title);
    return header;
  }
  function configRow(labelText, control) {
    const row = document.createElement("div");
    row.className = "config-row";
    const label = document.createElement("span");
    label.className = "config-label";
    label.textContent = labelText;
    row.appendChild(label);
    row.appendChild(control);
    return row;
  }
  function renderExerciseSettingsPanel(isOpen, configBody) {
    const wrap = document.createElement("div");
    wrap.className = "exercise-settings";
    const header = document.createElement("button");
    header.type = "button";
    header.className = "exercise-settings__header";
    header.dataset.action = "toggle-exercise-settings";
    const title = document.createElement("span");
    title.className = "exercise-settings__title";
    title.textContent = t("exerciseSettings");
    const chevron = document.createElement("span");
    chevron.className = "exercise-settings__chevron";
    chevron.textContent = isOpen ? "\u25BE" : "\u25B8";
    header.append(title, chevron);
    wrap.appendChild(header);
    if (isOpen) {
      const body = document.createElement("div");
      body.className = "exercise-settings__body";
      body.appendChild(configBody);
      wrap.appendChild(body);
    }
    return wrap;
  }
  function buildLanguageSelect(langs, selected, onChange) {
    const select = document.createElement("select");
    select.className = "select";
    langs.forEach((code) => {
      const option = document.createElement("option");
      option.value = code;
      option.textContent = `${flagEmoji(code)} ${languageDisplayName(code)}`;
      select.appendChild(option);
    });
    select.value = selected;
    if (!select.value) select.value = langs[0] || "";
    select.addEventListener("change", () => onChange(select.value));
    return select;
  }
  function showStageMessage(stage, text) {
    stage.innerHTML = "";
    stage.appendChild(makeEmptyState(text));
  }
  function renderFlashcards() {
    showView("flashcard");
    const view = elements.flashcardView;
    view.innerHTML = "";
    view.appendChild(
      exerciseHeader(
        flashcardKind === "sentence"
          ? t("sentenceFlashcards")
          : t("wordFlashcards"),
        "back-lesson",
      ),
    );
    const langs = selectedLessonLanguages();
    const settingsOpen = langs.length < 2 || exerciseSettingsOpen;
    ensureExerciseConfigs();
    const config = document.createElement("div");
    config.className = "exercise-config";
    config.appendChild(
      configRow(
        t("promptLanguage"),
        buildLanguageSelect(langs, flashcardConfig.promptLanguage, (value) => {
          flashcardConfig.promptLanguage = value;
          flashcardConfig.revealLanguages =
            flashcardConfig.revealLanguages.filter((code) => code !== value);
          flashcardSession = null;
          renderFlashcards();
        }),
      ),
    );
    const revealRow = document.createElement("div");
    revealRow.className = "config-row";
    const revealLabel = document.createElement("span");
    revealLabel.className = "config-label";
    revealLabel.textContent = t("revealLanguages");
    revealRow.appendChild(revealLabel);
    const revealControls = document.createElement("div");
    revealControls.className = "reveal-controls";
    langs.forEach((code) => {
      const isPrompt = code === flashcardConfig.promptLanguage;
      const label = document.createElement("label");
      label.className = "language-control";
      const input = document.createElement("input");
      input.type = "checkbox";
      input.disabled = isPrompt;
      input.checked =
        !isPrompt && flashcardConfig.revealLanguages.includes(code);
      input.addEventListener("change", () =>
        setFlashcardReveal(code, input.checked),
      );
      const flag = document.createElement("span");
      flag.className = "language-control__flag";
      flag.textContent = flagEmoji(code);
      const name = document.createElement("span");
      name.className = "language-control__label";
      name.textContent = languageDisplayName(code);
      label.append(input, flag, name);
      revealControls.appendChild(label);
    });
    revealRow.appendChild(revealControls);
    config.appendChild(revealRow);
    view.appendChild(renderExerciseSettingsPanel(settingsOpen, config));
    const stage = document.createElement("div");
    stage.id = "flashcard-stage";
    stage.className = "flashcard-stage";
    view.appendChild(stage);
    if (langs.length < 2) {
      showStageMessage(stage, t("selectTwoLanguages"));
      return;
    }
    if (!flashcardSession) startFlashcardSession();
    else if (flashcardSession.index < flashcardSession.due.length)
      renderCurrentFlashcard();
    else showStageMessage(stage, t("noDueCards"));
  }
  function setFlashcardReveal(code, enabled) {
    const set = new Set(flashcardConfig.revealLanguages);
    if (enabled) set.add(code);
    else set.delete(code);
    flashcardConfig.revealLanguages = [...set];
    flashcardSession = null;
    renderFlashcards();
  }
  function startFlashcardSession() {
    ensureExerciseConfigs();
    const stage = document.getElementById("flashcard-stage");
    if (!stage) return;
    const deck = flashcardService.buildDeck({
      itemIds: getItemPool(flashcardKind),
      promptLanguage: flashcardConfig.promptLanguage,
      revealLanguages: flashcardConfig.revealLanguages,
    });
    stage.innerHTML = "";
    if (!deck.revealLanguages.length) {
      showStageMessage(stage, t("selectRevealLanguage"));
      return;
    }
    if (!deck.cards.length) {
      if (deck.stats.withPromptText === 0)
        showStageMessage(stage, t("noPromptText"));
      else showStageMessage(stage, t("noRevealText"));
      return;
    }
    const due = srsService.getDueCards(deck.cards);
    flashcardSession = { deck, due, index: 0 };
    if (!due.length) {
      showStageMessage(stage, t("noDueCards"));
      return;
    }
    renderCurrentFlashcard();
  }
  function renderCurrentFlashcard() {
    const stage = document.getElementById("flashcard-stage");
    if (!stage) return;
    clearExerciseHighlights();
    stage.innerHTML = "";
    const card = flashcardSession?.due?.[flashcardSession.index];
    if (!card) {
      showStageMessage(stage, t("noDueCards"));
      return;
    }
    const status = document.createElement("div");
    status.className = "flashcard-status";
    status.textContent = `${flashcardSession.index + 1} / ${flashcardSession.due.length}`;
    stage.appendChild(status);
    const article = document.createElement("article");
    article.className = "flashcard";
    article.dataset.cardId = card.cardId;
    const isSentence = card.itemKind === "sentence";
    const cardItem = dataService.getItem(card.itemId);
    const front = isSentence
      ? createSentenceTextLine(cardItem, card.promptText, card.promptLanguage, [
          "flashcard__prompt",
        ])
      : createTextLine(card.promptText, card.promptLanguage, [
          "flashcard__prompt",
        ]);
    if (!front) {
      showStageMessage(stage, t("noPromptText"));
      return;
    }
    article.appendChild(front);
    const back = document.createElement("div");
    back.className = "flashcard__back";
    back.hidden = true;
    card.revealLines.forEach((line) => {
      const el = isSentence
        ? createSentenceTextLine(cardItem, line.text, line.languageCode, [
            "flashcard__reveal",
          ])
        : createTextLine(line.text, line.languageCode, ["flashcard__reveal"]);
      if (el) back.appendChild(el);
    });
    article.appendChild(back);
    const actions = document.createElement("div");
    actions.className = "flashcard__actions";
    const revealButton = document.createElement("button");
    revealButton.type = "button";
    revealButton.className = "button button--wide";
    revealButton.dataset.action = "reveal";
    revealButton.textContent = t("showAnswer");
    actions.appendChild(revealButton);
    article.appendChild(actions);
    article.appendChild(createRatingPanel());
    stage.appendChild(article);
    if (isSentence)
      speakLineWithHighlight(front, card.promptText, card.promptLanguage);
    else mediaService.speakImmediate(card.promptText, card.promptLanguage);
  }
  function createRatingPanel() {
    const panel = document.createElement("div");
    panel.className = "rating-panel";
    panel.hidden = true;
    ["again", "hard", "good", "easy"].forEach((rating) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "button button--wide";
      button.dataset.action = "rate";
      button.dataset.rating = rating;
      button.textContent = t(rating);
      panel.appendChild(button);
    });
    return panel;
  }
  function revealCurrentCard() {
    const stage = document.getElementById("flashcard-stage");
    if (!stage) return;
    const card = flashcardSession?.due?.[flashcardSession.index];
    const back = stage.querySelector(".flashcard__back");
    const revealButton = stage.querySelector('[data-action="reveal"]');
    const ratingPanel = stage.querySelector(".rating-panel");
    if (back) back.hidden = false;
    if (revealButton) revealButton.hidden = true;
    if (ratingPanel) ratingPanel.hidden = false;
    const answerLine = card?.revealLines?.[0];
    if (answerLine && String(answerLine.text || " ").trim()) {
      if (card.itemKind === "sentence") {
        const lineEl = back ? back.querySelector(".language-line") : null;
        speakLineWithHighlight(
          lineEl,
          answerLine.text,
          answerLine.languageCode,
        );
      } else
        mediaService.speakImmediate(answerLine.text, answerLine.languageCode);
    }
  }
  function rateCurrentCard(rating) {
    const card = flashcardSession?.due?.[flashcardSession.index];
    if (!card) return;
    srsService.rateCard(card, rating);
    nextFlashcard();
  }
  function nextFlashcard() {
    if (!flashcardSession) return;
    flashcardSession.index += 1;
    const stage = document.getElementById("flashcard-stage");
    if (flashcardSession.index >= flashcardSession.due.length) {
      if (stage) showStageMessage(stage, t("noDueCards"));
      return;
    }
    renderCurrentFlashcard();
  }
  function renderQuiz() {
    showView("quiz");
    const view = elements.quizView;
    view.innerHTML = "";
    view.appendChild(
      exerciseHeader(
        quizKind === "sentence" ? t("sentenceQuiz") : t("wordQuiz"),
        "back-lesson",
      ),
    );
    const langs = selectedLessonLanguages();
    const settingsOpen = langs.length < 2 || exerciseSettingsOpen;
    ensureExerciseConfigs();
    const config = document.createElement("div");
    config.className = "exercise-config";
    config.appendChild(
      configRow(
        t("questionLanguage"),
        buildLanguageSelect(langs, quizConfig.questionLanguage, (value) => {
          quizConfig.questionLanguage = value;
          if (quizConfig.answerLanguage === value)
            quizConfig.answerLanguage =
              langs.find((code) => code !== value) || "";
          quizSession = null;
          renderQuiz();
        }),
      ),
    );
    config.appendChild(
      configRow(
        t("answerLanguage"),
        buildLanguageSelect(
          langs.filter((code) => code !== quizConfig.questionLanguage),
          quizConfig.answerLanguage,
          (value) => {
            quizConfig.answerLanguage = value;
            quizSession = null;
            renderQuiz();
          },
        ),
      ),
    );
    view.appendChild(renderExerciseSettingsPanel(settingsOpen, config));
    const stage = document.createElement("div");
    stage.id = "quiz-stage";
    stage.className = "quiz-stage";
    view.appendChild(stage);
    if (langs.length < 2) {
      showStageMessage(stage, t("selectTwoLanguages"));
      return;
    }
    if (!quizSession) startQuiz();
    else if (quizSession.index < quizSession.session.questions.length)
      renderCurrentQuizQuestion();
    else renderQuizFinished();
  }
  function startQuiz() {
    ensureExerciseConfigs();
    const stage = document.getElementById("quiz-stage");
    if (!stage) return;
    const questionLanguage = quizConfig.questionLanguage;
    const answerLanguage = quizConfig.answerLanguage;
    if (
      !registry.has(questionLanguage) ||
      !registry.has(answerLanguage) ||
      questionLanguage === answerLanguage
    ) {
      showStageMessage(stage, t("quizSelectAnswerLanguage"));
      return;
    }
    resetQuizSessionSeed();
    const session = quizService.buildSession({
      itemIds: getItemPool(quizKind),
      questionLanguage,
      answerLanguage,
      seed: quizSessionSeed,
    });
    stage.innerHTML = "";
    if (session.reason === "notEnoughOptions") {
      showStageMessage(stage, t("quizNotEnoughOptions"));
      return;
    }
    if (!session.questions.length) {
      showStageMessage(stage, t("quizNoQuestions"));
      return;
    }
    quizSession = {
      session,
      index: 0,
      correct: 0,
      answered: false,
      selectedItemId: "",
      incorrectQuestions: [],
    };
    renderCurrentQuizQuestion();
  }
  function updateQuizStatus() {
    const statusEl = document.getElementById("quiz-status");
    if (!statusEl || !quizSession) return;
    const total = quizSession.session.questions.length;
    const current = Math.min(quizSession.index + 1, total);
    statusEl.textContent = `${current} / ${total} \xB7 ${t("quizScore")}: ${quizSession.correct}`;
  }
  function renderCurrentQuizQuestion() {
    const stage = document.getElementById("quiz-stage");
    if (!stage) return;
    clearExerciseHighlights();
    stage.innerHTML = "";
    const question = quizSession?.session?.questions?.[quizSession.index];
    if (!question) {
      renderQuizFinished();
      return;
    }
    const status = document.createElement("div");
    status.className = "quiz-status";
    status.id = "quiz-status";
    stage.appendChild(status);
    updateQuizStatus();
    const article = document.createElement("article");
    article.className = "quiz-question";
    article.dataset.itemId = question.itemId;
    const isSentence = question.itemKind === "sentence";
    const questionItem = dataService.getItem(question.itemId);
    const questionLine = isSentence
      ? createSentenceTextLine(
          questionItem,
          question.questionText,
          question.questionLanguage,
          ["quiz-question__line"],
        )
      : createTextLine(question.questionText, question.questionLanguage, [
          "quiz-question__line",
        ]);
    if (!questionLine) {
      showStageMessage(stage, t("quizNoQuestions"));
      return;
    }
    article.appendChild(questionLine);
    const optionsTitle = document.createElement("h3");
    optionsTitle.className = "quiz-options-title";
    optionsTitle.textContent = t("selectAnswer");
    article.appendChild(optionsTitle);
    const options = document.createElement("div");
    options.className = "quiz-options";
    question.options.forEach((option) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "quiz-option";
      button.dataset.action = "quiz-answer";
      button.dataset.itemId = option.itemId;
      button.dir = option.dir;
      const text = document.createElement("span");
      text.className = "quiz-option__text";
      text.lang = option.bcp47;
      text.dir = option.dir;
      if (isSentence) {
        const optionItem = dataService.getItem(option.itemId);
        const container = document.createElement("span");
        container.className = "sentence-text";
        if (registry.segmentation(question.answerLanguage) === "segmenter")
          container.classList.add("sentence-text--compact");
        const tokens = optionItem
          ? dataService.tokenize(optionItem, question.answerLanguage)
          : [];
        if (tokens.length) {
          tokens.forEach((token) => {
            const tokenEl = document.createElement("span");
            tokenEl.className = "sentence-token";
            tokenEl.dataset.tokenId = String(token.id);
            tokenEl.lang = option.bcp47;
            tokenEl.textContent = token.text;
            container.appendChild(tokenEl);
          });
        } else {
          container.textContent = option.text;
        }
        text.appendChild(container);
      } else {
        text.textContent = option.text;
      }
      button.appendChild(text);
      options.appendChild(button);
    });
    article.appendChild(options);
    const feedback = document.createElement("div");
    feedback.className = "quiz-feedback";
    feedback.hidden = true;
    feedback.setAttribute("role", "status");
    article.appendChild(feedback);
    stage.appendChild(article);
    if (quizSession.answered && quizSession.selectedItemId)
      applyQuizAnswerUI(quizSession.selectedItemId);
    else if (
      questionLine &&
      question.questionText &&
      question.questionText.trim()
    )
      speakLineWithHighlight(
        questionLine,
        question.questionText,
        question.questionLanguage,
      );
  }
  function applyQuizAnswerUI(answerItemId) {
    const question = quizSession.session.questions[quizSession.index];
    if (!question) return;
    const stage = document.getElementById("quiz-stage");
    if (!stage) return;
    const isCorrect = answerItemId === question.answerItemId;
    const optionButtons = Array.from(
      stage.querySelectorAll('[data-action="quiz-answer"]'),
    );
    optionButtons.forEach((button) => {
      button.disabled = true;
      if (button.dataset.itemId === question.answerItemId)
        button.classList.add("is-correct");
      else if (button.dataset.itemId === answerItemId && !isCorrect)
        button.classList.add("is-incorrect");
    });
    const feedback = stage.querySelector(".quiz-feedback");
    if (feedback) {
      feedback.hidden = false;
      feedback.classList.add(isCorrect ? "is-correct" : "is-incorrect");
      const message = document.createElement("span");
      message.textContent = t(isCorrect ? "quizCorrect" : "quizIncorrect");
      const nextButton = document.createElement("button");
      nextButton.type = "button";
      nextButton.className = "button button--wide";
      nextButton.dataset.action = "quiz-next";
      nextButton.textContent = t("quizNext");
      feedback.append(message, nextButton);
    }
  }
  function answerQuiz(answerItemId) {
    if (!quizSession || quizSession.answered) return;
    const question = quizSession.session.questions[quizSession.index];
    if (!question) return;
    quizSession.answered = true;
    quizSession.selectedItemId = answerItemId;
    const isCorrect = answerItemId === question.answerItemId;
    if (isCorrect) quizSession.correct += 1;
    else {
      if (!quizSession.incorrectQuestions) quizSession.incorrectQuestions = [];
      quizSession.incorrectQuestions.push(question);
    }
    applyQuizAnswerUI(answerItemId);
    quizProgressService.recordAnswer({
      itemId: question.itemId,
      questionLanguage: question.questionLanguage,
      answerLanguage: question.answerLanguage,
      correct: isCorrect,
    });
    const clickedOption = question.options.find(
      (option) => option.itemId === answerItemId,
    );
    const spokenText = String(
      clickedOption?.text || question.answerText || "",
    ).trim();
    if (spokenText) {
      if (question.itemKind === "sentence") {
        const optionEl =
          document.querySelector(
            `#quiz-stage .quiz-option[data-item-id="${cssEscape(answerItemId)}"]`,
          ) || null;
        speakLineWithHighlight(optionEl, spokenText, question.answerLanguage);
      } else mediaService.speakImmediate(spokenText, question.answerLanguage);
    }
    updateQuizStatus();
  }
  function nextQuizQuestion() {
    if (!quizSession || !quizSession.answered) return;
    quizSession.index += 1;
    quizSession.answered = false;
    quizSession.selectedItemId = "";
    if (quizSession.index >= quizSession.session.questions.length) {
      renderQuizFinished();
      return;
    }
    renderCurrentQuizQuestion();
  }
  function renderQuizFinished() {
    const stage = document.getElementById("quiz-stage");
    if (!stage) return;
    clearExerciseHighlights();
    stage.innerHTML = "";
    const total = quizSession?.session?.questions?.length || 0;
    const correct = quizSession?.correct || 0;
    const hasIncorrect = (quizSession?.incorrectQuestions || []).length > 0;
    const article = document.createElement("article");
    article.className = "quiz-question";
    const feedback = document.createElement("div");
    feedback.className = "quiz-feedback";
    feedback.textContent = `${t("quizFinished")} ${t("quizScore")}: ${correct} / ${total}`;
    const actions = document.createElement("div");
    actions.className = "quiz-options";
    if (hasIncorrect) {
      const retryButton = document.createElement("button");
      retryButton.type = "button";
      retryButton.className = "button button--wide";
      retryButton.dataset.action = "quiz-retry";
      retryButton.textContent = t("quizRetry");
      actions.appendChild(retryButton);
    } else {
      const restartButton = document.createElement("button");
      restartButton.type = "button";
      restartButton.className = "button button--wide";
      restartButton.dataset.action = "quiz-restart";
      restartButton.textContent = t("quizRestart");
      actions.appendChild(restartButton);
    }
    article.append(feedback, actions);
    stage.appendChild(article);
  }
  function restartQuiz() {
    resetQuizSessionSeed();
    startQuiz();
  }
  function retryQuiz() {
    if (!quizSession || !(quizSession.incorrectQuestions || []).length) return;
    const questions = quizSession.incorrectQuestions;
    quizSession = {
      session: {
        questions,
        stats: { questions: questions.length },
        questionLanguage: quizSession.session.questionLanguage,
        answerLanguage: quizSession.session.answerLanguage,
        reason: "",
      },
      index: 0,
      correct: 0,
      answered: false,
      selectedItemId: "",
      incorrectQuestions: [],
    };
    renderCurrentQuizQuestion();
  }
  function ensureBuildConfig() {
    const langs = selectedLessonLanguages();
    const appLang = state.settings.appLanguage;
    if (!buildConfig) {
      const saved = loadJSON(STORAGE_KEYS.buildLanguages, {});
      buildConfig = {
        displayLanguage:
          typeof saved?.displayLanguage === "string"
            ? saved.displayLanguage
            : "",
        buildLanguage:
          typeof saved?.buildLanguage === "string" ? saved.buildLanguage : "",
      };
    }
    let changed = false;
    if (!langs.includes(buildConfig.displayLanguage)) {
      buildConfig.displayLanguage = langs.includes(appLang)
        ? appLang
        : langs[0] || "";
      changed = true;
    }
    if (
      !langs.includes(buildConfig.buildLanguage) ||
      buildConfig.buildLanguage === buildConfig.displayLanguage
    ) {
      const targetLang = state.settings.targetLanguage;
      const next =
        langs.find(
          (code) => code !== buildConfig.displayLanguage && code === targetLang,
        ) ||
        langs.find((code) => code !== buildConfig.displayLanguage) ||
        "";
      if (buildConfig.buildLanguage !== next) changed = true;
      buildConfig.buildLanguage = next;
    }
    return changed;
  }
  function saveBuildConfig() {
    saveJSON(STORAGE_KEYS.buildLanguages, {
      displayLanguage: buildConfig.displayLanguage,
      buildLanguage: buildConfig.buildLanguage,
    });
  }
  function getBuildTargetTokens(item, code) {
    const explicit = dataService.getExplicitTokens(item, code);
    if (Array.isArray(explicit) && explicit.length > 0)
      return explicit
        .map((token) => (typeof token === "string" ? token : token?.text || ""))
        .map((text) => String(text).trim())
        .filter(Boolean);
    return dataService.tokenize(item, code).map((token) => token.text);
  }
  function buildEligibleSentenceIds() {
    return getItemPool("sentence").filter((id) => {
      const item = dataService.getItem(id);
      return (
        dataService.hasText(item, buildConfig.displayLanguage) &&
        getBuildTargetTokens(item, buildConfig.buildLanguage).length > 0
      );
    });
  }
  function startBuildSession() {
    buildSession = { itemIds: buildEligibleSentenceIds(), index: 0 };
    buildCurrent = null;
  }
  function loadBuildSentence() {
    const itemId = buildSession.itemIds[buildSession.index];
    const item = dataService.getItem(itemId);
    const texts = getBuildTargetTokens(item, buildConfig.buildLanguage);
    const chips = texts.map((text, index) => ({ id: index, text }));
    const order = deterministicShuffle(
      chips.map((chip) => chip.id),
      `build:${itemId}:${buildConfig.buildLanguage}`,
    );
    buildCurrent = { itemId, chips, selected: [], poolOrder: order };
  }
  function renderBuildSentence() {
    showView("build");
    const view = elements.buildView;
    view.innerHTML = "";
    view.appendChild(exerciseHeader(t("buildSentence"), "back-lesson"));
    const langs = selectedLessonLanguages();
    const settingsOpen = langs.length < 2 || exerciseSettingsOpen;
    const changed = ensureBuildConfig();
    const isInitialRender = !buildSession;
    const config = document.createElement("div");
    config.className = "exercise-config";
    config.appendChild(
      configRow(
        t("primaryLanguage"),
        buildLanguageSelect(langs, buildConfig.displayLanguage, (value) => {
          buildConfig.displayLanguage = value;
          if (buildConfig.buildLanguage === value)
            buildConfig.buildLanguage = langs.find((c) => c !== value) || "";
          saveBuildConfig();
          startBuildSession();
          renderBuildSentence();
        }),
      ),
    );
    config.appendChild(
      configRow(
        t("secondaryLanguage"),
        buildLanguageSelect(
          langs.filter((code) => code !== buildConfig.displayLanguage),
          buildConfig.buildLanguage,
          (value) => {
            buildConfig.buildLanguage = value;
            saveBuildConfig();
            startBuildSession();
            renderBuildSentence();
          },
        ),
      ),
    );
    view.appendChild(renderExerciseSettingsPanel(settingsOpen, config));
    const stage = document.createElement("div");
    stage.id = "build-stage";
    stage.className = "build-stage";
    view.appendChild(stage);
    if (langs.length < 2) {
      showStageMessage(stage, t("selectTwoLanguages"));
      return;
    }
    if (changed || !buildSession) startBuildSession();
    renderBuildStage();
    if (isInitialRender && buildCurrent) {
      const item = dataService.getItem(buildCurrent.itemId);
      if (item) {
        const displayText = dataService.getText(
          item,
          buildConfig.displayLanguage,
        );
        const displayLine = document.querySelector(
          "#build-stage .build-display",
        );
        if (displayLine && displayText && displayText.trim())
          speakLineWithHighlight(
            displayLine,
            displayText,
            buildConfig.displayLanguage,
          );
      }
    }
  }
  function createBuildChip(chipId, isSelected) {
    const chip = buildCurrent.chips[chipId];
    const buildCode = buildConfig.buildLanguage;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "build-chip";
    button.dataset.action = isSelected ? "build-remove" : "build-add";
    button.dataset.chipId = String(chipId);
    const text = document.createElement("span");
    text.className = "build-chip__text";
    text.lang = registry.bcp47(buildCode);
    text.textContent = chip.text;
    button.appendChild(text);
    if (isSelected) {
      const remove = document.createElement("span");
      remove.className = "build-chip__remove";
      remove.textContent = "\u2715";
      button.appendChild(remove);
    }
    return button;
  }
  function renderBuildStage() {
    const stage = document.getElementById("build-stage");
    if (!stage) return;
    stage.innerHTML = "";
    if (!buildSession || !buildSession.itemIds.length) {
      showStageMessage(stage, t("buildNoSentences"));
      return;
    }
    if (buildSession.index >= buildSession.itemIds.length) {
      renderBuildFinished(stage);
      return;
    }
    if (
      !buildCurrent ||
      buildCurrent.itemId !== buildSession.itemIds[buildSession.index]
    )
      loadBuildSentence();
    const item = dataService.getItem(buildCurrent.itemId);
    const displayCode = buildConfig.displayLanguage;
    const buildCode = buildConfig.buildLanguage;
    const status = document.createElement("div");
    status.className = "flashcard-status";
    status.textContent = `${buildSession.index + 1} / ${buildSession.itemIds.length}`;
    stage.appendChild(status);
    const displayText = dataService.getText(item, displayCode);
    const displayLine = createSentenceTextLine(item, displayText, displayCode, [
      "build-display",
    ]);
    if (displayLine) stage.appendChild(displayLine);
    const heading = document.createElement("h3");
    heading.className = "quiz-options-title";
    heading.textContent = t("yourSentence");
    stage.appendChild(heading);
    const sentenceArea = document.createElement("div");
    sentenceArea.className = "build-sentence";
    sentenceArea.dir = registry.dir(buildCode);
    if (!buildCurrent.selected.length) {
      const placeholder = document.createElement("span");
      placeholder.className = "build-placeholder";
      placeholder.textContent = t("buildPlaceholder");
      sentenceArea.appendChild(placeholder);
    } else {
      buildCurrent.selected.forEach((chipId) =>
        sentenceArea.appendChild(createBuildChip(chipId, true)),
      );
    }
    stage.appendChild(sentenceArea);
    const pool = document.createElement("div");
    pool.className = "build-pool";
    pool.dir = registry.dir(buildCode);
    buildCurrent.poolOrder
      .filter((chipId) => !buildCurrent.selected.includes(chipId))
      .forEach((chipId) => pool.appendChild(createBuildChip(chipId, false)));
    stage.appendChild(pool);
    if (buildCurrent.selected.length === buildCurrent.chips.length) {
      const correct = isBuildSentenceCorrect();
      const feedback = document.createElement("div");
      feedback.className = "quiz-feedback";
      feedback.classList.add(correct ? "is-correct" : "is-incorrect");
      feedback.textContent = t(correct ? "buildCorrect" : "buildIncorrect");
      stage.appendChild(feedback);
    }
    const actions = document.createElement("div");
    actions.className = "build-actions";
    const hintButton = document.createElement("button");
    hintButton.type = "button";
    hintButton.className = "button button--wide";
    hintButton.dataset.action = "build-hint";
    hintButton.textContent = t("hint");
    const nextButton = document.createElement("button");
    nextButton.type = "button";
    nextButton.className = "button button--wide";
    nextButton.dataset.action = "build-next";
    nextButton.textContent = t("quizNext");
    actions.append(hintButton, nextButton);
    stage.appendChild(actions);
  }
  function renderBuildFinished(stage) {
    clearExerciseHighlights();
    const article = document.createElement("article");
    article.className = "quiz-question";
    const feedback = document.createElement("div");
    feedback.className = "quiz-feedback";
    feedback.textContent = t("buildFinished");
    const actions = document.createElement("div");
    actions.className = "quiz-options";
    const restartButton = document.createElement("button");
    restartButton.type = "button";
    restartButton.className = "button button--wide";
    restartButton.dataset.action = "build-restart";
    restartButton.textContent = t("buildRestart");
    actions.appendChild(restartButton);
    article.append(feedback, actions);
    stage.appendChild(article);
  }
  function showBuildSentence() {
    loadBuildSentence();
    renderBuildStage();
    const item = dataService.getItem(buildCurrent.itemId);
    const text = dataService.getText(item, buildConfig.displayLanguage);
    const lineEl = document.querySelector("#build-stage .build-display");
    if (lineEl && text.trim())
      speakLineWithHighlight(lineEl, text, buildConfig.displayLanguage);
  }
  function buildAddChip(chipId) {
    if (!buildCurrent || buildCurrent.selected.includes(chipId)) return;
    buildCurrent.selected.push(chipId);
    mediaService.speakImmediate(
      buildCurrent.chips[chipId].text,
      buildConfig.buildLanguage,
    );
    renderBuildStage();
  }
  function buildRemoveChip(chipId) {
    if (!buildCurrent) return;
    const position = buildCurrent.selected.indexOf(chipId);
    if (position < 0) return;
    buildCurrent.selected.splice(position, 1);
    mediaService.speakImmediate(
      buildCurrent.chips[chipId].text,
      buildConfig.buildLanguage,
    );
    renderBuildStage();
  }
  function buildHint() {
    if (!buildCurrent) return;
    const total = buildCurrent.chips.length;
    if (buildCurrent.selected.length >= total) return;
    const newLength = buildCurrent.selected.length + 1;
    buildCurrent.selected = Array.from({ length: newLength }, (_, i) => i);
    mediaService.speakImmediate(
      buildCurrent.chips[newLength - 1].text,
      buildConfig.buildLanguage,
    );
    renderBuildStage();
  }
  function normalizeBuildToken(text) {
    return String(text)
      .toLowerCase()
      .replace(/[\p{P}\p{S}]/gu, " ")
      .trim();
  }
  function isBuildSentenceCorrect() {
    if (!buildCurrent) return false;
    return buildCurrent.selected.every(
      (chipId, index) =>
        normalizeBuildToken(buildCurrent.chips[chipId].text) ===
        normalizeBuildToken(buildCurrent.chips[index].text),
    );
  }
  function buildNext() {
    if (!buildSession) return;
    buildSession.index += 1;
    if (buildSession.index >= buildSession.itemIds.length) {
      renderBuildStage();
      return;
    }
    showBuildSentence();
  }
  function buildRestart() {
    startBuildSession();
    if (!buildSession.itemIds.length) {
      renderBuildStage();
      return;
    }
    showBuildSentence();
  }
  function detectOs() {
    const ua = String(navigator.userAgent || "");
    if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
    if (/Android/i.test(ua)) return "android";
    if (/Macintosh|MacIntel|MacPPC/i.test(ua)) {
      if (
        typeof navigator.maxTouchPoints === "number" &&
        navigator.maxTouchPoints > 1
      )
        return "ios";
      return "macos";
    }
    if (/Windows/i.test(ua)) return "windows";
    if (/Linux/i.test(ua)) return "linux";
    return "linux";
  }
  function voiceTestLanguages() {
    return registry
      .allCodes()
      .filter((code) => state.lessonLanguages.includes(code));
  }
  function voiceTestMessage(code) {
    const language = registry.getLanguage(code);
    const endonym = language?.names?.[code] || language?.label || code;
    const template = VOICE_TEST_MESSAGES[code] || VOICE_TEST_MESSAGES.en;
    return template.replace("{language}", endonym);
  }
  function renderVoiceTest() {
    stopVoiceTestPlayback();
    refreshVoices();
    showView("voicetest");
    const view = elements.voicetestView;
    view.innerHTML = "";
    view.appendChild(exerciseHeader(t("testVoices"), voiceTestReturn));
    const langSection = document.createElement("div");
    langSection.className = "sheet-section";
    const langTitle = document.createElement("h3");
    langTitle.className = "sheet-section__title";
    langTitle.textContent = t("languages");
    langSection.appendChild(langTitle);

    const list = renderLanguageCheckboxList(
      registry.allCodes(),
      setLessonLanguageEnabled,
    );

    langSection.appendChild(list);
    view.appendChild(langSection);
    const langs = voiceTestLanguages();
    if (langs.length < 2) {
      view.appendChild(makeEmptyState(t("selectTwoLanguages")));
      return;
    }
    const results = document.createElement("div");
    results.className = "sheet-section";
    const resultsTitle = document.createElement("h3");
    resultsTitle.className = "sheet-section__title";
    resultsTitle.textContent = t("testVoices");
    results.appendChild(resultsTitle);
    const available = [];
    const missing = [];
    langs.forEach((code) => {
      const hasVoice = mediaService.voicesForLanguage(code).length > 0;

      if (hasVoice) available.push(code);
      else missing.push(code);
      const row = document.createElement("div");
      row.className = "sheet-field";
      const labelEl = document.createElement("span");
      labelEl.className = "voice-row__label";
      labelEl.textContent = `${flagEmoji(code)} ${languageDisplayName(code)} — ${t(hasVoice ? "voiceAvailableStatus" : "voiceMissingStatus")}`;
      row.appendChild(labelEl);
      results.appendChild(row);
    });
    const controls = document.createElement("div");
    controls.className = "flashcard__actions";
    const playButton = document.createElement("button");
    playButton.type = "button";
    playButton.className = "button button--wide";
    playButton.dataset.action = "voice-test-play";
    playButton.textContent = t("playVoiceTest");
    playButton.disabled = available.length === 0;
    const stopButton = document.createElement("button");
    stopButton.type = "button";
    stopButton.className = "button button--wide";
    stopButton.dataset.action = "voice-test-stop";
    stopButton.textContent = t("stop");
    stopButton.disabled = true;
    controls.append(playButton, stopButton);
    results.appendChild(controls);
    view.appendChild(results);
    if (missing.length) view.appendChild(renderVoiceInstructions(missing));
  }
  function renderVoiceInstructions(missing) {
    if (!VOICE_OS_INSTRUCTIONS[voiceTestOs]) voiceTestOs = detectOs();
    const section = document.createElement("div");
    section.className = "sheet-section";
    const title = document.createElement("h3");
    title.className = "sheet-section__title";
    title.textContent = t("voiceInstallTitle");
    section.appendChild(title);
    const intro = document.createElement("p");
    intro.className = "voice-row__label";
    intro.textContent = `${t("voiceInstallIntro")} (${missing.map((code) => languageDisplayName(code)).join(", ")})`;
    section.appendChild(intro);
    const deviceRow = document.createElement("div");
    deviceRow.className = "sheet-field";
    const deviceLabel = document.createElement("span");
    deviceLabel.className = "voice-row__label";
    deviceLabel.textContent = t("device");
    const select = document.createElement("select");
    select.className = "select";
    VOICE_OS_LABELS.forEach(([value, label]) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = label;
      select.appendChild(option);
    });
    select.value = voiceTestOs;
    select.addEventListener("change", () => {
      voiceTestOs = select.value;
      renderVoiceTest();
    });
    deviceRow.append(deviceLabel, select);
    section.appendChild(deviceRow);
    const osLabel =
      VOICE_OS_LABELS.find(([value]) => value === voiceTestOs)?.[1] ||
      voiceTestOs;
    const details = document.createElement("details");
    details.className = "voice-instructions";
    details.open = true;
    const summary = document.createElement("summary");
    summary.textContent = osLabel;
    details.appendChild(summary);
    const steps = document.createElement("ol");
    steps.className = "voice-instructions__steps";
    const appLang = state.settings.appLanguage;
    (VOICE_OS_INSTRUCTIONS[voiceTestOs]?.steps || []).forEach((step) => {
      const li = document.createElement("li");
      li.textContent = step[appLang] || step.en;
      steps.appendChild(li);
    });
    details.appendChild(steps);
    section.appendChild(details);
    return section;
  }
  function refreshVoiceTestUI() {
    const playButton = document.querySelector(
      '[data-action="voice-test-play"]',
    );
    const stopButton = document.querySelector(
      '[data-action="voice-test-stop"]',
    );
    if (playButton) playButton.disabled = voiceTestPlaying;
    if (stopButton) stopButton.disabled = !voiceTestPlaying;
  }
  function startVoiceTestPlayback() {
    if (voiceTestPlaying) return;
    refreshVoices();
    const playable = voiceTestLanguages().filter(
      (code) => mediaService.voicesForLanguage(code).length > 0,
    );
    if (!playable.length) return;
    voiceTestQueue = playable.map((code) => ({
      code,
      text: voiceTestMessage(code),
    }));
    voiceTestPlaying = true;
    refreshVoiceTestUI();
    speakNextVoiceTest();
  }
  function speakNextVoiceTest() {
    if (!voiceTestPlaying) return;
    const entry = voiceTestQueue.shift();
    if (!entry) {
      stopVoiceTestPlayback();
      return;
    }
    if (!mediaService.supported) {
      voiceTestTimer = setTimeout(speakNextVoiceTest, 1000);
      return;
    }

    const utterance = mediaService.speakText(entry.text, entry.code, {
      onEnd: () => {
        if (voiceTestUtterance === utterance) speakNextVoiceTest();
      },
      onError: () => {
        if (voiceTestUtterance === utterance) speakNextVoiceTest();
      },
    });
    voiceTestUtterance = utterance || null;
  }
  function stopVoiceTestPlayback() {
    voiceTestPlaying = false;
    voiceTestQueue = [];
    voiceTestUtterance = null;
    if (voiceTestTimer) {
      clearTimeout(voiceTestTimer);
      voiceTestTimer = null;
    }
    if (mediaService?.supported) window.speechSynthesis.cancel();
    refreshVoiceTestUI();
  }
  function renderProgress() {
    showView("progress");
    const view = elements.progressView;
    view.innerHTML = "";
    view.appendChild(exerciseHeader(t("studyPlanAndProgress"), "back-home"));
    const stage = document.createElement("div");
    stage.className = "progress-stage";
    const categories = manifest.categories || [];
    if (!categories.length) stage.appendChild(makeEmptyState(t("noProgress")));
    else {
      const section = document.createElement("section");
      section.className = "progress-section";
      const triedOpen = openProgressSections.has("progress:lessons-tried");
      const triedHeader = document.createElement("button");
      triedHeader.type = "button";
      triedHeader.className = "progress-section__header";
      triedHeader.dataset.action = "toggle-progress-section";
      triedHeader.dataset.sectionKey = "progress:lessons-tried";
      const triedTitle = document.createElement("span");
      triedTitle.className = "progress-section__title";
      triedTitle.textContent = t("lessonsTried");
      const triedChevron = document.createElement("span");
      triedChevron.className = "progress-section__chevron";
      triedChevron.textContent = triedOpen ? "\u25BE" : "\u25B8";
      triedHeader.append(triedTitle, triedChevron);
      section.appendChild(triedHeader);
      if (triedOpen) {
        const body = document.createElement("div");
        body.className = "progress-section__body";
        const list = document.createElement("div");
        list.className = "progress-list";
        categories.forEach((category) => {
          const lessons = Array.isArray(category.lessons)
            ? category.lessons
            : [];
          const tried = lessons.filter((lesson) =>
            lessonsTried.has(lesson.id),
          ).length;
          const line = document.createElement("div");
          line.className = "progress-record";
          const title =
            dataService.getLocalizedText(
              category.title,
              preferredAppLanguages(),
            ) || category.id;
          line.textContent = `${title} \xB7 ${tried}/${lessons.length}`;
          list.appendChild(line);
        });
        body.appendChild(list);
        section.appendChild(body);
      }
      stage.appendChild(section);
      const planSection = renderStudyPlanProgressSection();
      if (planSection) stage.appendChild(planSection);
    }
    const exercisesPanel = document.createElement("section");
    exercisesPanel.className = "progress-section";
    const exercisesHeading = document.createElement("h3");
    exercisesHeading.className = "progress-section__heading";
    exercisesHeading.textContent = t("exercises");
    exercisesPanel.appendChild(exercisesHeading);
    const exercisesBody = document.createElement("div");
    exercisesBody.className = "progress-section__body";
    const resetActions = document.createElement("div");
    resetActions.className = "progress-reset-actions";
    const makeResetButton = (label, action) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "button button--wide";
      button.dataset.action = action;
      button.textContent = label;
      return button;
    };
    resetActions.appendChild(
      makeResetButton(t("resetFlashcards"), "reset-progress-srs"),
    );
    resetActions.appendChild(
      makeResetButton(t("resetQuiz"), "reset-progress-quiz"),
    );
    resetActions.appendChild(
      makeResetButton(t("resetProgress"), "reset-progress-all"),
    );
    exercisesBody.appendChild(resetActions);
    exercisesPanel.appendChild(exercisesBody);
    stage.appendChild(exercisesPanel);
    view.appendChild(stage);
  }
  function renderHelp() {
    showView("help");
    const view = elements.helpView;
    view.innerHTML = "";
    view.appendChild(exerciseHeader(t("gettingStarted"), "back-home"));
    const stage = document.createElement("div");
    stage.className = "progress-stage";
    HELP_SECTIONS.forEach((section) =>
      stage.appendChild(renderHelpSection(section)),
    );
    view.appendChild(stage);
  }
  function renderHelpSection(section) {
    const wrap = document.createElement("section");
    wrap.className = "progress-section";
    const isOpen = openHelpSections.has(section.key);
    const header = document.createElement("button");
    header.type = "button";
    header.className = "progress-section__header";
    header.dataset.action = "toggle-help-section";
    header.dataset.helpKey = section.key;
    const title = document.createElement("span");
    title.className = "progress-section__title";
    title.textContent = dataService.getLocalizedText(
      section.title,
      preferredAppLanguages(),
    );
    const chevron = document.createElement("span");
    chevron.className = "progress-section__chevron";
    chevron.textContent = isOpen ? "\u25BE" : "\u25B8";
    header.append(title, chevron);
    wrap.appendChild(header);
    if (!isOpen) return wrap;
    const body = document.createElement("div");
    body.className = "progress-section__body";
    const list = document.createElement("ul");
    list.className = "help-list";
    const appLang = state.settings.appLanguage;
    section.items.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item[appLang] || item.en;
      list.appendChild(li);
    });
    body.appendChild(list);
    wrap.appendChild(body);
    return wrap;
  }
  function toggleHelpSection(key) {
    if (openHelpSections.has(key)) openHelpSections.delete(key);
    else openHelpSections.add(key);
    renderHelp();
  }
  function clearProgressKeys(keys) {
    keys.forEach((key) => {
      try {
        localStorage.removeItem(key);
      } catch {}
    });
  }
  function resetFlashcardProgress() {
    if (!window.confirm(t("resetFlashcardsConfirm"))) return;
    clearProgressKeys([STORAGE_KEYS.srs]);
    srsService.records = {};
    if (elements.progressView && !elements.progressView.hidden)
      renderProgress();
  }
  function resetQuizProgress() {
    if (!window.confirm(t("resetQuizConfirm"))) return;
    clearProgressKeys([STORAGE_KEYS.quiz]);
    quizProgressService.records = {};
    if (elements.progressView && !elements.progressView.hidden)
      renderProgress();
  }
  function resetAllProgress() {
    if (!window.confirm(t("resetProgressConfirm"))) return;
    clearProgressKeys([
      STORAGE_KEYS.srs,
      STORAGE_KEYS.quiz,
      STORAGE_KEYS.lessonsTried,
    ]);
    srsService.records = {};
    quizProgressService.records = {};
    lessonsTried.clear();
    if (elements.progressView && !elements.progressView.hidden)
      renderProgress();
  }
  function bindGlobalEvents() {
    document.addEventListener("click", (event) => {
      const actionEl = event.target.closest("[data-action]");
      if (!actionEl) return;
      const action = actionEl.dataset.action;
      switch (action) {
        case "select-target-language": {
          const code = actionEl.dataset.langCode;
          if (code) {
            setTargetLanguage(code, "target-select");
          }
          break;
        }

        case "change-target-language":
          state.settings.targetLanguage = null;
          saveState();
          renderTargetSelect();
          break;

        case "generate-plan":
          generateStudyPlan();
          break;
        case "skip-onboarding":
          skipOnboarding();
          break;
        case "toggle-hamburger":
          if (elements.hamburgerPanel.hidden) openHamburger();
          else closeHamburger();
          break;
        case "close-hamburger":
          closeHamburger();
          break;
        case "cycle-theme":
          cycleTheme();
          break;
        case "cycle-font":
          cycleFont();
          break;
        case "create-plan":
          closeHamburger();
          renderOnboarding();
          break;
        case "show-progress":
          closeHamburger();
          renderProgress();
          break;
        case "open-voice-test":
          closeHamburger();
          if (!voiceTestOs) voiceTestOs = detectOs();
          voiceTestReturn = currentLesson ? "back-lesson" : "back-home";
          renderVoiceTest();
          break;
        case "open-help":
          closeHamburger();
          renderHelp();
          break;
        case "toggle-help-section":
          toggleHelpSection(actionEl.dataset.helpKey);
          break;
        case "toggle-category":
          toggleCategory(actionEl.dataset.categoryId);
          break;
        case "toggle-tier":
          toggleTier(actionEl.dataset.tierId);
          break;
        case "toggle-topic":
          toggleTopic(actionEl.dataset.topicId);
          break;
        case "toggle-book":
          toggleBook(actionEl.dataset.bookId);
          break;
        case "open-lesson":
          openLesson(actionEl.dataset.lessonId);
          break;
        case "retry-lesson":
          if (currentLesson) openLesson(currentLesson.meta.id);
          break;

        case "next-up-continue":
          nextUpPreviewId = null; // Reset preview state when actually opening
          openLesson(actionEl.dataset.lessonId);
          break;

        case "next-up-skip":
          handleNextUpSkip(actionEl.dataset.lessonId);
          break;
        case "open-grammar-rule":
          openGrammarOverlay(actionEl.dataset.ruleId);
          break;
        case "close-grammar-overlay":
          closeGrammarOverlay();
          break;
        case "next-up-preview-prev": {
          const currentPreview =
            nextUpPreviewId ||
            studyPlanService?.getNextLesson() ||
            getNextBrowseLesson()?.id;
          if (currentPreview) {
            const ctx = getNavigationContext(currentPreview);
            if (ctx.prevId) {
              nextUpPreviewId = ctx.prevId;
              renderHome();
            }
          }
          break;
        }
        case "next-up-preview-next": {
          const currentPreviewNext =
            nextUpPreviewId ||
            studyPlanService?.getNextLesson() ||
            getNextBrowseLesson()?.id;
          if (currentPreviewNext) {
            const ctx = getNavigationContext(currentPreviewNext);
            if (ctx.nextId) {
              nextUpPreviewId = ctx.nextId;
              renderHome();
            }
          }
          break;
        }

        case "edit-plan":
          handleEditPlan();
          break;
        case "delete-plan":
          handleDeletePlan();
          break;
        case "toggle-progress-section":
          toggleProgressSection(actionEl.dataset.sectionKey);
          break;
        case "toggle-lesson-section":
          toggleLessonSection(actionEl.dataset.sectionKey);
          break;
        case "toggle-exercise-settings":
          exerciseSettingsOpen = !exerciseSettingsOpen;
          renderCurrent();
          break;
        case "open-flashcards":
          if (flashcardKind !== "word") flashcardSession = null;
          flashcardKind = "word";
          renderFlashcards();
          break;
        case "open-sentence-flashcards":
          if (flashcardKind !== "sentence") flashcardSession = null;
          flashcardKind = "sentence";
          renderFlashcards();
          break;
        case "open-quiz":
          if (quizKind !== "word") quizSession = null;
          quizKind = "word";
          renderQuiz();
          break;
        case "open-sentence-quiz":
          if (quizKind !== "sentence") quizSession = null;
          quizKind = "sentence";
          renderQuiz();
          break;
        case "open-build-sentence":
          renderBuildSentence();
          break;
        case "back-home":
          goHome();
          break;
        case "back-lesson":
          renderLesson();
          break;
        case "media-play":
          togglePlayPause();
          break;
        case "media-stop":
          stopPlayback();
          break;
        case "voice-test-play":
          startVoiceTestPlayback();
          break;
        case "voice-test-stop":
          stopVoiceTestPlayback();
          break;
        case "open-settings":
          openSettings();
          break;
        case "close-settings":
          closeSettings();
          break;
        case "speak-cell":
          startPlaybackFromCell(actionEl.dataset.itemId, actionEl.dataset.lang);
          break;
        case "speak-text": {
          const lang = actionEl.dataset.lang;
          const rawText =
            actionEl.dataset.speakText ?? actionEl.textContent ?? "";
          const text = String(rawText).trim();
          if (text && registry.has(lang)) {
            if (actionEl.querySelector(".sentence-token"))
              speakLineWithHighlight(actionEl, text, lang);
            else mediaService.speakImmediate(text, lang);
          }
          break;
        }
        case "reset-voices":
          state.settings.voices = {};
          saveState();
          renderSettings();
          break;
        case "reveal":
          revealCurrentCard();
          break;
        case "rate":
          rateCurrentCard(actionEl.dataset.rating);
          break;
        case "quiz-answer":
          answerQuiz(actionEl.dataset.itemId);
          break;
        case "quiz-next":
          nextQuizQuestion();
          break;
        case "quiz-restart":
          restartQuiz();
          break;
        case "quiz-retry":
          retryQuiz();
          break;
        case "build-add":
          buildAddChip(Number(actionEl.dataset.chipId));
          break;
        case "build-remove":
          buildRemoveChip(Number(actionEl.dataset.chipId));
          break;
        case "build-hint":
          buildHint();
          break;
        case "build-next":
          buildNext();
          break;
        case "build-restart":
          buildRestart();
          break;
        case "reset-progress-srs":
          resetFlashcardProgress();
          break;
        case "reset-progress-quiz":
          resetQuizProgress();
          break;
        case "reset-progress-all":
          resetAllProgress();
          break;
        default:
          break;
      }
    });
    document.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
    });
    document.addEventListener(
      "scroll",
      () => {
        if (!playbackState || playbackState.status !== "playing") return;
        if (Date.now() < programmaticScrollUntil) return;
        stopPlayback();
      },
      { capture: true, passive: true },
    );
  }
  document.addEventListener("DOMContentLoaded", init);

  function handleTargetSelection(langCode) {
    if (!registry.has(langCode)) return;
    setTargetLanguage(langCode, "target-select");
  }

  function renderTargetSelect() {
    showView("targetSelect");
    const view = elements.targetSelectView;
    view.innerHTML = "";
    const stage = document.createElement("div");
    stage.className = "target-select-stage";
    const title = document.createElement("h2");
    title.className = "target-select-title";
    title.textContent = t("selectTargetLanguage");
    stage.appendChild(title);
    const intro = document.createElement("p");
    intro.className = "target-select-intro";
    intro.textContent = t("selectTargetLanguageIntro");
    stage.appendChild(intro);
    const list = document.createElement("div");
    list.className = "target-select-list";
    const appLang = state.settings.appLanguage;

    const sortedLanguages = getSortedLanguages();

    sortedLanguages.forEach((lang) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "target-select-option";
      btn.dataset.action = "select-target-language";
      btn.dataset.langCode = lang.code;
      const flag = document.createElement("span");
      flag.className = "target-select-flag";
      flag.textContent = flagEmoji(lang.code);
      const name = document.createElement("span");
      name.className = "target-select-name";
      name.textContent = languageDisplayName(lang.code);
      btn.append(flag, name);
      list.appendChild(btn);
    });

    stage.appendChild(list);
    view.appendChild(stage);
  }

  async function init() {
    // 1. Element References
    elements.onboardingView = document.getElementById("onboarding-view");
    elements.homeView = document.getElementById("home-view");
    elements.lessonView = document.getElementById("lesson-view");
    elements.flashcardView = document.getElementById("flashcard-view");
    elements.quizView = document.getElementById("quiz-view");
    elements.buildView = document.getElementById("build-view");
    elements.progressView = document.getElementById("progress-view");
    elements.voicetestView = document.getElementById("voicetest-view");
    elements.actionBar = document.getElementById("action-bar");
    elements.bottomBar = document.getElementById("bottom-bar");
    elements.hamburgerPanel = document.getElementById("hamburger-panel");
    elements.hamburgerBackdrop = document.getElementById("hamburger-backdrop");
    elements.helpView = document.getElementById("help-view");
    elements.themeIcon = document.getElementById("theme-icon");
    elements.themeLabel = document.getElementById("theme-label");
    elements.fontIcon = document.getElementById("font-icon");
    elements.fontLabel = document.getElementById("font-label");
    elements.appLanguageControl = document.getElementById(
      "app-language-control",
    );
    elements.settingsSheet = document.getElementById("settings-sheet");
    elements.settingsBody = document.getElementById("settings-body");
    elements.targetSelectView = document.getElementById("target-select-view");

    // 2. Load Manifest & Registry
    manifest = await loadManifest();
    registry = createRegistry(manifest?.zabon?.languages || []);

    // FIX 1: Initialize settings first, then compute lessonLanguages with the targetLang
    const settings = normalizeSettings(loadJSON(STORAGE_KEYS.settings, {}));
    state = {
      settings,
      lessonLanguages: [], // Temporary empty array
    };

    // Now pass the targetLanguage explicitly
    state.lessonLanguages = normalizeLessonLanguages(
      loadJSON(STORAGE_KEYS.lessonLanguages, null),
      settings.targetLanguage,
    );

    // 3. Initialize mediaService EARLY
    mediaService = new MediaService(registry);

    // 4. FIX: Initialize dataService EARLY so UI localization works before target language is chosen
    dataService = new DataService({ items: [] }, registry);

    // 5. Apply initial UI state
    applyTheme();
    applyFont();
    applyDocumentLanguage();
    refreshVoices();
    bindGlobalEvents();
    renderStaticLabels();
    renderHamburger();
    elements.targetLanguageControl = document.getElementById(
      "target-language-control",
    );
    renderTargetLanguageControl();

    // 6. voiceschanged listener
    if (
      mediaService.supported &&
      typeof window.speechSynthesis.addEventListener === "function"
    ) {
      window.speechSynthesis.addEventListener("voiceschanged", () => {
        refreshVoices();
        if (elements.settingsSheet && !elements.settingsSheet.hidden)
          renderSettings();
      });
    }

    // 7. v3 Target Language Flow: Halt if not selected
    if (!state.settings.targetLanguage) {
      renderTargetSelect();
      return; // Halt here until target is selected
    }

    // 8. Initialize namespaced services (now that targetLanguage is set)
    resetTargetScopedServices();

    // 9. Render Home
    goHome();

    // 10. Expose to window for debugging
    window.ZabonV2 = {
      state,
      registry,
      manifest,
      dataService,
      mediaService,
      srsService,
      quizProgressService,
    };
  }
})();

import { db } from "../../db/index.js";
import {
  assessmentResources,
  resourceChunks,
  resources,
  assessments,
} from "../../db/schema.js";
import { eq } from "drizzle-orm";
import axios from "axios";

export interface QuestionBlockLike {
  id?: number | null;
  questionType: string;
  questionCount: number;
  durationPerQuestion?: number | null;
  numOptions?: number | null;
  leftCount?: number | null;
  rightCount?: number | null;
  positiveMarks?: string | number | null;
  negativeMarks?: string | number | null;
}

// Scraper function to fetch and clean raw text from external URLs
async function scrapeExternalLink(url: string): Promise<string> {
  try {
    const response = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      },
      timeout: 8000,
    });

    const html = response.data;
    if (typeof html !== "string") return "";

    // Remove scripts, styles, SVGs, noscripts, navigation, headers, footers, and boilerplate
    let cleanText = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ")
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ")
      .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, " ")
      .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, " ")
      .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, " ")
      .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, " ")
      .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, " ")
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&[a-z0-9#]+;/gi, " ")
      .replace(/https?:\/\/[^\s]+/g, " ")
      .replace(/\b[a-f0-9]{24,}\b/gi, " ")
      .replace(/\s+/g, " ")
      .trim();

    // Limit single link content to avoid token overflow
    return cleanText.substring(0, 4000);
  } catch (error) {
    console.error(`Failed to scrape link: ${url}`, error instanceof Error ? error.message : error);
    return "";
  }
}

export async function gatherAssessmentContext(assessmentId: number): Promise<string> {
  // 1. Fetch chunks from linked uploaded resources (PDFs)
  const linkedResources = await db
    .select({ chunkText: resourceChunks.chunkText })
    .from(assessmentResources)
    .innerJoin(resources, eq(assessmentResources.resourceId, resources.id))
    .innerJoin(resourceChunks, eq(resourceChunks.resourceId, resources.id))
    .where(eq(assessmentResources.assessmentId, assessmentId))
    .limit(15);

  let contextParts = linkedResources.map((r) => r.chunkText);

  // 2. Fetch and scrape stored external links
  const [assessmentData] = await db
    .select({ externalLinks: assessments.externalLinks })
    .from(assessments)
    .where(eq(assessments.id, assessmentId))
    .limit(1);

  if (assessmentData?.externalLinks && Array.isArray(assessmentData.externalLinks)) {
    console.log(`[Scraper] Found ${assessmentData.externalLinks.length} external links to process.`);
    for (const url of assessmentData.externalLinks) {
      if (typeof url === "string" && url.startsWith("http")) {
        const pageText = await scrapeExternalLink(url);
        if (pageText) {
          contextParts.push(`\n--- Source Link: ${url} ---\n${pageText}`);
        }
      }
    }
  }

  return contextParts.join("\n\n");
}

function getQuestionTypeDetail(
  langPack: (typeof PROMPT_LANG_PACKS)[keyof typeof PROMPT_LANG_PACKS],
  qType: string,
  opts?: number | null,
  left?: number | null,
  right?: number | null
): { name: string; detail: string; rule: string } {
  if (qType === "multiple_choice") {
    const t = langPack.questionTypes.multiple_choice;
    return { name: t.name, detail: t.detail(opts ?? 4), rule: t.rule };
  }
  if (qType === "matching") {
    const t = langPack.questionTypes.matching;
    return { name: t.name, detail: t.detail(left ?? 3, right ?? 4), rule: t.rule };
  }
  if (qType === "true_false") {
    const t = langPack.questionTypes.true_false;
    return { name: t.name, detail: t.detail(), rule: t.rule };
  }
  if (qType === "short_answer") {
    const t = langPack.questionTypes.short_answer;
    return { name: t.name, detail: t.detail(), rule: t.rule };
  }
  if (qType === "fill_in_the_blank") {
    const t = langPack.questionTypes.fill_in_the_blank;
    return { name: t.name, detail: t.detail(), rule: t.rule };
  }
  const fallback = langPack.questionTypes.multiple_choice;
  return { name: qType, detail: fallback.detail(opts ?? 4), rule: fallback.rule };
}

export function buildBlockPrompt(
  block: QuestionBlockLike,
  instructorPrompt: string,
  context: string,
  languageCodeOrLabel: string,
  targetLangLabel?: string,
  maxContextChars = 4000
): string {
  const normLang = normalizeLang(languageCodeOrLabel);
  const langPack = PROMPT_LANG_PACKS[normLang] || PROMPT_LANG_PACKS.en;
  const langLabel = targetLangLabel || (normLang === "ur" ? "Urdu" : normLang === "ar" ? "Arabic" : normLang === "fa" ? "Persian" : "English");

  const { name: typeName, detail } = getQuestionTypeDetail(
    langPack,
    block.questionType,
    block.numOptions,
    block.leftCount,
    block.rightCount
  );

  const localizedInstruction = normLang === "all"
    ? `Generate exactly ${block.questionCount} ${typeName} (${block.questionType}) ${detail} covering all 4 languages: English, Urdu (اردو), Arabic (العربية), and Persian (فارسی).\nEvery question text, option choice, and answer MUST be translated into all 4 languages. Do not include raw URLs, tracking code, or HTML artifacts.`
    : normLang === "ur"
    ? `اردو زبان میں نوعیت "${typeName}" (${block.questionType}) کے بالکل ${block.questionCount} سوالات تیار کریں۔\nتمام سوالات کا متن، ممکنہ اختیارات اور جوابات لازماً اور صرف اردو زبان میں تحریر کریں۔ اگر حوالہ جاتی مواد کسی اور زبان میں ہو تو اس کا اردو میں ترجمہ کر کے سوالات بنائیں۔ کسی بھی قسم کا غیر متعلقہ ویب کوڈ یا HTML ٹیگز شامل نہ کریں۔`
    : normLang === "ar"
    ? `قم بإنشاء عدد ${block.questionCount} من أسئلة نوع "${typeName}" (${block.questionType}) باللغة العربية الفصحى.\nيجب صياغة جميع نصوص الأسئلة والخيارات والإجابات باللغة العربية الفصحى حصراً. إذا كانت المراجع بأي لغة أخرى، قم بترجمتها واستيعابها في الأسئلة. تجنب أي وسوم HTML أو أكواد تتبع تقنية.`
    : normLang === "fa"
    ? `تعداد ${block.questionCount} سوال از نوع "${typeName}" (${block.questionType}) به زبان فارسی تدوین نمایید.\nتمامی متون سوالات، گزینه‌ها و پاسخ‌ها باید منحصراً و کاملاً به زبان فارسی نگارش شوند. اگر منابع به زبان دیگری هستند، مفاهیم علمی را درک کرده و سوالات را به فارسی تدوین کنید. از درج کدهای وب یا برچسب‌های نامربوط خودداری نمایید.`
    : `Generate exactly ${block.questionCount} ${typeName} (${block.questionType}) ${detail} in ${langLabel}.\nAll question text, options, and answers MUST be composed strictly in ${langLabel}. If reference material or links are in another language, translate and adapt the concepts into ${langLabel}. Do not include raw URLs, tracking code, or HTML artifacts.`;

  return `${localizedInstruction}

${instructorPrompt ? `${langPack.metadataLabels.instructions} "${instructorPrompt}"\n` : ""}${context ? `${langPack.metadataLabels.context}\n${context.substring(0, maxContextChars)}\n` : ""}
${langPack.schemaHeader}
[
  {
    "question_text": "${langPack.schemaQuestion}",
    "question_type": "${block.questionType}",
${block.questionType === "multiple_choice" ? `    "options": ${langPack.schemaOptions},\n    "correct_answer": ${langPack.schemaCorrectAnswer},` : ""}${block.questionType === "true_false" ? `    "options": ${normLang === "ur" ? '["درست", "غلط"]' : normLang === "ar" ? '["صواب", "خطأ"]' : normLang === "fa" ? '["صحیح", "غلط"]' : '["True", "False"]'},\n    "correct_answer": ${normLang === "ur" ? '"درست"' : normLang === "ar" ? '"صواب"' : normLang === "fa" ? '"صحیح"' : '"True"'},` : ""}${block.questionType === "short_answer" ? `    "correct_answer": ${langPack.schemaCorrectAnswer},` : ""}${block.questionType === "fill_in_the_blank" ? `    "correct_answer": ${langPack.schemaCorrectAnswer},` : ""}${block.questionType === "matching" ? `    "left_items": ${langPack.schemaOptions},\n    "right_items": ${langPack.schemaOptions},\n    "correct_answer": ${normLang === "ur" ? '"جملہ جوڑوں کا درست مطابقت والا JSON"' : normLang === "ar" ? '"مطابقة الأزواج بصيغة JSON"' : normLang === "fa" ? '"تطابق جفت‌ها در قالب JSON"' : '"JSON match pairs"'},` : ""}
    "positive_marks": ${block.positiveMarks ?? 1},
    "negative_marks": ${block.negativeMarks ?? 0.25},
    "duration_per_question": ${block.durationPerQuestion ?? 60}
  }
]

${langPack.ruleJsonOnly}`;
}

export function parseQuestionsFromAI(raw: string, _questionType: string): object[] {
  try {
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (!jsonMatch?.[0]) return [];
    return JSON.parse(jsonMatch[0]) as object[];
  } catch {
    return [];
  }
}

// ─── Multi-Language Prompts & Comprehensive Language Packs ───────────────────

export const MULTILANGUAGE_PROMPTS: Record<string, string> = {
  all: `Generate a complete multi-language assignment covering all 4 supported languages: English, Urdu (اردو), Arabic (العربية), and Persian (فارسی).

[English] Generate a complete assignment including instructions, question items, marks distribution, and answer key.
[Urdu / اردو] ایک مکمل اسائنمنٹ تیار کریں جس میں ہدایات، سوالات، نمبروں کی تقسیم اور جوابات کی کلید شامل ہو۔
[Arabic / العربية] إنشاء واجب كامل يتضمن التعليمات والأسئلة وتوزيع الدرجات ونموذج الإجابة.
[Persian / فارسی] یک تکلیف کامل شامل دستورالعمل‌ها، سوالات، بارم‌بندی و کلید پاسخ‌ها ایجاد کنید.`,
  en: "Generate a complete assignment including instructions, question items, marks distribution, and answer key.",
  ur: "ایک مکمل اسائنمنٹ تیار کریں جس میں ہدایات، سوالات، نمبروں کی تقسیم اور جوابات کی کلید شامل ہو۔",
  ar: "إنشاء واجب كامل يتضمن التعليمات والأسئلة وتوزيع الدرجات ونموذج الإجابة.",
  fa: "یک تکلیف کامل شامل دستورالعمل‌ها، سوالات، بارم‌بندی و کلید پاسخ‌ها ایجاد کنید.",
};

function normalizeLang(lang?: string): "all" | "en" | "ur" | "ar" | "fa" {
  if (!lang) return "all";
  const l = lang.toLowerCase();
  if (l === "all" || l.includes("combined") || l.includes("multi")) return "all";
  if (l === "ur" || l.includes("urdu")) return "ur";
  if (l === "ar" || l.includes("arab")) return "ar";
  if (l === "fa" || l.includes("persian") || l.includes("farsi")) return "fa";
  if (l === "en" || l.includes("eng")) return "en";
  return "all";
}

export const PROMPT_LANG_PACKS = {
  all: {
    targetLangName: "All 4 Languages (English, Urdu / اردو, Arabic / العربية, Persian / فارسی)",
    directive: `CRITICAL ALL-4-LANGUAGES GENERATION REQUIREMENT:
1. MULTI-LANGUAGE QUESTIONS: Every single question in the assignment MUST be generated with full content in all 4 languages: English, Urdu (اردو), Arabic (العربية), and Persian (فارسی).
2. "question_text" FORMAT: In question_text, provide the question in all 4 languages separated by line breaks:
   [English] <Question in English>
   [اردو] <سوال اردو میں>
   [العربية] <السؤال بالعربية الفصحى>
   [فارسی] <سوال به زبان فارسی>
3. "options" FORMAT: For multiple choice questions, every option MUST include all 4 translations:
   "[EN] <Option text> | [UR] <اردو متن> | [AR] <النص العربي> | [FA] <متن فارسی>"
4. "correct_answer" FORMAT: The correct answer matching the exact option string with all 4 languages.
5. "translations" OBJECT: Each question item MUST include a structured "translations" object containing separated fields for each language:
   "translations": {
     "en": { "question_text": "...", "options": [...], "correct_answer": "..." },
     "ur": { "question_text": "...", "options": [...], "correct_answer": "..." },
     "ar": { "question_text": "...", "options": [...], "correct_answer": "..." },
     "fa": { "question_text": "...", "options": [...], "correct_answer": "..." }
   }
6. NO CORRUPTED CODES: Do NOT output HTML fragments, tracking codes, or URLs into question items. Produce genuine educational questions across all 4 languages.`,
    metadataLabels: {
      title: "Assignment Title:",
      instructions: "Instructor Instructions / Topic:",
      context: "Reference Material (Translate and adapt into all 4 languages):",
    },
    reqHeader: "Assignment Requirements & Marks Distribution (All 4 Languages):",
    totalQ: (count: number) => `Total Questions to Generate: ${count} (each generated across English, Urdu, Arabic, Persian)`,
    sectionLine: (sNum: number, qCount: number, typeName: string, detail: string, pMarks: number | string, nMarks: number | string, dur: number) =>
      `- Section ${sNum}: Exactly ${qCount} questions of type "${typeName}" ${detail} [Marks: +${pMarks} positive, ${nMarks} negative, Time: ${dur}s per question] (All 4 Languages required)`,
    questionTypes: {
      multiple_choice: {
        name: "Multiple Choice Questions (multiple_choice / MCQs)",
        detail: (opts: number) => `with exactly ${opts} options provided in all 4 languages (English, Urdu, Arabic, Persian)`,
        rule: "For multiple_choice, every option must contain the translated choice in all 4 languages: [EN] ... | [UR] ... | [AR] ... | [FA] ..., and include the 'translations' object.",
      },
      short_answer: {
        name: "Short Answer Questions (short_answer)",
        detail: () => "concise 1-3 sentence model answers provided in all 4 languages",
        rule: "For short_answer, correct_answer must contain the model answer in all 4 languages.",
      },
      true_false: {
        name: "True/False Questions (true_false)",
        detail: () => "true/false format with all 4 language labels",
        rule: 'For true_false, options must be ["True / درست / صواب / صحیح", "False / غلط / خطأ / غلط"].',
      },
      matching: {
        name: "Matching Questions (matching)",
        detail: (l: number, r: number) => `with ${l} left items and ${r} right options in all 4 languages`,
        rule: "For matching, include 'left_items' and 'right_items' translated into all 4 languages.",
      },
      fill_in_the_blank: {
        name: "Fill-in-the-Blank Questions (fill_in_the_blank)",
        detail: () => "clear missing phrase with [_______] blank indicator in all 4 languages",
        rule: "For fill_in_the_blank, mark the blank with _______ in question_text across all 4 languages.",
      },
    },
    schemaHeader: "Response Schema (All 4 Languages Unified Structure):\nReturn ONLY a valid JSON object matching this multi-language structure:",
    schemaInstructions: "Read all questions carefully / تمام سوالات کو غور سے پڑھیں / اقرأ الأسئلة بعناية / سوالات را با دقت بخوانید",
    schemaQuestion: `[English] Question text in English\\n[اردو] سوال کا متن اردو میں\\n[العربية] نص السؤال بالعربية\\n[فارسی] متن سوال به زبان فارسی`,
    schemaOptions: `[
        "[EN] Option A | [UR] آپشن الف | [AR] الخيار الأول | [FA] گزینه اول",
        "[EN] Option B | [UR] آپشن ب | [AR] الخيار الثاني | [FA] گزینه دوم",
        "[EN] Option C | [UR] آپشن ج | [AR] الخيار الثالث | [FA] گزینه سوم",
        "[EN] Option D | [UR] آپشن د | [AR] الخيار الرابع | [FA] گزینه چهارم"
      ]`,
    schemaCorrectAnswer: '"[EN] Option A | [UR] آپشن الف | [AR] الخيار الأول | [FA] گزینه اول"',
    rulesHeader: "Strict Multi-Language Rules:",
    ruleOrder: "1. Provide questions in exact order of the sections defined above.",
    ruleJsonOnly: "7. Return ONLY the JSON object. Do not include markdown or conversational prefixes.",
  },

  ur: {
    targetLangName: "اردو (Urdu / ur)",
    directive: `اہم ہدایات برائے اردو زبان و تدریسی مواد:
1. ہدف زبان خالص اردو (اردو رسم الخط) ہے۔ ہر ایک سوال، کثیر الانتخابی سوالات کے چاروں اختیارات، درست جواب اور رہنمائی 100٪ معیاری و شستہ اردو میں ہونی چاہیے۔
2. حوالہ جاتی مواد کا مکمل ترجمہ: اگر نیچے فراہم کردہ حوالہ جاتی دستاویزات، کتابیں یا ویب لنکس انگریزی یا کسی دوسری زبان میں ہوں، تب بھی آپ کو علمی مفہوم سمجھ کر تمام تر سوالات، معروضی اختیارات اور جوابات مکمل اردو میں تیار کرنے ہیں۔
3. ویب کوڈ یا خراب الفاظ کی مکمل ممانعت: کسی بھی سوال یا آپشن میں غیر متعلقہ ویب کوڈ، HTML ٹیگز، لنکس، ٹریکنگ کوڈ یا ناہموار الفاظ شامل نہ کریں۔ تمام سوالات خالص اور معیاری تعلیمی اردو میں ہوں۔
4. معنی خیز اردو اختیارات: کثیر الانتخابی سوالات (MCQs) میں ہر ایک آپشن اردو میں بامعنی اور مکمل جواب ہو۔ صرف "آپشن الف" یا انگریزی "Option A" جیسی فرضی علامتیں نہ لکھیں۔`,
    metadataLabels: {
      title: "اسائنمنٹ کا عنوان:",
      instructions: "استاد کی ہدایات / موضوع:",
      context: "حوالہ جاتی مواد (اس مواد کا فہم حاصل کر کے مکمل اردو میں سوالات ڈھالیں):",
    },
    reqHeader: "اسائنمنٹ کی ساخت، سیکشنز اور نمبروں کی تقسیم:",
    totalQ: (count: number) => `کل مطلوبہ سوالات کی تعداد: ${count}`,
    sectionLine: (sNum: number, qCount: number, typeName: string, detail: string, pMarks: number | string, nMarks: number | string, dur: number) =>
      `- سیکشن ${sNum}: ${qCount} سوالات برائے نوعیت "${typeName}" ${detail} [نمبر: +${pMarks} مثبت، ${nMarks} منفی، وقت: ${dur} سیکنڈ فی سوال]`,
    questionTypes: {
      multiple_choice: {
        name: "کثیر الانتخابی سوالات (MCQs / multiple_choice)",
        detail: (opts: number) => `بالکل ${opts} اختیارات (الف، ب، ج، د) کے ساتھ`,
        rule: "کثیر الانتخابی سوالات (multiple_choice / MCQs) کے تمام options اردو زبان میں مکمل سٹرنگز کی ارے ہوں، اور correct_answer ان میں سے درست آپشن کا ہو بہو متن ہو۔",
      },
      short_answer: {
        name: "مختصر جواب والے سوالات (short_answer)",
        detail: () => "1 تا 3 جملوں پر مشتمل جامع ماڈل جواب کے ساتھ",
        rule: "مختصر جوابات (short_answer) کے لیے correct_answer اردو میں 1 سے 3 جملوں پر مشتمل جامع ماڈل جواب ہو۔",
      },
      true_false: {
        name: "درست یا غلط سوالات (true_false)",
        detail: () => "درست / غلط فارمیٹ کے ساتھ",
        rule: 'درست/غلط سوالات (true_false) کے لیے اختیارات ["درست", "غلط"] (یا ["True", "False"]) اور correct_answer درست جواب ہو۔',
      },
      matching: {
        name: "جوڑے ملانے والے سوالات (matching)",
        detail: (l: number, r: number) => `بائیں جانب ${l} اور دائیں جانب ${r} متبادل آئٹمز کے ساتھ`,
        rule: 'جوڑے ملانے والے سوالات (matching) کے لیے "left_items" اور "right_items" اردو میں سٹرنگز کی ارے ہوں، اور correct_answer میں ان کے درست جوڑوں کی وضاحت ہو۔',
      },
      fill_in_the_blank: {
        name: "خالی جگہیں پر کرنے والے سوالات (fill_in_the_blank)",
        detail: () => "واضح خالی جگہ _______ اور درست مطلوبہ لفظ کے ساتھ",
        rule: "خالی جگہ پر کرنے والے سوالات (fill_in_the_blank) کے لیے question_text کے اندر مطلوبہ خالی جگہ کو _______ سے ظاہر کریں اور correct_answer اردو میں وہ مطلوبہ لفظ ہو۔",
      },
    },
    schemaHeader: "مطلوبہ JSON جواب کا ڈھانچہ (Response Schema):\nصرف اور صرف درج ذیل ساخت کے عین مطابق ایک درست JSON آبجیکٹ لوٹائیں:",
    schemaInstructions: "اردو میں اسائنمنٹ کی عمومی اور جامع ہدایات",
    schemaQuestion: "سوال کا مکمل اور معیاری متن یہاں اردو میں لکھیں",
    schemaOptions: '["پہلا ممکنہ جواب", "دوسرا ممکنہ جواب", "تیسرا ممکنہ جواب", "چوتھا ممکنہ جواب"]',
    schemaCorrectAnswer: '"پہلا ممکنہ جواب"',
    rulesHeader: "لازمی اور سخت شرائط و اصول:",
    ruleOrder: "1. تمام سوالات کو لازماً اوپر بیان کردہ سیکشنز کی ترتیب کے عین مطابق فراہم کریں۔",
    ruleJsonOnly: "7. صرف اور صرف درست JSON آبجیکٹ واپس کریں۔ جواب کے آغاز یا اختتام پر کوئی اضافی گفتگو، مارک ڈاؤن یا وضاحت نہ لکھیں۔",
  },

  ar: {
    targetLangName: "العربية (Arabic / ar)",
    directive: `قواعد اللغة والمحتوى المرجعي الصارمة:
1. اللغة المستهدفة هي العربية الفصحى. كل سؤال وخيار وإجابة نموذجية يجب أن يُكتب بنسبة 100٪ باللغة العربية الفصحى السليمة.
2. ترجمة المحتوى المرجعي: حتى لو كانت المراجع أو الروابط المرفقة أدناه باللغة الإنجليزية أو لغات أخرى، يجب استيعاب المادة العلمية وصياغة جميع الأسئلة والخيارات باللغة العربية الفصحى.
3. منع الأكواد والرموز المشوهة: تجنب إدراج أي وسوم HTML أو روابط ويب أو رموز تتبع تقنية. يجب أن تكون جميع الأسئلة بصياغة تربوية عربية رصينة.
4. خيارات واضحة ومتكاملة: في أسئلة الاختيار من متعدد، يجب أن يكون كل خيار جملة أو عبارة عربية متكاملة وذات معنى علمي واضح.`,
    metadataLabels: {
      title: "عنوان الواجب:",
      instructions: "تعليمات المدرس / الموضوع:",
      context: "المواد المرجعية (قم بترجمة هذه المادة واستيعابها وصياغة الأسئلة بالكامل باللغة العربية):",
    },
    reqHeader: "هيكل الواجب، الأقسام وتوزيع الدرجات:",
    totalQ: (count: number) => `إجمالي عدد الأسئلة المطلوب إنشاؤها: ${count}`,
    sectionLine: (sNum: number, qCount: number, typeName: string, detail: string, pMarks: number | string, nMarks: number | string, dur: number) =>
      `- القسم ${sNum}: عدد ${qCount} أسئلة من نوع "${typeName}" ${detail} [الدرجات: +${pMarks} إيجابي، ${nMarks} سلبي، الوقت: ${dur} ثانية لكل سؤال]`,
    questionTypes: {
      multiple_choice: {
        name: "أسئلة الاختيار من متعدد (multiple_choice / MCQs)",
        detail: (opts: number) => `مع ${opts} خيارات محددة بالضبط (أ، ب، ج، د)`,
        rule: "لأسئلة الاختيار من متعدد (multiple_choice)، يجب أن تكون الخيارات مصفوفة نصوص باللغة العربية، والإجابة الصحيحة (correct_answer) مطابقة تماماً لأحد الخيارات.",
      },
      short_answer: {
        name: "أسئلة الإجابة القصيرة (short_answer)",
        detail: () => "إجابات نموذجية موجزة تتكون من 1 إلى 3 جمل",
        rule: "لأسئلة الإجابة القصيرة (short_answer)، الإجابة الصحيحة نموذج إجابة واضح وموجز باللغة العربية (1 إلى 3 جمل).",
      },
      true_false: {
        name: "أسئلة الصواب والخطأ (true_false)",
        detail: () => "بصيغة صواب / خطأ",
        rule: 'لأسئلة الصواب والخطأ (true_false)، تكون الخيارات ["صواب", "خطأ"] (أو ["True", "False"]) والإجابة الصحيحة مطابقة لها.',
      },
      matching: {
        name: "أسئلة التوصيل والمطابقة (matching)",
        detail: (l: number, r: number) => `مع ${l} عناصر في القائمة الأولى و ${r} خيارات في القائمة المقابلة`,
        rule: 'لأسئلة المطابقة (matching)، يجب تضمين "left_items" و "right_items" باللغة العربية، والإجابة الصحيحة توضح التوافق الدقيق.',
      },
      fill_in_the_blank: {
        name: "أسئلة ملء الفراغات (fill_in_the_blank)",
        detail: () => "تحديد موضع الفراغ بعلامة _______ مع المصطلح المفقود في الإجابة",
        rule: "لأسئلة ملء الفراغات (fill_in_the_blank)، وضع علامة _______ في نص السؤال والمصطلح المفقود باللغة العربية في correct_answer.",
      },
    },
    schemaHeader: "مخطط الاستجابة الموحد (Response Schema):\nأعد كائن JSON صالحاً فقط يطابق الهيكل التالي تماماً وبدقة:",
    schemaInstructions: "التعليمات العامة والشاملة للواجب باللغة العربية الفصحى",
    schemaQuestion: "نص السؤال الكامل هنا باللغة العربية الفصحى",
    schemaOptions: '["الخيار الأول", "الخيار الثاني", "الخيار الثالث", "الخيار الرابع"]',
    schemaCorrectAnswer: '"الخيار الأول"',
    rulesHeader: "القواعد والضوابط الصارمة:",
    ruleOrder: "1. يجب تقديم الأسئلة بالترتيب الدقيق للأقسام المحددة أعلاه دون أي تغيير.",
    ruleJsonOnly: "7. إرجاع كائن JSON فقط دون أي نصوص تمهيدية، ختامية، أو علامات ماركداون خارج الكائن.",
  },

  fa: {
    targetLangName: "فارسی (Persian / fa)",
    directive: `قوانین و الزامات نگارش به زبان فارسی:
۱. زبان هدف منحصراً فارسی است. تمام سوالات، گزینه‌های تستی، پاسخ‌های کوتاه و راهنمای تصحیح باید ۱۰۰٪ به زبان فارسی فصیح و روان نگارش یابند.
۲. ترجمه کامل منابع و مستندات: حتی اگر منابع پیوست شده یا پیوندهای وب به زبان انگلیسی یا هر زبان دیگری باشند، باید مفاهیم علمی را درک کرده و تمامی سوالات و گزینه‌ها را کاملاً به زبان فارسی تدوین نمایید.
۳. عدم استفاده از کدهای وب یا نشانه‌های نامعتبر: هیچ‌گونه برچسب HTML، کدهای برنامه‌نویسی غیرمرتبط یا نشانه‌های وب نباید وارد متن سوالات یا گزینه‌ها شود. تمام عبارات باید با نثر استاندارد آموزشی فارسی نگاشته شوند.
۴. گزینه‌های معنادار و دقیق: برای سوالات چندگزینه‌ای، هر گزینه باید متنی گویا و مستقل به زبان فارسی باشد؛ از نوشتن عبارات ناقص یا صرفاً "گزینه الف" خودداری نمایید.`,
    metadataLabels: {
      title: "عنوان تکلیف:",
      instructions: "دستورالعمل‌های استاد / موضوع:",
      context: "منابع و محتوای مرجع (این محتوا را کاملاً درک نموده و سوالات را به زبان فارسی تالیف کنید):",
    },
    reqHeader: "ساختار تکلیف، بخش‌ها و توزیع بارم‌بندی:",
    totalQ: (count: number) => `تعداد کل سوالات مورد نظر: ${count}`,
    sectionLine: (sNum: number, qCount: number, typeName: string, detail: string, pMarks: number | string, nMarks: number | string, dur: number) =>
      `- بخش ${sNum}: تعداد ${qCount} سوال از نوع "${typeName}" ${detail} [بارم: +${pMarks} نمره مثبت، ${nMarks} منفی، زمان: ${dur} ثانیه به ازای هر سوال]`,
    questionTypes: {
      multiple_choice: {
        name: "سوالات چند گزینه‌ای / چهارگزینه‌ای (multiple_choice / MCQs)",
        detail: (opts: number) => `با دقیقا ${opts} گزینه مشخص (الف، ب، ج، د)`,
        rule: "برای سوالات چندگزینه‌ای (multiple_choice / MCQs)، گزینه‌ها باید آرایه‌ای از رشته‌های متنی به زبان فارسی باشند و correct_answer دقیقاً متن گزینه درست باشد.",
      },
      short_answer: {
        name: "سوالات پاسخ کوتاه (short_answer)",
        detail: () => "پاسخ تشریحی و کلیدی در حد ۱ تا ۳ جمله",
        rule: "برای سوالات پاسخ کوتاه (short_answer)، پاسخ نمونه (correct_answer) یک پاسخ تشریحی جامع و موجز ۱ تا ۳ جمله‌ای به زبان فارسی باشد.",
      },
      true_false: {
        name: "سوالات صحیح یا غلط (true_false)",
        detail: () => "قالب صحیح / غلط",
        rule: 'برای سوالات صحیح/غلط (true_false)، گزینه‌ها ["صحیح", "غلط"] (یا ["True", "False"]) و پاسخ صحیح منطبق با آن باشد.',
      },
      matching: {
        name: "سوالات تطبیقی و جورکردنی (matching)",
        detail: (l: number, r: number) => `شامل ${l} مورد در ستون اول و ${r} گزینه در ستون دوم`,
        rule: 'برای سوالات تطبیقی و وصل‌کردنی (matching)، اقلام "left_items" و "right_items" به زبان فارسی درج شوند و پاسخ صحیح تطابق آنها باشد.',
      },
      fill_in_the_blank: {
        name: "سوالات جای خالی (fill_in_the_blank)",
        detail: () => "مشخص کردن جای خالی با علامت _______ و ذکر واژه مناسب در پاسخ",
        rule: "برای سوالات جای خالی (fill_in_the_blank)، جای خالی با علامت _______ در متن سوال مشخص شده و پاسخ صحیح واژه مناسب به فارسی باشد.",
      },
    },
    schemaHeader: "الگوی ساختار پاسخ (Response Schema):\nفقط و فقط یک آبجکت معتبر JSON منطبق با ساختار زیر ارسال کنید:",
    schemaInstructions: "دستورالعمل جامع و کامل تکلیف به زبان فارسی",
    schemaQuestion: "متن کامل و دقیق سوال به زبان فارسی در اینجا",
    schemaOptions: '["گزینه اول", "گزینه دوم", "گزینه سوم", "گزینه چهارم"]',
    schemaCorrectAnswer: '"گزینه اول"',
    rulesHeader: "قوانین و الزامات سخت‌گیرانه:",
    ruleOrder: "۱. سوالات باید دقیقاً مطابق با ترتیب بخش‌های تعریف‌شده در بالا تولید شوند.",
    ruleJsonOnly: "۷. فقط آبجکت JSON معتبر بازگردانید و از درج هرگونه یادداشت، توضیح پیش‌فرض یا نشانه‌گذاری‌های اضافی خودداری نمایید.",
  },

  en: {
    targetLangName: "English (en)",
    directive: `CRITICAL LANGUAGE & SOURCE ADAPTATION RULES:
1. Target Language is ENGLISH. Every question, multiple choice option, instruction, and answer key item MUST be written in clear English.
2. If reference material or links are in another language, translate the core concepts into English.
3. NO RAW CODE / METADATA: Do NOT copy raw URLs, HTML snippets, or website tracking parameters. Every question and choice must be clean educational prose.
4. MEANINGFUL CHOICES: For multiple-choice questions, every option must be a full, meaningful answer in English.`,
    metadataLabels: {
      title: "Assignment Title:",
      instructions: "Instructor Instructions / Topic:",
      context: "Reference Material (Translate and adapt into English):",
    },
    reqHeader: "Assignment Requirements & Marks Distribution:",
    totalQ: (count: number) => `Total Questions to Generate: ${count}`,
    sectionLine: (sNum: number, qCount: number, typeName: string, detail: string, pMarks: number | string, nMarks: number | string, dur: number) =>
      `- Section ${sNum}: Exactly ${qCount} questions of type "${typeName}" ${detail} [Marks: +${pMarks} positive, ${nMarks} negative, Time: ${dur}s per question]`,
    questionTypes: {
      multiple_choice: {
        name: "Multiple Choice Questions (multiple_choice)",
        detail: (opts: number) => `with exactly ${opts} options (A, B, C, D...)`,
        rule: "For multiple_choice, options must be an array of strings in English, and correct_answer must match the exact string of the correct choice.",
      },
      short_answer: {
        name: "Short Answer Questions (short_answer)",
        detail: () => "1-3 sentence answers",
        rule: "For short_answer, correct_answer is a model answer string in English (1-3 sentences).",
      },
      true_false: {
        name: "True/False Questions (true_false)",
        detail: () => "true/false format",
        rule: 'For true_false, options must be ["True", "False"], and correct_answer "True" or "False".',
      },
      matching: {
        name: "Matching Questions (matching)",
        detail: (l: number, r: number) => `with ${l} left items and ${r} right options`,
        rule: 'For matching, include "left_items" (array of strings) and "right_items" (array of strings in English), and correct_answer as JSON match mapping.',
      },
      fill_in_the_blank: {
        name: "Fill-in-the-Blank Questions (fill_in_the_blank)",
        detail: () => "clear missing phrase/word with obvious _______ indicator",
        rule: "For fill_in_the_blank, mark the blank with _______ in question_text, and correct_answer is the missing term in English.",
      },
    },
    schemaHeader: "Response Schema:\nReturn ONLY a valid JSON object matching this unified structure:",
    schemaInstructions: "Overall assignment instructions in English",
    schemaQuestion: "Question text here in English",
    schemaOptions: '["Option A description", "Option B description", "Option C description", "Option D description"]',
    schemaCorrectAnswer: '"Option A description"',
    rulesHeader: "Strict Rules:",
    ruleOrder: "1. Provide questions in exact order of the sections defined above.",
    ruleJsonOnly: "7. Return ONLY the JSON object. Do not include markdown or conversational prefixes.",
  },
};

// ─── Unified Prompting Pipeline ───────────────────────────────────────────────

export function buildUnifiedAssignmentPrompt(
  blocks: QuestionBlockLike[],
  instructorPrompt: string,
  context: string,
  languageCode: string,
  languageLabel: string,
  title = "Assignment",
  maxContextChars = 12000
): string {
  const normLang = normalizeLang(languageCode);
  const langPack = PROMPT_LANG_PACKS[normLang] || PROMPT_LANG_PACKS.en;
  const baseInstruction = MULTILANGUAGE_PROMPTS[normLang] || MULTILANGUAGE_PROMPTS.en;

  const blockDescriptions = blocks.map((b, idx) => {
    const pMarks = b.positiveMarks ?? 1;
    const nMarks = b.negativeMarks ?? 0.25;
    const dur = b.durationPerQuestion ?? 60;
    const { name: typeName, detail } = getQuestionTypeDetail(
      langPack,
      b.questionType,
      b.numOptions,
      b.leftCount,
      b.rightCount
    );

    return langPack.sectionLine(idx + 1, b.questionCount, typeName, detail, pMarks, nMarks, dur);
  }).join("\n");

  const totalQuestions = blocks.reduce((sum, b) => sum + (b.questionCount || 0), 0);

  // Compile active rules for present question types
  const presentTypes = new Set(blocks.map((b) => b.questionType));
  const activeTypeRules: string[] = [];
  let ruleIdx = 2;

  (["multiple_choice", "true_false", "matching", "short_answer", "fill_in_the_blank"] as const).forEach((t) => {
    if (presentTypes.has(t)) {
      const typeInfo = langPack.questionTypes[t];
      if (typeInfo) {
        activeTypeRules.push(`${ruleIdx}. ${typeInfo.rule}`);
        ruleIdx++;
      }
    }
  });

  const allRulesText = [
    langPack.ruleOrder,
    ...activeTypeRules,
    `${ruleIdx}. ${langPack.ruleJsonOnly.replace(/^\d+\.\s*/, "")}`,
  ].join("\n");

  return `${baseInstruction}

${normLang === "all" ? "Target Languages: All 4 Languages (English, Urdu / اردو, Arabic / العربية, Persian / فارسی).\nEvery question item, multiple choice option, and answer MUST be provided across all 4 languages." : normLang === "ur" ? "ہدف زبان: اردو (Urdu / ur)۔ تمام سوالات، آپشنز، ماڈل جوابات اور تفاصیل مکمل طور پر اردو میں ہوں گی۔" : normLang === "ar" ? "اللغة المستهدفة: العربية (Arabic / ar). يجب كتابة جميع الأسئلة والخيارات والإجابات باللغة العربية الفصحى." : normLang === "fa" ? "زبان هدف: فارسی (Persian / fa). تمامی صورت سوالات، گزینه‌ها و پاسخ‌ها منحصراً به زبان فارسی خواهند بود." : `Target Language: ${languageLabel} (${normLang}). All question text, options, and explanations MUST be written in ${languageLabel}.`}

${langPack.directive}

Multilingual Reference Instruction:
[English] Generate a complete assignment including instructions, question items, marks distribution, and answer key.
[Urdu / اردو] ایک مکمل اسائنمنٹ تیار کریں جس میں ہدایات، سوالات، نمبروں کی تقسیم اور جوابات کی کلید شامل ہو۔
[Arabic / العربية] إنشاء واجب كامل يتضمن التعليمات والأسئلة وتوزيع الدرجات ونموذج الإجابة.
[Persian / فارسی] یک تکلیف کامل شامل دستورالعمل‌ها، سوالات، بارم‌بندی و کلید پاسخ‌ها ایجاد کنید.

${langPack.metadataLabels.title} "${title}"
${instructorPrompt ? `${langPack.metadataLabels.instructions} "${instructorPrompt}"\n` : ""}${context ? `${langPack.metadataLabels.context}\n${context.substring(0, maxContextChars)}\n` : ""}
${langPack.reqHeader}
${langPack.totalQ(totalQuestions)}
${blockDescriptions}

${langPack.schemaHeader}
{
  "instructions": ${normLang === "all" ? `{
    "en": "Read all questions carefully and select the best answer for each choice.",
    "ur": "تمام سوالات کو غور سے پڑھیں اور ہر سوال کے لیے بہترین جواب منتخب کریں۔",
    "ar": "اقرأ جميع الأسئلة بعناية واختر أفضل إجابة لكل سؤال.",
    "fa": "همه سوالات را به دقت بخوانید و بهترین گزینه را برای هر سوال انتخاب نمایید."
  }` : `"${langPack.schemaInstructions}"`},
  "questions": [
    {
      "question_order": 1,
      "question_type": "multiple_choice",
      "question_text": "${langPack.schemaQuestion}",
      "options": ${langPack.schemaOptions},
      "correct_answer": ${langPack.schemaCorrectAnswer},
${normLang === "all" ? `      "translations": {
        "en": {
          "question_text": "Question text in English",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correct_answer": "Option A"
        },
        "ur": {
          "question_text": "سوال کا متن اردو میں",
          "options": ["آپشن الف", "آپشن ب", "آپشن ج", "آپشن د"],
          "correct_answer": "آپشن الف"
        },
        "ar": {
          "question_text": "نص السؤال بالعربية",
          "options": ["الخيار الأول", "الخيار الثاني", "الخيار الثالث", "الخيار الرابع"],
          "correct_answer": "الخيار الأول"
        },
        "fa": {
          "question_text": "متن سوال به زبان فارسی",
          "options": ["گزینه اول", "گزینه دوم", "گزینه سوم", "گزینه چهارم"],
          "correct_answer": "گزینه اول"
        }
      },
` : ""}      "positive_marks": 1,
      "negative_marks": 0.25,
      "duration_per_question": 60
    }
  ],
  "answer_key": [
    {
      "question_order": 1,
      "correct_answer": ${langPack.schemaCorrectAnswer}
    }
  ]
}

${langPack.rulesHeader}
${allRulesText}`;
}

export function parseUnifiedAssignmentQuestionsFromAI(raw: string, blocks: QuestionBlockLike[]): object[] {
  let extractedQuestions: Array<Record<string, unknown>> = [];
  try {
    const trimmed = raw.trim();
    // 1. Try parsing JSON object with "questions" array
    const objMatch = trimmed.match(/\{[\s\S]*\}/);
    if (objMatch?.[0]) {
      const parsedObj = JSON.parse(objMatch[0]);
      if (Array.isArray(parsedObj.questions)) {
        extractedQuestions = parsedObj.questions;
      }
    }
    // 2. If no questions array in object, try parsing JSON array directly
    if (extractedQuestions.length === 0) {
      const arrMatch = trimmed.match(/\[[\s\S]*\]/);
      if (arrMatch?.[0]) {
        extractedQuestions = JSON.parse(arrMatch[0]);
      }
    }
  } catch (err) {
    console.error("[UnifiedPromptParser] Error parsing AI response JSON:", err);
  }

  // Map extracted questions to blocks guaranteeing correct types, marks, and durations
  const finalQuestions: Array<Record<string, unknown>> = [];
  let questionPointer = 0;

  for (const block of blocks) {
    const count = block.questionCount || 1;
    for (let i = 0; i < count; i++) {
      let q = extractedQuestions[questionPointer];
      questionPointer++;

      if (!q || typeof q !== "object") {
        q = {
          question_text: `Question ${finalQuestions.length + 1} (${block.questionType})`,
          question_type: block.questionType,
          options: block.questionType === "multiple_choice" ? ["Option A", "Option B", "Option C", "Option D"] : undefined,
          correct_answer: block.questionType === "true_false" ? "True" : "Model answer",
        };
      }

      const isMatching = block.questionType === "matching";
      const leftItems = Array.isArray(q["left_items"])
        ? (q["left_items"] as unknown[]).map(String)
        : Array.isArray(q["leftItems"])
          ? (q["leftItems"] as unknown[]).map(String)
          : [];
      const rightItems = Array.isArray(q["right_items"])
        ? (q["right_items"] as unknown[]).map(String)
        : Array.isArray(q["rightItems"])
          ? (q["rightItems"] as unknown[]).map(String)
          : [];

      finalQuestions.push({
        question_order: finalQuestions.length + 1,
        question_type: block.questionType,
        question_text: String(q["question_text"] ?? q["questionText"] ?? `Question ${finalQuestions.length + 1}`),
        options: isMatching && leftItems.length > 0 && rightItems.length > 0
          ? [JSON.stringify({ leftItems, rightItems })]
          : Array.isArray(q["options"])
            ? (q["options"] as string[])
            : undefined,
        left_items: leftItems.length > 0 ? leftItems : undefined,
        right_items: rightItems.length > 0 ? rightItems : undefined,
        correct_answer: String(q["correct_answer"] ?? q["correctAnswer"] ?? ""),
        translations: (q["translations"] && typeof q["translations"] === "object") ? (q["translations"] as Record<string, unknown>) : undefined,
        positive_marks: block.positiveMarks ?? 1,
        negative_marks: block.negativeMarks ?? 0.25,
        duration_per_question: block.durationPerQuestion ?? 60,
      });
    }
  }

  return finalQuestions;
}


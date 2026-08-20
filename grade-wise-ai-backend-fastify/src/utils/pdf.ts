import PDFDocument from "pdfkit";
import type { Writable } from "stream";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface PhysicalPaperOptions {
  instituteName: string;
  teacherName: string;
  subjectName: string;
  paperDate: string;
  paperTime: string;
  paperDuration: string;
  totalMarks: number;
  notes?: string;
  pageSize: "A4" | "A5" | "LETTER";
  headerFontSize: number;
  bodyFontSize: number;
  optionFontSize?: number;
  questions: PaperQuestion[];
  language?: string;
}

export interface PaperQuestion {
  questionNumber: number;
  questionText: string;
  questionType: string;
  options?: string[];
  marks: number;
}

export function generatePhysicalPaperPdf(
  options: PhysicalPaperOptions,
  outputStream: Writable
): void {
  const {
    instituteName,
    teacherName,
    subjectName,
    paperDate,
    paperTime,
    paperDuration,
    totalMarks,
    notes,
    pageSize,
    headerFontSize,
    bodyFontSize,
    optionFontSize,
    questions,
    language = "en",
  } = options;

  const doc = new PDFDocument({
    size: pageSize,
    margins: { top: 50, bottom: 50, left: 60, right: 60 },
  });

  doc.pipe(outputStream);

  const langKey = language.toLowerCase();
  const isUrdu = langKey === "ur";
  const isRTL = ["ur", "ar", "fa", "sd", "ps"].includes(langKey);

  const LABELS: Record<string, { subject: string; teacher: string; total: string; duration: string; instructions: string; question: string; marks: string; answerKey: string; answerOmitted: string; options: string[] }> = {
    ar: {
      subject: "المادة:",
      teacher: "المعلم:",
      total: "المجموع الكلي:",
      duration: "المدة:",
      instructions: "التعليمات:",
      question: "السؤال",
      marks: "علامة",
      answerKey: "ورقة الإجابات",
      answerOmitted: "[الجواب غير متاح]",
      options: ["أ", "ب", "ج", "د", "هـ", "و"],
    },
    fa: {
      subject: "موضوع:",
      teacher: "معلم:",
      total: "مجموع نمرات:",
      duration: "مدت:",
      instructions: "دستورالعمل:",
      question: "سوال",
      marks: "نمره",
      answerKey: "راهنما",
      answerOmitted: "[جواب ذخیره شده]",
      options: ["ا", "ب", "ج", "د", "هـ", "و"],
    },
    ur: {
      subject: "مضمون:",
      teacher: "استاد:",
      total: "کل نمبر:",
      duration: "دورانیہ:",
      instructions: "ہدایات:",
      question: "سوال",
      marks: "نمبر",
      answerKey: "جوابی پرچہ",
      answerOmitted: "[جواب محفوظ ہے]",
      options: ["ا", "ب", "ج", "د", "ہ", "و"],
    },
  };
  const lbl: (typeof LABELS)["ur"] = LABELS[langKey] ?? LABELS.ur!;
  
  const nastaliqFontPath = process.env["URDU_FONT_PATH"] ?? path.join(__dirname, "..", "assets", "fonts", "NotoNastaliqUrdu-Regular.ttf");
  const quranicFontPath = process.env["ARABIC_FONT_PATH"] ?? path.join(__dirname, "..", "assets", "fonts", "AmiriQuran-Regular.ttf");
  const arabicFontPath = path.join(__dirname, "..", "assets", "fonts", "Amiri-Regular.ttf");

  let fontLoaded = false;
  let activeFontKey = "";

  if (isUrdu && fs.existsSync(nastaliqFontPath)) {
    doc.registerFont("UrduFont", nastaliqFontPath);
    activeFontKey = "UrduFont";
    fontLoaded = true;
  } else if (isRTL && fs.existsSync(quranicFontPath)) {
    // Amiri Quran — shared Quranic font for Arabic (and other RTL languages)
    doc.registerFont("ArabicFont", quranicFontPath);
    activeFontKey = "ArabicFont";
    fontLoaded = true;
  } else if (isRTL && fs.existsSync(arabicFontPath)) {
    // Fallback to standard Amiri if the Quranic variant is missing
    doc.registerFont("ArabicFont", arabicFontPath);
    activeFontKey = "ArabicFont";
    fontLoaded = true;
  } else if (isRTL && fs.existsSync(nastaliqFontPath)) {
    // Fallback for Arabic to Nastaliq if Arabic fonts are missing
    doc.registerFont("UrduFont", nastaliqFontPath);
    activeFontKey = "UrduFont";
    fontLoaded = true;
  }

  const applyFont = (isBold = false) => {
    if (fontLoaded && activeFontKey) {
      doc.font(activeFontKey);
    } else {
      doc.font(isBold ? "Helvetica-Bold" : "Helvetica");
    }
  };

  const useEnglish = (isBold = false) => { doc.font(isBold ? "Helvetica-Bold" : "Helvetica"); };

  const fixBiDi = (text: string) => {
    // PDFKit lays out the whole line as one run and reverses its glyph array when
    // the first non-Common character is Arabic (rtla). Pre-reverse the LTR runs
    // (Latin words and digits) so they display left-to-right after that reversal.
    // Mirror fontkit's direction detection: skip Common chars (space, digits,
    // punctuation) and inspect the first script-bearing character.
    const first = [...text].find(ch => !/[\s0-9\u0660-\u0669\u06F0-\u06F9.\-_/:،٫()[\]{}<>«»"'`!?،؛^~*+|=&%#$@]/.test(ch));
    const isRtlLine = !!first && /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(first);
    if (!isRtlLine) return text;
    return text.replace(/[0-9\u0660-\u0669\u06F0-\u06F9A-Za-z]+(?:[.\-_/:،٫\u200c\u200d]+[0-9\u0660-\u0669\u06F0-\u06F9A-Za-z]+)*/g, match => match.split('').reverse().join(''));
  };

  const printRTLText = (text: string, xOrOptions?: number | PDFKit.Mixins.TextOptions, y?: number, options?: PDFKit.Mixins.TextOptions) => {
    let x: number | undefined;
    let finalY: number | undefined;
    let printOptions: PDFKit.Mixins.TextOptions = {};

    if (typeof xOrOptions === 'number') {
      x = xOrOptions;
      finalY = y;
      printOptions = options || {};
    } else if (typeof xOrOptions === 'object') {
      printOptions = xOrOptions;
    }

    const mergedOptions: PDFKit.Mixins.TextOptions = {
      ...printOptions,
      align: printOptions.align || "right",
      features: ["rtla" as PDFKit.Mixins.OpenTypeFeatures],
      lineGap: printOptions.lineGap ?? bodyFontSize * 0.18,
    };

    const finalText = (isRTL && fontLoaded) ? fixBiDi(text) : text;

    if (isRTL && fontLoaded) {
      try {
        if (x !== undefined && finalY !== undefined) {
          doc.text(finalText, x, finalY, mergedOptions);
        } else {
          doc.text(finalText, mergedOptions);
        }
      } catch {
        // fontkit GPOS anchor crash — fall back without rtla feature
        const fallbackOptions = { ...mergedOptions, features: [] };
        if (x !== undefined && finalY !== undefined) {
          doc.text(finalText, x, finalY, fallbackOptions);
        } else {
          doc.text(finalText, fallbackOptions);
        }
      }
    } else {
      if (x !== undefined && finalY !== undefined) {
        doc.text(finalText, x, finalY, printOptions);
      } else {
        doc.text(finalText, printOptions);
      }
    }
  };

  const textAlignment = isRTL ? "right" : "left";
  const optionFontSizeFinal = optionFontSize ?? bodyFontSize - 1;

  const contentLeft = doc.page.margins.left;
  const contentWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;

  // 1. Header (Centered Layout)
  applyFont(true);
  doc.fontSize(headerFontSize + 6);
  printRTLText(instituteName, { align: "center" });

  doc.moveDown(0.35);
  doc.fontSize(headerFontSize + 1);
  printRTLText(isRTL ? `${lbl.subject} ${subjectName}` : "Subject: " + subjectName, { align: "center" });

  doc.moveDown(0.8);

  // 2. Grid Metadata Table
  const startY = doc.y;

  doc.fontSize(bodyFontSize);
  if (isRTL && fontLoaded) {
    const metadataCol = contentWidth / 3;
    applyFont(false);
    printRTLText(`${lbl.teacher} ${teacherName}`, contentLeft, startY, { width: metadataCol, align: "right" });
    useEnglish();
    doc.text(`Date: ${paperDate}`, contentLeft + metadataCol, startY, { width: metadataCol, align: "center" });
    doc.text(`Time: ${paperTime}`, contentLeft + 2 * metadataCol, startY, { width: metadataCol, align: "left" });

    const nextY = startY + doc.currentLineHeight() + bodyFontSize * 0.7;
    applyFont(false);
    printRTLText(`${lbl.total} ${totalMarks}`, contentLeft, nextY, { width: contentWidth / 2, align: "right" });
    printRTLText(`${lbl.duration} ${paperDuration}`, contentLeft + contentWidth / 2, nextY, { width: contentWidth / 2, align: "left" });
    doc.y = nextY + doc.currentLineHeight();
  } else {
    useEnglish();
    doc.text(`Teacher: ${teacherName}`, contentLeft, startY, { width: contentWidth / 3, align: "left" });
    doc.text(`Date: ${paperDate}`, contentLeft + contentWidth / 3, startY, { width: contentWidth / 3, align: "center" });
    doc.text(`Time: ${paperTime}`, contentLeft + 2 * contentWidth / 3, startY, { width: contentWidth / 3, align: "right" });

    const nextY = startY + doc.currentLineHeight() + 5;
    doc.text(`Total Marks: ${totalMarks}`, contentLeft, nextY, { width: contentWidth / 2, align: "left" });
    doc.text(`Duration: ${paperDuration}`, contentLeft + contentWidth / 2, nextY, { width: contentWidth / 2, align: "right" });
    doc.y = nextY + doc.currentLineHeight();
  }

  if (notes) {
    doc.moveDown(0.5);
    doc.fontSize(bodyFontSize - 1);
    if (isRTL && fontLoaded) {
      applyFont(false);
      printRTLText(`${lbl.instructions} ${notes}`, { align: "right" });
    } else {
      doc.font("Helvetica-Oblique");
      doc.text("Instructions: " + notes, contentLeft, doc.y, { align: "left" });
    }
  }

  // 3. Separator — generous spacing so Nastaliq descenders clear the rule
  doc.moveDown(1.1);
  doc.moveTo(contentLeft, doc.y).lineTo(contentLeft + contentWidth, doc.y).stroke();
  doc.moveDown(1.4);

  // 4. Questions Rendering
  for (const q of questions) {
    applyFont(true);
    doc.fontSize(bodyFontSize);

    if (isRTL && fontLoaded) {
      const questionFullText = `${lbl.question} ${q.questionNumber}: ${q.questionText} (${q.marks} ${lbl.marks})`;
      printRTLText(questionFullText, { align: "right" });

      if (q.options && q.options.length > 0) {
        doc.moveDown(0.1);
        applyFont(false);
        const optionLabels = lbl.options;
        for (let i = 0; i < q.options.length; i++) {
          doc.fontSize(optionFontSizeFinal);
          const optionMainText = q.options[i] || "";
          printRTLText(`${optionLabels[i]}. ${optionMainText}`, { align: "right" });
        }
      }
    } else {
      useEnglish(true);
      doc.text(`Q${q.questionNumber}. ${q.questionText}  (${q.marks} marks)`, contentLeft, doc.y, { align: "left" });

      if (q.options && q.options.length > 0) {
        doc.moveDown(0.1);
        useEnglish(false);
        const labels = ["A", "B", "C", "D", "E", "F"];
        for (let i = 0; i < q.options.length; i++) {
          const optionVal = q.options[i] || "";
          doc.fontSize(optionFontSizeFinal).text(`   ${labels[i]}. ${optionVal}`, contentLeft, doc.y, { align: "left" });
        }
      }
    }
    doc.moveDown(1.1);
  }

  // 5. Answer Key Page Configuration
  doc.addPage();
  doc.fontSize(headerFontSize);
  applyFont(true);
  printRTLText(isRTL ? lbl.answerKey : "Answer Key", { align: "center" });

  doc.moveDown(1);
  doc.fontSize(bodyFontSize);
  applyFont(false);

  for (const q of questions) {
    if (q.questionType === "multiple_choice" || q.questionType === "true_false") {
      if (isRTL && fontLoaded) {
        printRTLText(`${lbl.question} ${q.questionNumber}: ${lbl.answerOmitted}`, { align: "right" });
      } else {
        useEnglish(false); doc.text(`Q${q.questionNumber}: [Answer omitted — see evaluation system]`, contentLeft, doc.y, { align: "left" });
      }
    }
  }

  doc.end();
}

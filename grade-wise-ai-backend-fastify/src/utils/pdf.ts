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

  const LABELS: Record<string, { subject: string; teacher: string; total: string; duration: string; instructions: string; question: string; marks: string; date: string; time: string; options: string[] }> = {
    ar: {
      subject: "المادة:",
      teacher: "المعلم:",
      total: "المجموع الكلي:",
      duration: "المدة:",
      instructions: "التعليمات:",
      question: "السؤال",
      marks: "علامة",
      date: "التاريخ:",
      time: "الوقت:",
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
      date: "تاریخ:",
      time: "زمان:",
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
      date: "تاریخ:",
      time: "وقت:",
      options: ["ا", "ب", "ج", "د", "ہ", "و"],
    },
    en: {
      subject: "Subject:",
      teacher: "Teacher:",
      total: "Total Marks:",
      duration: "Duration:",
      instructions: "Instructions:",
      question: "Question",
      marks: "marks",
      date: "Date:",
      time: "Time:",
      options: ["A", "B", "C", "D", "E", "F"],
    },
  };
  const lbl: (typeof LABELS)["ur"] = LABELS[langKey] ?? LABELS.en!;
  
  const notoArabicFontPath = path.join(__dirname, "..", "assets", "fonts", "NotoSansArabic-Regular.ttf");
  const arabicFontPath = path.join(__dirname, "..", "assets", "fonts", "Amiri-Regular.ttf");
  const quranicFontPath = process.env["ARABIC_FONT_PATH"] ?? path.join(__dirname, "..", "assets", "fonts", "AmiriQuran-Regular.ttf");
  const customUrduFontPath = process.env["URDU_FONT_PATH"];

  let fontLoaded = false;
  let activeFontKey = "";

  if (isUrdu) {
    // NotoSansArabic has full Urdu alphabet support (ٹ, ڈ, ڑ, ے, ں, چ, پ, گ, ژ, ہ, ھ),
    // Latin characters, numbers, and does not crash fontkit with anchor errors.
    if (customUrduFontPath && fs.existsSync(customUrduFontPath)) {
      doc.registerFont("UrduFont", customUrduFontPath);
      activeFontKey = "UrduFont";
      fontLoaded = true;
    } else if (fs.existsSync(notoArabicFontPath)) {
      doc.registerFont("UrduFont", notoArabicFontPath);
      activeFontKey = "UrduFont";
      fontLoaded = true;
    } else if (fs.existsSync(arabicFontPath)) {
      doc.registerFont("UrduFont", arabicFontPath);
      activeFontKey = "UrduFont";
      fontLoaded = true;
    }
  } else if (isRTL) {
    if (fs.existsSync(arabicFontPath)) {
      doc.registerFont("ArabicFont", arabicFontPath);
      activeFontKey = "ArabicFont";
      fontLoaded = true;
    } else if (fs.existsSync(notoArabicFontPath)) {
      doc.registerFont("ArabicFont", notoArabicFontPath);
      activeFontKey = "ArabicFont";
      fontLoaded = true;
    } else if (fs.existsSync(quranicFontPath)) {
      doc.registerFont("ArabicFont", quranicFontPath);
      activeFontKey = "ArabicFont";
      fontLoaded = true;
    }
  }

  const applyFont = (isBold = false) => {
    if (fontLoaded && activeFontKey) {
      doc.font(activeFontKey);
    } else {
      doc.font(isBold ? "Helvetica-Bold" : "Helvetica");
    }
  };

  const useEnglish = (isBold = false) => { doc.font(isBold ? "Helvetica-Bold" : "Helvetica"); };

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
      align: printOptions.align || (isRTL ? "right" : "left"),
      lineGap: printOptions.lineGap ?? bodyFontSize * 0.22,
    };

    if (isRTL && fontLoaded) {
      try {
        if (x !== undefined && finalY !== undefined) {
          doc.text(text, x, finalY, mergedOptions);
        } else {
          doc.text(text, mergedOptions);
        }
      } catch (err) {
        console.warn("[PDFKit] RTL text print warning:", err);
        try {
          if (x !== undefined && finalY !== undefined) {
            doc.text(text, x, finalY, { ...mergedOptions, features: [] });
          } else {
            doc.text(text, { ...mergedOptions, features: [] });
          }
        } catch (innerErr) {
          console.error("PDFKit fallback rendering failed:", innerErr);
        }
      }
    } else {
      try {
        if (x !== undefined && finalY !== undefined) {
          doc.text(text, x, finalY, printOptions);
        } else {
          doc.text(text, printOptions);
        }
      } catch (err) {
        console.error("PDFKit LTR rendering failed:", err);
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
    printRTLText(`${lbl.date} ${paperDate}`, contentLeft + metadataCol, startY, { width: metadataCol, align: "center" });
    printRTLText(`${lbl.time} ${paperTime}`, contentLeft + 2 * metadataCol, startY, { width: metadataCol, align: "left" });

    const nextY = Math.max(doc.y, startY + doc.currentLineHeight() + 6);
    applyFont(false);
    printRTLText(`${lbl.total} ${totalMarks}`, contentLeft, nextY, { width: contentWidth / 2, align: "right" });
    printRTLText(`${lbl.duration} ${paperDuration}`, contentLeft + contentWidth / 2, nextY, { width: contentWidth / 2, align: "left" });
    doc.y = nextY + doc.currentLineHeight() + 6;
  } else {
    useEnglish();
    const metadataCol = contentWidth / 3;
    doc.text(`Teacher: ${teacherName}`, contentLeft, startY, { width: metadataCol, align: "left" });
    doc.text(`Date: ${paperDate}`, contentLeft + metadataCol, startY, { width: metadataCol, align: "center" });
    doc.text(`Time: ${paperTime}`, contentLeft + 2 * metadataCol, startY, { width: metadataCol, align: "right" });

    const nextY = Math.max(doc.y, startY + doc.currentLineHeight() + 6);
    doc.text(`Total Marks: ${totalMarks}`, contentLeft, nextY, { width: contentWidth / 2, align: "left" });
    doc.text(`Duration: ${paperDuration}`, contentLeft + contentWidth / 2, nextY, { width: contentWidth / 2, align: "right" });
    doc.y = nextY + doc.currentLineHeight() + 6;
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

  // 3. Separator
  doc.moveDown(1.1);
  doc.moveTo(contentLeft, doc.y).lineTo(contentLeft + contentWidth, doc.y).stroke();
  doc.moveDown(1.4);

  // 4. Questions Rendering with Auto-Pagebreak & Clipping Protection
  for (const q of questions) {
    const optionCount = q.options?.length || 0;
    const estQuestionHeight = 28 + (optionCount * (optionFontSizeFinal + 8)) + 30;

    // Check printable area boundary to prevent visual clipping
    if (doc.y + estQuestionHeight > doc.page.height - doc.page.margins.bottom) {
      doc.addPage();
    }

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

  doc.end();
}

// ─── Automated PDF Validation & Processing Pipeline ───────────────────────────

export interface PdfValidationResult {
  isValid: boolean;
  issues: string[];
  buffer: Buffer;
}

export function validateAndProcessPdf(
  buffer: Buffer,
  options?: Partial<PhysicalPaperOptions>
): PdfValidationResult {
  const issues: string[] = [];

  if (!Buffer.isBuffer(buffer) || buffer.length < 200) {
    issues.push("Generated PDF stream is empty or corrupt (< 200 bytes)");
    return { isValid: false, issues, buffer };
  }

  const sample = buffer.toString("binary", 0, Math.min(buffer.length, 4096));

  // Check PDF signature header
  if (!sample.startsWith("%PDF-")) {
    issues.push("Missing valid %PDF- magic signature header");
  }

  // Check EOF trailer
  const tail = buffer.toString("binary", Math.max(0, buffer.length - 2048));
  if (!tail.includes("%%EOF")) {
    issues.push("Truncated PDF structure: Missing %%EOF trailer marker");
  }

  // Validate critical paper option constraints
  if (options) {
    if (options.totalMarks !== undefined && options.totalMarks <= 0) {
      issues.push("Total marks must be a positive numeric value");
    }
    if (options.paperTime !== undefined && options.paperTime.trim() === "") {
      issues.push("Paper time field is empty or unformatted");
    }
  }

  return {
    isValid: issues.length === 0,
    issues,
    buffer,
  };
}


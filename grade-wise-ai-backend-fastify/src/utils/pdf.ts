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

type RtlTextOptions = PDFKit.Mixins.TextOptions & { direction?: "rtl" | "ltr" };

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

  const isRTL = ["ur", "ar", "sd", "ps"].includes(language.toLowerCase());
  const defaultFontPath = path.join(__dirname, "..", "assets", "fonts", "NotoSansArabic-Regular.ttf");
  const urduFontPath = process.env["URDU_FONT_PATH"] ?? defaultFontPath;
  const fontLoaded = isRTL && fs.existsSync(urduFontPath);

  if (fontLoaded) {
    doc.registerFont("UrduFont", urduFontPath);
  }

  const applyFont = (isBold = false) => {
    if (fontLoaded) {
      doc.font("UrduFont");
    } else {
      doc.font(isBold ? "Helvetica-Bold" : "Helvetica");
    }
  };

  const useEnglish = (isBold = false) => { doc.font(isBold ? "Helvetica-Bold" : "Helvetica"); };

  const printRTLText = (text: string, printOptions: RtlTextOptions = {}) => {
    if (isRTL && fontLoaded) {
      doc.text(text, {
        ...printOptions,
        direction: "rtl",
        align: printOptions.align || "right",
      } as PDFKit.Mixins.TextOptions);
    } else {
      doc.text(text, printOptions);
    }
  };

  const textAlignment = isRTL ? "right" : "left";
  const optionFontSizeFinal = optionFontSize ?? bodyFontSize - 1;

  // 1. Header (Centered Layout)
  applyFont(true);
  doc.fontSize(headerFontSize + 6);
  printRTLText(instituteName, { align: "center" });

  doc.moveDown(0.2);
  doc.fontSize(headerFontSize + 1);
  printRTLText(isRTL ? `مضمون: ${subjectName}` : "Subject: " + subjectName, { align: "center" });

  doc.moveDown(0.5);

  // 2. Grid Metadata Table (Typecasted direction parameter to fix build errors)
  const startY = doc.y;
  const pageWidth = doc.page.width - 120;

  doc.fontSize(bodyFontSize);
  if (isRTL && fontLoaded) {
    const metadataCol = pageWidth / 3;
    applyFont(false);
    doc.text(`استاد: ${teacherName}`, 60, startY, { width: metadataCol, align: "right", direction: "rtl" } as PDFKit.Mixins.TextOptions);
    useEnglish();
    doc.text(`Date: ${paperDate}`, 60 + metadataCol, startY, { width: metadataCol, align: "center" });
    doc.text(`Time: ${paperTime}`, 60 + (2 * metadataCol), startY, { width: metadataCol, align: "left" });

    const nextY = startY + doc.currentLineHeight() + 8;
    applyFont(false);
    doc.text(`کل نمبر: ${totalMarks}`, 60, nextY, { width: pageWidth / 2, align: "right", direction: "rtl" } as PDFKit.Mixins.TextOptions);
    doc.text(`دورانیہ: ${paperDuration}`, 60 + (pageWidth / 2), nextY, { width: pageWidth / 2, align: "left", direction: "rtl" } as PDFKit.Mixins.TextOptions);
    doc.y = nextY + doc.currentLineHeight();
  } else {
    useEnglish();
    doc.text(`Teacher: ${teacherName}`, 60, startY, { width: pageWidth / 3, align: "left" });
    doc.text(`Date: ${paperDate}`, 60 + (pageWidth / 3), startY, { width: pageWidth / 3, align: "center" });
    doc.text(`Time: ${paperTime}`, 60 + (2 * pageWidth / 3), startY, { width: pageWidth / 3, align: "right" });
    
    const nextY = startY + doc.currentLineHeight() + 5;
    doc.text(`Total Marks: ${totalMarks}`, 60, nextY, { width: pageWidth / 2, align: "left" });
    doc.text(`Duration: ${paperDuration}`, 60 + (pageWidth / 2), nextY, { width: pageWidth / 2, align: "right" });
    doc.y = nextY + doc.currentLineHeight();
  }

  if (notes) {
    doc.moveDown(0.4);
    doc.fontSize(bodyFontSize - 1);
    if (isRTL && fontLoaded) {
      applyFont(false);
      printRTLText(`ہدایات: ${notes}`, { align: "right" });
    } else {
      doc.font("Helvetica-Oblique");
      doc.text("Instructions: " + notes, 60, doc.y, { align: "left" });
    }
  }

  doc.moveDown(0.6);
  doc.moveTo(60, doc.y).lineTo(doc.page.width - 60, doc.y).stroke();
  doc.moveDown(1.0);

  // 3. Questions Rendering
  for (const q of questions) {
    applyFont(true);
    doc.fontSize(bodyFontSize);

    if (isRTL && fontLoaded) {
      const questionFullText = `سوال ${q.questionNumber}: ${q.questionText} (${q.marks} نمبر)`;
      printRTLText(questionFullText, { align: "right" });

      if (q.options && q.options.length > 0) {
        doc.moveDown(0.1);
        applyFont(false);
        const labels = ["ا", "ب", "ج", "د", "ہ", "و"];
        for (let i = 0; i < q.options.length; i++) {
          doc.fontSize(optionFontSizeFinal);
          const optionMainText = q.options[i] || "";
          printRTLText(`${labels[i]}. ${optionMainText}`, { align: "right" });
        }
      }
    } else {
      useEnglish(true);
      doc.text(`Q${q.questionNumber}. ${q.questionText}  (${q.marks} marks)`, 60, doc.y, { align: "left" });

      if (q.options && q.options.length > 0) {
        doc.moveDown(0.1);
        useEnglish(false);
        const labels = ["A", "B", "C", "D", "E", "F"];
        for (let i = 0; i < q.options.length; i++) {
          const optionVal = q.options[i] || "";
          doc.fontSize(optionFontSizeFinal).text(`   ${labels[i]}. ${optionVal}`, 60, doc.y, { align: "left" });
        }
      }
    }
    doc.moveDown(1.0);
  }

  // 4. Answer Key Page Configuration
  doc.addPage();
  doc.fontSize(headerFontSize);
  applyFont(true);
  printRTLText(isRTL ? "جوابی پرچہ" : "Answer Key", { align: "center" });
  
  doc.moveDown(1);
  doc.fontSize(bodyFontSize);
  applyFont(false);

  for (const q of questions) {
    if (q.questionType === "multiple_choice" || q.questionType === "true_false") {
      if (isRTL && fontLoaded) {
        printRTLText(`سوال ${q.questionNumber}: [جواب خارج کر دیا گیا ہے]`, { align: "right" });
      } else {
        useEnglish(false); doc.text(`Q${q.questionNumber}: [Answer omitted — see evaluation system]`, 60, doc.y, { align: "left" });
      }
    }
  }

  doc.end();
}
import PDFDocument from "pdfkit";
import type { Writable } from "stream";

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
  questions: PaperQuestion[];
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
    questions,
  } = options;

  const doc = new PDFDocument({
    size: pageSize,
    margins: { top: 50, bottom: 50, left: 60, right: 60 },
  });

  doc.pipe(outputStream);

  // Header
  doc
    .fontSize(headerFontSize + 4)
    .font("Helvetica-Bold")
    .text(instituteName, { align: "center" });

  doc
    .fontSize(headerFontSize)
    .font("Helvetica-Bold")
    .text(`Subject: ${subjectName}`, { align: "center" });

  doc.moveDown(0.5);

  doc
    .fontSize(bodyFontSize)
    .font("Helvetica")
    .text(`Teacher: ${teacherName}   |   Date: ${paperDate}   |   Time: ${paperTime}`, {
      align: "center",
    });

  doc.text(
    `Duration: ${paperDuration}   |   Total Marks: ${totalMarks}`,
    { align: "center" }
  );

  if (notes) {
    doc.moveDown(0.5);
    doc
      .fontSize(bodyFontSize - 1)
      .font("Helvetica-Oblique")
      .text(`Instructions: ${notes}`);
  }

  doc.moveDown(1);
  doc.moveTo(60, doc.y).lineTo(doc.page.width - 60, doc.y).stroke();
  doc.moveDown(1);

  // Questions
  for (const q of questions) {
    doc
      .fontSize(bodyFontSize)
      .font("Helvetica-Bold")
      .text(`Q${q.questionNumber}. ${q.questionText}  (${q.marks} marks)`);

    if (q.options && q.options.length > 0) {
      doc.font("Helvetica");
      const labels = ["A", "B", "C", "D", "E", "F"];
      for (let i = 0; i < q.options.length; i++) {
        doc
          .fontSize(bodyFontSize - 1)
          .text(`   ${labels[i] ?? String.fromCharCode(65 + i)}. ${q.options[i]}`);
      }
    }
    doc.moveDown(1);
  }

  // Answer key on last page
  doc.addPage();
  doc
    .fontSize(headerFontSize)
    .font("Helvetica-Bold")
    .text("Answer Key", { align: "center" });
  doc.moveDown(1);

  for (const q of questions) {
    if (q.questionType === "multiple_choice" || q.questionType === "true_false") {
      doc
        .fontSize(bodyFontSize)
        .font("Helvetica")
        .text(`Q${q.questionNumber}: [Answer omitted — see evaluation system]`);
    }
  }

  doc.end();
}

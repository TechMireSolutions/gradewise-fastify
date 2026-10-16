"use client";
import { cn } from "@/lib/cn.js";
import { useState, useEffect, useRef } from "react";
import Modal from "./ui/Modal";
import LoadingSpinner from "./ui/LoadingSpinner";
import { FaFilePdf, FaTimes, FaGlobe, FaArrowLeft, FaDownload } from "react-icons/fa";
import { sanitizeFileName } from "../utils/paperUtils";
import PaperFormFields from "./PaperFormFields";
import FormattingOptions from "./FormattingOptions";
import { LANGUAGE_OPTIONS, getTranslation, isRTLLanguage } from "../utils/translations";
import useAssessmentStore from "@/features/assessments/store.js";

const STORAGE_KEY = "gradewise_paper_settings";

export const sanitizeTimeValue = (val) => {
  if (!val || typeof val !== "string") return "10:00";
  const trimmed = val.trim();
  if (/^([01]\d|2[0-3]):[0-5]\d$/.test(trimmed)) return trimmed;
  if (/^[0-9]:[0-5]\d$/.test(trimmed)) return `0${trimmed}`;
  const match12 = trimmed.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*([aApP][mM])?$/);
  if (match12) {
    let hours = parseInt(match12[1], 10);
    const minutes = match12[2];
    const ampm = match12[3]?.toUpperCase();
    if (ampm === "PM" && hours < 12) hours += 12;
    if (ampm === "AM" && hours === 12) hours = 0;
    return `${String(hours).padStart(2, "0")}:${minutes}`;
  }
  if (trimmed.includes("T")) {
    const timePart = trimmed.split("T")[1]?.slice(0, 5);
    if (/^([01]\d|2[0-3]):[0-5]\d$/.test(timePart)) return timePart;
  }
  return "10:00";
};

const INITIAL_FORM = {
  instituteName: "",
  teacherName: "",
  subjectName: "",
  paperDate: "",
  paperTime: "10:00",
  paperDuration: "1 Hour 30 Mins",
  totalMarks: "",
  notes: "",
  pageSize: "A4",
  headerFontSize: 18,
  questionFontSize: 10,
  optionFontSize: 9,
};

const INITIAL_NOTIFY = { isOpen: false, type: "info", title: "", message: "" };

const PhysicalPaperModal = ({
  isOpen,
  onClose,
  assessmentId,
  assessmentTitle,
  assessment,
}) => {
  const [step, setStep] = useState("language");
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [notify, setNotify] = useState(INITIAL_NOTIFY);

  const hasInitializedRef = useRef(false);
  const userModifiedMarksRef = useRef(false);

  const { generatePhysicalPaper, getAssessmentById, currentAssessment } = useAssessmentStore();

  const t = (key) => getTranslation(selectedLanguage, key);
  const isRTL = isRTLLanguage(selectedLanguage);
  const isQuranic = ["ar", "fa"].includes(selectedLanguage);

  // Fetch full assessment data if question blocks are not included in the parent row
  useEffect(() => {
    if (!isOpen || !assessmentId) return;
    if (!assessment?.question_blocks?.length) {
      if (typeof getAssessmentById === "function") {
        getAssessmentById(assessmentId).catch((err) => {
          console.warn("[PhysicalPaperModal] Failed to fetch assessment details:", err);
        });
      }
    }
  }, [isOpen, assessmentId, assessment, getAssessmentById]);

  // Target assessment with fallback to store's currentAssessment
  const targetAssessment =
    assessment?.question_blocks?.length
      ? assessment
      : currentAssessment?.id === Number(assessmentId) && currentAssessment?.question_blocks?.length
      ? currentAssessment
      : assessment;

  // Auto-calculated fallback total marks from assessment question blocks
  const derivedMarks =
    targetAssessment?.question_blocks?.reduce(
      (sum, b) =>
        sum +
        (Number(b.question_count || b.questionCount || 0) *
          Number(b.positive_marks ?? b.positiveMarks ?? 1)),
      0
    ) || 0;

  const calculatedTotalMarks = derivedMarks > 0 ? derivedMarks : 100;

  // Auto-calculated estimated duration from question blocks
  const calculatedTotalSeconds =
    targetAssessment?.question_blocks?.reduce(
      (sum, b) =>
        sum +
        (Number(b.question_count || b.questionCount || 0) *
          Number(b.duration_per_question ?? b.durationPerQuestion ?? 60)),
      0
    ) || 5400;

  const defaultHours = Math.floor(calculatedTotalSeconds / 3600);
  const defaultMins = Math.floor((calculatedTotalSeconds % 3600) / 60);
  const calculatedDurationStr =
    defaultHours > 0
      ? defaultMins > 0
        ? `${defaultHours} Hour${defaultHours > 1 ? "s" : ""} ${defaultMins} Mins`
        : `${defaultHours} Hour${defaultHours > 1 ? "s" : ""}`
      : `${defaultMins} Mins`;

  // Initialize form defaults only once when modal opens to avoid locking user input
  useEffect(() => {
    if (!isOpen) {
      hasInitializedRef.current = false;
      userModifiedMarksRef.current = false;
      return;
    }

    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    let saved = {};
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) saved = JSON.parse(stored);
    } catch {
      saved = {};
    }

    const todayDate = new Date().toISOString().split("T")[0];

    const initialMarks =
      saved.totalMarks ||
      (derivedMarks > 0 ? String(derivedMarks) : "100");

    const initialTime = sanitizeTimeValue(saved.paperTime);
    const initialDuration = saved.paperDuration || calculatedDurationStr || "1 Hour 30 Mins";

    setForm({
      instituteName: saved.instituteName || "",
      teacherName: saved.teacherName || "",
      subjectName: assessmentTitle || assessment?.title || saved.subjectName || "",
      paperDate: todayDate,
      paperTime: initialTime,
      paperDuration: initialDuration,
      totalMarks: initialMarks,
      notes: "",
      pageSize: saved.pageSize || "A4",
      headerFontSize: 18,
      questionFontSize: 10,
      optionFontSize: 9,
    });
  }, [isOpen, assessmentTitle, assessment, derivedMarks, calculatedDurationStr]);

  // Update total marks if question blocks load asynchronously, but only if user hasn't edited the field
  useEffect(() => {
    if (!isOpen || userModifiedMarksRef.current) return;
    if (derivedMarks > 0) {
      setForm((prev) => ({
        ...prev,
        totalMarks: String(derivedMarks),
        paperDuration: prev.paperDuration || calculatedDurationStr,
      }));
    }
  }, [isOpen, derivedMarks, calculatedDurationStr]);

  const showNotify = (type, title, message) =>
    setNotify({ isOpen: true, type, title, message });

  const handleLanguageSelect = (lang) => {
    setSelectedLanguage(lang);
    setStep("form");
  };

  const updateSavedSettings = (updates) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const current = stored ? JSON.parse(stored) : {};
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, ...updates }));
    } catch {
      // Ignore localStorage write failures
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "totalMarks") {
      userModifiedMarksRef.current = true;
    }
    if (["instituteName", "teacherName", "paperTime", "paperDuration", "pageSize"].includes(name)) {
      updateSavedSettings({ [name]: value });
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSetField = (name, value) => {
    if (name === "totalMarks") {
      userModifiedMarksRef.current = true;
    }
    if (["instituteName", "teacherName", "paperTime", "paperDuration", "pageSize"].includes(name)) {
      updateSavedSettings({ [name]: value });
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!assessmentId) {
      showNotify("error", "Error", t("noAssessment"));
      return;
    }

    if (!form.instituteName.trim()) { showNotify("warning", "Required", "Please enter the institute name."); return; }
    if (!form.teacherName.trim())   { showNotify("warning", "Required", "Please enter the teacher name."); return; }
    if (!form.subjectName.trim())   { showNotify("warning", "Required", "Please enter the subject name."); return; }

    const finalDate = form.paperDate || new Date().toISOString().split("T")[0];
    const finalTime = sanitizeTimeValue(form.paperTime);
    const finalDuration = form.paperDuration?.trim() || calculatedDurationStr || "1 Hour 30 Mins";

    // Validate standard numeric input, with graceful auto-calculation fallback if blank or non-numeric
    const parsedMarks = form.totalMarks !== "" && form.totalMarks != null ? Number(form.totalMarks) : NaN;
    const finalMarks = !isNaN(parsedMarks) && parsedMarks > 0
      ? (parsedMarks % 1 === 0 ? Math.round(parsedMarks) : Number(parsedMarks.toFixed(2)))
      : Math.round(calculatedTotalMarks > 0 ? calculatedTotalMarks : 100);

    // Persist settings for next user session
    updateSavedSettings({
      instituteName: form.instituteName,
      teacherName: form.teacherName,
      subjectName: form.subjectName,
      paperTime: finalTime,
      paperDuration: finalDuration,
      pageSize: form.pageSize,
    });

    setLoading(true);
    try {
      const blob = await generatePhysicalPaper(assessmentId, {
        language: selectedLanguage,
        instituteName: form.instituteName,
        teacherName: form.teacherName,
        subjectName: form.subjectName,
        paperDate: finalDate,
        paperTime: finalTime,
        paperDuration: finalDuration,
        totalMarks: finalMarks,
        notes: form.notes,
        pageSize: form.pageSize.toUpperCase(),
        headerFontSize: Number(form.headerFontSize),
        bodyFontSize: Number(form.questionFontSize),
        optionFontSize: Number(form.optionFontSize),
        outputFormat: "pdf",
      });

      const fileName = `${sanitizeFileName(assessmentTitle || form.subjectName)}_Paper_${selectedLanguage.toUpperCase()}.pdf`;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      showNotify("success", "Success", t("paperGenerated"));
      setTimeout(() => {
        resetModal();
        onClose();
      }, 1000);
    } catch (err) {
      console.error("[PhysicalPaperModal] Paper generation error:", err);
      showNotify("error", "Error", t("generationFailed"));
    } finally {
      setLoading(false);
    }
  };

  const resetModal = () => {
    setStep("language");
    setSelectedLanguage("en");
    setForm(INITIAL_FORM);
    setNotify(INITIAL_NOTIFY);
    hasInitializedRef.current = false;
    userModifiedMarksRef.current = false;
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <Modal
        isOpen={notify.isOpen}
        onClose={() => setNotify(INITIAL_NOTIFY)}
        type={notify.type}
        title={notify.title}
        zIndex="z-[110]"
      >
        {notify.message}
      </Modal>

      <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
        <div className="min-h-full flex items-center justify-center">
          <div
            className={cn(
              "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto transition-all duration-300",
              isRTL ? "text-right" : "text-left",
              isQuranic && "font-quran"
            )}
            dir={isRTL ? "rtl" : "ltr"}
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 dark:from-indigo-950 dark:via-purple-950 dark:to-indigo-950 text-white px-5 sm:px-6 py-4 sm:py-5 rounded-t-2xl sm:rounded-t-3xl flex justify-between items-center shadow-lg z-10 border-b border-indigo-500/20 dark:border-indigo-800/40">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 dark:bg-white/10 backdrop-blur-sm p-2 sm:p-3 rounded-xl">
                  {step === "language" ? (
                    <FaGlobe className="text-2xl sm:text-3xl text-indigo-100 dark:text-indigo-300" />
                  ) : (
                    <FaFilePdf className="text-2xl sm:text-3xl text-indigo-100 dark:text-indigo-300" />
                  )}
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">{t("modalTitle")}</h2>
                  <p className="text-indigo-100 dark:text-indigo-200 text-xs sm:text-sm truncate max-w-xs sm:max-w-md">
                    {step === "language" ? t("modalSubtitle") : assessmentTitle}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClose}
                aria-label="Close modal"
                className="text-white/80 hover:text-white hover:bg-white/10 rounded-full p-2 transition-all duration-200 hover:rotate-90 active:scale-90 cursor-pointer"
              >
                <FaTimes className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-5 sm:space-y-6">
              {step === "language" ? (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                      {t("selectLanguage")}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400">{t("selectLanguageDesc")}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {LANGUAGE_OPTIONS.map((lang) => (
                      <button
                        key={lang.value}
                        type="button"
                        onClick={() => handleLanguageSelect(lang.value)}
                        className={cn(
                          "p-6 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/40 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-950 transition-all duration-300 flex items-center justify-center gap-3 active:scale-95 text-slate-700 dark:text-slate-200 cursor-pointer",
                          ["ar", "fa"].includes(lang.value) && "font-quran"
                        )}
                      >
                        <span className="text-4xl">{lang.label.split(" ")[0]}</span>
                        <span className="text-xl font-bold text-slate-700 dark:text-slate-100">
                          {lang.label.split(" ").slice(1).join(" ")}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setStep("language")}
                    className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-semibold transition-colors cursor-pointer"
                  >
                    <FaArrowLeft />
                    <span>{t("back")}</span>
                  </button>

                  <div className="bg-indigo-50 dark:bg-indigo-950/40 p-4 rounded-xl border border-indigo-200 dark:border-indigo-500/20">
                    <div className="flex items-center gap-3">
                      <FaGlobe className="text-2xl text-indigo-600 dark:text-indigo-400" />
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{t("selectLanguage")}</p>
                        <p className="text-lg font-bold text-slate-700 dark:text-slate-100">
                          {LANGUAGE_OPTIONS.find((l) => l.value === selectedLanguage)?.label}
                        </p>
                      </div>
                    </div>
                  </div>

                  <PaperFormFields
                    form={form}
                    onChange={handleChange}
                    onSetField={handleSetField}
                    calculatedMarks={calculatedTotalMarks}
                    calculatedDuration={calculatedDurationStr}
                    language={selectedLanguage}
                  />

                  <FormattingOptions form={form} onChange={handleChange} language={selectedLanguage} />

                  <div className="border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-end gap-3 sm:gap-4 pt-4 mt-6">
                    <button
                      type="button"
                      onClick={handleClose}
                      disabled={loading}
                      className="px-6 py-3 w-full sm:w-auto border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/40 text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white hover:border-slate-400 dark:hover:border-slate-700 rounded-xl font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 cursor-pointer"
                    >
                      {t("cancel")}
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={loading}
                      className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 w-full sm:w-auto text-white rounded-xl font-bold text-sm sm:text-lg flex items-center justify-center gap-2 sm:gap-3 shadow-xl hover:shadow-2xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 cursor-pointer"
                    >
                      {loading ? (
                        <>
                          <LoadingSpinner size="sm" color="white" type="dots" />
                          <span>{t("generating")}</span>
                        </>
                      ) : (
                        <>
                          <FaDownload className="text-lg sm:text-xl" />
                          <span>{t("generateDownload")}</span>
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PhysicalPaperModal;
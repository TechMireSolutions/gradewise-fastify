"use client";
import { cn } from "@/lib/cn.js";
import { btn } from "@/lib/ui.js";
import { useState, useEffect, useRef } from "react";
import Modal from "@/components/ui/Modal.jsx";
import LoadingSpinner from "@/components/ui/LoadingSpinner.jsx";
import {
  FaFilePdf,
  FaTimes,
  FaGlobe,
  FaArrowLeft,
  FaArrowRight,
  FaCheck,
  FaDownload,
} from "react-icons/fa";
import { sanitizeFileName } from "@/utils/paperUtils.js";
import PaperFormFields from "./PaperFormFields.jsx";
import FormattingOptions from "./FormattingOptions.jsx";
import { LANGUAGE_OPTIONS, getTranslation, isRTLLanguage } from "@/utils/translations.js";
import useAssessmentStore from "@/features/assessments/store.js";
import LanguageFlag, { FlagUK, FlagPK, FlagSA, FlagIR } from "@/components/ui/LanguageFlag.jsx";

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

  // Auto-calculated duration in seconds from question blocks
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
      headerFontSize: saved.headerFontSize ? Number(saved.headerFontSize) : 18,
      questionFontSize: saved.questionFontSize ? Number(saved.questionFontSize) : 10,
      optionFontSize: saved.optionFontSize ? Number(saved.optionFontSize) : 9,
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
    if (["instituteName", "teacherName", "paperTime", "paperDuration", "pageSize", "headerFontSize", "questionFontSize", "optionFontSize"].includes(name)) {
      updateSavedSettings({ [name]: value });
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSetField = (name, value) => {
    if (name === "totalMarks") {
      userModifiedMarksRef.current = true;
    }
    if (["instituteName", "teacherName", "paperTime", "paperDuration", "pageSize", "headerFontSize", "questionFontSize", "optionFontSize"].includes(name)) {
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

  const allOption = LANGUAGE_OPTIONS.find((l) => l.value === "all");
  const singleLanguages = LANGUAGE_OPTIONS.filter((l) => l.value !== "all");

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

      <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm p-4 overflow-y-auto overscroll-contain">
        <div className="min-h-full flex items-center justify-center">
          <div
            className={cn(
              "bg-card border border-border rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto overscroll-contain transition-all duration-300 text-start",
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
                className="text-white/80 hover:text-white hover:bg-white/10 rounded-xl p-2 transition-all duration-200 hover:rotate-90 active:scale-90 cursor-pointer"
              >
                <FaTimes className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-6">
              {step === "language" ? (
                <div className="space-y-6">
                  {/* Clean header info */}
                  <div className="text-center max-w-xl mx-auto space-y-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                      <FaGlobe className="text-xs" /> Multilingual Exam Generator
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight text-balance">
                      {t("selectLanguage")}
                    </h3>
                    <p className="text-muted-foreground text-sm sm:text-base leading-relaxed text-pretty">
                      {t("selectLanguageDesc")}
                    </p>
                  </div>

                  {/* Featured Hero Option: All 4 Languages */}
                  {allOption && (
                    <button
                      type="button"
                      onClick={() => handleLanguageSelect(allOption.value)}
                      className={cn(
                        "w-full text-left p-5 sm:p-6 rounded-2xl border-2 transition-all duration-200 cursor-pointer group relative overflow-hidden",
                        selectedLanguage === "all"
                          ? "border-accent bg-accent/10 shadow-lg shadow-teal-500/10 ring-2 ring-accent/30"
                          : "border-border bg-card/70 hover:bg-card hover:border-accent/50 hover:shadow-lg"
                      )}
                    >
                      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-gradient-to-br from-indigo-500/15 via-teal-500/10 to-transparent rounded-full blur-2xl pointer-events-none" />

                      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start sm:items-center gap-4">
                          <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-indigo-500 via-teal-500 to-sky-400 p-3 flex items-center justify-center text-white shadow-lg shadow-teal-500/25 shrink-0 group-hover:scale-105 transition-transform duration-200">
                            <FaGlobe className="w-7 h-7" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2.5 flex-wrap">
                              <h4 className="text-lg sm:text-xl font-bold text-foreground group-hover:text-accent transition-colors">
                                {allOption.name || "All 4 Languages"}
                              </h4>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[0.6875rem] font-bold uppercase tracking-wider bg-teal-500/15 text-teal-700 dark:text-teal-300 border border-teal-500/30">
                                ★ Recommended
                              </span>
                            </div>
                            <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-xl leading-relaxed">
                              {allOption.description ||
                                "Generate a consolidated exam paper containing all 4 supported languages"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3.5 self-end sm:self-center shrink-0">
                          <div className="flex items-center -space-x-1.5 p-1 bg-surface-elevated/90 backdrop-blur-sm rounded-lg border border-border shadow-xs">
                            <FlagUK className="w-6 h-4" />
                            <FlagPK className="w-6 h-4" />
                            <FlagSA className="w-6 h-4" />
                            <FlagIR className="w-6 h-4" />
                          </div>
                          <div
                            className={cn(
                              "w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 border",
                              selectedLanguage === "all"
                                ? "bg-accent text-brand-navy border-accent shadow-md shadow-teal-500/20"
                                : "border-border text-muted-foreground group-hover:text-foreground group-hover:border-accent group-hover:bg-accent/10 group-hover:translate-x-0.5"
                            )}
                          >
                            {selectedLanguage === "all" ? (
                              <FaCheck className="w-4 h-4" />
                            ) : (
                              <FaArrowRight className="w-4 h-4" />
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  )}

                  {/* Clean Divider */}
                  <div className="relative flex items-center justify-center my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border" />
                    </div>
                    <span className="relative bg-card px-4 text-xs font-semibold tracking-wider uppercase text-muted-foreground">
                      Or select single language
                    </span>
                  </div>

                  {/* 2x2 Grid for Individual Languages */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {singleLanguages.map((lang) => {
                      const isSelected = selectedLanguage === lang.value;
                      const isRtl = lang.rtl;
                      return (
                        <button
                          key={lang.value}
                          type="button"
                          onClick={() => handleLanguageSelect(lang.value)}
                          className={cn(
                            "group relative p-4 sm:p-5 rounded-2xl border-2 transition-all duration-200 cursor-pointer text-left flex items-center justify-between gap-3",
                            isSelected
                              ? "border-accent bg-accent/10 shadow-md shadow-teal-500/10 ring-2 ring-accent/30"
                              : "border-border bg-card/70 hover:bg-card hover:border-accent/50 hover:shadow-md"
                          )}
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            <div className="w-12 h-12 rounded-xl bg-surface-elevated border border-border flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform duration-200">
                              <LanguageFlag language={lang.value} size="lg" />
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-baseline gap-2">
                                <h5 className="text-base sm:text-lg font-bold text-foreground group-hover:text-accent transition-colors truncate">
                                  {lang.name || lang.label.split(" ").slice(1).join(" ")}
                                </h5>
                                <span
                                  className={cn(
                                    "text-sm font-semibold text-secondary-foreground shrink-0",
                                    ["ar", "fa", "ur"].includes(lang.value) && "font-quran"
                                  )}
                                >
                                  ({lang.nativeName || ""})
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-teal-500" />
                                <span>{lang.badge || (isRtl ? "RTL Layout" : "LTR Layout")}</span>
                              </p>
                            </div>
                          </div>

                          <div
                            className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 border shrink-0",
                              isSelected
                                ? "bg-accent text-brand-navy border-accent shadow-sm"
                                : "border-border text-muted-foreground group-hover:text-foreground group-hover:border-accent group-hover:bg-accent/10 group-hover:translate-x-0.5"
                            )}
                          >
                            {isSelected ? (
                              <FaCheck className="w-3.5 h-3.5" />
                            ) : (
                              <FaArrowRight className="w-3.5 h-3.5" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <>
                  {/* Selected Language Banner */}
                  <div className="bg-card/80 p-4 rounded-2xl border border-border flex items-center justify-between gap-4 flex-wrap shadow-sm">
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-surface-elevated border border-border flex items-center justify-center shadow-xs shrink-0">
                        <LanguageFlag language={selectedLanguage} size="md" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          {t("selectLanguage")}
                        </p>
                        <div className="flex items-center gap-2">
                          <p className="text-base sm:text-lg font-bold text-foreground">
                            {LANGUAGE_OPTIONS.find((l) => l.value === selectedLanguage)?.name ||
                              selectedLanguage}
                          </p>
                          {selectedLanguage !== "all" && (
                            <span className="text-sm font-semibold text-secondary-foreground">
                              ({LANGUAGE_OPTIONS.find((l) => l.value === selectedLanguage)?.nativeName})
                            </span>
                          )}
                          <span className="text-xs text-teal-700 dark:text-teal-300 font-semibold bg-teal-500/15 border border-teal-500/25 px-2 py-0.5 rounded-full">
                            Selected
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setStep("language")}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-border bg-btn-secondary hover:bg-surface-elevated hover:border-accent/40 text-secondary-foreground hover:text-foreground transition-all cursor-pointer shadow-xs active:scale-95"
                    >
                      <FaArrowLeft className="text-xs" />
                      <span>{t("back")}</span>
                    </button>
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

                  <div className="border-t border-border flex flex-col sm:flex-row items-center justify-end gap-3 sm:gap-4 pt-4 mt-6">
                    <button
                      type="button"
                      onClick={handleClose}
                      disabled={loading}
                      className={cn(btn.secondary, "font-bold w-full sm:w-auto")}
                    >
                      {t("cancel")}
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={loading}
                      className={cn(btn.success, "font-bold w-full sm:w-auto text-sm sm:text-base py-3 sm:py-3.5")}
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

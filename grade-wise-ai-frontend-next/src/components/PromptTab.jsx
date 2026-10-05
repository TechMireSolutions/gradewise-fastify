import { cn } from "@/lib/cn.js";
import { FaFileAlt, FaLanguage, FaCopy } from "react-icons/fa";
import React from "react";
import { generateAIPrompt } from "../utils/promptGenerator.js";
import { LANGUAGE_OPTIONS } from "@/utils/translations.js";
import LoadingSpinner from "./ui/LoadingSpinner.jsx";

const QUESTION_TYPE_LABELS = {
  multiple_choice: { en: "Multiple Choice", ur: "کثیر الانتخابی سوالات (MCQs)", ar: "أسئلة الاختيار من متعدد", fa: "سوالات چند گزینه‌ای" },
  short_answer: { en: "Short Answer", ur: "مختصر جوابات", ar: "أسئلة الإجابة القصيرة", fa: "سوالات پاسخ کوتاه" },
  true_false: { en: "True / False", ur: "درست یا غلط", ar: "الصواب والخطأ", fa: "صحیح / غلط" },
  matching: { en: "Matching", ur: "جوڑے ملائیں", ar: "المطابقة والتوصيل", fa: "وصل‌کردنی / تطبیقی" },
  fill_in_the_blank: { en: "Fill in the Blank", ur: "خالی جگہیں پر کریں", ar: "ملء الفراغات", fa: "جای خالی" },
};

function getSectionTypeLabel(qType, lang = "en") {
  return QUESTION_TYPE_LABELS[qType]?.[lang] || QUESTION_TYPE_LABELS[qType]?.en || (qType || "").replace(/_/g, " ");
}

export default function PromptTab({
  assessment,
  aiPrompt,
  aiPromptLoading,
  copied,
  onCopy,
  selectedLanguage,
  onLanguageChange,
}) {
  const fallbackPrompt = React.useMemo(() => {
    return assessment ? generateAIPrompt(assessment, selectedLanguage) : "";
  }, [assessment, selectedLanguage]);

  const activeLangOption = LANGUAGE_OPTIONS.find((l) => l.value === selectedLanguage);

  return (
    <div className="animate-fadeIn">
      <div className="mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                <FaFileAlt className="text-indigo-400 text-sm" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                AI Prompt Blueprint
              </h2>
              {aiPrompt?.languageLabel && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
                  <FaLanguage /> {aiPrompt.languageLabel}
                </span>
              )}
            </div>
            <p className={cn("text-muted-foreground", "text-sm", "mt-1")}>
              Exact instruction payload configured for AI generation in your selected language
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Multi-language Selector Box */}
            <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Prompt language">
              {LANGUAGE_OPTIONS.map((lang) => (
                <button
                  key={lang.value}
                  type="button"
                  onClick={() => onLanguageChange?.(lang.value)}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-xs transition-all duration-200 active:scale-95 cursor-pointer",
                    selectedLanguage === lang.value
                      ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/25"
                      : "bg-btn-secondary border border-border text-secondary-foreground hover:text-foreground hover:bg-surface-elevated"
                  )}
                >
                  <span className="text-sm leading-none">{lang.label.split(" ")[0]}</span>
                  <span>{lang.label.replace(/^\S+\s/, "")}</span>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={onCopy}
              disabled={!assessment || aiPromptLoading}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-btn-secondary hover:bg-indigo-500/20 border border-border hover:border-indigo-500/40 text-secondary-foreground hover:text-indigo-300 rounded-lg font-medium text-xs transition-all duration-200 active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaCopy /> {copied ? "Copied!" : "Copy Full Prompt"}
            </button>
          </div>
        </div>
      </div>

      {aiPromptLoading ? (
        <div className="flex flex-col items-center justify-center py-28 gap-4">
          <div className="p-4 rounded-full bg-indigo-500/10 border border-indigo-500/20">
            <LoadingSpinner size="lg" type="dots" color="blue" />
          </div>
          <p className={cn("text-muted-foreground", "text-sm")}>
            Building full AI prompt in {activeLangOption?.label?.replace(/^\S+\s/, "") || selectedLanguage}...
          </p>
        </div>
      ) : aiPrompt?.unifiedPrompt ? (
        <div className="space-y-4">
          <p className={cn("text-xs text-muted-foreground")}>
            The unified execution prompt sent to the AI for generating the complete assignment in{" "}
            <span className="font-semibold text-foreground">{aiPrompt.languageLabel || selectedLanguage}</span>{" "}
            (instructions, question items, marks distribution, and answer key):
          </p>
          <div className="rounded-lg border border-border overflow-hidden">
            <div className="px-3.5 py-2.5 bg-input text-xs font-semibold text-secondary-foreground flex items-center justify-between border-b border-border">
              <span>Unified Assignment Generation Prompt ({aiPrompt.languageLabel || selectedLanguage})</span>
              <span className="text-muted-foreground font-mono text-[11px]">Single Pipeline Execution</span>
            </div>
            <pre className="whitespace-pre-wrap text-xs text-muted-foreground p-3.5 bg-muted max-h-[500px] overflow-y-auto font-mono leading-relaxed">
              {aiPrompt.unifiedPrompt}
            </pre>
          </div>
          {aiPrompt.blocks?.length > 0 && (
            <details className="rounded-lg border border-border/60 overflow-hidden text-xs">
              <summary className="px-3 py-2 bg-input/50 cursor-pointer text-muted-foreground hover:text-foreground">
                View Section Breakdown ({aiPrompt.blocks.length} sections)
              </summary>
              <div className="p-3 space-y-3 bg-muted/50">
                {aiPrompt.blocks.map((block, i) => (
                  <div key={block.id ?? i} className="p-2 border border-border/40 rounded bg-background/50">
                    <p className="font-semibold text-secondary-foreground mb-1">
                      Section {i + 1} — {getSectionTypeLabel(block.questionType, selectedLanguage)} × {block.questionCount} questions
                    </p>
                    <pre className="whitespace-pre-wrap text-[11px] text-muted-foreground max-h-40 overflow-y-auto">
                      {block.prompt}
                    </pre>
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>
      ) : aiPrompt?.blocks?.length > 0 ? (
        <div className="space-y-4">
          <p className={cn("text-xs text-muted-foreground")}>
            The prompt the system sends to the AI for each question block in{" "}
            <span className="font-semibold text-foreground">{aiPrompt.languageLabel || selectedLanguage}</span>:
          </p>
          {aiPrompt.blocks.map((block, i) => (
            <details key={block.id ?? i} open={aiPrompt.blocks.length === 1} className="rounded-lg border border-border overflow-hidden">
              <summary className="px-3 py-2.5 bg-input cursor-pointer text-sm font-semibold text-secondary-foreground">
                Block {i + 1} — {getSectionTypeLabel(block.questionType, selectedLanguage)} × {block.questionCount} questions
              </summary>
              <pre className="whitespace-pre-wrap text-xs text-muted-foreground p-3 bg-muted max-h-96 overflow-y-auto">
                {block.prompt}
              </pre>
            </details>
          ))}
        </div>
      ) : (
        <>
          <p className={cn("text-xs text-muted-foreground mb-2")}>
            Showing preview based on assessment configuration in{" "}
            <span className="font-semibold text-foreground">{activeLangOption?.label?.replace(/^\S+\s/, "") || selectedLanguage}</span>:
          </p>
          <pre className="whitespace-pre-wrap text-xs font-mono text-muted-foreground p-3.5 bg-muted rounded border border-border max-h-96 overflow-y-auto">
            {fallbackPrompt || assessment?.prompt || "No prompt generated yet."}
          </pre>
        </>
      )}
    </div>
  );
}

"use client";

import { cn } from "@/lib/cn.js";
import { card, panel } from "@/lib/ui.js";
import { Button, Label, Select } from "@/components/ui";
import { getExamTranslation, isRTLLanguage, translations } from "@/utils/translations.js";

export default function ExamLanguageSelector({
  selectedLanguage,
  onLanguageChange,
  onStart,
  loading = false,
}) {
  const isRTL = isRTLLanguage(selectedLanguage);
  const welcomeText = getExamTranslation(selectedLanguage, "welcome");
  const selectLangLabel = getExamTranslation(selectedLanguage, "selectLanguage");
  const startBtnText = loading
    ? getExamTranslation(selectedLanguage, "starting")
    : getExamTranslation(selectedLanguage, "start");
  const instructionsTitle = getExamTranslation(selectedLanguage, "instructions");
  const instructionsList = translations[selectedLanguage]?.instructionsList || translations.en.instructionsList;

  return (
    <div className="min-h-screen flex items-center justify-center p-4" dir={isRTL ? "rtl" : "ltr"}>
      <div className={cn("w-full max-w-2xl", card, "shadow-2xl p-6 sm:p-8 space-y-6")}>
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground text-balance">
            {welcomeText}
          </h1>
          <p className="text-muted-foreground text-sm mt-1 text-pretty">
            {getExamTranslation(selectedLanguage, "prepare")}
          </p>
        </div>

        <div>
          <Label htmlFor="exam-language">{selectLangLabel}</Label>
          <Select
            id="exam-language"
            value={selectedLanguage}
            onChange={(e) => onLanguageChange(e.target.value)}
            disabled={loading}
          >
            <option value="en">English (LTR)</option>
            <option value="ur">Urdu - اردو (RTL)</option>
            <option value="ar">Arabic - العربية (RTL)</option>
            <option value="fa">Persian - فارسی (RTL)</option>
          </Select>
        </div>

        {instructionsList && instructionsList.length > 0 && (
          <div className={cn(panel, "p-4 space-y-2 text-start")}>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {instructionsTitle}
            </p>
            <ul className="text-sm space-y-1.5 text-secondary-foreground list-disc ps-5">
              {instructionsList.map((inst, idx) => (
                <li key={idx}>{inst}</li>
              ))}
            </ul>
          </div>
        )}

        <Button
          type="button"
          variant="primary"
          onClick={onStart}
          disabled={loading}
          className="w-full py-3.5 text-base font-bold shadow-lg shadow-indigo-500/20"
        >
          {startBtnText}
        </Button>
      </div>
    </div>
  );
}

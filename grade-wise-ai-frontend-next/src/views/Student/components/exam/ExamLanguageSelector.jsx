"use client";

import { cn } from "@/lib/cn.js";
import { card } from "@/lib/ui.js";
import { Button, Label, Select } from "@/components/ui";

export default function ExamLanguageSelector({
  selectedLanguage,
  onLanguageChange,
  onStart,
  loading = false,
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className={cn("w-full max-w-2xl", card, "shadow-2xl p-6 sm:p-8 space-y-6")}>
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground text-balance">
            Welcome to Your Assessment
          </h1>
          <p className="text-muted-foreground text-sm mt-1 text-pretty">
            Select your preferred examination language to begin. Direction and interface strings will adapt automatically.
          </p>
        </div>
        <div>
          <Label htmlFor="exam-language">Select Language</Label>
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
        <Button
          type="button"
          variant="primary"
          onClick={onStart}
          disabled={loading}
          className="w-full py-3.5 text-base font-bold shadow-lg shadow-indigo-500/20"
        >
          {loading ? "Preparing Exam..." : "Start Assessment"}
        </Button>
      </div>
    </div>
  );
}

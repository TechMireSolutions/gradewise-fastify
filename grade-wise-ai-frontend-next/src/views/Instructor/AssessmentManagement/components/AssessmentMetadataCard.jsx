"use client";

import { cn } from "@/lib/cn.js";
import { card, iconBadge } from "@/lib/ui.js";
import { Input, Label, Select, Textarea } from "@/components/ui/index.js";
import { assessmentLanguages } from "@/schemas/assessmentSchemas.js";
import { FaFileAlt } from "react-icons/fa";

export default function AssessmentMetadataCard({
  title = "",
  language = "en",
  prompt = "",
  onChange,
  disabled = false,
  showLanguage = true,
  titlePlaceholder = "e.g., Computer Systems Final Exam",
}) {
  return (
    <div className={cn(card, "@container", "shadow-2xl overflow-hidden")}>
      <div className="px-6 py-4 border-b border-border bg-input flex items-center gap-3">
        <div className={cn("p-2.5 rounded-xl", iconBadge)}>
          <FaFileAlt className="text-white text-base" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Assessment Details</h2>
      </div>

      <div className="p-6 sm:p-8 space-y-6">
        <div className={cn("grid gap-4", showLanguage ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-1")}>
          <div className={showLanguage ? "sm:col-span-2" : "col-span-1"}>
            <Label htmlFor="title">
              Assessment Title <span className="text-red-500 dark:text-red-400">*</span>
            </Label>
            <Input
              type="text"
              name="title"
              id="title"
              hasIcon={false}
              value={title}
              onChange={onChange}
              placeholder={titlePlaceholder}
              required
              disabled={disabled}
            />
          </div>

          {showLanguage && (
            <div>
              <Label htmlFor="language">Assessment Language</Label>
              <Select
                id="language"
                name="language"
                value={language || "en"}
                onChange={onChange}
                disabled={disabled}
              >
                {assessmentLanguages.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </Select>
            </div>
          )}
        </div>

        <div>
          <Label htmlFor="prompt">
            AI Directives & Prompt{" "}
            <span className="text-muted-foreground font-normal">
              (Optional if using resources or links)
            </span>
          </Label>
          <Textarea
            name="prompt"
            id="prompt"
            value={prompt}
            onChange={onChange}
            rows={4}
            placeholder="Provide instructions for question generation: focus areas, difficulty level, conceptual versus algorithmic balance..."
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
}

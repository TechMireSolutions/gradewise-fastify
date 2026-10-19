import {
  FaUniversity,
  FaChalkboardTeacher,
  FaBook,
  FaCalendarAlt,
  FaClock,
  FaStickyNote,
  FaHourglass,
  FaStar,
  FaCalculator,
} from "react-icons/fa";
import { cn } from "@/lib/cn.js";
import { Label } from "@/components/ui";
import { getTranslation } from "@/utils/translations.js";

const DURATION_PRESETS = [
  "30 Mins",
  "45 Mins",
  "1 Hour",
  "1.5 Hours",
  "2 Hours",
  "3 Hours",
];

const TIME_PRESETS = [
  { value: "08:30", label: "08:30 AM" },
  { value: "09:00", label: "09:00 AM" },
  { value: "10:00", label: "10:00 AM" },
  { value: "11:30", label: "11:30 AM" },
  { value: "14:00", label: "02:00 PM" },
  { value: "15:30", label: "03:30 PM" },
];

const PaperFormFields = ({
  form,
  onChange,
  language = "en",
  onSetField,
  calculatedMarks,
  calculatedDuration,
}) => {
  const t = (key) => getTranslation(language, key);

  const updateField = (name, value) => {
    if (onSetField) {
      onSetField(name, value);
    } else if (onChange) {
      onChange({ target: { name, value } });
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Institute Name */}
      <div className="group">
        <Label htmlFor="instituteName">
          {t("instituteName")}
        </Label>
        <div className="flex items-center gap-3 sm:gap-4 bg-input p-3 rounded-xl border border-border focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/25 transition-all duration-200 h-[54px] sm:h-[60px]">
          <div className="bg-gradient-to-br from-indigo-500 to-violet-600 text-white p-2.5 rounded-lg flex-shrink-0 shadow-sm">
            <FaUniversity className="text-base" />
          </div>
          <input
            id="instituteName"
            type="text"
            name="instituteName"
            placeholder={t("instituteNamePlaceholder")}
            value={form.instituteName || ""}
            onChange={onChange}
            className="w-full bg-transparent outline-none text-sm sm:text-base placeholder:text-subtle-foreground font-medium text-foreground"
          />
        </div>
      </div>

      {/* Teacher Name */}
      <div className="group">
        <Label htmlFor="teacherName">
          {t("teacherName")}
        </Label>
        <div className="flex items-center gap-3 sm:gap-4 bg-input p-3 rounded-xl border border-border focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/25 transition-all duration-200 h-[54px] sm:h-[60px]">
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-2.5 rounded-lg flex-shrink-0 shadow-sm">
            <FaChalkboardTeacher className="text-base" />
          </div>
          <input
            id="teacherName"
            type="text"
            name="teacherName"
            placeholder={t("teacherNamePlaceholder")}
            value={form.teacherName || ""}
            onChange={onChange}
            className="w-full bg-transparent outline-none text-sm sm:text-base placeholder:text-subtle-foreground font-medium text-foreground"
          />
        </div>
      </div>

      {/* Subject Name */}
      <div className="group">
        <Label htmlFor="subjectName">
          {t("subjectName")}
        </Label>
        <div className="flex items-center gap-3 sm:gap-4 bg-input p-3 rounded-xl border border-border focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-500/25 transition-all duration-200 h-[54px] sm:h-[60px]">
          <div className="bg-gradient-to-br from-purple-500 to-violet-600 text-white p-2.5 rounded-lg flex-shrink-0 shadow-sm">
            <FaBook className="text-base" />
          </div>
          <input
            id="subjectName"
            type="text"
            name="subjectName"
            placeholder={t("subjectNamePlaceholder")}
            value={form.subjectName || ""}
            onChange={onChange}
            className="w-full bg-transparent outline-none text-sm sm:text-base placeholder:text-subtle-foreground font-medium text-foreground"
          />
        </div>
      </div>

      {/* Date and Time with Presets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        <div className="group">
          <Label htmlFor="paperDate">
            {t("paperDate")}
          </Label>
          <div className="flex items-center gap-3 bg-input p-3 rounded-xl border border-border focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/25 transition-all duration-200 h-[54px] sm:h-[60px]" dir="ltr">
            <div className="bg-gradient-to-br from-orange-500 to-amber-600 text-white p-2.5 rounded-lg flex-shrink-0 shadow-sm">
              <FaCalendarAlt className="text-base" />
            </div>
            <input
              type="date"
              id="paperDate"
              name="paperDate"
              value={form.paperDate || ""}
              onChange={onChange}
              className="w-full bg-transparent outline-none text-sm sm:text-base font-medium text-foreground focus:outline-none [color-scheme:light] dark:[color-scheme:dark]"
            />
          </div>
        </div>

        <div className="group">
          <div className="flex items-center justify-between mb-1.5">
            <Label htmlFor="paperTime" className="mb-0">
              {t("paperTime")}
            </Label>
            <span className="text-xs text-muted-foreground">{t("quickSlots") || "Slots below"}</span>
          </div>
          <div className="flex items-center gap-3 bg-input p-3 rounded-xl border border-border focus-within:border-rose-500 focus-within:ring-2 focus-within:ring-rose-500/25 transition-all duration-200 h-[54px] sm:h-[60px]" dir="ltr">
            <div className="bg-gradient-to-br from-rose-500 to-red-600 text-white p-2.5 rounded-lg flex-shrink-0 shadow-sm">
              <FaClock className="text-base" />
            </div>
            <input
              type="time"
              id="paperTime"
              name="paperTime"
              value={form.paperTime || "10:00"}
              onChange={onChange}
              className="w-full bg-transparent outline-none text-sm sm:text-base font-medium text-foreground focus:outline-none [color-scheme:light] dark:[color-scheme:dark]"
            />
          </div>
          {/* Quick Time Slots */}
          <div className="grid grid-cols-3 sm:flex sm:flex-wrap items-center gap-1.5 mt-2" dir="ltr">
            {TIME_PRESETS.map((tSlot) => {
              const val = typeof tSlot === "string" ? tSlot : tSlot.value;
              const label = typeof tSlot === "string" ? tSlot : tSlot.label;
              const isSelected = form.paperTime === val;
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => updateField("paperTime", val)}
                  className={cn(
                    "text-xs px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer text-center font-medium min-h-8 inline-flex items-center justify-center",
                    isSelected
                      ? "bg-gradient-to-r from-rose-500 to-red-600 text-white border-rose-500 font-semibold shadow-sm shadow-rose-500/20"
                      : "bg-btn-secondary border-border text-secondary-foreground hover:text-foreground hover:bg-surface-elevated"
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Duration Picker and Total Marks */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        {/* Responsive Duration Picker */}
        <div className="group">
          <div className="flex items-center justify-between mb-1.5">
            <Label htmlFor="paperDuration" className="mb-0">
              {t("paperDuration") || "Paper Duration"}
            </Label>
            {calculatedDuration ? (
              <button
                type="button"
                onClick={() => updateField("paperDuration", calculatedDuration)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
                title="Populate duration from question blocks"
              >
                <FaHourglass className="text-[10px]" />
                Auto: {calculatedDuration}
              </button>
            ) : (
              <span className="text-xs text-muted-foreground">{t("quickSelect") || "Quick select"}</span>
            )}
          </div>
          <div className="flex items-center gap-3 bg-input p-3 rounded-xl border border-border focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/25 transition-all duration-200 h-[54px] sm:h-[60px]">
            <div className="bg-gradient-to-br from-teal-500 to-emerald-600 text-white p-2.5 rounded-lg flex-shrink-0 shadow-sm">
              <FaHourglass className="text-base" />
            </div>
            <input
              type="text"
              id="paperDuration"
              name="paperDuration"
              placeholder="e.g. 1 Hour 30 Mins"
              value={form.paperDuration || ""}
              onChange={onChange}
              className="w-full bg-transparent outline-none text-sm sm:text-base placeholder:text-subtle-foreground font-medium text-foreground"
            />
          </div>
          {/* Duration Preset Chips */}
          <div className="grid grid-cols-3 sm:flex sm:flex-wrap items-center gap-1.5 mt-2">
            {DURATION_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => updateField("paperDuration", preset)}
                className={cn(
                  "text-xs px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer text-center font-medium min-h-8 inline-flex items-center justify-center",
                  form.paperDuration === preset
                    ? "bg-gradient-to-r from-teal-500 to-emerald-600 text-white border-teal-500 font-semibold shadow-sm shadow-teal-500/20"
                    : "bg-btn-secondary border-border text-secondary-foreground hover:text-foreground hover:bg-surface-elevated"
                )}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Total Marks Input with Auto-Calculation Fallback */}
        <div className="group">
          <div className="flex items-center justify-between mb-1.5">
            <Label htmlFor="totalMarks" className="mb-0">
              {t("totalMarks") || "Total Marks"}
            </Label>
            {calculatedMarks !== undefined && calculatedMarks > 0 && (
              <button
                type="button"
                onClick={() => updateField("totalMarks", String(calculatedMarks))}
                className="inline-flex items-center gap-1 text-xs font-semibold text-violet-600 dark:text-violet-400 hover:underline cursor-pointer"
                title="Populate total marks from question blocks"
              >
                <FaCalculator className="text-[10px]" />
                Auto: {calculatedMarks}
              </button>
            )}
          </div>
          <div className="flex items-center gap-3 bg-input p-3 rounded-xl border border-border focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-500/25 transition-all duration-200 h-[54px] sm:h-[60px]">
            <div className="bg-gradient-to-br from-violet-500 to-purple-600 text-white p-2.5 rounded-lg flex-shrink-0 shadow-sm">
              <FaStar className="text-base" />
            </div>
            <input
              type="number"
              id="totalMarks"
              name="totalMarks"
              placeholder={calculatedMarks ? `e.g. ${calculatedMarks}` : "e.g. 100"}
              min="1"
              step="any"
              value={form.totalMarks ?? ""}
              onChange={onChange}
              className="w-full bg-transparent outline-none text-sm sm:text-base placeholder:text-subtle-foreground font-medium text-foreground"
            />
          </div>
          <p className="text-[11px] text-muted-foreground mt-1.5">
            Enter total marks or use the auto-calculated score derived from questions.
          </p>
        </div>
      </div>

      {/* Notes */}
      <div className="group">
        <Label htmlFor="notes">
          {t("notes")}
        </Label>
        <div className="flex items-start gap-3 sm:gap-4 bg-input p-3 rounded-xl border border-border focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/25 transition-all duration-200">
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white p-2.5 rounded-lg mt-1 flex-shrink-0 shadow-sm">
            <FaStickyNote className="text-base" />
          </div>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            value={form.notes || ""}
            onChange={onChange}
            placeholder={t("notesPlaceholder")}
            className="w-full bg-transparent outline-none text-sm sm:text-base resize-none placeholder:text-subtle-foreground font-medium text-foreground"
          />
        </div>
      </div>
    </div>
  );
};

export default PaperFormFields;

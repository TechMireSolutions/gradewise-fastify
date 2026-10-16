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
import { getTranslation } from "../utils/translations";

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
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
          {t("instituteName")}
        </label>
        <div className="flex items-center gap-3 sm:gap-4 bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl border-2 border-slate-200 dark:border-slate-800 focus-within:border-indigo-500 focus-within:shadow-lg focus-within:shadow-indigo-500/10 transition-all duration-200 h-[54px] sm:h-[60px]">
          <div className="bg-indigo-600 text-white p-2 rounded-lg flex-shrink-0">
            <FaUniversity className="text-lg" />
          </div>
          <input
            type="text"
            name="instituteName"
            placeholder={t("instituteNamePlaceholder")}
            value={form.instituteName || ""}
            onChange={onChange}
            className="w-full bg-transparent outline-none text-sm sm:text-base placeholder-slate-400 dark:placeholder-slate-500 font-medium text-slate-800 dark:text-slate-100"
          />
        </div>
      </div>

      {/* Teacher Name */}
      <div className="group">
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
          {t("teacherName")}
        </label>
        <div className="flex items-center gap-3 sm:gap-4 bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl border-2 border-slate-200 dark:border-slate-800 focus-within:border-emerald-500 focus-within:shadow-lg focus-within:shadow-emerald-500/10 transition-all duration-200 h-[54px] sm:h-[60px]">
          <div className="bg-emerald-600 text-white p-2 rounded-lg flex-shrink-0">
            <FaChalkboardTeacher className="text-lg" />
          </div>
          <input
            type="text"
            name="teacherName"
            placeholder={t("teacherNamePlaceholder")}
            value={form.teacherName || ""}
            onChange={onChange}
            className="w-full bg-transparent outline-none text-sm sm:text-base placeholder-slate-400 dark:placeholder-slate-500 font-medium text-slate-800 dark:text-slate-100"
          />
        </div>
      </div>

      {/* Subject Name */}
      <div className="group">
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
          {t("subjectName")}
        </label>
        <div className="flex items-center gap-3 sm:gap-4 bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl border-2 border-slate-200 dark:border-slate-800 focus-within:border-purple-500 focus-within:shadow-lg focus-within:shadow-purple-500/10 transition-all duration-200 h-[54px] sm:h-[60px]">
          <div className="bg-purple-600 text-white p-2 rounded-lg flex-shrink-0">
            <FaBook className="text-lg" />
          </div>
          <input
            type="text"
            name="subjectName"
            placeholder={t("subjectNamePlaceholder")}
            value={form.subjectName || ""}
            onChange={onChange}
            className="w-full bg-transparent outline-none text-sm sm:text-base placeholder-slate-400 dark:placeholder-slate-500 font-medium text-slate-800 dark:text-slate-100"
          />
        </div>
      </div>

      {/* Date and Time with Presets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        <div className="group">
          <label htmlFor="paperDate" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            {t("paperDate")}
          </label>
          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl border-2 border-slate-200 dark:border-slate-800 focus-within:border-orange-500 focus-within:shadow-lg focus-within:shadow-orange-500/10 transition-all duration-200 h-[54px] sm:h-[60px]" dir="ltr">
            <div className="bg-orange-600 text-white p-2 rounded-lg flex-shrink-0">
              <FaCalendarAlt className="text-base" />
            </div>
            <input
              type="date"
              id="paperDate"
              name="paperDate"
              value={form.paperDate || ""}
              onChange={onChange}
              className="w-full bg-transparent outline-none text-sm sm:text-base font-medium text-slate-800 dark:text-slate-100 focus:outline-none [color-scheme:light] dark:[color-scheme:dark]"
            />
          </div>
        </div>

        <div className="group">
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="paperTime" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
              {t("paperTime")}
            </label>
            <span className="text-xs text-slate-400">{t("quickSlots") || "Slots below"}</span>
          </div>
          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl border-2 border-slate-200 dark:border-slate-800 focus-within:border-red-500 focus-within:shadow-lg focus-within:shadow-red-500/10 transition-all duration-200 h-[54px] sm:h-[60px]" dir="ltr">
            <div className="bg-red-600 text-white p-2 rounded-lg flex-shrink-0">
              <FaClock className="text-base" />
            </div>
            <input
              type="time"
              id="paperTime"
              name="paperTime"
              value={form.paperTime || "10:00"}
              onChange={onChange}
              className="w-full bg-transparent outline-none text-sm sm:text-base font-medium text-slate-800 dark:text-slate-100 focus:outline-none [color-scheme:light] dark:[color-scheme:dark]"
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
                  className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer text-center font-medium ${
                    isSelected
                      ? "bg-red-600 text-white border-red-600 font-bold shadow-sm shadow-red-500/30"
                      : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-red-400 hover:text-red-600 dark:hover:text-red-400"
                  }`}
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
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="paperDuration" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
              {t("paperDuration") || "Paper Duration"}
            </label>
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
              <span className="text-xs text-slate-400">{t("quickSelect") || "Quick select"}</span>
            )}
          </div>
          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl border-2 border-slate-200 dark:border-slate-800 focus-within:border-teal-500 focus-within:shadow-lg focus-within:shadow-teal-500/10 transition-all duration-200 h-[54px] sm:h-[60px]">
            <div className="bg-teal-600 text-white p-2 rounded-lg flex-shrink-0">
              <FaHourglass className="text-base" />
            </div>
            <input
              type="text"
              id="paperDuration"
              name="paperDuration"
              placeholder="e.g. 1 Hour 30 Mins"
              value={form.paperDuration || ""}
              onChange={onChange}
              className="w-full bg-transparent outline-none text-sm sm:text-base placeholder-slate-400 dark:placeholder-slate-500 font-medium text-slate-800 dark:text-slate-100"
            />
          </div>
          {/* Duration Preset Chips */}
          <div className="grid grid-cols-3 sm:flex sm:flex-wrap items-center gap-1.5 mt-2">
            {DURATION_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => updateField("paperDuration", preset)}
                className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer text-center font-medium ${
                  form.paperDuration === preset
                    ? "bg-teal-600 text-white border-teal-600 font-bold shadow-sm shadow-teal-500/30"
                    : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-teal-400 hover:text-teal-600 dark:hover:text-teal-400"
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Total Marks Input with Auto-Calculation Fallback */}
        <div className="group">
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="totalMarks" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
              {t("totalMarks") || "Total Marks"}
            </label>
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
          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl border-2 border-slate-200 dark:border-slate-800 focus-within:border-violet-500 focus-within:shadow-lg focus-within:shadow-violet-500/10 transition-all duration-200 h-[54px] sm:h-[60px]">
            <div className="bg-violet-600 text-white p-2 rounded-lg flex-shrink-0">
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
              className="w-full bg-transparent outline-none text-sm sm:text-base placeholder-slate-400 dark:placeholder-slate-500 font-medium text-slate-800 dark:text-slate-100"
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-1.5">
            Enter total marks or use the auto-calculated score derived from questions.
          </p>
        </div>
      </div>

      {/* Notes */}
      <div className="group">
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
          {t("notes")}
        </label>
        <div className="flex items-start gap-3 sm:gap-4 bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl border-2 border-slate-200 dark:border-slate-800 focus-within:border-yellow-500 focus-within:shadow-lg focus-within:shadow-yellow-500/10 transition-all duration-200">
          <div className="bg-yellow-600 text-white p-2 rounded-lg mt-1 flex-shrink-0">
            <FaStickyNote className="text-base" />
          </div>
          <textarea
            name="notes"
            rows={3}
            value={form.notes || ""}
            onChange={onChange}
            placeholder={t("notesPlaceholder")}
            className="w-full bg-transparent outline-none text-sm sm:text-base resize-none placeholder-slate-400 dark:placeholder-slate-500 font-medium text-slate-800 dark:text-slate-100"
          />
        </div>
      </div>
    </div>
  );
};

export default PaperFormFields;

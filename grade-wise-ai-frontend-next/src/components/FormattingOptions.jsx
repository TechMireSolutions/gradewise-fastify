import { FaWrench } from "react-icons/fa";
import { getTranslation } from "../utils/translations";

const FormattingOptions = ({ form, onChange, language = "en" }) => {
  const t = (key) => getTranslation(language, key);

  return (
    <div className="bg-gradient-to-br from-slate-50 dark:from-slate-900/40 to-sky-50 dark:to-sky-950/30 p-4 sm:p-5 border-2 border-border rounded-2xl shadow-inner">
      <h3 className="text-base sm:text-lg font-bold flex items-center gap-2 mb-4 text-foreground">
        <div className="bg-indigo-600 text-white p-2 rounded-lg">
          <FaWrench className="text-base sm:text-lg" />
        </div>
        {t("formattingTitle")}
      </h3>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Page Size */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-secondary-foreground mb-2">
            {t("pageSize")}
          </label>
          <select
            name="pageSize"
            value={form.pageSize}
            onChange={onChange}
            className="w-full p-2 sm:p-3 border-2 border-border rounded-lg text-sm sm:text-base font-semibold focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
          >
            <option value="A4">A4</option>
            <option value="A5">A5</option>
            <option value="LETTER">Letter</option>
          </select>
        </div>

        {/* Header Font Size */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-secondary-foreground mb-2">
            {t("headerSize")}
          </label>
          <input
            type="number"
            name="headerFontSize"
            min={18}
            max={40}
            value={form.headerFontSize}
            onChange={onChange}
            className="w-full p-2 sm:p-3 border-2 border-border rounded-lg text-sm sm:text-base font-semibold focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
          />
        </div>

        {/* Question Font Size */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-secondary-foreground mb-2">
            {t("questionSize")}
          </label>
          <input
            type="number"
            name="questionFontSize"
            min={10}
            max={20}
            value={form.questionFontSize}
            onChange={onChange}
            className="w-full p-2 sm:p-3 border-2 border-border rounded-lg text-sm sm:text-base font-semibold focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
          />
        </div>

        {/* Option Font Size */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-secondary-foreground mb-2">
            {t("optionSize")}
          </label>
          <input
            type="number"
            name="optionFontSize"
            min={9}
            max={16}
            value={form.optionFontSize}
            onChange={onChange}
            className="w-full p-2 sm:p-3 border-2 border-border rounded-lg text-sm sm:text-base font-semibold focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
          />
        </div>
      </div>
    </div>
  );
};

export default FormattingOptions;
import { FaWrench } from "react-icons/fa";
import { getTranslation } from "@/utils/translations.js";
import { Input, Label, Select } from "@/components/ui";

const FormattingOptions = ({ form, onChange, language = "en" }) => {
  const t = (key) => getTranslation(language, key);

  return (
    <div className="bg-card border border-border p-4 sm:p-5 rounded-2xl shadow-sm">
      <h3 className="text-base sm:text-lg font-bold flex items-center gap-2.5 mb-4 text-foreground">
        <div className="bg-gradient-to-br from-indigo-500 to-violet-600 text-white p-2 rounded-xl shadow-sm">
          <FaWrench className="text-sm sm:text-base" />
        </div>
        {t("formattingTitle")}
      </h3>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Page Size */}
        <div>
          <Label htmlFor="pageSize" className="text-xs sm:text-sm font-semibold mb-2">
            {t("pageSize")}
          </Label>
          <Select
            id="pageSize"
            name="pageSize"
            value={form.pageSize}
            onChange={onChange}
          >
            <option value="A4">A4</option>
            <option value="A5">A5</option>
            <option value="LETTER">Letter</option>
          </Select>
        </div>

        {/* Header Font Size */}
        <div>
          <Label htmlFor="headerFontSize" className="text-xs sm:text-sm font-semibold mb-2">
            {t("headerSize")}
          </Label>
          <Input
            id="headerFontSize"
            type="number"
            name="headerFontSize"
            hasIcon={false}
            min={18}
            max={40}
            value={form.headerFontSize}
            onChange={onChange}
          />
        </div>

        {/* Question Font Size */}
        <div>
          <Label htmlFor="questionFontSize" className="text-xs sm:text-sm font-semibold mb-2">
            {t("questionSize")}
          </Label>
          <Input
            id="questionFontSize"
            type="number"
            name="questionFontSize"
            hasIcon={false}
            min={10}
            max={20}
            value={form.questionFontSize}
            onChange={onChange}
          />
        </div>

        {/* Option Font Size */}
        <div>
          <Label htmlFor="optionFontSize" className="text-xs sm:text-sm font-semibold mb-2">
            {t("optionSize")}
          </Label>
          <Input
            id="optionFontSize"
            type="number"
            name="optionFontSize"
            hasIcon={false}
            min={9}
            max={16}
            value={form.optionFontSize}
            onChange={onChange}
          />
        </div>
      </div>
    </div>
  );
};

export default FormattingOptions;
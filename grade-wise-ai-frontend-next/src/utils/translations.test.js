import test from "node:test";
import assert from "node:assert/strict";
import {
  isRTLLanguage,
  LANGUAGE_OPTIONS,
  RTL_LANGUAGES,
  getTranslation,
  getExamTranslation,
  translations,
} from "./translations.js";

test("RTL_LANGUAGES and isRTLLanguage", async (t) => {
  await t.test("recognizes Arabic, Urdu, Persian, and Hebrew as RTL languages", () => {
    assert.ok(Array.isArray(RTL_LANGUAGES));
    assert.deepStrictEqual(RTL_LANGUAGES, ["ar", "ur", "fa", "he"]);
    assert.strictEqual(isRTLLanguage("ar"), true);
    assert.strictEqual(isRTLLanguage("ur"), true);
    assert.strictEqual(isRTLLanguage("fa"), true);
    assert.strictEqual(isRTLLanguage("he"), true);
  });

  await t.test("recognizes English and other LTR languages as non-RTL", () => {
    assert.strictEqual(isRTLLanguage("en"), false);
    assert.strictEqual(isRTLLanguage("fr"), false);
    assert.strictEqual(isRTLLanguage("es"), false);
    assert.strictEqual(isRTLLanguage("all"), false);
    assert.strictEqual(isRTLLanguage(""), false);
  });
});

test("LANGUAGE_OPTIONS", async (t) => {
  await t.test("contains all required languages with correct RTL flags", () => {
    const values = LANGUAGE_OPTIONS.map((o) => o.value);
    assert.ok(values.includes("all"));
    assert.ok(values.includes("en"));
    assert.ok(values.includes("ur"));
    assert.ok(values.includes("ar"));
    assert.ok(values.includes("fa"));

    const enOption = LANGUAGE_OPTIONS.find((o) => o.value === "en");
    assert.strictEqual(enOption.rtl, false);

    const urOption = LANGUAGE_OPTIONS.find((o) => o.value === "ur");
    assert.strictEqual(urOption.rtl, true);

    const arOption = LANGUAGE_OPTIONS.find((o) => o.value === "ar");
    assert.strictEqual(arOption.rtl, true);

    const faOption = LANGUAGE_OPTIONS.find((o) => o.value === "fa");
    assert.strictEqual(faOption.rtl, true);
  });
});

test("getTranslation", async (t) => {
  await t.test("returns language-specific translation when available", () => {
    const enText = getTranslation("en", "modalTitle");
    assert.strictEqual(enText, "Generate Physical Paper");

    const urText = getTranslation("ur", "modalTitle");
    assert.strictEqual(urText, "جسمانی پرچہ بنائیں");

    const arText = getTranslation("ar", "modalTitle");
    assert.strictEqual(arText, "إنشاء ورقة امتحان");

    const faText = getTranslation("fa", "modalTitle");
    assert.strictEqual(faText, "ایجاد برگه امتحانی");
  });

  await t.test("falls back to English when key is missing in target language", () => {
    const fallbackText = getTranslation("unknown_lang", "modalTitle");
    assert.strictEqual(fallbackText, "Generate Physical Paper");
  });

  await t.test("falls back to the raw key string when key is not in English dictionary", () => {
    const missingKey = "some_non_existent_key_xyz";
    assert.strictEqual(getTranslation("en", missingKey), missingKey);
    assert.strictEqual(getTranslation("ur", missingKey), missingKey);
  });
});

test("getExamTranslation", async (t) => {
  await t.test("returns language-specific exam translations", () => {
    assert.strictEqual(getExamTranslation("en", "submitExam"), "Submit Exam");
    assert.strictEqual(getExamTranslation("ur", "submitExam"), "ٹیسٹ جمع کرائیں");
    assert.strictEqual(getExamTranslation("ar", "submitExam"), "تقديم الاختبار");
    assert.strictEqual(getExamTranslation("fa", "submitExam"), "ثبت آزمون");
  });

  await t.test("falls back to English when key is missing in target language", () => {
    assert.strictEqual(getExamTranslation("unknown", "submitExam"), "Submit Exam");
  });

  await t.test("falls back to raw key if key not in English dictionary", () => {
    assert.strictEqual(getExamTranslation("en", "non_existent"), "non_existent");
  });
});

test("translations dictionary completeness", async (t) => {
  await t.test("defines core student exam strings across all 4 locales", () => {
    const requiredLocales = ["en", "ur", "ar", "fa"];
    const requiredKeys = [
      "welcome",
      "start",
      "submit",
      "instructions",
      "question",
      "loading",
      "instructionsList",
    ];

    for (const locale of requiredLocales) {
      assert.ok(translations[locale], `Missing locale dictionary for ${locale}`);
      for (const key of requiredKeys) {
        assert.ok(
          translations[locale][key],
          `Missing '${key}' in locale '${locale}'`
        );
      }
    }
  });

  await t.test("instructionsList is an array of strings in each locale", () => {
    for (const locale of ["en", "ur", "ar", "fa"]) {
      const list = translations[locale].instructionsList;
      assert.ok(Array.isArray(list));
      assert.ok(list.length > 0);
      assert.strictEqual(typeof list[0], "string");
    }
  });
});

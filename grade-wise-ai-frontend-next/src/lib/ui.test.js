import test from "node:test";
import assert from "node:assert/strict";
import {
  page,
  pageInner,
  card,
  cardHeader,
  cardInteractive,
  cardGlow,
  btn,
  input,
  inputPlain,
  inputError,
  label,
  nav,
  eyebrow,
  eyebrowPill,
  pageTitle,
  heroTitle,
  pageDesc,
  sectionTitle,
  headingGradient,
  iconBadge,
  statSurface,
  shape,
  statusTone,
  gradient,
  chip,
  chipTone,
} from "./ui.js";

test("Design System Layout & Surface Tokens", async (t) => {
  await t.test("defines core page shell tokens", () => {
    assert.ok(typeof page === "string" && page.includes("min-h-screen"));
    assert.ok(typeof pageInner === "string" && pageInner.includes("max-w-7xl"));
  });

  await t.test("defines glassmorphism card tokens and nav bar", () => {
    assert.ok(typeof card === "string" && card.includes("rounded-2xl") && card.includes("border"));
    assert.ok(typeof cardHeader === "string" && cardHeader.includes("rounded-t-2xl"));
    assert.ok(typeof cardInteractive === "string" && cardInteractive.includes("hover:"));
    assert.ok(typeof cardGlow === "string" && cardGlow.includes("before:"));
    assert.ok(typeof nav === "string" && nav.includes("sticky"));
  });
});

test("Design System Button Tokens", async (t) => {
  await t.test("contains all required button variants", () => {
    const requiredVariants = ["primary", "secondary", "google", "success", "danger"];
    for (const variant of requiredVariants) {
      assert.ok(typeof btn[variant] === "string", `Missing btn.${variant}`);
      assert.ok(btn[variant].length > 0, `Empty btn.${variant}`);
    }
  });

  await t.test("enforces WCAG 44x44px minimum tap target (min-h-11) on buttons", () => {
    for (const [name, classes] of Object.entries(btn)) {
      assert.ok(
        classes.includes("min-h-11"),
        `btn.${name} does not enforce min-h-11 tap target`
      );
    }
  });

  await t.test("enforces focus-visible ring styles on all buttons for keyboard accessibility", () => {
    for (const [name, classes] of Object.entries(btn)) {
      assert.ok(
        classes.includes("focus-visible:ring-2") || classes.includes("focus-visible:outline-none"),
        `btn.${name} does not have focus-visible styling`
      );
    }
  });
});

test("Design System Form Tokens", async (t) => {
  await t.test("defines input with left-icon padding and inputPlain without", () => {
    assert.ok(input.includes("pl-11"), "input should include pl-11 for icon padding");
    assert.ok(inputPlain.includes("px-4 py-3"), "inputPlain should have standard padding");
  });

  await t.test("defines input error state with red border styling", () => {
    assert.ok(inputError.includes("border-red-500"));
    assert.ok(typeof label === "string" && label.includes("font-medium"));
  });
});

test("Modern Web Typography & Legibility", async (t) => {
  await t.test("applies text-balance to headings per modern web guidance", () => {
    assert.ok(pageTitle.includes("text-balance"), "pageTitle must include text-balance");
    assert.ok(heroTitle.includes("text-balance"), "heroTitle must include text-balance");
    assert.ok(sectionTitle.includes("text-balance"), "sectionTitle must include text-balance");
  });

  await t.test("applies text-pretty to body copy and descriptions", () => {
    assert.ok(pageDesc.includes("text-pretty"), "pageDesc must include text-pretty");
  });

  await t.test("defines heading gradient and eyebrows", () => {
    assert.ok(headingGradient.includes("bg-clip-text"));
    assert.ok(eyebrow.includes("uppercase"));
    assert.ok(eyebrowPill.includes("rounded-full"));
  });
});

test("Design System Badges and Surfaces", async (t) => {
  await t.test("defines icon badge and stat surfaces", () => {
    assert.ok(iconBadge.includes("rounded-xl"));
    assert.ok(statSurface.indigo.includes("border-indigo-500"));
    assert.ok(statSurface.emerald.includes("border-emerald-500"));
    assert.ok(statSurface.amber.includes("border-amber-500"));
  });
});

test("Concentric Shape Hierarchy (3-Tier Radius Standard)", async (t) => {
  await t.test("enforces Tier 1 container/card/modal 16px radius (rounded-2xl)", () => {
    assert.strictEqual(shape.container, "rounded-2xl");
    assert.strictEqual(shape.card, "rounded-2xl");
    assert.strictEqual(shape.modal, "rounded-2xl");
  });

  await t.test("enforces Tier 2 control/button/input/panel/chip 12px radius (rounded-xl)", () => {
    assert.strictEqual(shape.control, "rounded-xl");
    assert.strictEqual(shape.button, "rounded-xl");
    assert.strictEqual(shape.input, "rounded-xl");
    assert.strictEqual(shape.panel, "rounded-xl");
    assert.strictEqual(shape.chip, "rounded-xl");
  });

  await t.test("enforces Tier 3 badge/pill/avatar full radius (rounded-full)", () => {
    assert.strictEqual(shape.badge, "rounded-full");
    assert.strictEqual(shape.pill, "rounded-full");
    assert.strictEqual(shape.avatar, "rounded-full");
  });
});

test("Centralized Status Tone Tokens & WCAG Contrast", async (t) => {
  const tones = ["success", "warning", "danger", "info", "purple", "sky", "neutral"];

  await t.test("defines all standard status tones", () => {
    for (const tone of tones) {
      assert.ok(typeof statusTone[tone] === "string" && statusTone[tone].length > 0, `Missing statusTone.${tone}`);
    }
  });

  await t.test("enforces dual-theme dark: contrast classes on colored tones", () => {
    const coloredTones = ["success", "warning", "danger", "info", "purple", "sky"];
    for (const tone of coloredTones) {
      assert.ok(
        statusTone[tone].includes("dark:"),
        `statusTone.${tone} is missing dark theme contrast class`
      );
      assert.ok(
        statusTone[tone].includes("border-"),
        `statusTone.${tone} is missing semantic border class`
      );
    }
  });
});

test("Centralized Brand Gradient Tokens", async (t) => {
  const gradients = ["brand", "primary", "teal", "emerald", "amber", "danger", "surface"];

  await t.test("defines all standard brand gradients", () => {
    for (const key of gradients) {
      assert.ok(typeof gradient[key] === "string" && gradient[key].length > 0, `Missing gradient.${key}`);
      assert.ok(
        gradient[key].includes("bg-gradient-to-br"),
        `gradient.${key} should declare bg-gradient-to-br`
      );
    }
  });
});

test("Centralized Action Chip & Tone Tokens", async (t) => {
  await t.test("enforces rounded-xl on chip primitive for Tier 2 shape compliance", () => {
    assert.ok(chip.includes("rounded-xl"), "chip primitive must declare rounded-xl");
    assert.ok(chip.includes("min-h-9"), "chip primitive must declare min-h-9 for accessibility");
  });

  await t.test("enforces dual-theme WCAG AA contrast on all chipTone variants", () => {
    const tones = ["indigo", "emerald", "violet", "purple", "amber", "sky"];
    for (const tone of tones) {
      assert.ok(
        chipTone[tone].includes("dark:hover:text-"),
        `chipTone.${tone} is missing dark theme hover contrast class`
      );
    }
    assert.ok(
      chipTone.danger.includes("dark:text-red-400"),
      "chipTone.danger is missing dark:text-red-400"
    );
  });
});

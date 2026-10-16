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

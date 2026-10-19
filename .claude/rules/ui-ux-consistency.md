---
trigger: always_on
glob: "grade-wise-ai-frontend-next/**/*.{js,jsx,ts,tsx,css}"
description: "UI/UX consistency, semantic Tailwind tokens, WCAG AA contrast, container queries, and RTL/LTR logical layouts."
---

# UI/UX Consistency & Modern Web Guidance Rules

This rule defines mandatory design, accessibility, and styling constraints for all frontend UI components, views, and layouts in GradeWise AI.

---

## 1. Design Tokens & Zero Raw Neutrals
- **Never use hardcoded arbitrary neutrals**:
  - Do NOT use `slate-*`, `gray-*`, `zinc-*`, `neutral-*`, or `stone-*` utility classes for layout, text, or borders.
- **Always use semantic design system tokens** defined in `@/lib/ui.js` and `globals.css`:
  - Backgrounds: `bg-background`, `bg-card`, `bg-input`, `bg-btn-secondary`, `bg-surface-elevated`
  - Text: `text-foreground`, `text-secondary-foreground`, `text-muted-foreground`
  - Borders: `border-border`, `border-border/60`
  - Focus: `focusRing` (`focus-visible:ring-2 focus-visible:ring-indigo-500`)
  - Accent panels: `accentPanel`, `iconBadge`

---

## 2. WCAG AA Contrast & Dual-Theme Tokens ($\ge 4.5:1$)
- **Never use bare `*-400` text in light mode**:
  - `text-emerald-400`, `text-indigo-400`, `text-red-400`, `text-amber-400` fail contrast requirements against light backgrounds.
- **Always use dual-theme contrast pairings**:
  - Success: `text-emerald-700 dark:text-emerald-400` (Backgrounds: `bg-emerald-500/15 border-emerald-500/20`)
  - Danger / Error: `text-red-700 dark:text-red-400` (Backgrounds: `bg-red-500/15 border-red-500/20`)
  - Info / Indigo: `text-indigo-700 dark:text-indigo-300` or `text-indigo-700 dark:text-indigo-400`
  - Warning / Amber: `text-amber-700 dark:text-amber-400`
  - Purple / Violet: `text-violet-700 dark:text-violet-400`
- **Pills & Status Badges**:
  - Always use the centralized `<StatusBadge variant="success|warning|info|danger|neutral">` component rather than crafting ad-hoc `<span>` badges.

---

## 3. Logical Text Alignment & RTL/LTR Localization
- **Never use physical text alignment**:
  - Replace `text-left` with `text-start`.
  - Replace `text-right` with `text-end`.
  - Do NOT write inline conditional alignments like `isRTL && "text-right"`.
- **Directional Mirroring**:
  - Setting `dir={isRTL ? "rtl" : "ltr"}` alongside `text-start` automatically mirrors alignment correctly across English (`en`), Arabic (`ar`), Urdu (`ur`), and Persian (`fa`).
- **Translation Keys**:
  - Always resolve exam labels (e.g., True / False, Questions, Buttons) using `getExamTranslation(selectedLanguage, key)` rather than hardcoding English strings.

---

## 4. Layout Shells & Landmarks
- **Standard Layout Shells**:
  - Data Grids / Full Dashboards: Use `pageInner` (`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8`).
  - Creation, Edit, & Form Shells: Use `pageInnerNarrow` (`max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12`).
- **Landmarks**:
  - Every view must have a top-level `<MainLandmark className="...">` (`<main id="main-content">`) wrapping the active page content for WCAG accessibility compliance.

---

## 5. Modern Web Enhancements
- **Typography**:
  - Headings & Titles: Add `text-balance` (`text-wrap: balance`) to avoid single-word typographic runts.
  - Body & Descriptions: Add `text-pretty` (`text-wrap: pretty`) to eliminate trailing single-word lines.
- **Container Queries**:
  - Use `@container` on cards, stat tiles, and question blocks.
  - Style internal elements using `@xs:`, `@sm:`, and `@md:` container query modifiers instead of viewport breakpoints for component-level responsiveness.
- **Offscreen Rendering Performance**:
  - Long lists, tables, and question review cards must include:
    `style={{ contentVisibility: "auto", containIntrinsicSize: "auto 180px" }}` or Tailwind classes `[content-visibility:auto] [contain-intrinsic-size:1px_180px]`.
- **Interactive Targets**:
  - All interactive buttons and touch targets must enforce `min-h-[44px]` or `min-w-[44px]` with `cursor-pointer`.

---

## 6. Primitives First
- Replace raw `<button>` with `<Button variant="primary|secondary|danger">` from `@/components/ui`.
- Replace inline placeholder empty states with `<EmptyState icon={...} title="..." description="..." action={...} />`.
- Use `<Input>`, `<Select>`, `<Textarea>`, `<Label>`, and `<PasswordInput>` primitives from `@/components/ui`.

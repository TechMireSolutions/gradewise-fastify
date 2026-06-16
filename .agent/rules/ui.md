---
trigger: always_on
glob: "**/*.{js,jsx,css}"
description: "Guidelines and rules for UI/UX, layouts, and Tailwind CSS v4 styling in the frontend application."
---

# UI/UX & Styling Rules

## Colors & Dark Mode
- Curated palettes only: HSL/RGB slate, indigo, violet, emerald with gradient backgrounds.
- No plain primary colors (pure red, blue, green).
- Dark mode on every screen. WCAG contrast ≥ 4.5:1 in both light and dark variants.

## Typography
- Fonts: Outfit, Inter, or Roboto. No browser/system defaults.
- Font-weight hierarchy:
  - Headings: `600–700` (bold/semibold)
  - Body: `400` (regular)
  - Labels/Buttons: `500` (medium)

## Layout & Spacing
- Mobile-first. Fluid across mobile, tablet, and desktop breakpoints.
- 4pt/8dp spacing grid for all padding, margins, and gaps.
- Respect safe areas (notches, gesture bars) on mobile viewports.

## Interactions
- Minimum hit area: `44×44px` for all interactive targets (buttons, links, icons).
- Immediate press feedback: opacity change, background tint, or scale shift.
- Transitions: `150ms–300ms` ease-out. No instant state snaps.

## Icons & Visual Consistency
- SVG icons only (Lucide React, FontAwesome). No raw emojis in structural UI or navigation.
- Use reusable size tokens for icons and layout dimensions to preserve visual rhythm.

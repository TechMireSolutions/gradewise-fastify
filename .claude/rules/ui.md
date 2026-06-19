---
trigger: always_on
glob: "grade-wise-ai-frontend-next/**/*.{js,jsx,css}"
description: "UI/UX design tokens — Tailwind v4 styling, typography, accessibility, light/dark mode, and interaction standards."
---

# UI/UX & Styling Rules

> App-specific layout and component patterns → `frontend_rules.md` · Business UI rules → `domain_rules.md`

## Styling approach (pure Tailwind)

- **No custom `.edu-*` CSS classes.** Use Tailwind utilities in JSX or shared tokens in `src/lib/ui.js`.
- **Theme tokens** live in `globals.css` (`:root` / `.dark` CSS variables + `@theme inline` semantic colors).
- **Compose with `cn()`** from `src/lib/cn.js` and primitives from `src/lib/ui.js`.
- Prefer **UI components** (`Button`, `Input`, `Card`) over duplicating long class strings.

## Colors & Theme

- Semantic palette via Tailwind theme: `bg-background`, `text-foreground`, `text-muted-foreground`, `border-border`, `bg-card`, `bg-accent`, etc.
- **Light and dark mode** via `ThemeToggle` + `.dark` class on `<html>` (Zustand persist + `ThemeScript` for FOUC).
- Curated accents: indigo, violet, teal, emerald as gradients and muted tints.
- WCAG contrast ≥ 4.5:1 in both themes.

## Typography

- Font: **Outfit** (via `next/font`).
- Weight hierarchy: headings `600–700` · body `400` · labels/buttons `500`.

## Layout & Spacing

- Mobile-first; 4pt/8dp spacing grid.
- `safe-area-x` / `safe-area-bottom` (`@utility` in `globals.css`) on root layouts.
- `PageShell` for dashboard pages (ambient bg + padded content).
- `SkipLink` → `#main-content` on every page.

## Shared UI Primitives (reuse first)

| Component | Use for |
|-----------|---------|
| `Button` | Primary, secondary, Google auth variants |
| `Input` | Form fields with error state |
| `Card` / `CardHeader` | Glass cards with optional hover/glow |
| `EmptyState` | No data / empty lists |
| `LoadingState` | Async loading with message |
| `SearchField` | Filter/search inputs |
| `StatusBadge` | Draft, executed, role pills |
| `PageShell` | Standard page wrapper |
| `WelcomeBanner` | Dashboard hero |
| `ui.js` tokens | `page`, `card`, `btn`, `input`, `tableHead`, etc. |

## Interactions

- Minimum hit area: **44×44px** (`min-h-11 min-w-11`).
- Press feedback: `active:scale-95` or opacity.
- Transitions: **150ms–300ms** ease-out.
- `prefers-reduced-motion` respected in `globals.css`.

## Accessibility

- `role="status"` + `aria-live` on loaders.
- `sr-only` labels on icon-only controls and search fields.
- Focus rings: `focus-visible:ring-2 focus-visible:ring-teal-500/25`.
- `ErrorBoundary` wraps app in `Providers.jsx`.

## Icons

- SVG only: `react-icons/fa` or `lucide-react`.
- No emojis in navigation or structural UI.

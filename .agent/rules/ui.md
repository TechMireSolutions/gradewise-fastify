---
trigger: always_on
glob: "grade-wise-ai-frontend-next/**/*.{js,jsx,css}"
description: "UI/UX design tokens — Tailwind v4 pure utilities, typography, accessibility, light/dark mode, and interaction standards."
---

# UI/UX & Styling Rules

> App-specific layout and component patterns → `frontend_rules.md` · Business UI rules → `domain_rules.md`

## Pure Tailwind policy (mandatory)

1. **No custom component CSS classes** (no `.edu-*`, no `@apply` in components, no BEM-style globals).
2. **`globals.css` is tokens + animations only** — `:root` / `.dark` CSS variables, `@theme inline`, keyframes, `@utility safe-area-*`, `prefers-reduced-motion`.
3. **Style in JSX** via Tailwind utilities, `cn()` from `src/lib/cn.js`, and tokens from `src/lib/ui.js`.
4. **Prefer UI primitives** in `src/components/ui/` before pasting long class strings in views.
5. **No shadcn/ui** — Gradewise uses a custom primitive layer, not Radix/shadcn copy-paste.

### Decision order

```
UI primitive (Button, Input, Card…) → ui.js token → Tailwind utility in JSX → add token to ui.js (never add .css class)
```

## Theme architecture

| Layer | Path | Role |
|-------|------|------|
| CSS variables | `src/app/globals.css` `:root` / `.dark` | `--app-*` semantic values |
| Tailwind theme | `@theme inline` in `globals.css` | Maps vars → `bg-background`, `text-foreground`, `border-border`, etc. |
| Class compositions | `src/lib/ui.js` | Reusable multi-utility strings (`page`, `card`, `btn.primary`) |
| Merger | `src/lib/cn.js` | `cn("extra", token, condition && otherToken)` |
| Runtime theme | `features/theme/store.js` + `ThemeProvider` | `system` \| `light` \| `dark`; `.dark` on `<html>` |
| FOUC prevention | `ThemeScript` in `layout.js` | Reads `theme-storage` before paint |

**Semantic colors (use these, not raw `slate-*` / `gray-*`):**

`background` · `foreground` · `muted-foreground` · `secondary-foreground` · `subtle-foreground` · `card` · `card-header` · `border` · `input` · `nav` · `surface` · `surface-elevated` · `btn-secondary` · `accent` · `eyebrow` · `brand-navy` · `brand-teal` · `brand-sky` · `brand-gold`

## `src/lib/ui.js` token catalog

### Layout & surfaces

| Token | Use for |
|-------|---------|
| `page` | Full-page gradient shell |
| `pageInner` | Centered max-width content |
| `card` / `cardInteractive` / `cardHeader` / `cardGlow` | Glass cards |
| `panel` / `accentPanel` | Inset panels, highlights |
| `statSurface.{indigo,emerald,amber}` | Dashboard stat card backgrounds |
| `nav` | Sticky navbar |
| `examBar` | Exam sticky header |
| `gridPattern` | Ambient grid (via `AmbientBackground`) |

### Typography

| Token | Use for |
|-------|---------|
| `heroTitle` / `pageTitle` / `pageDesc` | Headings & lead copy |
| `headingGradient` | Brand gradient text (has solid fallback) |
| `eyebrow` / `eyebrowPill` / `sectionTitle` | Section labels |

### Forms

| Token | Use for |
|-------|---------|
| `input` | Fields with left icon (`pl-11`) |
| `inputPlain` | Fields without icon |
| `select` / `textarea` / `fileInput` | Other controls |
| `inputError` / `label` | Validation & labels |

### Actions

| Token | Use for |
|-------|---------|
| `btn.primary` / `btn.secondary` / `btn.google` / `btn.success` / `btn.danger` | Buttons & link-buttons |
| `chip` + `chipTone.{indigo,emerald,violet,amber,sky,danger}` | Table/row action chips |
| `fab` | Floating action (scroll-to-top, etc.) |
| `focusRing` | Append to interactive elements |

### Icons & badges

| Token | Use for |
|-------|---------|
| `iconBadge` / `iconBadgeTeal` / `iconBadgeEmerald` / `iconBadgeAmber` | Gradient icon containers |
| `emptyStateIcon` | Empty-state hero icon wrap |

### Data display

| Token | Use for |
|-------|---------|
| `tableHead` / `tableRowHover` | Tables |
| `statCard` | Metric tiles |
| `dividerLine` / `dividerLabel` | Section dividers |

## UI primitives (`src/components/ui/`)

| Component | Wraps |
|-----------|--------|
| `Button` | `btn.*` variants (`primary`, `secondary`, `google`, `success`) |
| `Input` | `input` / `inputPlain` + `hasIcon` prop |
| `Select` / `Textarea` | `select` / `textarea` |
| `Label` | `label` |
| `Card` / `CardHeader` / `CardContent` | `card`, `cardHeader` |
| `IconBadge` | `iconBadge*` variants |
| `StatusBadge` | Semantic status pills |
| `SearchField` / `EmptyState` / `LoadingState` | Lists & async UI |

## Layout components (`src/components/layout/`)

| Component | Use for |
|-----------|---------|
| `PageShell` | Dashboard pages (`page` + ambient + padding) |
| `MainLandmark` | `id="main-content"` skip-link target |
| `SkipLink` | Keyboard skip navigation |
| `WelcomeBanner` | Dashboard hero |
| `AuthPageLayout` | Auth pages + theme toggle |
| `AmbientBackground` | Decorative blobs |

## Light / dark mode

- Default: **`system`** (respects `prefers-color-scheme` on first visit).
- Toggle sets explicit `light` \| `dark` (stored in `theme-storage`).
- **Never hardcode** `bg-slate-800`, `text-white`, `hover:text-white` — use semantic tokens.
- Status colors: `text-emerald-700 dark:text-emerald-400` pattern (see `StatusBadge.jsx`).

## Accessibility (required)

- `MainLandmark` on every route tree (dashboard, auth, exam, home, error, 404).
- `focus-visible:ring-*` on all interactive elements (`focusRing` or `btn.*`).
- `aria-label` / `aria-pressed` / `role="timer"` on exam controls.
- `sr-only` for icon-only buttons and search labels.
- `prefers-reduced-motion`: global disable in `globals.css`; use `motion-reduce:*` on transforms.
- WCAG contrast ≥ 4.5:1 in both themes.

## Interactions

- Minimum hit area: **44×44px** (`min-h-11 min-w-11`).
- Press feedback: `active:scale-[0.98]` + `motion-reduce:active:scale-100`.
- Transitions: **150ms–300ms** ease-out.

## Anti-patterns (do not)

- ❌ New `.edu-*` or bespoke classes in `globals.css`
- ❌ Inline `<style>` blocks in views (use global keyframes / Tailwind `animate-*`)
- ❌ `bg-slate-*` / `text-gray-*` without `dark:` or semantic replacement
- ❌ Duplicating `btn.primary` gradient string in views
- ❌ `style={{ backgroundColor: … }}` for theme colors (use tokens)
- ❌ Importing `cn` from `ui.js` (only from `cn.js`)

## Icons

- SVG only: `react-icons/fa` or `lucide-react`.
- No emojis in navigation or structural UI.

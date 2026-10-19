---
description: "UI/UX design tokens — Tailwind v4 pure utilities, typography, accessibility, light/dark mode, and interaction standards."
globs: "grade-wise-ai-frontend-next/**/*.{js,jsx,css}"
glob: "grade-wise-ai-frontend-next/**/*.{js,jsx,css}"
alwaysApply: true
trigger: always_on
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

`background` · `foreground` · `muted-foreground` · `secondary-foreground` · `subtle-foreground` · `card` · `card-header` · `border` · `input` · `nav` · `surface` · `surface-elevated` · `btn-secondary` · `accent` · `eyebrow` · `edu-navy` · `edu-teal` · `edu-sky` · `edu-gold`

## `src/lib/ui.js` token catalog

### Layout & surfaces

| Token | Use for |
|-------|---------|
| `page` | Full-page gradient shell |
| `pageInner` | Centered max-width content |
| `card` / `cardHeader` / `cardGlow` | Glass cards & container panels |
| `cardInteractive` | Clickable cards (**leaf items only** — never on containers or form sections) |
| `panel` | Inset panels, highlights |
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
| `input` | Text fields (includes `pl-11` left-icon padding) |
| `select` / `textarea` | Other controls |
| `inputError` / `label` | Validation & labels |

### Actions

| Token | Use for |
|-------|---------|
| `btn.primary` / `btn.secondary` / `btn.google` / `btn.success` | Buttons & link-buttons |
| `chip` | Table/row action chips |
| `focusRing` | Append to interactive elements |

### Icons & badges

| Token | Use for |
|-------|---------|
| `iconBadge` / `iconBadgeTeal` | Gradient icon containers |

| Token | Use for |
|-------|---------|
| `tableHead` / `tableRowHover` | Tables |
| `statCard` | Metric tiles |
| `statSurface.indigo` / `emerald` / `amber` | Themed metric summary boxes with border & gradient |
| `dividerLine` / `dividerLabel` | Section dividers |

## UI primitives (`src/components/ui/`)

| Component | Wraps |
|-----------|--------|
| `Button` | `btn.*` variants (`primary`, `secondary`, `google`, `success`) + min-h-11 hit target |
| `Input` | `input` + `inputError` via `error` prop + left icon support |
| `PasswordInput` | `input` with accessible show/hide toggle (`aria-pressed`, `aria-label`) & IME safety |
| `Select` | `select` token with integrated `FiChevronDown` chevron, focus ring & error styling |
| `Textarea` | `textarea` token with error states |
| `Label` | Accessible form label with required indicator (`*`) |
| `Card` / `CardHeader` / `CardContent` | `card`, `cardInteractive`, `cardGlow`, `cardHeader` |
| `StatusBadge` | Semantic status pills |
| `SearchField` | Standardized search input with icon & sr-only label |
| `EmptyState` | Standardized empty state with icon, heading, description, and action button |
| `LoadingState` / `LoadingSpinner` / `PageLoader` / `Modal` | Async UI, loaders & overlays |

## Layout components (`src/components/layout/`)

| Component | Use for |
|-----------|---------|
| `PageShell` | Dashboard pages (`page` + ambient + padding) |
| `MainLandmark` | `id="main-content"` skip-link target |
| `SkipLink` | Keyboard skip navigation |
| `WelcomeBanner` | Dashboard hero |
| `AuthPageLayout` | Auth pages + theme toggle |
| `AmbientBackground` | Decorative blobs |

## Light / dark mode & browser theming

- Default: **`system`** (respects `prefers-color-scheme` on first visit).
- Toggle sets explicit `light` | `dark` (stored in `theme-storage`).
- **Never hardcode** `bg-slate-800`, `text-white`, `hover:text-white` — use semantic tokens.
- Status colors: `text-emerald-700 dark:text-emerald-400` pattern (see `StatusBadge.jsx`).
- **`color-scheme`**: Maintain `color-scheme: light` in `:root` and `color-scheme: dark` in `.dark` so native form controls, dialogs, and scrollbars adapt without custom CSS (`browser-ui-theming`).
- **`accent-color`**: Bound to `--app-accent` for native controls (checkboxes, radio buttons, sliders).
- **Text selection**: Style `::selection` with brand tokens (`bg-indigo-500/25 text-foreground`). **Never** apply `user-select: none` to readable content text (breaks copy-paste, translation tools, and screen reader "read from here" gestures); restrict `user-select: none` strictly to UI chrome (drag handles, action chips).
- **Scrollbars**: Use standard `scrollbar-color` and `scrollbar-width: thin`. Ensure $\ge 3:1$ contrast between thumb and track. **Never** set `scrollbar-width: none` or `overflow: hidden` on scrollable regions without providing an alternate scrolling affordance.

## Modern typography & text wrapping

Per `modern-web-guidance` (`improve-text-layout-and-legibility`):
- **Headings & Titles**: Apply `text-wrap: balance` to headings (`h1`–`h6`, `pageTitle`, `heroTitle`, card headers) up to 6 lines to ensure symmetrical line breaks and eliminate awkward hanging single words.
- **DO NOT** apply `text-wrap: balance` globally (e.g., `* { text-wrap: balance; }`) — it uses a binary-search algorithm that is computationally expensive for large content blocks.
- **Body copy & Paragraphs**: Apply `text-wrap: pretty` to multi-line paragraphs, questions text, and blockquotes (`p`, `blockquote`, `li`) to prevent orphaned words ("runts") on the final line.

## Modals, dialogs & top layer

Per `modern-web-guidance` (`prevent-page-scroll-under-modal-dialog`, `animate-to-from-top-layer`):
- **Pure CSS scroll containment**:
  ```css
  dialog:modal { overscroll-behavior: contain; }
  dialog::backdrop { overflow: hidden; overscroll-behavior: contain; }
  ```
  `::backdrop` defaults to `overflow: visible` (not a scroll container); setting `overflow: hidden` makes it a non-scrollable scroll container that honors `overscroll-behavior`.
- **DO NOT** lock background page scrolling by setting `overflow: hidden` or `position: fixed` on `<html>` or `<body>` when opening dialogs. Mutating root overflow removes the scrollbar (causing horizontal layout shift), can jump scroll position, and breaks `position: sticky` on the underlying page.
- **Top-layer transitions**: Modals and popovers entering/exiting the top layer must declare `transition-behavior: allow-discrete` and include `overlay` and `display` in their transition property list, paired with `@starting-style` and `prefers-reduced-motion` fallbacks.

## Modern form states & validation

Per `modern-web-guidance` (`validate-input-after-interaction`, `accessible-error-announcement`):
- **Validation state**: Use `:user-invalid` and `:user-valid` rather than raw `:invalid` / `:valid` for visual validity indicators. This avoids the hostile pattern of flagging required-empty fields as invalid on initial page load.
- **Accessibility synchronization**: Screen readers do not automatically sync `:user-invalid`. Synchronize `aria-invalid="true"` and link `aria-errormessage` (or `aria-describedby`) to the error message element upon user blur/input.
- **Password visibility**: Use `PasswordInput` with an accessible toggle button declaring `aria-label`, `aria-pressed`, and $\ge 44\text{px}$ hit target.
- **Password criteria**: Auth registration forms must include `PasswordRequirements` (4-bar strength indicator + real-time 5-point checklist).
- **Confirmation fields**: Confirm-password fields must provide real-time match feedback (e.g. checkmark vs mismatch note).
- **IME-safe submission**: In input `onKeyDown` handlers for Enter-submit, always guard against IME composition sessions (`if (event.nativeEvent.isComposing) return;`) to prevent premature submission for multilingual users (Urdu, Arabic, Persian, CJK).
- **Zero raw grayscale in forms**: Use `bg-input`, `text-foreground`, `border-border`, and `bg-surface-elevated` — never raw `slate-*` / `gray-*`.

## Component-level responsiveness & performance

Per `modern-web-guidance` (`size-aware-styling`, `defer-rendering-heavy-content`):
- **Container queries**: Prefer `@container` (Tailwind 4 container queries) over viewport media queries for encapsulated components (question cards, analytics metric cards, modal sidebars) so components respond to their container width.
- **Heavy list rendering**: On long lists of questions (e.g. 50+ item exam sheets) or large tables, apply `content-visibility: auto` with `contain-intrinsic-size` to defer layout and paint for off-screen items, dramatically optimizing Largest Contentful Paint (LCP) and Interaction to Next Paint (INP).

## Accessibility (required)

- `MainLandmark` on every route tree (dashboard, auth, exam, home, error, 404).
- `focus-visible:ring-*` on all interactive elements (`focusRing` or `btn.*`).
- Exam timer: Must declare `role="timer"`, `aria-live="polite"`, and `font-mono tabular-nums` to prevent layout reflows during countdowns.
- Exam controls: `aria-label` / `aria-pressed` on navigation and option selection.
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
- ❌ Hardcoded grayscale borders (`border-slate-600`, `border-gray-700`) — use `border-border` / `border-border/60`
- ❌ `cardInteractive` on wrapper containers, form sections, or cards containing forms/buttons (causes container scale jitter on click; use `card` or `cardElevated` for containers)
- ❌ Interactive filter tabs or action chips lacking `focusRing` or failing $\ge 44\text{px}$ touch target compliance
- ❌ Duplicating `btn.primary` gradient string in views
- ❌ `style={{ backgroundColor: … }}` for theme colors (use tokens)
- ❌ Importing `cn` from `ui.js` (only from `cn.js`)
- ❌ `overflow: hidden` on `body` for modals (use CSS `overscroll-behavior: contain`)
- ❌ `user-select: none` on readable body text or question items
- ❌ `:invalid` styling applied prematurely on load (use `:user-invalid`)
- ❌ Physical text alignment (`text-left`, `text-right`) — use CSS logical properties (`text-start`, `text-end`) with `dir`

## Icons

- SVG only: `react-icons/fa` or `lucide-react`.
- No emojis in navigation or structural UI.


---
name: gradewise-frontend
description: "Develop and debug the Gradewise Next.js frontend (React 19, App Router, Tailwind 4 pure utilities, Zustand, TanStack Query, cookie auth). ACTIVATE for pages, views, components, hooks, forms, middleware, dashboards, theme/a11y, or API integration in grade-wise-ai-frontend-next/."
---

# Gradewise Frontend Skill

## When to Use

- Adding or changing pages, views, components, hooks
- Zustand stores and feature API modules
- Cookie auth, middleware, protected routes, forms
- TanStack Query for server state
- **Pure Tailwind styling**, light/dark theme, accessibility
- Instructor/student dashboards and assessment UI
- Playwright E2E tests
- Frontend DRY refactors

## Stack

React 19 · Next.js 16 (Turbopack) · **Tailwind CSS 4 (pure utilities)** · Zustand 5 · TanStack Query 5 · Zod 4 · ESLint 10 · Playwright

## Before You Code

1. Read `.agent/rules/standards_rules.md` (Policies 1–5)
2. Read `.agent/rules/frontend_rules.md` and **`.agent/rules/ui.md`**
3. Run from `grade-wise-ai-frontend-next/`:
   ```bash
   npm run build && npm run lint
   ```

## Project Layout

```
grade-wise-ai-frontend-next/src/
  proxy.js
  app/
    globals.css           # Tokens + @theme + animations ONLY
    layout.js             # ThemeScript, SkipLink, Providers
    loading.js error.js not-found.jsx
    (auth)/ (dashboard)/ (exam)/
  lib/
    cn.js                 # cn(...classes) — class merger
    ui.js                 # Design-system Tailwind compositions
    apiClient.js
  features/
    theme/                # store.js, resolveTheme.js
    <domain>/             # store.js + api.js
  views/                  # Page UI (react-router mock OK)
  components/
    Providers.jsx         # QueryClient + ThemeProvider + ErrorBoundary
    ThemeProvider.jsx ThemeToggle.jsx
  components/
    Providers.jsx         # QueryClient + ThemeProvider + ErrorBoundary
    ThemeProvider.jsx ThemeToggle.jsx
    ui/                   # Button, Input, PasswordInput, Select, Textarea, Label, SearchField, EmptyState, Card…
    layout/               # PageShell, MainLandmark, AuthPageLayout, AmbientBackground
    auth/ admin/ dashboard/ # LoginFormFields, PasswordRequirements, UserManagementTable…
  hooks/
  schemas/                # Zod (NOT scheema/)
  utils/                  # roleDisplay, parseZodFieldErrors, formatDate, translations
  e2e/
```

## Patterns (must follow)

| Task | Pattern |
|------|---------|
| New page | `app/.../page.jsx` → `dynamic(() => import('@/views/...'), { ssr: false })` |
| Route protection | `proxy.js` + `<ProtectedRoute requiredRole="...">` |
| Session | httpOnly cookie — **no JWT in localStorage** |
| Auth store | Persist `user` only; call `fetchMe()` / `logoutApi()` |
| Google sign-in | `GoogleAuthButton` — shared button with spinner & standard tokens |
| Server state | TanStack Query (wrap app in `Providers.jsx`) |
| UI state | Zustand in `features/<domain>/store.js` |
| API calls | `features/<domain>/api.js` via `apiClient.js` |
| Form fields | `Input`, `PasswordInput`, `Select`, `Textarea`, `Label` from `@/components/ui` |
| Password criteria | `PasswordRequirements` (4-tier strength bar + 5-criteria checklist) |
| Confirm password | Real-time match visual indicator |
| Form validation | `react-hook-form` + Zod schemas from `src/schemas/` |
| View modularity | Orchestrator view < 200 lines; extract UI to `<View>/components/` and logic to custom hooks (`<View>/hooks/` or `src/hooks/`) |
| Dashboard metrics | `DashboardStatCard`, `DashboardStatGrid`, `DashboardSectionCard`, `DashboardQuickActions` from `@/components/dashboard/shared/` |
| Assessment actions | `AssessmentActionButtons` supporting `chips` (table rows) and `grid` (mobile cards) modes |
| Assessment forms | `AssessmentMetadataCard` (Title, Language, Prompt) & `AssessmentLockedNotice` |
| Dynamic route params | `const rawId = params?.id || params?.assessmentId; const id = Array.isArray(rawId) ? rawId[0] : rawId;` |
| List loading (FOES) | Animated skeleton cards/rows while `loading && !hasLoaded`; never `EmptyState` while loading |
| Containers & sections | `card` or `cardElevated` — **never `cardInteractive` on containers/forms** |
| Modals | Dedicated boolean per action or discriminated `{ type, data }` to avoid race conditions |
| Auth pages | `AuthPageLayout` + `GoogleAuthButton` + `useLoginForm` (login) / `useSignupForm` (signup) |
| Admin users | `useUserManagement` + `UserManagementTable` |
| Notifications | `react-hot-toast` or `Modal` |

## Pure Tailwind styling (mandatory)

### Stack

- **Tailwind v4** via `@import "tailwindcss"` in `globals.css`
- **No shadcn/ui**, no `@apply` component classes, no `.edu-*` globals
- **No** inline `<style>` in views — use `animate-*` from `globals.css`

### Decision order

```
1. UI primitive (Button, Input, PasswordInput, Select, Textarea, Label, SearchField, EmptyState, Card, StatusBadge…)
2. Token from lib/ui.js (page, card, btn.primary, chip, statSurface…)
3. Raw Tailwind utility (one-off)
4. If pattern repeats → add export to lib/ui.js (never new CSS class)
```

### Examples

```jsx
import { cn } from "@/lib/cn.js";
import { btn, card, chip, focusRing, page, statSurface } from "@/lib/ui.js";
import { Button, Input, PasswordInput, Select, Label, EmptyState } from "@/components/ui";

// Page
<div className={cn(page, "overflow-x-hidden")}>…</div>

// Button
<Button variant="primary" className="w-full">Submit</Button>
<Link href="/x" className={cn(btn.secondary, focusRing)}>Back</Link>

// Password Input with accessible show/hide toggle
<PasswordInput id="pass" error={!!errors.password} {...register("password")} />

// Select with integrated chevron
<Select id="role" {...register("role")} options={[{ value: "student", label: "Student" }]} />

// Stat Card / Surface
<div className={statSurface.indigo}>…</div>
```

### Theme (light / dark / system)

- Store: `features/theme/store.js` — default `system`
- `ThemeProvider` applies `.dark` on `<html>`; `ThemeScript` prevents FOUC
- Use semantic colors: `bg-background`, `text-foreground`, `border-border`, `bg-input`, `bg-surface-elevated`
- **Never** `bg-slate-800/60`, `hover:text-white`, raw `gray-*` without `dark:`

### Layout, Form UX & Accessibility

| Component | Purpose |
|-----------|-----------|
| `PageShell` | Dashboard pages |
| `MainLandmark` | `#main-content` for skip link |
| `SkipLink` | In root `layout.js` |
| `WelcomeBanner` | Dashboard hero |
| `AmbientBackground` | Decorative blobs |
| `SearchField` | Standardized search input with icon |
| `EmptyState` | Standardized zero-result display |

- **Touch targets**: All interactive buttons, inputs, selects, and toggles must be $\ge 44\text{px}$ (`min-h-11`).
- **Form errors**: Link errors with `aria-errormessage` and use `:user-invalid` styling.
- **IME safety**: On input Enter keydown, guard with `if (event.nativeEvent?.isComposing) return;` (for Urdu, Arabic, Persian, CJK).
- **Exam Timer**: Must declare `role="timer"`, `aria-live="polite"`, and `font-mono tabular-nums`.
- **Exam Directionality**: `ExamLayout` dynamically binds `dir="rtl"` vs `dir="ltr"` for selected language.

### Role badges

Use `utils/roleDisplay.js` + `StatusBadge` — dual-theme contrast (`text-*-700 dark:text-*-400`).

## Do NOT

- Recreate root `src/store/` or `src/api/`
- Store JWT in `localStorage`
- Use `scheema/` (renamed to `schemas/`)
- Re-add removed deps: chart.js, recharts, lodash, @react-oauth/google
- **Add custom CSS classes** or shadcn components
- **Use raw unstyled inputs/selects** (use `Input`, `PasswordInput`, `Select`, `Textarea`, `Label`)
- **Use raw `slate-*` / `gray-*`** in forms (use `bg-input`, `text-foreground`, `border-border`)
- **Import `cn` from `ui.js`** (only from `cn.js`)
- **Apply `cardInteractive` to containers or form sections** (causes container scale jitter on click; use `card` or `cardElevated`)
- **Render `EmptyState` prematurely** while initial data is fetching (FOES anti-pattern; always show skeleton loaders)
- **Use hardcoded grayscale borders** like `border-slate-600` or `border-gray-700` (use `border-border` / `border-border/60`)
- Duplicate gradient button strings (use `btn.primary`)
- Lock page scroll by modifying `overflow` on `body`/`html` for modals (use CSS `overscroll-behavior: contain`)
- Set `user-select: none` on readable body copy or questions
- Use raw `:invalid` for visual form validation (use `:user-invalid`)
- Forget to restart PM2 after frontend build (`npx pm2 restart all`)

## Async Assessment UI

When start returns `{ status: "generating" }`:

- Poll `getAssessmentStatusApi(assessmentId, attemptId)` until `ready`
- See `features/student-assessment/store.js`

## Route Groups

- `(auth)` — login, signup, password reset (`AuthPageLayout` + `MainLandmark`)
- `(dashboard)` — Navbar + Footer + `MainLandmark`
- `(exam)` — distraction-free assessment + `MainLandmark`

## Testing

```bash
npm run test:e2e       # Playwright smoke
npm run test:e2e:ui    # Interactive mode
```

## Env

```bash
cp .env.example .env.local
NEXT_PUBLIC_API_URL=http://localhost:5005
# Firebase vars for Google sign-in
```

Dev server: **http://localhost:3000**

## References

- Modernization: `MIGRATION.md`
- Full rules: `.agent/rules/frontend_rules.md`
- **UI tokens & a11y:** `.agent/rules/ui.md`
- Domain: `.agent/rules/domain_rules.md`

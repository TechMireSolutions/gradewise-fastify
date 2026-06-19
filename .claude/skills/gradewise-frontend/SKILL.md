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

1. Read `.claude/rules/standards_rules.md` (Policies 1–5)
2. Read `.claude/rules/frontend_rules.md` and **`.claude/rules/ui.md`**
3. Run from `grade-wise-ai-frontend-next/`:
   ```bash
   npm run build && npm run lint
   ```

## Project Layout

```
grade-wise-ai-frontend-next/src/
  middleware.js
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
    ui/                   # Button, Input, Card, IconBadge, StatusBadge…
    layout/               # PageShell, MainLandmark, AuthPageLayout…
    auth/ admin/ dashboard/
  hooks/
  schemas/                # Zod (NOT scheema/)
  utils/                  # roleDisplay, parseZodFieldErrors, formatDate
  e2e/
```

## Patterns (must follow)

| Task | Pattern |
|------|---------|
| New page | `app/.../page.jsx` → `dynamic(() => import('@/views/...'), { ssr: false })` |
| Route protection | `middleware.js` + `<ProtectedRoute requiredRole="...">` |
| Session | httpOnly cookie — **no JWT in localStorage** |
| Auth store | Persist `user` only; call `fetchMe()` / `logoutApi()` |
| Google sign-in | Firebase popup → `getIdToken()` → `{ idToken }` to backend |
| Server state | TanStack Query (wrap app in `Providers.jsx`) |
| UI state | Zustand in `features/<domain>/store.js` |
| API calls | `features/<domain>/api.js` via `apiClient.js` |
| Forms | react-hook-form + Zod from `src/schemas/` |
| Modals | `useModal()` |
| Auth pages | `AuthPageLayout` + `useLoginForm` + `LoginFormFields` |
| Admin users | `useUserManagement` + `UserManagementTable` |
| Notifications | `react-hot-toast` or `Modal` |

## Pure Tailwind styling (mandatory)

### Stack

- **Tailwind v4** via `@import "tailwindcss"` in `globals.css`
- **No shadcn/ui**, no `@apply` component classes, no `.edu-*` globals
- **No** inline `<style>` in views — use `animate-*` from `globals.css`

### Decision order

```
1. UI primitive (Button, Input, Card, IconBadge, StatusBadge…)
2. Token from lib/ui.js (page, card, btn.primary, chipTone.indigo…)
3. Raw Tailwind utility (one-off)
4. If pattern repeats → add export to lib/ui.js (never new CSS class)
```

### Examples

```jsx
import { cn } from "@/lib/cn.js";
import { btn, card, chip, chipTone, focusRing, page } from "@/lib/ui.js";
import Button from "@/components/ui/Button.jsx";
import { Card, CardHeader } from "@/components/ui/Card.jsx";

// Page
<div className={cn(page, "overflow-x-hidden")}>…</div>

// Button
<Button variant="primary" className="w-full">Submit</Button>
<Link href="/x" className={cn(btn.secondary, focusRing)}>Back</Link>

// Card
<Card hover><CardHeader>Title</CardHeader>…</Card>

// Table action chip
<Link className={cn(chip, chipTone.indigo, focusRing)}>View</Link>

// Form
<Input hasIcon={false} error={!!errors.email} {...register("email")} />
```

### Theme (light / dark / system)

- Store: `features/theme/store.js` — default `system`
- `ThemeProvider` applies `.dark` on `<html>`; `ThemeScript` prevents FOUC
- Use semantic colors: `bg-background`, `text-foreground`, `border-border`, `bg-input`
- **Never** `bg-slate-800/60`, `hover:text-white`, raw `gray-*` without `dark:`

### Layout & a11y

| Component | Purpose |
|-----------|-----------|
| `PageShell` | Dashboard pages |
| `MainLandmark` | `#main-content` for skip link |
| `SkipLink` | In root `layout.js` |
| `WelcomeBanner` | Dashboard hero |
| `AmbientBackground` | Decorative blobs |

- All interactives: `focusRing` or `btn.*` (includes `focus-visible`)
- Exam UI: `aria-pressed`, `aria-label`, `role="timer"`
- Touch targets ≥ `min-h-11`

### Role badges

Use `utils/roleDisplay.js` + `StatusBadge` — dual-theme contrast (`text-*-700 dark:text-*-400`).

## Do NOT

- Recreate root `src/store/` or `src/api/`
- Store JWT in `localStorage`
- Use `scheema/` (renamed to `schemas/`)
- Re-add removed deps: chart.js, recharts, lodash, @react-oauth/google
- **Add custom CSS classes** or shadcn components
- **Import `cn` from `ui.js`** (only from `cn.js`)
- Duplicate gradient button strings (use `btn.primary`)

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
- Full rules: `.claude/rules/frontend_rules.md`
- **UI tokens & a11y:** `.claude/rules/ui.md`
- Domain: `.claude/rules/domain_rules.md`

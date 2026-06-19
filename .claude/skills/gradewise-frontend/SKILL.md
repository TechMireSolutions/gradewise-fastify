---
name: gradewise-frontend
description: "Develop and debug the Gradewise Next.js frontend (React 19, App Router, Tailwind 4, Zustand, TanStack Query, cookie auth). ACTIVATE for pages, views, components, hooks, forms, middleware, dashboards, or API integration in grade-wise-ai-frontend-next/."
---

# Gradewise Frontend Skill

## When to Use

- Adding or changing pages, views, components, hooks
- Zustand stores and feature API modules
- Cookie auth, middleware, protected routes, forms
- TanStack Query for server state
- Instructor/student dashboards and assessment UI
- Playwright E2E tests
- Frontend DRY refactors

## Stack

React 19 · Next.js 16 (Turbopack) · Tailwind 4 · Zustand 5 · TanStack Query 5 · Zod 4 · ESLint 10 · Playwright

## Before You Code

1. Read `.agent/rules/standards_rules.md` (Policies 1–5)
2. Read `.agent/rules/frontend_rules.md` and `.agent/rules/ui.md`
3. Run from `grade-wise-ai-frontend-next/`:
   ```bash
   npm run build && npm run lint
   ```

## Project Layout

```
grade-wise-ai-frontend-next/src/
  middleware.js         # Cookie session gate
  app/
    layout.js           # Providers (TanStack Query) + Toaster
    loading.js error.js not-found.jsx
    (auth)/ (dashboard)/ (exam)/
  features/<domain>/    # store.js + api.js
  views/                # Page UI (react-router mock OK)
  components/
    Providers.jsx       # QueryClientProvider
    ui/ layout/ auth/ admin/ dashboard/
  hooks/                # useModal, useLoginForm, useUserManagement, useHydrated
  lib/apiClient.js      # withCredentials: true
  schemas/              # Zod (NOT scheema/)
  utils/                # parseZodFieldErrors, formatDate, translations
  e2e/                  # Playwright smoke tests
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

## Do NOT

- Recreate root `src/store/` or `src/api/`
- Store JWT in `localStorage`
- Use `scheema/` (renamed to `schemas/`)
- Re-add removed deps: chart.js, recharts, lodash, @react-oauth/google

## Async Assessment UI

When start returns `{ status: "generating" }`:

- Poll `getAssessmentStatusApi(assessmentId, attemptId)` until `ready`
- See `features/student-assessment/store.js`

## Route Groups

- `(auth)` — login, signup, password reset
- `(dashboard)` — Navbar + Footer
- `(exam)` — distraction-free assessment

## Styling

- Palette: slate · indigo · violet · emerald
- Reuse: `AmbientBackground`, `PageLoader`, `StatCard`
- Touch targets ≥ 44px · WCAG ≥ 4.5:1
- **No shadcn/ui** — custom `components/ui/`

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
- UI tokens: `.agent/rules/ui.md`
- Domain: `.agent/rules/domain_rules.md`

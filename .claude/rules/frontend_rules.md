---
trigger: always_on
glob: "grade-wise-ai-frontend-next/**/*.{js,jsx,ts,tsx,css}"
description: "Next.js frontend — routing, middleware, cookie auth, TanStack Query, feature modules, forms, and API client."
---

# Frontend Rules — grade-wise-ai-frontend-next

> **Mandatory:** `standards_rules.md` Policies 1–5.

**Stack:** React 19 · Next.js 16 (App Router, Turbopack) · Tailwind 4 · Zustand 5 · TanStack Query 5 · Zod 4 · ESLint 10 · Playwright

## Project Structure

```
src/
├── middleware.js           # Cookie session gate for protected routes
├── app/
│   ├── layout.js           # RootLayout + Providers + Toaster
│   ├── loading.js          # Global loading UI
│   ├── error.js            # Global error boundary
│   ├── not-found.jsx       # 404 page
│   ├── (auth)/ (dashboard)/ (exam)/
├── features/<domain>/      # store.js + api.js
├── views/                  # Page UI (react-router-dom mock OK)
├── components/
│   ├── Providers.jsx       # TanStack Query QueryClientProvider
│   ├── ui/ layout/ auth/ admin/ dashboard/
├── hooks/                  # useModal, useLoginForm, useUserManagement, useHydrated
├── lib/
│   ├── apiClient.js        # axios with withCredentials
│   ├── cn.js               # className merger
│   └── ui.js               # Tailwind design-system tokens (btn, card, input…)
├── features/theme/         # Zustand theme store + resolveTheme.js
├── schemas/                # Zod validation (NOT scheema/)
├── utils/                  # parseZodFieldErrors, formatDate, roleDisplay, translations
├── config/                 # firebase.js, captcha.js
└── e2e/                    # Playwright smoke tests
```

> **Removed (do not recreate):** root `src/store/`, `src/api/`, dead chart libs.

## Routing & Layouts

- Route groups: `(auth)`, `(dashboard)`, `(exam)`.
- Pages: `dynamic import` + `{ ssr: false }` where Zustand persist / Firebase needed.
- **`middleware.js`** — redirects unauthenticated users (no `gradewise_token` cookie).
- **`ProtectedRoute`** — validates session via `/api/auth/me` + role check.
- App Router conventions: `loading.js`, `error.js`, `not-found.jsx`.

## Auth (cookie session)

- **No JWT in localStorage.** Session is httpOnly cookie `gradewise_token`.
- `apiClient` uses `withCredentials: true`.
- Auth store persists **`user` only** (not token): `partialize: (state) => ({ user: state.user })`.
- Login/signup/google → backend sets cookie → frontend stores `user` from response.
- Google: Firebase popup → `getIdToken()` → `POST /auth/google-auth { idToken }`.
- Logout: `POST /auth/logout` + clear Zustand user.
- 401 → clear `auth-storage` + redirect `/login`.

### Auth API (`features/auth/api.js`)

| Function | Endpoint |
|----------|----------|
| `loginApi` | POST `/auth/login` |
| `signupApi` | POST `/auth/signup` |
| `googleAuthApi` | POST `/auth/google-auth` |
| `meApi` | GET `/auth/me` |
| `logoutApi` | POST `/auth/logout` |

## State Management

| Concern | Tool |
|---------|------|
| Server/async data | **TanStack Query** via `Providers.jsx` |
| Auth user, UI flags | **Zustand** in `features/<domain>/store.js` |
| API calls | `features/<domain>/api.js` via `apiClient.js` |

- No Redux. No React Context for global state.
- Prefer TanStack Query for fetch/cache/refetch over manual `useEffect` fetches in new code.

## React-Router-Dom Mock

Views in `src/views/` may import `react-router-dom` — aliased to `react-router-dom-mock.js`.

**New code outside views:** use `next/link` and `next/navigation` directly.

## Shared Hooks & Components (reuse first)

| Module | Use for |
|--------|---------|
| `Providers` | TanStack Query root |
| `useModal` | Modal state |
| `useLoginForm` | Login + captcha |
| `useUserManagement` | Admin CRUD |
| `useHydrated` | SSR guard |
| `AuthPageLayout` | Auth shell |
| `AmbientBackground` | Dashboard blobs |
| `parseZodFieldErrors` | Zod → field errors |

## API Client (`lib/apiClient.js`)

- `withCredentials: true` (required for cookies).
- Dynamic timeout: 120s heavy · 15s default.
- GET retry (max 3) on network/408/503/504.
- GET deduplication for in-flight requests.
- Base URL: `NEXT_PUBLIC_API_URL` (default `http://localhost:5005`).

## Forms

- `react-hook-form` + Zod from `src/schemas/` via `@hookform/resolvers/zod`.
- Field errors via `parseZodFieldErrors` or RHF `errors.field.message`.
- `react-hot-toast` or `Modal` — never `alert()`.

## Async Assessment Taking

When backend returns `{ status: "generating" }`:

- Poll `GET /taking/assessments/:id/attempts/:attemptId/status` until `ready`.
- Implemented in `features/student-assessment/store.js`.

## Hydration Safety

- `useHydrated()` before reading persisted auth.
- `ProtectedRoute` shows spinner until session validated.
- Never access `window` / `localStorage` for tokens at module top level.

## Styling (pure Tailwind v4)

**Full spec:** `ui.md` · **Skill:** `gradewise-frontend` styling section

| Need | Use |
|------|-----|
| Page wrapper | `PageShell` or `page` from `ui.js` |
| Skip target | `MainLandmark` (`id="main-content"`) |
| Buttons | `Button` or `btn.*` via `cn()` |
| Form fields | `Input` / `Select` / `Textarea` / `Label` |
| Cards | `Card`, `CardHeader` |
| Action chips | `chip` + `chipTone.*` |
| Theme toggle | `ThemeToggle` + `features/theme/store.js` |
| Class merge | `cn()` from `lib/cn.js` only |

- **No** custom CSS classes · **No** shadcn/ui · **No** hardcoded `slate-*` palettes
- `globals.css` = tokens + animations only
- New repeated patterns → add to `lib/ui.js`, not inline in views

## Testing

- Playwright: `npm run test:e2e` · tests in `e2e/`
- CI runs smoke tests after build

## TypeScript

- `tsconfig.json` present — gradual adoption; new shared modules may use `.ts`.
- App code remains mostly JS/JSX for now.

## Environment

| Variable | Notes |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | Backend base (`http://localhost:5005`) |
| `NEXT_PUBLIC_FIREBASE_*` | Google sign-in |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | `dummy-key` bypasses in dev |

## Dependency Policy

- TanStack Query for server state in new features.
- Removed: `chart.js`, `recharts`, `lodash`, `html2canvas`, `@react-oauth/google`.
- Pin `next` + `@next/eslint-plugin-next` to same version.

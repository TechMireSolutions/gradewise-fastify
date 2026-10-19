---
description: "Next.js frontend — routing, middleware, cookie auth, TanStack Query, feature modules, forms, and API client."
globs: "grade-wise-ai-frontend-next/**/*.{js,jsx,ts,tsx,css}"
glob: "grade-wise-ai-frontend-next/**/*.{js,jsx,ts,tsx,css}"
alwaysApply: true
trigger: always_on
---

# Frontend Rules — grade-wise-ai-frontend-next

> **Mandatory:** `standards_rules.md` Policies 1–5.

**Stack:** React 19 · Next.js 16 (App Router, Turbopack) · Tailwind 4 · Zustand 5 · TanStack Query 5 · Zod 4 · ESLint 10 · Playwright

## Project Structure

```
src/
├── proxy.js               # Cookie session gate (Next.js 16 proxy)
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
- **`proxy.js`** — redirects unauthenticated users (no `gradewise_token` cookie); permits `PUBLIC_PATHS` including `/_not-found` to avoid redirect loops on 404s.
- **`ProtectedRoute`** — validates session via `/api/auth/me` + role check.
- App Router conventions: `loading.js`, `error.js`, `not-found.jsx`.
- **Dynamic Param Specificity**: In App Router dynamic routes (`app/.../[id]/page.jsx`), params may resolve as `params?.id` or `params?.assessmentId` depending on the route segment name, or as an array/promise. Always safely normalize:
  ```javascript
  const rawId = params?.id || params?.assessmentId;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  ```
- **Static Route Specificity**: Ensure static routes (e.g. `/instructor/assessments/analytics`) coexist cleanly with dynamic routes (`[id]`) without route collisions.

## UI Stability & Anti-Patterns

- **Container Scale Jitter Prohibition**: `cardInteractive` contains `active:scale-[0.99] transition-all duration-200`. It is **strictly forbidden** on container cards, wrapper panels, form sections, or cards containing forms, inputs, selects, or buttons. Applying it to containers causes the entire section to jitter and shrink whenever an internal input or button is clicked. `cardInteractive` is **exclusively reserved for leaf clickable cards** (e.g. a standalone assessment card or resource tile where the entire card is a link). Use `card` or `cardElevated` for containers.
- **Flash of Empty State (FOES) Prevention**: Never render `<EmptyState />` while data is still loading. Always track `hasLoaded` (or `isInitialLoading`) alongside `loading` in stores or queries. Render animated skeleton placeholder cards or rows while `loading && !hasLoaded`.
- **Modal State Decoupling**: Avoid sharing a single generic `isModalOpen` boolean for multiple modal actions or confirmation dialogs. Decouple confirmation dialogs (delete, clone, enroll) from general notifications, or use a discriminated modal state `{ type: 'clone' | 'delete' | 'enroll', data: ... }` to prevent race conditions and unintended dismissals.

## View Modularization & Monolith Prevention

- **Max Lines Guideline (< 200 lines)**: Orchestrator views in `src/views/` must not exceed ~200 lines. Monolithic views must be aggressively decomposed into:
  - Custom hooks (`src/hooks/` or `src/views/<View>/hooks/`): encapsulate data fetching, TanStack Query hooks, Zustand selectors, form state (`react-hook-form` / Zod), and event handlers.
  - Subcomponents (`src/views/<View>/components/`): presentational child components with dedicated styling and props.
- **Shared Dashboard Primitives (`src/components/dashboard/shared/`)**:
  - `DashboardStatCard`: standard metric card supporting 6 semantic color variants (`cyan`, `emerald`, `amber`, `rose`, `purple`, `blue`), trend indicator badge, icon badge, and pulse skeleton state.
  - `DashboardStatGrid`: responsive layout grid supporting 2, 3, 4, and 5-column presets.
  - `DashboardSectionCard`: glassmorphic surface (`card`), balanced header typography, icon badge, custom action slot, zero raw borders.
  - `DashboardQuickActions`: grid launcher with touch-target minimums ($\ge 44\text{px}$) and semantic focus ring.
  - `DashboardSkeletons`: `StatCardSkeleton`, `TableSkeleton`, `CardListSkeleton`.
- **Shared Assessment Primitives (`src/views/Instructor/AssessmentManagement/components/`)**:
  - `AssessmentActionButtons`: unified chip buttons (table rows) and full-width grid buttons (mobile/grid cards) for edit, clone, preview, delete, analytics, enroll, physical paper.
  - `AssessmentMetadataCard`: unified card containing title, assessment language selection (with RTL awareness), and AI instruction prompt.
  - `AssessmentLockedNotice`: prominent locked status warning when `isExecuted === true` preventing invalid mutations.
  - `AssessmentSearchControls`: search input + table/grid toggle controls.
  - `AssessmentDeleteModal`: accessible delete confirmation modal.

## Auth (cookie session)

- **No JWT in localStorage.** Session is httpOnly cookie `gradewise_token`.
- `apiClient` uses `withCredentials: true`.
- Auth store persists **`user` only** (not token): `partialize: (state) => ({ user: state.user })`.
- Login/signup/google → backend sets cookie → frontend stores `user` from response.
- Google: Firebase redirect (`signInWithRedirect` on click + `getRedirectResult` in Login/Signup `useEffect`) → `getIdToken()` → `POST /auth/google-auth { idToken }` → instant role redirect. Use `GoogleAuthButton` for all Google sign-in/up triggers.
- Forms: Use `useLoginForm` for login and `useSignupForm` for registration (encapsulating validation, captcha, redirect listeners).
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
| `useLoginForm` | Login + captcha + redirect |
| `useSignupForm` | Signup + Zod + captcha + redirect |
| `useUserManagement` | Admin user CRUD |
| `useHydrated` | SSR guard |
| `AuthPageLayout` | Auth shell |
| `AmbientBackground` | Dashboard blobs |
| `GoogleAuthButton` | Google sign-in/signup button with spinner state |
| `PasswordRequirements` | Real-time 4-tier password strength & 5-criteria checklist |
| `Button` | Primary, secondary, google, success buttons with min-h-11 targets |
| `Input` | Text input with icon & error states |
| `PasswordInput` | Accessible password input with show/hide toggle & IME safety |
| `Select` | Dropdown with chevron & error states |
| `Textarea` | Multiline text control with error states |
| `Label` | Field label with required asterisk |
| `SearchField` | Standard search input with icon & sr-only label |
| `EmptyState` | Standard empty state with action trigger |
| `DashboardStatCard` | Shared metric card (6 color tones + skeleton) |
| `DashboardStatGrid` | Responsive stat card grid layout |
| `DashboardSectionCard`| Glassmorphic card with header actions slot |
| `DashboardQuickActions`| Dashboard action launcher tile grid |
| `AssessmentActionButtons` | Table chips & card grid assessment actions |
| `AssessmentMetadataCard` | Form card for Title, Language, and AI prompt |
| `AssessmentLockedNotice` | Warning banner on executed assessments |
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
- Accessibility: Link input errors to error messages via `aria-errormessage` or `aria-describedby` (`accessible-error-announcement`).
- Modern validity: Use `:user-invalid` / `:user-valid` for field feedback to avoid premature error flags before interaction (`validate-input-after-interaction`).
- Password visibility: Use `PasswordInput` with an accessible toggle button (`aria-label`, `aria-pressed`, `min-h-11`).
- Password requirements: Auth registration forms include `PasswordRequirements` (8+ chars, upper, lower, digit, special).
- Confirm match: Confirm password fields must display real-time match feedback.
- IME-safe submit: On Enter keydown in inputs, guard with `if (event.nativeEvent?.isComposing) return;` for RTL and non-Latin input methods (`ime-safe-enter-submit`).
- Pure Tailwind v4: Never use raw `slate-*` / `gray-*` in forms; use `bg-input`, `text-foreground`, `border-border`.
- `react-hot-toast` or `Modal` — never `alert()`.

## Performance & Web Guidance (CWV)

Per `modern-web-guidance`:
- **LCP Optimization:** Apply `fetchPriority="high"` on critical above-the-fold hero images; use `loading="lazy"` on below-the-fold media (`optimize-image-priority`).
- **Offscreen List Rendering:** Long question blocks and data tables use `content-visibility: auto` with `contain-intrinsic-size` to defer off-screen rendering (`defer-rendering-heavy-content`).
- **Typography:** Headings use `text-wrap: balance`; paragraphs and descriptions use `text-wrap: pretty` (`improve-text-layout-and-legibility`).
- **Modal Scrolling:** Pure CSS scroll containment (`overscroll-behavior: contain`) on `<dialog>` and `::backdrop`; **never** lock scrolling by modifying `overflow` on `body`/`html` (`prevent-page-scroll-under-modal-dialog`).
- **Long Tasks:** Heavy client data processing or PDF transforms broken up using `scheduler.yield()` or microtasks (`break-up-long-tasks`).

## Async Assessment Taking & Exam UI
 
 When backend returns `{ status: "generating" }`:
 
 - Poll `GET /taking/assessments/:id/attempts/:attemptId/status` until `ready`.
 - Implemented in `features/student-assessment/store.js`.

### Exam UI & Accessibility Standards

- **Timer**: Declares `role="timer"`, `aria-live="polite"`, and `font-mono tabular-nums` to prevent layout reflows during countdowns.
- **Input composition**: Guard against IME composition on Enter-submission (`if (event.nativeEvent?.isComposing) return;`).
- **Directionality & Multilingual Layout**: Both `ExamLayout` and instructor assessment prompt/preview components (`PromptTab`, `QuestionCard`) must dynamically bind `dir={isRtl ? 'rtl' : 'ltr'}` based on the assessment's selected language. Text displays and inputs must strictly use CSS logical properties (`text-start` / `text-end`, `ms-*`, `me-*`, `ps-*`, `pe-*`) to automatically mirror layout across English, Urdu, Arabic, and Persian without hardcoded `text-left` or `text-right` classes.
- **Semantic borders**: Never use hardcoded grayscale borders such as `border-slate-600` or `border-gray-700`; always use `border-border` or `border-border/60`.
- **Metric surfaces**: Use `statSurface.indigo`, `statSurface.emerald`, and `statSurface.amber` tokens from `src/lib/ui.js`.
- **List controls**: Use `SearchField` and `EmptyState` for lists and filter results.

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
| Form fields | `Input` or `input` / `select` / `textarea` / `label` tokens |
| Cards | `Card`, `CardHeader`, `CardContent` |
| Action chips | `chip` |
| Theme toggle | `ThemeToggle` + `features/theme/store.js` |
| Class merge | `cn()` from `lib/cn.js` only |

- **No** custom CSS classes · **No** shadcn/ui · **No** hardcoded `slate-*` palettes
- `globals.css` = tokens + animations only
- New repeated patterns → add to `lib/ui.js`, not inline in views

## Testing

- Unit tests: `npm run test:unit` (195 tests) in `src/**/*.test.js`
- Playwright E2E: `npm run test:e2e` · tests in `e2e/`
- CI runs unit tests and E2E smoke tests after build

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

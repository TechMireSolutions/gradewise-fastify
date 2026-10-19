# GradeWise Modernization — Applied Changes

This document summarizes infrastructure and architecture upgrades applied across the monorepo.

## Phase 0 — Foundation

- **PM2 process manager** (`ecosystem.config.cjs`): api + worker
- **GitHub Actions CI** (`.github/workflows/ci.yml`): typecheck, build, vitest, lint, Playwright smoke
- **Vitest** backend tests (`npm test`)
- **Playwright** frontend smoke tests (`npm run test:e2e`)
- **Removed unused deps**: `sharp`, `@fastify/static`, `chart.js`, `recharts`, `lodash`, `html2canvas`, `@react-oauth/google`
- **Renamed** `src/scheema/` → `src/schemas/`

## Phase 1 — Security

- **httpOnly session cookies** (`gradewise_token`) — JWT no longer returned to client or stored in `localStorage`
- **`/api/auth/me`** and **`/api/auth/logout`** endpoints
- **Google OAuth**: verifies Firebase/Google **ID token** server-side (`google-auth-library`)
- **AI key encryption at rest** when `ENCRYPTION_KEY` is set
- **Strict CORS** in production (no `origin: true` fallback)
- **Next.js Proxy/Middleware** route protection (`src/proxy.js`) — Next.js 16 renamed `middleware` → `proxy`

## Phase 2 — Frontend

- **TanStack Query** provider (`src/components/Providers.jsx`)
- **`loading.js` / `error.js` / `not-found.jsx`** App Router conventions
- **`tsconfig.json`** for gradual TypeScript adoption
- **Cookie-based API client** (`withCredentials: true`)

## Phase 3 — Scalability

- **BullMQ** assessment generation queue + worker (`npm run dev:worker`)
- **Async assessment start** when `USE_ASYNC_JOBS=true` + `REDIS_URL` (polls `/status`)
- **Batch answer inserts** on submit
- **Redis-backed rate limiting** when `REDIS_URL` is set
- **pgvector** init SQL (run on DB once: `CREATE EXTENSION IF NOT EXISTS vector;`)

## Phase 4 — Observability

- **`/api/health`** checks database + Redis + config flags

## Local development

```bash
# Backend
cd grade-wise-ai-backend-fastify
cp .env.example .env   # set JWT_SECRET, DATABASE_URL
npm run db:push && npm run db:seed
npm run dev
npm run dev:worker     # separate terminal when USE_ASYNC_JOBS=true

# Frontend
cd grade-wise-ai-frontend-next
cp .env.example .env.local
npm run dev

# Production
pm2 start ecosystem.config.cjs
```

## Required env updates

**Backend** (`.env`):
- `ENCRYPTION_KEY` — 32+ char secret for AI key encryption
- `FIREBASE_PROJECT_ID` — for Google ID token verification
- `REDIS_URL` — optional; enables async jobs + distributed rate limits
- `USE_ASYNC_JOBS=true` — enable background question generation

**Frontend** (`.env.local`):
- `NEXT_PUBLIC_API_URL=http://localhost:5005`
- Firebase vars unchanged (Google sign-in uses Firebase **redirect** flow (`signInWithRedirect` + `getRedirectResult`), sends `idToken` to backend)

## Breaking changes

1. **Login/signup responses no longer include `token`** — session is cookie-only
2. **Google auth body** is now `{ idToken }` only (frontend updated)
3. **Protected routes** require valid session cookie + `/auth/me` validation

## Phase 5 — Stack & dependency refresh (2026-06)

### Runtime

- **Node.js** `22` → **`24` LTS** (`engines.node >=24.0.0`, CI)
- **PostgreSQL** upgraded to **`pg18`**
- **Redis** `redis:7-alpine` → **`redis:8-alpine`**
- **GitHub Actions** `checkout@v4` / `setup-node@v4` → **`@v6`**

> **Postgres major upgrade note:** if you have existing data on an older major, run `pg_upgrade` or restore from a fresh dump.

### npm updates

**Frontend:** `@tanstack/react-query`, `@playwright/test`, `react-hook-form` (all other deps already latest).

**Backend:** `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`, `bullmq`, `google-auth-library`, `ioredis`, `vitest`; `@types/node` pinned to **`^24.13.2`** (matches Node 24 runtime).

## Phase 6 — Stability fixes (2026-08)

### Exam submit crash fix

- **Removed** `student-assessment/store.js` calls to non-existent student-analytics store methods (`fetchOverview`, `fetchPerformance`, `fetchRecommendations`) that crashed exam submission; leftover import cleaned up.

### Matching questions end-to-end

- **Backend persistence** (`generation.ts`): matching left/right items now stored in the question `options` jsonb (`{ leftItems, rightItems }`), supporting both `left_items`/`right_items` and `leftItems`/`rightItems` AI output naming.
- **Backend grading** (`student-assessments.service.ts`): new `normalizeMatchPairs` helper + `evaluateAnswer` matching branch — order-independent, case-insensitive pair comparison (supports array-of-pairs, single-entry object, and plain-object payloads).
- **Frontend UI** (`TakeAssessment.jsx`): matching question renderer with a right-side dropdown per left item; answer stored as a JSON pair array.

### Admin edit access control

- **`PUT /api/assessments/:id`** now passes the caller's `role`; `updateAssessmentService` uses `assertCanManageAssessment` so `admin`/`super_admin` can edit any assessment (previously admin edits silently failed with `NOT_FOUND` because of the `instructorId` filter).

### Versioning

- **Backend** bumped `1.0.0` → **`2.1.0`** (`package.json` + `package-lock.json` synced).

### Dead code removal

Removed files with zero references:

- `grade-wise-ai-backend-fastify/src/utils/route-handler.ts`
- `grade-wise-ai-backend-fastify/src/services/storage.ts` (S3/MinIO scaffold was unused)
- `grade-wise-ai-frontend-next/src/utils/pdfGenerator.js`
- `grade-wise-ai-frontend-next/src/utils/docxGenerator.js`
- `grade-wise-ai-frontend-next/src/views/InstructorLogin.jsx`
- `grade-wise-ai-frontend-next/src/views/AdminLogin.jsx`

### Security verification

- Confirmed only `.env.example` files are tracked in git; real `.env*` files are ignored by the root `.gitignore` (`**/.env.*`, exception `!**/.env.example`).

> **Verification:** backend `typecheck` / `build` / `vitest` and frontend `build` / `lint` all pass.

## Phase 7 — UX & Auth/Question-type refinements (2026-09)

### Google OAuth: popup → redirect flow

- **Removed** Firebase `signInWithPopup` (popup window + blank auth-handler intermediate).
- **Now:** `signInWithRedirect(auth, googleProvider)` on button click; `getRedirectResult(auth)` awaited in a `useEffect` on **both** `Login.jsx` and `Signup.jsx`.
- Store split: `googleAuth()` (starts redirect) + `completeGoogleRedirect()` (exchanges idToken via `/auth/google-auth`, persists user in Zustand).
- **No success modal, no `setTimeout`** — user is instantly routed to their role dashboard via `router.replace` (`redirectByRole`).

### Fill in the Blank question type

- **DB enum** `question_type` now includes `fill_in_the_blank` (idempotent patch `0003_add-fill-in-the-blank-type` in `scripts/apply-db-patches.mjs`).
- **Backend**: `QuestionBlockSchema` + `question-generation.ts` prompt/JSON requirements updated.
- **Frontend**: Create/Edit forms expose `multiple_choice`, `short_answer`, `true_false`, and `fill_in_the_blank`; `TakeAssessment.jsx` renders a single-line input for fill-in-the-blank (short answer uses a textarea).
- Grading uses exact-match (lowered + trimmed), same as short answer.
- **UI tweaks**: "Number of Options" moved to the last field slot (MCQ-only); `Question Type` selects now show a chevron icon.

### Assessment creation UX

- **Removed** the "Questions Language" field from Create Assessment (payload hardcodes `language: "en"`; per-block language generation unchanged).
- **Content Source** merged: "Add External Link" and "Select Existing Resource" are now one card toggled by `sourceMode` (`"links"` / `"resources"`).

### Auto logout

- Added `src/components/AutoLogout.jsx` — 1-hour **inactivity** idle timer (mouse/keyboard/touch/scroll/focus events, 30s reset throttle); logs out, toasts, redirects to `/login`. Mounted in `Providers.jsx`.

### Full AI Prompt blueprint

- `buildBlockPrompt` gained `maxContextChars = 4000` default; the blueprint prompt service passes `50_000`, and `getAssessmentService` returns resource `chunks` so the **Full AI Prompt now includes full document content**.

---

## Phase 8 — Structural Reorganization, Modular Schemas & Standards (2026-10)

### 1. Tooling & Workspace Cleanup
- Removed lingering empty legacy directories `src/api` and `src/store` in `grade-wise-ai-frontend-next`.
- Established `tsconfig.json` as single source of truth (deleted redundant `jsconfig.json`).
- Fixed Next.js 16 / Turbopack root directory resolution (`turbopack: { root: __dirname }`).
- Archived one-time migration scripts to `scripts/archive/`.

### 2. Frontend Component Modularization & Architectural Barrels
- Organized components into domain-driven subdirectories with backward-compatible re-exports:
  - `components/layout/` (`Navbar`, `Footer`, `PageShell`, `AuthPageLayout`, `AmbientBackground`, `MainLandmark`, `SkipLink`, `WelcomeBanner`, `index.js`)
  - `components/auth/` (`ProtectedRoute`, `AutoLogout`, `LoginFormFields`, `RememberedAccountCard`, `index.js`)
  - `components/paper/` (`PhysicalPaperModal`, `PaperFormFields`, `FormattingOptions`, `index.js`)
  - `components/assessments/` (`AssessmentHeader`, `AssessmentInfoCard`, `PromptTab`, `SampleQuestionsTab`, `QuestionCard`, `index.js`)
  - `components/theme/` (`ThemeProvider`, `ThemeToggle`, `index.js`)
  - `components/ui/index.js` (re-exports all 14 UI primitives)
  - `schemas/index.js`, `hooks/index.js`, `utils/index.js`, and `views/index.js`
  - Canonical domain barrels under `features/` (`auth`, `assessments`, `resources`, `student-assessment`, `instructor-analytics`, `student-analytics`, `ai-config`, `theme`)

### 3. Modern Web Standards, CWV & Accessibility
- **Modern Typography (CWV)**: Applied `text-balance` to headings/page titles and `text-pretty` to body descriptions in `src/lib/ui.js`.
- **Pure CSS Modal Scroll Containment**: Eliminated `document.body.style.overflow = "hidden"` mutation in `Modal.jsx`, adopting `overscroll-contain` per `ui.md`.
- **Off-Screen Rendering**: Added `[content-visibility:auto] [contain-intrinsic-size:1px_180px]` to `QuestionCard.jsx` to defer layout and paint for off-screen items on long assessments.
- **IME-Safe Multilingual Input**: Added composition session checks (`if (event.nativeEvent?.isComposing) return;`) to `Input.jsx` and `LoginFormFields.jsx` for Urdu, Arabic, and Persian input methods.
- **Accessible Form States**: Synchronized `aria-invalid` and `aria-errormessage` attributes across input primitives.

### 4. Backend Modular Architecture & Test Suite Expansion
- Enforced Policy 2 (`index.ts` thin routes + `<name>.service.ts` + `<name>.schema.ts`) across all modules:
  - `config.schema.ts`, `resources.schema.ts`, `student-assessments.schema.ts`, `student-analytics.schema.ts`, `instructor-analytics.schema.ts`.
- Expanded backend Vitest test suite from 1 to **13 test suites (77 tests, 100% passing)**:
  - `errors.test.ts`, `crypto.test.ts`, `auth-cookie.test.ts`, `common.test.ts`
  - `constants.test.ts`, `question-generation.test.ts`, `captcha.test.ts`
  - `auth.schema.test.ts`, `assessments.schema.test.ts`, `resources.schema.test.ts`
  - `student-assessments.schema.test.ts`, `config.schema.test.ts`, `instructor-analytics.schema.test.ts`
- Expanded Playwright E2E smoke suite from 2 to **7 tests** covering all public routes and theme toggle.

---

## Phase 9 — Native Frontend Testing, Health & PDF Validation & CI Pipeline Alignment (2026-10)

### 1. Zero-Dependency Frontend Unit Testing
- Integrated native Node.js test runner (`node --test`) in `grade-wise-ai-frontend-next/package.json`:
  - `"test:unit": "node --test 'src/utils/*.test.js'"`
  - `"test": "npm run test:unit && npm run test:e2e"`
  - `"type": "module"` configured for ESM resolution.
- Created 5 unit test suites covering 43 test cases in ~50ms:
  - `formatDate.test.js` (null safety, invalid date guards, Intl options, datetime formatting)
  - `parseZodFieldErrors.test.js` (error/issue parsing, path extraction, null error handling)
  - `redirectByRole.test.js` (all role destinations and profile fallback)
  - `roleDisplay.test.js` (semantic color mapping, avatar gradients, Title Case formatting)
  - `parseQuestionOptions.test.js` (JSON option parsing, array validation, question mapping)

### 2. Backend Health & PDF Generation Unit Tests
- Created `src/health.test.ts` (5 tests):
  - Database connectivity check and error handling
  - `getHealthStatus` "ok" vs "degraded" reporting
  - Redis and feature flag environment integration
- Created `src/utils/pdf.test.ts` (6 tests):
  - PDF signature and EOF trailer marker validation
  - Corrupt stream detection and option constraint checking
  - End-to-end PDF streaming generation with PDFKit
- Total backend test coverage: **15 test files, 88 unit tests (100% passing)**.

### 3. GitHub Actions CI Pipeline Modernization
- Corrected `.github/workflows/ci.yml` from invalid `v6` action tags to stable `actions/checkout@v4` and `actions/setup-node@v4`.
- Integrated `npm run test:unit` in the frontend CI job before Playwright E2E smoke execution.

---

## Phase 10 — Fastify App Integration, RBAC Hooks Testing & Full Schema Validation (2026-10)

### 1. Fastify Server Integration & Core RBAC Hooks Testing
- Created `src/app.test.ts` (4 tests):
  - Fastify `app.inject()` in-memory integration testing.
  - Root `/` discovery metadata verification.
  - Not Found 404 handler standard envelope verification.
  - Global error handler integration.
  - Health check endpoint integration.
  - Protected route 401 gate verification.
- Created `src/hooks/authenticate.test.ts` (3 tests):
  - Valid decoded JWT token payload pass-through.
  - Missing user id or role rejection with 401 `"Invalid token payload"`.
  - Verification rejection with 401 `"Unauthorized — invalid or missing token"`.
- Created `src/hooks/authorize.test.ts` (4 tests):
  - Missing user rejection with 401 `"Unauthorized"`.
  - Single allowed role and multi-role allowance pass-through.
  - Mismatched role rejection with 403 `"Access denied. Required role: ..."`.
- Created `src/lib/redis.test.ts` (6 tests):
  - `isRedisEnabled`, `getRedis`, and `pingRedis` tests under enabled and disabled states.
- Created `src/queue/index.test.ts` (4 tests):
  - BullMQ queue initialization, job enqueueing, and worker instantiation.
- Total backend test suite: **20 test files, 109 unit tests (100% passing in 1.19s)**.

### 2. Frontend Schema Validation & Contract Parity
- **Contract Parity**: Added `.max(128)` constraint to `passwordField` in `src/schemas/fields.js` to match backend `auth.schema.ts`.
- **Bug Fix**: Resolved Zod 4 `error.issues` compatibility in `src/schemas/fileSchemas.js` `validateFiles`.
- **Full Client Schema Test Suite** (`src/schemas/*.test.js`):
  - `authSchemas.test.js`: `loginSchema` and `signupSchema` validation (complexity, length bounds, email format).
  - `passwordSchemas.test.js`: `resetPasswordSchema` and `setNewPasswordSchema` confirmation match refinement.
  - `fileSchemas.test.js`: `fileSchema`, `filesArraySchema`, and `validateFiles` (MIME types, 10MB limit, file counts).
  - `resourceSchemas.test.js`: `resourceSchema` (file, link, text types, URL format, character boundaries).
  - `studentSchemas.test.js`: `registerStudentSchema` and `enrollStudentSchema`.
- **Theme Resolver Unit Tests**:
  - `src/features/theme/resolveTheme.test.js` (`getSystemTheme` SSR and matchMedia resolution, explicit theme overrides).
- Total frontend unit test suite: **11 test files, 105 unit tests (100% passing in 156ms)**.

---

## Phase 11 — Monorepo Task Orchestration, App Router Streaming UX & AI Factory Tests (2026-10)

### 1. Root Monorepo Developer Experience & CI Orchestration
- Created root `package.json` unifying commands across frontend and backend:
  - `npm run check:all`: runs typecheck, lint, and all backend/frontend tests in one command.
  - `npm test`: executes backend Vitest suite and frontend Node test runner.
  - `npm run build`: builds Fastify backend and Next.js frontend production bundles.
  - `npm run test:e2e`: runs Playwright E2E smoke tests.
- Modernized `playwright.config.js`: auto-manages webServer lifecycle and server reuse.

### 2. Next.js App Router Streaming Fallback
- Upgraded `src/app/loading.js` from `return null;` to an accessible, centered `LoadingSpinner` with semantic theme styling and `role="status"` accessibility attributes.

### 3. Frontend Assessment Creation Schema Validation
- Created `src/schemas/assessmentSchemas.test.js` (11 tests):
  - Valid assessment creation with prompt, resources, or links.
  - superRefine validation requiring at least one content source.
  - Duration per question bounds (30s minimum, 600s maximum).
  - Positive marks constraints (1–100) and negative marks deduction ceiling ($\le$ positive marks).
  - Language options validation (`assessmentLanguages`).
- Frontend test coverage: **12 test files, 118 unit tests (100% passing in 135ms)**.

### 4. Backend AI Model Factory & Analytics Queries Unit Tests
- Created `src/ai/build-model.test.ts` (6 tests):
  - Model initialization for all 6 providers: `gemini`, `openai`, `claude`, `groq`, `mistral`, and `deepseek` custom baseURL.
- Created `src/ai/generate.test.ts` (6 tests):
  - `mapLanguageCode` mapping for all 4 languages (`en`, `ur`, `ar`, `fa`, `all`, and English fallback).
- Created `src/modules/analytics/shared.test.ts` (3 tests):
  - `getCompletedAttempt` error throwing and record retrieval.
  - `getAttemptQuestionsWithAnswers` query execution.
- Backend test coverage: **23 test files, 124 unit tests (100% passing in 1.12s)**.
- Monorepo unit test total: **242 unit tests (100% passing)**.

---

## Phase 12 — Design System Token Contracts, Multilingual/RTL Verification, Exam Privacy & Full Monorepo Milestone (2026-10)

### 1. Comprehensive Frontend Schema & UI Token Verification
- **Edit Assessment Schema Test Suite** (`src/schemas/editAssessmentSchemas.test.js`, 27 tests):
  - `ASSESSMENT_CONSTANTS`: boundaries on title, prompt, duration (30–600s), options (2–6), marks (0–100), and allowed file types.
  - `questionBlockSchema`: integer coercions, required options on multiple choice, negative marks $\le$ positive marks refinement.
  - `assessmentFormSchema`: title bounds, content source requirements (prompt, resources, links, or files).
  - `fileValidationSchema` and validation helpers: `validateAssessmentForm`, `validateQuestionBlock`, and `validateFiles`.
- **Design System Token & Accessibility Contracts** (`src/lib/ui.test.js`, 16 tests):
  - Verification of surfaces (`page`, `pageInner`, `card`, `cardHeader`, `cardInteractive`, `cardGlow`, `nav`).
  - Strict WCAG 44×44px touch target enforcement (`min-h-11`) on all `btn.*` variants.
  - Focus-visible ring accessibility verification on interactive actions.
  - Modern typography standards verification: `text-balance` on `pageTitle`, `heroTitle`, `sectionTitle`, and `text-pretty` on `pageDesc`.
- **ClassName Merger Utility Tests** (`src/lib/cn.test.js`, 6 tests):
  - Concatenation, whitespace trimming, filtering of falsy values (`false`, `null`, `undefined`, `""`, `0`), and conditional expressions.
- **Physical Exam Paper Utilities** (`src/utils/paperUtils.test.js`, 12 tests):
  - `PAGE_DIMENSIONS` and `getPageDimensions` for A4, A5, and Letter formats.
  - `sanitizeFileName` character stripping and space-to-underscore replacement.
  - LTR and RTL line wrapping with `wrapText`.
- **Multilingual & RTL Translation Contracts** (`src/utils/translations.test.js`, 12 tests):
  - `isRTLLanguage` recognition for `ar`, `ur`, `fa`, `he`.
  - `LANGUAGE_OPTIONS` validation with RTL flags.
  - `getTranslation` with language fallback and raw key fallback.
  - Dictionary key completeness verification across English, Urdu, Arabic, and Persian locales.
- **Central Utils Barrel Expansion** (`src/utils/index.js`):
  - Re-exported `translations.js` (`translations`, `LANGUAGE_OPTIONS`, `RTL_LANGUAGES`, `isRTLLanguage`, `getTranslation`) and `paperUtils.js` (`PAGE_DIMENSIONS`, `getPageDimensions`, `sanitizeFileName`, `wrapText`).
- **Frontend Test Suite Total**: **17 test files, 191 unit tests (100% passing in 184ms)**.

### 2. Backend Modular Architecture, Service Testing & Exam Privacy
- **Student Analytics Schema Tests** (`src/modules/student-analytics/student-analytics.schema.test.ts`, 5 tests):
  - Dedicated validation for `TimeRangeEnum` and query defaults (`30d`).
- **Exam Question Sanitization & Privacy Tests** (`src/modules/student-assessments/generation.test.ts`, 4 tests):
  - `createFallbackQuestion` generation for multiple choice (4 options), true/false, and short answer.
  - `sanitizeQuestion` verification: completely strips `correctAnswer`, `attemptId`, and metadata to prevent cheating or data leakage before student submission.
- **Config Service Key Masking Tests** (`src/modules/config/config.service.test.ts`, 3 tests):
  - `maskKey` verification for short keys ($\le$ 8 chars) and standard API keys (preserving first 6 and last 4 chars).
- **Resource Text Extraction Tests** (`src/modules/resources/resources.service.test.ts`, 6 tests):
  - `extractTextFromFile` validation for plain text, markdown, JSON, null-byte stripping, and unsupported binary fallback.
- **Backend Test Suite Total**: **27 test files, 142 unit tests (100% passing in 1.15s)**.

### 3. Full Monorepo Quality State
- **Total Unit Test Count**: **333 tests passing (100%)** (142 backend + 191 frontend).
- **Playwright E2E Smoke Tests**: **7/7 passing (1.9s)**.
- **TypeScript**: **0 errors** across both projects (`tsc --noEmit`).
- **ESLint**: **0 errors, 0 warnings** across both projects.
- **Production Build**: **100% successful** (Fastify API + Next.js App Router).

---

## Phase 13 — Tech Stack Upgrade, Nodemailer 10.1.7, Next.js 16.4.2, CI Workflow Hardening & Migration Parity (2026-10)

### 1. Technology Stack & Dependency Modernization
- **Backend Stack Upgraded**:
  - Pinned `nodemailer` to `10.1.7` (`@types/nodemailer` to `^8.0.2`) resolving Node 24 stream handling deprecations.
  - Upgraded `@fastify/cookie`, `@fastify/cors`, `@fastify/helmet`, `@fastify/jwt`, `@fastify/multipart`, `@fastify/rate-limit`, `ai`, `drizzle-orm`, `fastify`, and `zod` to latest stable releases.
- **Frontend Stack Upgraded**:
  - Pinned `next` and `@next/eslint-plugin-next` to exact matching version `16.4.2` to eliminate caret drift and Turbopack compiler warnings.
  - Upgraded `@tanstack/react-query` to latest stable release.
- **CI / CD Workflow Hardening**:
  - Added dependency caching (`cache: 'npm'`) to `.github/workflows/ci.yml`.
  - Added explicit production port validation (`PORT 5005`) and `/api/health` validation in deployment verification gates.

### 2. Database Schema & Migration Parity
- **Schema Parity Migration (`0001_dapper_silver_fox.sql`)**:
  - Enforced `question_block_type` enum inclusion of `'fill_in_the_blank'`.
  - Added `language` column (`varchar(10) DEFAULT 'en' NOT NULL`) to `assessments` table.
  - Established strict migration parity standard: all future schema updates must run `npm run db:generate` to keep SQL migrations in `drizzle/` 100% synchronized with `src/db/schema.ts`.

---

## Phase 14 — Design System & Accessible Form Standardization Across All Portals (2026-10)

### 1. Unified Form UI Primitives Suite (`src/components/ui/`)
- Created and standardized design system primitives:
  - `Input`: Enhanced with accessible error binding (`aria-errormessage`), icon slot, and `:user-invalid` styling.
  - `PasswordInput`: Built-in password visibility toggle (`eye`/`eye-off`) and live 5-point password policy checklist (length $\ge 8$, uppercase, lowercase, number, special character).
  - `Select`: Accessible dropdown component with chevron indicator, dark mode styles, and linked error handling.
  - `Textarea`: Auto-expanding accessible text area with character counts and linked error handling.
  - `Label`: Accessible form label with required indicator (`*`) and proper `htmlFor` binding.

### 2. Comprehensive Multi-Portal Form Refactoring
- **Auth & Onboarding**:
  - `LoginView`, `SignupView`, `ForgotPasswordView`, `VerifyEmailView`, and `NewPasswordModal` standardized to use unified primitives and live password policy checkmarks.
- **Super Admin**:
  - `SuperAdminDashboardView` (user management modal) and `ApiConfigView` (API key insertion/edit modal) refactored with new form controls and accessible error announcements.
- **Admin**:
  - `AdminDashboardView`, `AdminQuestionTypesView`, and `UserModal` updated with consistent selects, labels, and validation feedback.
- **Instructor**:
  - `CreateAssessmentView`, `EditAssessmentView`, `ResourcesView`, `EnrollmentModal`, `PhysicalPaperModal`, and `ResourceUploadModal` refactored to use standard `Select`, `Input`, and `Textarea` controls with uniform padding, focus rings, and dark mode support.
- **Student Exam & Analytics**:
  - `StudentDashboardView` and `ExamLayoutView` modernized:
    - Added `role="timer"` and `tabular-nums` to ensure stable countdown numeral layout across English (LTR) and Urdu/Arabic/Persian (RTL).
    - Preserved RTL direction and font scaling without layout shift.
    - Added pure CSS modal containment (`overscroll-behavior: contain`) on exam dialogs.
- **Proxy Middleware Whitelist**:
  - Updated `src/proxy.js` to whitelist `/_not-found` so Next.js internal 404 rendering is never trapped in an auth redirect loop.





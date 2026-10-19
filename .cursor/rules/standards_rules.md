---
trigger: always_on
glob: "**/*"
description: "Core engineering standards — dependencies, structure, naming, DRY, security, and infrastructure. Mandatory for all code changes."
---

# Gradewise Engineering Standards

Five mandatory policies for every change. Agents must apply all five before submitting work.

---

## Policy 1 — Upgrade Tech Stack & Dependencies

**Goal:** Keep the monorepo on the latest **stable** versions of runtime, frameworks, and packages.

### Scope

| Area | Location | Current stack |
|------|----------|---------------|
| Backend | `grade-wise-ai-backend-fastify/` | Node ≥24 · Fastify 5 · TS 6 · Drizzle · PostgreSQL (pgvector) · Redis · BullMQ · AI SDK 6 · Nodemailer ^10.1.7 · Zod 4 · Vitest |
| Frontend | `grade-wise-ai-frontend-next/` | Next.js 16.4.2 · React 19 · Tailwind 4 · Zustand 5 · TanStack Query 5 · ESLint 10 · Zod 4 · Playwright |

### Upgrade cadence

- Run **`npx npm-check-updates`** and **`npm outdated`** in **both** apps before major feature work or quarterly maintenance.
- **Patch / minor** semver → upgrade immediately, then verify.
- **Major** semver → read release notes, fix breaking API changes, then verify.
- New dependencies → always add at **latest stable**, never pin obsolete versions.

### Upgrade workflow

```bash
# Backend
cd grade-wise-ai-backend-fastify
npx npm-check-updates -u --target latest
npm install && npm run typecheck && npm run build && npm test

# Frontend
cd grade-wise-ai-frontend-next
npx npm-check-updates -u --target latest
npm install && npm run build && npm run lint
```

### Version pinning rules

| Package | Rule |
|---------|------|
| `next` + `@next/eslint-plugin-next` | Pin **same exact version** (`16.4.2` — eliminates SSRF & Turbopack proxy bypass CVEs) |
| `nodemailer` | Keep at **`^10.1.7`** or higher (eliminates DNS cache TLS reuse vulnerability) |
| `engines.node` | `>=24.0.0` in both `package.json` files |
| `@types/node` | Match active Node runtime major |

### Forbidden

- `npm audit fix --force` without reviewing breaking downgrades (especially `drizzle-kit`, `next`).
- `--legacy-peer-deps` as a permanent workaround — resolve peer conflicts properly.
- Deprecated packages: Express patterns, unused chart libs, `@react-oauth/google` (use Firebase + idToken).
- Re-adding removed deps: `sharp`, `@fastify/static`, `chart.js`, `recharts`, `lodash`, `html2canvas`.

### Accepted transitive audit debt (document, do not “fix” blindly)

- `drizzle-kit` → old `esbuild` (dev-only)
- Next.js bundled `postcss` (await upstream patch)

---

## Policy 2 — Modern File Structure

**Goal:** Feature-based layout, thin boundaries, single responsibility per folder.

### Monorepo layout

```
gradewiseai/
├── ecosystem.config.cjs          # PM2 — api + worker
├── .github/workflows/ci.yml      # CI gates
├── MIGRATION.md                  # Modernization changelog
├── grade-wise-ai-backend-fastify/  # API + worker
├── grade-wise-ai-frontend-next/  # Web app
├── .agent/rules/                 # Antigravity rules (mirrored)
├── .claude/rules/                # Claude rules (mirrored)
├── .agent/skills/                # Agent skills (mirrored)
└── .cursorrules                  # Cursor index
```

### Backend structure (`grade-wise-ai-backend-fastify/src/`)

```
app.ts                    # App factory
index.ts                  # Bootstrap + env validation
worker.ts                 # BullMQ worker entry (assessment generation)
db/                       # Client + schema.ts
ai/                       # generate.ts, providers.ts, build-model.ts, constants.ts
plugins/                  # cookie, cors, helmet, jwt, rate-limit, multipart
hooks/                    # authenticate.ts, authorize.ts
lib/                      # redis.ts
queue/                    # BullMQ queue + worker setup
services/                 # storage.ts (S3/MinIO)
constants/                # roles.ts
schemas/                  # common.ts — reusable Zod param schemas
utils/                    # errors.ts, auth-cookie.ts, crypto.ts, captcha.ts, pdf.ts
health.ts                 # /api/health checks
modules/<domain>/
  index.ts                # Routes only (thin)
  <domain>.service.ts     # Facade re-exporting sub-services
  <domain>-*.service.ts   # Focused domain sub-services (<300 lines)
  <domain>-common.ts      # Shared access control & predicates
  <domain>.schema.ts      # Zod schemas
  generation.ts           # (student-assessments) async question generation
drizzle/                  # Migrations + init-pgvector.sql
```

**Module domains:** `auth`, `admin`, `assessments`, `resources`, `config`, `student-assessments`, `instructor-analytics`, `student-analytics` (+ `analytics` shared query module)

**Rules:**

- Routes **never** contain business logic or raw SQL.
- Services **never** register routes or read `request`/`reply` directly.
- Monolithic services (>300 lines) must be decomposed into focused sub-services (`*-common.ts`, `*-*.service.ts`) with `<domain>.service.ts` acting as a backward-compatible facade.
- Long-running AI work → BullMQ queue + `worker.ts`, not blocking HTTP.
- Shared cross-module logic → `utils/`, `schemas/`, `constants/`, `ai/`, `queue/`.
- One `schema.ts` per module; shared params → `schemas/common.ts`.

### Frontend structure (`grade-wise-ai-frontend-next/src/`)

```
app/                      # Next.js App Router — thin page shells
  loading.js, error.js, not-found.jsx
  (auth)/ (dashboard)/ (exam)/
proxy.js                  # Cookie-based route protection (Next.js 16 proxy)
features/<domain>/        # api.js + store.js
views/                    # Page UI (<200 lines per orchestrator view)
  <View>/components/      # Visual child components
  <View>/hooks/           # View-specific custom hooks
components/
  Providers.jsx           # TanStack Query provider
  ui/ layout/ auth/ admin/ dashboard/
  dashboard/shared/       # Shared dashboard primitives (StatCard, StatGrid, SectionCard…)
hooks/                    # useModal, useLoginForm, useSignupForm, useUserManagement, useHydrated
lib/                      # apiClient.js, react-router-dom-mock.js, ui.js
schemas/                  # Zod validation
utils/                    # parseZodFieldErrors, formatDate, roleDisplay, translations
config/                   # firebase.js, captcha.js
e2e/                      # Playwright smoke tests
```

**Rules:**

- `src/app/**/page.jsx` → orchestration only: `dynamic import` + `ProtectedRoute`.
- Page rendering → `src/views/` (migrate to native Next over time).
- Complex views must not exceed ~200 lines; extract presentation to `<View>/components/` and state/queries to custom hooks (`<View>/hooks/` or `src/hooks/`).
- **Do not recreate** root `src/store/` or `src/api/` — use `src/features/<domain>/`.
- Server state → TanStack Query (via `Providers.jsx`); UI/auth state → Zustand.
- Reusable UI used in 2+ places → `src/components/`.
- Logic used in 2+ features → `src/hooks/` or `src/utils/`.

### Layer boundaries

| Layer | May import from | Must not |
|-------|-----------------|----------|
| `app/` | views, components, hooks, features | heavy business logic |
| `views/` | features, components, hooks, utils | bare axios |
| `features/` | lib, utils, schemas | views |
| `components/` | utils, hooks | features stores (prefer props/callbacks) |
| Backend routes | services, schemas, hooks | Drizzle directly |
| Backend services | db, utils, ai, queue, constants | Fastify reply |
| Backend worker | services, queue, generation modules | HTTP handlers |

---

## Policy 3 — Naming Policy

**Goal:** Predictable, searchable names aligned with industry conventions.

### General

| Kind | Convention | Example |
|------|------------|---------|
| Variables, functions | `camelCase` | `fetchUsers`, `setAuthCookie` |
| React components | `PascalCase` | `AdminDashboard`, `Providers` |
| Classes / types | `PascalCase` | `NotFoundError`, `AppError` |
| Constants | `UPPER_SNAKE_CASE` | `INSTRUCTOR_ROLES`, `AUTH_COOKIE_NAME` |
| Enums (TS/DB) | `snake_case` values | `super_admin`, `multiple_choice` |

### Folders

| Context | Convention | Example |
|---------|------------|---------|
| Backend modules | `kebab-case` | `student-analytics`, `student-assessments` |
| Frontend features | `kebab-case` | `student-assessment`, `instructor-analytics` |
| Frontend views by role | `PascalCase` dir | `Admin/`, `Instructor/`, `Student/` |
| Shared hooks/components | `camelCase` file | `useModal.js`, `formatDate.js` |
| UI primitives | `PascalCase` file | `Modal.jsx`, `PageLoader.jsx` |

### Files

| Type | Pattern | Example |
|------|---------|---------|
| Backend route entry | `index.ts` | `modules/auth/index.ts` |
| Backend service | `<domain>.service.ts` | `assessments.service.ts` |
| Backend schema | `<domain>.schema.ts` | `auth.schema.ts` |
| Backend worker | `worker.ts` | `src/worker.ts` |
| Frontend feature store | `store.js` | `features/auth/store.js` |
| Frontend feature API | `api.js` | `features/auth/api.js` |
| Zod schemas | `<area>Schemas.js` | `authSchemas.js` under `schemas/` |
| Shared field schemas | `fields.js`, `fileSchemas.js` | under `schemas/` |
| Next.js pages | `page.jsx` | App Router convention |
| Next.js proxy (middleware) | `proxy.js` | root of `src/` |

### Functions & handlers

| Pattern | Use |
|---------|-----|
| `get*`, `fetch*`, `load*` | Read operations |
| `create*`, `add*`, `enqueue*` | Create / queue operations |
| `update*`, `change*` | Update operations |
| `delete*`, `remove*` | Delete operations |
| `handle*` | Event handlers (frontend) |
| `parse*`, `format*`, `build*`, `encrypt*`, `decrypt*` | Pure transforms |
| `use*` | React hooks only |

### API & routes

- REST paths: **kebab-case**, plural nouns → `/api/instructor-analytics`
- Route params: match URL (`:assessmentId` → `AssessmentIdParamSchema`)
- Response envelope: always `{ success, message?, data? }`
- Auth cookie name: `gradewise_token` (httpOnly)

### Forbidden naming

- Abbreviations without domain meaning (`util2`, `helperNew`)
- Duplicate layers (`authStore.js` at root AND in features)
- Mixed casing in same folder (`Auth/` + `auth/` siblings)
- **`scheema/`** — renamed to **`schemas/`**; do not revert

---

## Policy 4 — DRY (Don't Repeat Yourself)

**Goal:** Single source of truth; extract on second use.

### When to extract

| Signal | Action |
|--------|--------|
| Same logic in **2+ files** | Extract to shared module |
| Same JSX block **2+ times** | Extract component |
| Same validation rules **2+ forms** | Extract Zod field to `schemas/fields.js` |
| Same API error handling **2+ routes** | Use service + `AppError` |
| Same role lists **2+ routes** | Import from `constants/roles.ts` |

### Frontend shared modules (reuse before writing new)

| Module | Purpose |
|--------|---------|
| `hooks/useModal.js` | Modal state |
| `hooks/useLoginForm.js` | Login + captcha + role gate |
| `hooks/useSignupForm.js` | Signup + Zod + captcha + redirect |
| `hooks/useUserManagement.js` | Admin user CRUD |
| `hooks/useHydrated.js` | SSR/hydration guard |
| `components/Providers.jsx` | TanStack Query root provider |
| `components/layout/AuthPageLayout.jsx` | Auth page shell |
| `components/layout/AmbientBackground.jsx` | Dashboard blobs |
| `components/auth/LoginFormFields.jsx` | Email/password fields |
| `components/auth/GoogleAuthButton.jsx` | Google sign-in/up button with spinner |
| `components/auth/PasswordRequirements.jsx` | Dynamic 4-tier strength meter + 5-criteria checklist |
| `components/admin/UserManagementTable.jsx` | Admin tables |
| `components/ui/Button.jsx` | `btn.*` semantic variants + min-h-11 targets |
| `components/ui/Input.jsx` | Accessible text input with icon & error states |
| `components/ui/PasswordInput.jsx` | Accessible show/hide password toggle + IME safety |
| `components/ui/Select.jsx` | Dropdown control with integrated chevron & focus rings |
| `components/ui/Textarea.jsx` | Textarea control with error styling |
| `components/ui/Label.jsx` | Form field label with required asterisk |
| `components/ui/SearchField.jsx` | Accessible search field with icon & sr-only label |
| `components/ui/EmptyState.jsx` | Unified empty state with icon, text, and action button |
| `components/ui/PageLoader.jsx` | Full-page loader |
| `components/dashboard/shared/DashboardStatCard.jsx` | Standard metric card (6 color tones + skeleton) |
| `components/dashboard/shared/DashboardStatGrid.jsx` | Responsive stat card grid layout |
| `components/dashboard/shared/DashboardSectionCard.jsx` | Glassmorphic section container with action slot |
| `components/dashboard/shared/DashboardQuickActions.jsx` | Action tile grid with $\ge 44\text{px}$ touch targets |
| `views/Instructor/AssessmentManagement/components/AssessmentActionButtons.jsx` | Table chips & card grid action buttons |
| `views/Instructor/AssessmentManagement/components/AssessmentMetadataCard.jsx` | Unified assessment title, language, prompt card |
| `views/Instructor/AssessmentManagement/components/AssessmentLockedNotice.jsx` | Warning banner on executed assessments |
| `utils/parseZodFieldErrors.js` | Zod → field errors |
| `utils/formatDate.js` | Date formatting |
| `utils/roleDisplay.js` | Role badges/avatars |
| `schemas/fields.js` | Shared Zod fields |
| `schemas/fileSchemas.js` | File MIME validation |
| `lib/apiClient.js` | All HTTP (withCredentials) |

### Backend shared modules (reuse before writing new)

| Module | Purpose |
|--------|---------|
| `constants/roles.ts` | `INSTRUCTOR_ROLES`, `ADMIN_ROLES` |
| `schemas/common.ts` | Param Zod schemas |
| `utils/auth-cookie.ts` | `setAuthCookie`, `clearAuthCookie` |
| `utils/crypto.ts` | AI key encrypt/decrypt, Google idToken verify |
| `modules/assessments/question-generation.ts` | AI prompt + parse |
| `modules/assessments/assessments-common.ts` | Assessment access control & predicates |
| `modules/assessments/assessments-enrollment.service.ts` | Roster and student enrollment |
| `modules/assessments/assessments-preview.service.ts` | Assessment preview & prompt construction |
| `modules/student-assessments/generation.ts` | Question generation (sync + worker) |
| `modules/student-assessments/student-attempts.service.ts` | Attempt starting, polling & submission |
| `modules/student-assessments/student-submissions.service.ts` | Submission breakdown & scores |
| `modules/student-assessments/student-evaluation.service.ts` | Pure answer evaluation & matching normalization |
| `modules/analytics/shared.ts` | Attempt/question queries |
| `queue/index.ts` | BullMQ enqueue + worker |
| `ai/build-model.ts`, `ai/constants.ts` | Model factory + defaults |
| `utils/errors.ts` | `AppError` hierarchy |
| `health.ts` | Health check aggregation |

### DRY anti-patterns (do not do)

- Writing monolithic views (>200 lines) — extract child components and custom hooks.
- Re-implementing custom stat cards or section containers — use `DashboardStatCard` and `DashboardSectionCard`.
- Duplicate Google login/signup button markup — use `GoogleAuthButton`.
- Duplicate assessment action buttons across tables and grids — use `AssessmentActionButtons`.
- Duplicate ambient blob markup — use `AmbientBackground`.
- Duplicate user table markup — use `UserManagementTable`.
- Duplicate Zod email/password rules — use `schemas/fields.js`.
- Raw unstyled `<input type="password">` — use `PasswordInput`.
- Raw unstyled `<select>` or `<textarea>` — use `Select` / `Textarea`.
- Parallel `src/store/` and `src/features/*/store.js`.
- Storing JWT in `localStorage` — use httpOnly cookie only.
- Sync AI generation in HTTP when `USE_ASYNC_JOBS=true`.
- Applying `cardInteractive` to container cards or form sections (causes click jitter; use `card` or `cardElevated`).
- Flash of Empty State (FOES) — showing `EmptyState` before fetch finishes; always render skeleton placeholders while `loading && !hasLoaded`.
- Sharing a single generic boolean flag for multiple modal workflows — decouple confirmation dialogs from general notifications.

---

## Policy 5 — Security, Infrastructure & Testing

**Goal:** Production-ready auth, deployability, and automated quality gates.

### Security (mandatory)

| Concern | Rule |
|---------|------|
| Session | httpOnly cookie `gradewise_token` — **never** return JWT in JSON or store in `localStorage` |
| Google OAuth | Frontend sends `{ idToken }`; backend verifies via `google-auth-library` + `FIREBASE_PROJECT_ID` |
| AI keys | Encrypt at rest when `ENCRYPTION_KEY` is set (`utils/crypto.ts`) |
| CORS | Strict allowlist in production (`FRONTEND_URL`); no `origin: true` fallback |
| Rate limit | Redis-backed when `REDIS_URL` set |
| Secrets | Never commit `.env`; use `.env.example` templates |

### Auth endpoints

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/auth/login` | Sets cookie, returns `{ user }` |
| POST | `/api/auth/signup` | Sets cookie, returns `{ user }` |
| POST | `/api/auth/google-auth` | Body: `{ idToken }` |
| GET | `/api/auth/me` | Current user from cookie |
| POST | `/api/auth/logout` | Clears cookie |

### Infrastructure & Operations

```bash
npm run dev:worker                  # BullMQ worker (backend, separate terminal)
pm2 start ecosystem.config.cjs      # production: api (5005) + worker + frontend (3000) under PM2
npx pm2 restart all                 # restart all services after Next.js build
```

| Service | Env | Purpose |
|---------|-----|---------|
| Postgres + pgvector | `DATABASE_URL` | Primary DB |
| Redis | `REDIS_URL` | Rate limit, BullMQ |
| MinIO/S3 | `S3_*` | Object storage (scaffold) |
| Async jobs | `USE_ASYNC_JOBS=true` | Background question generation |

### Testing & CI

| Check | Command | When |
|-------|---------|------|
| Backend unit tests | `npm test` | Every backend change |
| Backend typecheck | `npm run typecheck` | Every backend change |
| Backend build | `npm run build` | Every backend change |
| Frontend build | `npm run build` | Every frontend change |
| Frontend lint | `npm run lint` | Every frontend change |
| E2E smoke | `npm run test:e2e` | CI + before major UI changes |

**CI pipeline (`.github/workflows/ci.yml`):**
- Concurrency group with `cancel-in-progress: true`.
- `paths-ignore` for markdown (`**.md`), docs, and agent config.
- `npm audit --audit-level=critical` on both backend and frontend jobs.
- Cache for `.next/cache` and Playwright browser binaries (`~/.cache/ms-playwright`).
- Aggregated status gate: `ci-gate` ("All Checks Passed") required for merge.

### DB migrations & schema parity

- Always maintain 100% schema-migration parity.
- Production: `npm run db:generate` + commit `drizzle/*.sql` and `drizzle/meta/_journal.json` + `npm run db:migrate`.
- Never create unjournaled or manual migration files outside `drizzle-kit`.
- `db:push` acceptable for local dev experimentation only.
- pgvector extension: run `CREATE EXTENSION IF NOT EXISTS vector;` on the target DB once.

---

## Compliance checklist (agents)

Before marking work complete:

- [ ] Dependencies still latest stable (Next.js `16.4.2`, Nodemailer `^10.1.7`)
- [ ] New code in correct folder per Policy 2
- [ ] Names follow Policy 3 tables
- [ ] No duplicate logic when shared module exists (Policy 4)
- [ ] Shared UI primitives used: `Button`, `Input`, `PasswordInput`, `Select`, `Textarea`, `Label`, `SearchField`, `EmptyState`
- [ ] Auth uses cookies, not localStorage tokens (Policy 5)
- [ ] Modern web standards verified (`ui.md` & `frontend_rules.md`: text-wrap balance/pretty, :user-invalid, CSS dialog overscroll containment, accessible errors)
- [ ] UI stability verified: `cardInteractive` strictly on leaf cards (no container scale jitter), FOES avoided via skeleton placeholders (`loading && !hasLoaded`), decoupled modal states
- [ ] Route parameters safely normalized (`params?.id || params?.assessmentId`)
- [ ] Assessment integrity verified: executed assessments immutable; cloning workflow available via `POST /api/assessments/:id/clone`
- [ ] Form UX verified: accessible password show/hide, password checklist (`PasswordRequirements`), confirm match feedback, IME-safe submit (`if (event.nativeEvent?.isComposing) return;`), and $\ge 44\text{px}$ touch targets
- [ ] Exam & timer accessibility verified (`role="timer"`, `aria-live="polite"`, `font-mono tabular-nums`, dynamic RTL/LTR directionality in exam and preview)
- [ ] `npm run build` + `npm run lint` (frontend) pass
- [ ] `npm run typecheck` + `npm run build` + `npm test` (backend) pass

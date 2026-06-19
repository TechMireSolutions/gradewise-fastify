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
| Backend | `grade-wise-ai-backend-fastify/` | Node ≥22 · Fastify 5 · TS 6 · Drizzle · PostgreSQL (pgvector) · Redis · BullMQ · AI SDK 6 · Zod 4 · Vitest |
| Frontend | `grade-wise-ai-frontend-next/` | Next.js 16 · React 19 · Tailwind 4 · Zustand 5 · TanStack Query 5 · ESLint 10 · Zod 4 · Playwright |

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
| `next` + `@next/eslint-plugin-next` | Pin **same exact version** (no caret drift) |
| `engines.node` | `>=22.0.0` in both `package.json` files |
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
├── docker-compose.yml               # Postgres (pgvector), Redis, MinIO, api, worker, web
├── .github/workflows/ci.yml         # CI gates
├── MIGRATION.md                     # Modernization changelog
├── grade-wise-ai-backend-fastify/ # API + worker
├── grade-wise-ai-frontend-next/     # Web app
├── .agent/rules/                    # Antigravity rules (mirrored)
├── .claude/rules/                   # Claude rules (mirrored)
├── .agent/skills/                   # Agent skills (mirrored)
└── .cursorrules                     # Cursor index
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
  <domain>.service.ts     # Business logic + DB
  <domain>.schema.ts      # Zod schemas
  generation.ts           # (student-assessments) async question generation
drizzle/                  # Migrations + init-pgvector.sql
```

**Module domains:** `auth`, `assessments`, `resources`, `config`, `student-assessments`, `instructor-analytics`, `student-analytics`

**Rules:**

- Routes **never** contain business logic or raw SQL.
- Services **never** register routes or read `request`/`reply` directly.
- Long-running AI work → BullMQ queue + `worker.ts`, not blocking HTTP.
- Shared cross-module logic → `utils/`, `schemas/`, `constants/`, `ai/`, `queue/`.
- One `schema.ts` per module; shared params → `schemas/common.ts`.

### Frontend structure (`grade-wise-ai-frontend-next/src/`)

```
app/                      # Next.js App Router — thin page shells
  loading.js, error.js, not-found.jsx
  (auth)/ (dashboard)/ (exam)/
middleware.js             # Cookie-based route protection
features/<domain>/        # api.js + store.js
views/                    # Page UI (react-router-dom mock OK during migration)
components/
  Providers.jsx           # TanStack Query provider
  ui/ layout/ auth/ admin/ dashboard/
hooks/                    # useModal, useLoginForm, useUserManagement, useHydrated
lib/                      # apiClient.js, react-router-dom-mock.js
schemas/                  # Zod validation (renamed from scheema/)
utils/                    # parseZodFieldErrors, formatDate, roleDisplay, translations
config/                   # firebase.js, captcha.js
e2e/                      # Playwright smoke tests
```

**Rules:**

- `src/app/**/page.jsx` → orchestration only: `dynamic import` + `ProtectedRoute`.
- Page rendering → `src/views/` (migrate to native Next over time).
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
| Next.js middleware | `middleware.js` | root of `src/` |

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
| `hooks/useUserManagement.js` | Admin user CRUD |
| `hooks/useHydrated.js` | SSR/hydration guard |
| `components/Providers.jsx` | TanStack Query root provider |
| `components/layout/AuthPageLayout.jsx` | Auth page shell |
| `components/layout/AmbientBackground.jsx` | Dashboard blobs |
| `components/auth/LoginFormFields.jsx` | Email/password fields |
| `components/admin/UserManagementTable.jsx` | Admin tables |
| `components/ui/PageLoader.jsx` | Full-page loader |
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
| `modules/student-assessments/generation.ts` | Question generation (sync + worker) |
| `modules/analytics/shared.ts` | Attempt/question queries |
| `queue/index.ts` | BullMQ enqueue + worker |
| `ai/build-model.ts`, `ai/constants.ts` | Model factory + defaults |
| `utils/errors.ts` | `AppError` hierarchy |
| `health.ts` | Health check aggregation |

### DRY anti-patterns (do not do)

- Duplicate ambient blob markup — use `AmbientBackground`.
- Duplicate user table markup — use `UserManagementTable`.
- Duplicate Zod email/password rules — use `schemas/fields.js`.
- Parallel `src/store/` and `src/features/*/store.js`.
- Storing JWT in `localStorage` — use httpOnly cookie only.
- Sync AI generation in HTTP when `USE_ASYNC_JOBS=true`.

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

### Infrastructure

```bash
docker compose up -d postgres redis minio   # local infra
npm run dev:worker                            # BullMQ worker (backend)
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

CI defined in `.github/workflows/ci.yml`.

### DB migrations

- Prefer **`npm run db:generate`** + commit `drizzle/` + **`npm run db:migrate`** in production.
- `db:push` OK for local dev only.
- pgvector enabled via `drizzle/init-pgvector.sql` in Docker.

---

## Compliance checklist (agents)

Before marking work complete:

- [ ] Dependencies still latest stable (or upgrade PR included)
- [ ] New code in correct folder per Policy 2
- [ ] Names follow Policy 3 tables
- [ ] No duplicate logic when shared module exists (Policy 4)
- [ ] Auth uses cookies, not localStorage tokens (Policy 5)
- [ ] `npm run build` + `npm run lint` (frontend) pass
- [ ] `npm run typecheck` + `npm run build` + `npm test` (backend) pass

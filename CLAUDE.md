# Gradewise AI — Onboarding & Conventions

Workspace guide for humans and AI agents (Cursor, Claude Code, Antigravity).

---

## Rules & Skills Map (Mirrored in `.cursor/rules/`, `.agent/rules/`, `.agents/rules/`, `.claude/rules/`)

| Rule | Scope |
|------|-------|
| `standards_rules.md` | Policies 1–5: deps, structure, naming, DRY, security, testing, form UX checklist |
| `domain_rules.md` | RBAC, assessments, multilingual RTL, XAI feedback, question types, password policy |
| `backend_rules.md` | Fastify 5 · TypeScript 6 · Drizzle ORM · PostgreSQL · Redis · BullMQ · AI SDK · migration parity |
| `frontend_rules.md` | Next.js 16 · React 19 · Tailwind 4 · Zustand · TanStack Query · cookie auth · form primitives |
| `ui.md` | Tailwind v4 tokens · `statSurface` · typography · accessible form inputs · modal overscroll containment |
| `ui-ux-consistency.md` | Semantic tokens · WCAG AA contrast · RTL/LTR logical layout · landmarks · container queries |
| `workflow_rules.md` | Verification gates · PM2 reload after build · pre-commit checklist |
| `project_rules.md` | Repository overview, port 5005, commands, and key routes |
| `antigravity_rules.md` | Google Antigravity SDK agent orchestration (not app code) |

### Skills Catalog (Mirrored in `.cursor/skills/`, `.agent/skills/`, `.agents/skills/`, `.claude/skills/`)

| Skill | Purpose |
|-------|---------|
| `gradewise-frontend` | Next.js 16 App Router, pure Tailwind v4, form primitives (`PasswordInput`, `Select`, `Textarea`), exam UI |
| `gradewise-backend` | Fastify 5, Drizzle ORM, BullMQ, Redis, Vitest, migration parity |
| `gradewise-domain` | RBAC, assessment lifecycle, XAI feedback, multilingual RTL, physical paper generation |
| `gradewise-modularization` | Full-stack view decomposition (<200 lines), shared dashboard primitives, and backend service facade patterns |
| `ui-ux-design-consistency` | Review and enforce project-wide UI/UX consistency, semantic tokens, WCAG AA contrast, container queries, RTL/LTR |
| `ui-styling` | Design system styling, Tailwind v4 tokens, form primitives & accessibility standards |
| `design-system` | Three-layer token architecture, component specifications, pure Tailwind v4 tokens |
| `ui-ux-pro-max` | UI/UX design intelligence for web and mobile across responsive layouts |
| `brand` | Brand voice, visual identity, messaging frameworks, asset management |
| `design` | Comprehensive design: logos, icons, presentations, banners, mockups |
| `slides` | Strategic HTML presentations & layouts |
| `banner-design` | Banner design for web, social, ads, print |
| `google-antigravity-sdk` | Google Antigravity AI agent orchestration |

---

## Repository Structure

| Component | Path | Stack |
|-----------|------|-------|
| **Backend** | `grade-wise-ai-backend-fastify/` | Fastify 5 · TS 6 · Drizzle ORM · PostgreSQL · Redis · BullMQ · AI SDK 6 · Vitest |
| **Frontend** | `grade-wise-ai-frontend-next/` | Next.js 16 · React 19 · Tailwind 4 · Zustand 5 · TanStack Query 5 · Zod 4 · Playwright |
| **Process manager** | `ecosystem.config.cjs` | PM2 — api (port 5005) + worker |
| **CI/CD** | `.github/workflows/deploy.yml` | SSH deploy to production |

> **Not in use:** `grade-wise-ai-backend-v2/` (legacy Express) — do not reference or modify.

---

## Quick Start

```bash
# Backend — port 5005
cd grade-wise-ai-backend-fastify && cp .env.example .env && npm install && npm run dev

# Frontend — port 3000
cd grade-wise-ai-frontend-next && cp .env.example .env.local && npm install && npm run dev

# PM2 (production)
pm2 start ecosystem.config.cjs && pm2 save && pm2 startup
```

---

## Commands

### Process Management (PM2)

```bash
pm2 start ecosystem.config.cjs   # start api + worker
pm2 save                          # persist across reboots
pm2 startup                       # generate init script
pm2 logs                          # tail all logs
pm2 logs gradewise-api --lines 30 # tail backend logs
pm2 restart gradewise-api         # restart backend only
pm2 flush gradewise-api           # clear old logs
```

### Backend

```bash
npm run dev          # API — http://localhost:5005
npm run dev:worker   # BullMQ worker (USE_ASYNC_JOBS=true)
npm run typecheck    # tsc --noEmit (strict mode)
npm run build        # tsc + copy fonts to dist/assets/fonts/
npm test             # Vitest (src/**/*.test.ts)
npm run db:push      # push schema changes (local)
npm run db:migrate   # run migrations (production)
npm run db:seed      # seed super_admin + system_configs
```

### Frontend

```bash
npm run dev          # http://localhost:3000
npm run build        # Next.js production build
npm run lint         # ESLint flat config
npm run test:e2e     # Playwright E2E
npm run start        # serve production build
```

### Pre-Commit Verification

```bash
cd grade-wise-ai-backend-fastify && npm run typecheck && npm run build && npm test
cd grade-wise-ai-frontend-next && npm run build && npm run lint
```

---

## Key Conventions

### Backend

- **ESM + `.js` import suffixes** — all imports use `.js` extension (NodeNext resolution)
- **Strict TypeScript** — `strict: true`, `noUncheckedIndexedAccess: true`
- **Cookie auth** — `setAuthCookie` / `clearAuthCookie`; JWT stored in httpOnly cookie (`gradewise_token`), never in JSON bodies
- **Google OAuth** — client gets Firebase `idToken` → backend verifies via `verifyGoogleIdToken()` in `src/utils/crypto.ts` using native Node `crypto` verification against Google x509 public certificates (`google-auth-library` installed as peer/dependency)
- **Async AI** — BullMQ + `npm run dev:worker` when `USE_ASYNC_JOBS=true`; sync fallback when Redis unavailable
- **AI key encryption** — AES-256-GCM via `encryptSecret`/`decryptSecret`; keys stored as `enc:iv:tag:data` in `system_configs` table
- **Provider rotation** — `callWithRotation()` tries up to 4 providers with cooldown (60s rate limit, 15s other errors)
- **Services throw `AppError`** — routes stay thin, business logic in services
- **Config cache** — `system_configs` cached 60s in memory; call `invalidateConfigCache()` after writes
- **Fonts** — PDFKit fonts in `src/assets/fonts/`, auto-copied to `dist/assets/fonts/` during build
- **Database Parity** — Drizzle migrations in `drizzle/` maintained via `npm run db:generate` to guarantee exact match with `src/db/schema.ts` (including `question_block_type` enum `'fill_in_the_blank'` and `assessments` `language` column)
- **Assessment Deep Cloning** — `cloneAssessmentService` transactionally copies assessment metadata and all question blocks in `db.transaction()` (`POST /api/assessments/:id/clone`), resetting `is_executed: false`
- **Assessment Immutability** — Executed assessments (`is_executed === true`) cannot be edited or deleted; updates/deletions throw `400 Bad Request`
- **Service Decomposition & Facades** — Monolithic services (>300 lines) are decomposed into focused sub-services (`*-common.ts`, `*-attempts.service.ts`, `*-submissions.service.ts`, `*-evaluation.service.ts`) while keeping `<domain>.service.ts` as a 100% backward-compatible facade
- **Database Query Consolidation** — Use SQL conditional aggregation (`count(case when role = ... then 1 end)`) and combined joins (`count` + `avg`) to eliminate sequential unindexed queries in dashboard analytics

### Frontend

- **httpOnly cookie session** — `withCredentials: true` on all API calls; no token in localStorage/sessionStorage
- **Middleware** — `proxy.js` (Next.js 16 convention) checks `gradewise_token` cookie; redirects unauthenticated to `/login?next=<path>` (with `/_not-found` whitelisted)
- **View Modularization (< 200 lines)** — Orchestrator views in `src/views/` must not exceed ~200 lines. Extract UI to `<View>/components/` and data/state logic to custom hooks (`<View>/hooks/` or `src/hooks/`)
- **Shared Dashboard Primitives** — Reuse `@/components/dashboard/shared/` (`DashboardStatCard`, `DashboardStatGrid`, `DashboardSectionCard`, `DashboardQuickActions`, `DashboardSkeletons`)
- **Shared Assessment Primitives** — Reuse `AssessmentActionButtons` (chips vs grid modes), `AssessmentMetadataCard`, and `AssessmentLockedNotice`
- **Auth Primitives** — Use `GoogleAuthButton`, `useLoginForm`, and `useSignupForm`
- **State management** — TanStack Query (server state) + Zustand (UI/auth/theme state)
- **Feature modules** — `features/<domain>/api.js` (API calls) + `features/<domain>/store.js` (Zustand store)
- **Zod schemas** — in `src/schemas/`; shared field validators in `fields.js`
- **Dynamic Route Params** — Safely normalize route params: `const rawId = params?.id || params?.assessmentId; const id = Array.isArray(rawId) ? rawId[0] : rawId;`
- **Container Scale Prohibition** — Never apply `cardInteractive` (which has `active:scale-[0.99]`) to container cards or form sections; reserve exclusively for leaf clickable cards to eliminate click jitter
- **FOES Prevention** — Avoid Flash of Empty State by maintaining `hasLoaded` and rendering animated skeleton placeholders during `loading && !hasLoaded`; never render `EmptyState` prematurely
- **Modal Decoupling** — Separate confirmation dialogs from general action modals to eliminate modal state race conditions
- **UI primitives** — `components/ui/` (`Button`, `Card`, `Input`, `PasswordInput`, `Select`, `Textarea`, `Label`, `Modal`, `StatusBadge`, `PageLoader`); build with `cn()` utility
- **Views** — `views/<Role>/` contain page-level components; `app/` pages are thin wrappers
- **Dark mode** — class-based (`.dark` on `<html>`); theme tokens in `globals.css` `@theme inline {}`
- **RTL & Multilingual Layout** — Exam layout and instructor assessment preview/prompt components (`PromptTab`, `QuestionCard`) dynamically apply `dir="rtl"` for Urdu, Arabic, and Persian; use pure semantic border tokens (`border-border`) with zero raw grayscale classes (`border-slate-600` is forbidden)
- **Physical Paper Persistence** — User-configured font sizes (`headerFontSize`, `questionFontSize`, `optionFontSize`) saved to `localStorage` (`gradewise_paper_settings`)
- **Google Auth** — Firebase redirect flow (`signInWithRedirect` on click + `getRedirectResult` in `Login`/`Signup` `useEffect`) → `getIdToken()` → POST to `/api/auth/google-auth` → instant role-based redirect (`router.replace`, no success modal/delay)
- **Auto logout** — 1h inactivity idle timer in `src/components/AutoLogout.jsx`, mounted in `Providers.jsx`
- **Form Standards & Accessibility** — shared form primitives across all 4 role portals, linked errors (`aria-errormessage`), `:user-invalid` styling, 5-point password requirement checklist, and IME-safe Enter submissions
- **Timers** — Question countdowns use `role="timer"` with `tabular-nums` for rock-steady numeral layout in LTR and RTL
- **Modern Web Standards** — `text-wrap: balance` for headings, `text-wrap: pretty` for body paragraphs, pure CSS overscroll containment on dialogs (`overscroll-behavior: contain`), no body scroll locking, and `content-visibility: auto` for heavy question rendering

---

## Project Architecture

### Backend Modules (`src/modules/`)

| Module | Prefix | Purpose |
|--------|--------|---------|
| `auth` | `/api/auth` | Signup, login, Google OAuth, email verify, password reset, user management |
| `admin` | `/api/admin` | Platform role aggregation, user pagination, and server-side filtering |
| `assessments` | `/api/assessments` | CRUD, deep clone, preview, enrollment, physical paper PDF |
| `student-assessments` | `/api/taking` | Start/submit attempts, question generation, status polling |
| `config` | `/api/config` | Super admin AI key management (add/delete/test/model) |
| `resources` | `/api/resources` | File upload (PDF/DOCX/txt), URL scraping, text chunking |
| `instructor-analytics` | `/api/instructor-analytics` | Instructor dashboard metrics |
| `student-analytics` | `/api/student-analytics` | Student performance, reports, recommendations |

### Frontend Features (`src/features/`)

| Feature | Files | Purpose |
|---------|-------|---------|
| `auth` | api.js + store.js | Login/signup/logout, session, `/auth/me` |
| `assessments` | api.js + store.js | Assessment CRUD, enrollment, physical paper |
| `student-assessment` | api.js + store.js | Exam taking, answer submission |
| `ai-config` | api.js | Super admin AI provider management |
| `resources` | api.js + store.js | File upload/management |
| `instructor-analytics` | api.js + store.js | Instructor dashboard data |
| `student-analytics` | api.js + store.js | Student performance data |
| `theme` | resolveTheme.js + store.js | Dark/light/system theme |

### Database Schema (11 tables)

`users` → `assessments` → `question_blocks` · `enrollments` · `assessment_attempts` → `generated_questions` → `student_answers` · `resources` → `resource_chunks` · `assessment_resources` · `system_configs`

---

## Environment Variables

### Backend (`.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | Yes | Server port (default: 5005) |
| `NODE_ENV` | Yes | `development` or `production` |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | Secret for JWT signing (64-char hex) |
| `ENCRYPTION_KEY` | Yes | AES-256-GCM key for AI key encryption |
| `FIREBASE_PROJECT_ID` | Yes | Must match frontend Firebase project |
| `SKIP_CAPTCHA` | Recommended | Set `true` when reCAPTCHA not configured |
| `FRONTEND_URL` | Yes | Comma-separated allowed origins |
| `USE_ASYNC_JOBS` | No | Enable BullMQ async generation |
| `REDIS_URL` | If async | Redis for BullMQ + rate limiting |
| `TEXT_GEMINI_KEYS` | Optional | Comma-separated Gemini API keys |
| `TEXT_GROQ_KEYS` | Optional | Comma-separated Groq API keys |

### Frontend (`.env.local`)

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | Backend URL (e.g., `https://gradewiseai.techmiresolutions.com` or `http://localhost:5005`) |
| `NEXT_PUBLIC_FIREBASE_*` | Yes | Firebase config (API key, auth domain, project ID, etc.) |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | No | Set `dummy-key` to bypass |

---

## RBAC Roles

| Role | Access |
|------|--------|
| `super_admin` | Everything + AI config + user management |
| `admin` | User management + instructor capabilities |
| `instructor` | Create/manage assessments, enroll students, view analytics |
| `student` | Take assessments, view own analytics |

Protected by `authenticate` (JWT verify) + `authorize(...roles)` preHandler hooks.

---

## AI Provider System

- **6 providers**: Gemini, Groq, OpenAI, Claude, Mistral, DeepSeek
- **Two purposes**: `text` (question generation, evaluation) and `pdf` (document extraction)
- **Rotation**: Round-robin with automatic cooldown on failure
- **Config**: Keys + models stored in `system_configs` table, managed via Super Admin panel
- **Encryption**: API keys encrypted with AES-256-GCM before storage
- **Model selection**: Configurable per provider via admin UI or DB update

---

## Deployment

- **Trigger**: Push to `main` branch
- **Pipeline**: Git sync → `npm install --ignore-engines` → build → migrate → PM2 restart → health check
- **Server**: Ubuntu (aaPanel), PM2, nginx reverse proxy
- **Important**: `ENCRYPTION_KEY` must match between environments or encrypted AI keys fail to decrypt

---

## Common Pitfalls

1. **Port 5005**: Fastify binds to port 5005 by default (`ecosystem.config.cjs` & `src/index.ts`). Only ONE backend PM2 process should bind port 5005. Check for duplicates: `pm2 list`. Never reference port 8000.
2. **PM2 reload after build**: When running local dev/e2e with Next.js under PM2, run `npx pm2 restart all` after `npm run build` to load new Turbopack chunk manifests.
3. **Groq model names**: Current models use prefix format (e.g., `openai/gpt-oss-120b`), not old `llama-3.3-70b-versatile`
4. **Config cache**: Changes to `system_configs` take up to 60s to reflect. Call `invalidateConfigCache()` or restart PM2
5. **Font paths**: Fonts live in `src/assets/fonts/` and are copied to `dist/assets/fonts/` during build. If fonts missing in production, rebuild
6. **SKIP_CAPTCHA**: Must be `true` in `.env` when no reCAPTCHA secret is configured; frontend sends `dummy-key` as token
7. **EADDRINUSE**: Kill duplicate PM2 processes before restarting: `pm2 delete <name>` then `pm2 restart <name>`
8. **Migration Parity**: When updating `src/db/schema.ts`, run `npm run db:generate` to generate corresponding SQL migrations in `drizzle/`.

---

## Conflict Resolution

Previous legacy documentation referenced Express v2, `scheema/` directory, JWT in localStorage, root `src/store/`, and port 8000. All superseded by this document and the actual codebase state: Fastify 5 on port 5005, cookie session auth, and `src/schemas/`.

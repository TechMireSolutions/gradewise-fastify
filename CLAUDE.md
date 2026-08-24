# Gradewise AI — Onboarding & Conventions

Workspace guide for humans and AI agents (Cursor, Claude Code, Antigravity).

---

## Repository Structure

| Component | Path | Stack |
|-----------|------|-------|
| **Backend** | `grade-wise-ai-backend-fastify/` | Fastify 5 · TS 6 · Drizzle ORM · PostgreSQL · Redis · BullMQ · AI SDK 6 · Vitest |
| **Frontend** | `grade-wise-ai-frontend-next/` | Next.js 16 · React 19 · Tailwind 4 · Zustand 5 · TanStack Query 5 · Zod 4 · Playwright |
| **Process manager** | `ecosystem.config.cjs` | PM2 — api (port 8000) + worker |
| **CI/CD** | `.github/workflows/deploy.yml` | SSH deploy to production |

> **Not in use:** `grade-wise-ai-backend-v2/` (legacy Express) — do not reference or modify.

---

## Quick Start

```bash
# Backend — port 8000
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
npm run dev          # API — http://localhost:8000
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
- **Google OAuth** — client gets Firebase `idToken` → backend verifies via `verifyGoogleIdToken()` (custom implementation, no runtime `google-auth-library`)
- **Async AI** — BullMQ + `npm run dev:worker` when `USE_ASYNC_JOBS=true`; sync fallback when Redis unavailable
- **AI key encryption** — AES-256-GCM via `encryptSecret`/`decryptSecret`; keys stored as `enc:iv:tag:data` in `system_configs` table
- **Provider rotation** — `callWithRotation()` tries up to 4 providers with cooldown (60s rate limit, 15s other errors)
- **Services throw `AppError`** — routes stay thin, business logic in services
- **Config cache** — `system_configs` cached 60s in memory; call `invalidateConfigCache()` after writes
- **Fonts** — PDFKit fonts in `src/assets/fonts/`, auto-copied to `dist/assets/fonts/` during build

### Frontend

- **httpOnly cookie session** — `withCredentials: true` on all API calls; no token in localStorage/sessionStorage
- **Middleware** — `proxy.js` (Next.js 16 convention) checks `gradewise_token` cookie; redirects unauthenticated to `/login?next=<path>`
- **State management** — TanStack Query (server state) + Zustand (UI/auth/theme state)
- **Feature modules** — `features/<domain>/api.js` (API calls) + `features/<domain>/store.js` (Zustand store)
- **Zod schemas** — in `src/schemas/`; shared field validators in `fields.js`
- **UI primitives** — `components/ui/` (Button, Card, Input, Modal, etc.); build with `cn()` utility
- **Views** — `views/<Role>/` contain page-level components; `app/` pages are thin wrappers
- **Dark mode** — class-based (`.dark` on `<html>`); theme tokens in `globals.css` `@theme inline {}`
- **RTL support** — exam layout supports RTL via `dir="rtl"` and `font-quran` font family
- **Google Auth** — Firebase popup → `getIdToken()` → POST to `/api/auth/google-auth`

---

## Project Architecture

### Backend Modules (`src/modules/`)

| Module | Prefix | Purpose |
|--------|--------|---------|
| `auth` | `/api/auth` | Signup, login, Google OAuth, email verify, password reset, user management |
| `assessments` | `/api/assessments` | CRUD, enrollment, question preview, physical paper PDF |
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
| `PORT` | Yes | Server port (default: 8000) |
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
| `NEXT_PUBLIC_API_URL` | Yes | Backend URL (e.g., `https://gradewiseai.techmiresolutions.com`) |
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

1. **Port conflict**: Only ONE backend PM2 process should bind port 8000. Check for duplicates: `pm2 list`
2. **Groq model names**: Current models use prefix format (e.g., `openai/gpt-oss-120b`), not old `llama-3.3-70b-versatile`
3. **Config cache**: Changes to `system_configs` take up to 60s to reflect. Call `invalidateConfigCache()` or restart PM2
4. **Font paths**: Fonts live in `src/assets/fonts/` and are copied to `dist/assets/fonts/` during build. If fonts missing in production, rebuild
5. **SKIP_CAPTCHA**: Must be `true` in `.env` when no reCAPTCHA secret is configured; frontend sends `dummy-key` as token
6. **EADDRINUSE**: Kill duplicate PM2 processes before restarting: `pm2 delete <name>` then `pm2 restart <name>`

---

## Conflict Resolution

Previous rules referenced Express v2, `scheema/` directory, JWT in localStorage, root `src/store/`, and port 5005. All superseded by this document and the actual codebase state.

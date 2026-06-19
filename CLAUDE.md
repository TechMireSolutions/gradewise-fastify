# Gradewise AI — Onboarding & Conventions

Workspace guide for humans and AI agents (Cursor, Antigravity, Claude Code).

---

## Repository Structure

| Component | Path | Stack |
|-----------|------|-------|
| **Backend** | `grade-wise-ai-backend-fastify/` | Fastify 5 · TS 6 · Drizzle · PostgreSQL · Redis · BullMQ · AI SDK 6 · Vitest |
| **Frontend** | `grade-wise-ai-frontend-next/` | Next.js 16 · React 19 · Tailwind 4 · Zustand · TanStack Query · Playwright |
| **Infra** | `docker-compose.yml` | Postgres (pgvector) · Redis · MinIO |
| **CI** | `.github/workflows/ci.yml` | Automated quality gates |

> **Not in use:** `grade-wise-ai-backend-v2/` (legacy Express).

See **`MIGRATION.md`** for the full modernization changelog.

---

## Agent Rules Architecture

Rules are **grouped by concern** and **mirrored** across agent platforms:

| Location | Platform |
|----------|----------|
| `.agent/rules/` | Antigravity / Cursor agent |
| `.claude/rules/` | Claude Code |
| `.cursorrules` | Cursor quick index |

### Rule Files

| File | Contents |
|------|----------|
| **`standards_rules.md`** | **Policies 1–5: deps, structure, naming, DRY, security/infra/testing** |
| `project_rules.md` | Overview, Docker, CI, commands, routes, env |
| `domain_rules.md` | RBAC, assessments, multilingual, XAI |
| `backend_rules.md` | Fastify, Drizzle, cookie auth, BullMQ, Redis, AI SDK |
| `frontend_rules.md` | Next.js, middleware, TanStack Query, cookie auth |
| `ui.md` | Tailwind v4, typography, a11y |
| `workflow_rules.md` | Verification gates, commit checklist |
| `antigravity_rules.md` | AGY SDK agents only |

### Skills (local)

Mirrored in `.agent/skills/` and `.claude/skills/`:

| Skill | Purpose |
|-------|---------|
| **gradewise-backend** | Fastify, Drizzle, Redis, BullMQ, cookie auth, AI SDK |
| **gradewise-frontend** | Next.js, middleware, TanStack Query, Zustand, Playwright |
| **gradewise-domain** | RBAC, assessments, async generation, XAI |
| **google-antigravity-sdk** | Antigravity orchestration (not app code) |
| **ui-ux-pro-max** | UI/UX design intelligence |
| **ui-styling** | Tailwind, component styling |
| **design** · **design-system** · **brand** · **slides** · **banner-design** | Visual assets |

---

## Commands

### Infrastructure

```bash
docker compose up -d postgres redis minio
```

### Backend

```bash
npm run dev          # API — http://localhost:5005
npm run dev:worker   # BullMQ worker (USE_ASYNC_JOBS=true)
npm run typecheck
npm run build
npm test             # Vitest
npm run db:push      # local schema
npm run db:migrate   # production migrations
npm run db:seed
```

### Frontend

```bash
npm run dev          # http://localhost:3000
npm run build
npm run lint
npm run test:e2e     # Playwright smoke
npm run start
```

**Env:** `.env.example` → `.env` (backend) · `.env.local` (frontend)

**Backend env highlights:** `JWT_SECRET`, `ENCRYPTION_KEY`, `FIREBASE_PROJECT_ID`, `REDIS_URL`, `USE_ASYNC_JOBS`

---

## Key Conventions

### Backend

- ESM + `.js` import suffixes · strict TypeScript
- **Cookie auth** — `setAuthCookie` / `clearAuthCookie`; no JWT in JSON
- Google OAuth: verify `{ idToken }` server-side
- Async AI: BullMQ + `npm run dev:worker`
- AI keys encrypted when `ENCRYPTION_KEY` set
- Services throw `AppError`; routes stay thin

### Frontend

- **httpOnly cookie session** — `withCredentials: true`; no token in localStorage
- `middleware.js` + `ProtectedRoute` + `/auth/me`
- State: TanStack Query (server) + Zustand (UI/auth user)
- Zod in `src/schemas/` (renamed from `scheema/`)
- Google: Firebase popup → `getIdToken()` → backend

### Before Commit

```bash
cd grade-wise-ai-backend-fastify && npm run typecheck && npm run build && npm test
cd grade-wise-ai-frontend-next && npm run build && npm run lint
```

See `workflow_rules.md` for full checklist.

---

## Conflict Resolution

Previous rules referenced Express v2, `scheema/`, JWT in localStorage, and root `src/store/`. All superseded by current mirrored rules and **`MIGRATION.md`**.

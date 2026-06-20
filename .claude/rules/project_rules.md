---
trigger: always_on
glob: "**/*"
description: "Project overview — stack, repo layout, commands, routes, infrastructure, and pointers to specialized rule files."
---

# Gradewise AI — Project Overview

## Rule Map (read the right file)

| File | Scope |
|------|--------|
| **`standards_rules.md`** | **Policies 1–5: deps, structure, naming, DRY, security/infra/testing** |
| `domain_rules.md` | RBAC, assessments, multilingual, XAI, business rules |
| `backend_rules.md` | Fastify · TypeScript · Drizzle · Redis · BullMQ · AI SDK |
| `frontend_rules.md` | Next.js · React · Zustand · TanStack Query · cookie auth |
| `ui.md` | Tailwind v4 · typography · accessibility · interactions |
| `workflow_rules.md` | Verification gates · commit checklist |
| `antigravity_rules.md` | Google Antigravity SDK agent design (not app code) |

See also **`MIGRATION.md`** for modernization changelog.

## What This App Is

Grade Wise AI is an **intelligent assessment platform** for educational institutions. It automates question generation, evaluation, and explainable feedback using LLM APIs (Gemini, OpenAI, Claude, Groq, Mistral, DeepSeek).

**Domain detail → `domain_rules.md`**

## Role Hierarchy

`super_admin` → `admin` → `instructor` → `student`

| Role | Primary capabilities |
|------|---------------------|
| **super_admin** | User management + AI API key configuration |
| **admin** | User/role management + platform oversight |
| **instructor** | Resources, assessments, enrollment, analytics |
| **student** | Take assessments, XAI feedback, progress history |

## Repository Structure

| Component | Path | Stack |
|-----------|------|-------|
| **Backend** | `grade-wise-ai-backend-fastify/` | Fastify 5 · TS 6 · Drizzle · PostgreSQL · Redis · BullMQ · AI SDK 6 · Vitest |
| **Frontend** | `grade-wise-ai-frontend-next/` | Next.js 16 · React 19 · Tailwind 4 · Zustand · TanStack Query · Playwright |
| **Infra** | `docker-compose.yml` | PostgreSQL 18 (pgvector) · Redis 8 · MinIO · api · worker · web · Node 24 |
| **CI** | `.github/workflows/ci.yml` | typecheck · build · test · lint · e2e |

> **Deprecated:** `grade-wise-ai-backend-v2/` (Express) — never reference in new work.

## Commands

### Infrastructure

```bash
docker compose up -d postgres redis minio
```

### Backend (`grade-wise-ai-backend-fastify/`)

| Target | Command |
|--------|---------|
| Dev API | `npm run dev` → http://localhost:5005 |
| Dev worker | `npm run dev:worker` (when `USE_ASYNC_JOBS=true`) |
| Typecheck | `npm run typecheck` |
| Build | `npm run build` |
| Unit tests | `npm test` |
| DB push (local) | `npm run db:push` |
| DB migrate (prod) | `npm run db:migrate` |
| DB seed | `npm run db:seed` |

### Frontend (`grade-wise-ai-frontend-next/`)

| Target | Command |
|--------|---------|
| Dev | `npm run dev` → http://localhost:3000 |
| Build | `npm run build` |
| Lint | `npm run lint` |
| E2E smoke | `npm run test:e2e` |
| Prod | `npm run start` |

**Env:** copy `.env.example` → `.env` (backend) and `.env.local` (frontend).

### Required backend env (beyond JWT + DATABASE_URL)

| Variable | Purpose |
|----------|---------|
| `ENCRYPTION_KEY` | Encrypt AI keys at rest |
| `FIREBASE_PROJECT_ID` | Verify Google idToken |
| `REDIS_URL` | Rate limit + BullMQ (optional locally) |
| `USE_ASYNC_JOBS` | Background question generation |
| `S3_*` | MinIO/S3 object storage (optional) |

## Key Routes

| Path | Role | Purpose |
|------|------|---------|
| `/login` · `/signup` · `/forgot-password` · `/verify-email` | public | Auth |
| `/super-admin/dashboard` · `/super-admin/api-config` | super_admin | Users + AI keys |
| `/admin/dashboard` | admin | Platform admin |
| `/instructor/dashboard` · `/instructor/resources` · `/instructor/students` | instructor | Workspace |
| `/instructor/assessments/*` | instructor | CRUD, enroll, analytics, preview |
| `/student/dashboard` · `/student/analytics` | student | Portal + history |
| `/student/assessments/[assessmentId]/take` | student | Live exam (ExamLayout) |
| `/profile` | authenticated | Profile edit |

## API Prefixes (backend)

| Prefix | Module |
|--------|--------|
| `/api/auth` | Auth, `/me`, `/logout`, user management |
| `/api/assessments` | Assessment CRUD, enrollment, preview, physical paper |
| `/api/resources` | Resource upload & management |
| `/api/config` | AI provider keys (super_admin) |
| `/api/taking` | Student start/submit/status |
| `/api/instructor-analytics` | Instructor analytics |
| `/api/student-analytics` | Student performance analytics |
| `/api/health` | DB + Redis + feature flags |

## Quick Pointers

- **Backend:** cookie auth · async AI via BullMQ · encrypted AI keys · thin routes · fat services.
- **Frontend:** httpOnly cookie session · `middleware.js` + `ProtectedRoute` · TanStack Query provider · `schemas/` for Zod.
- **Styling:** `ui.md` + slate/indigo/violet/emerald palette.
- **Before commit:** `workflow_rules.md`.

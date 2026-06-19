---
name: gradewise-backend
description: "Develop and debug the Gradewise Fastify backend (TypeScript, Drizzle, PostgreSQL, Redis, BullMQ, Zod, Vercel AI SDK). ACTIVATE for API routes, services, DB schema, cookie auth, async workers, AI generation, analytics, or backend refactors in grade-wise-ai-backend-fastify/."
---

# Gradewise Backend Skill

## When to Use

- Adding or changing API routes in `grade-wise-ai-backend-fastify/`
- Drizzle schema, migrations, queries, transactions
- Cookie auth, Google idToken verification, role authorization
- BullMQ workers, async assessment generation
- AI question generation, provider rotation, encrypted config keys
- Redis rate limiting, health checks, S3 storage
- Instructor/student analytics services
- Backend DRY refactors

## Stack

Node ≥22 · Fastify 5 · TypeScript 6 · Drizzle ORM · PostgreSQL (pgvector) · Redis · BullMQ · Zod 4 · Vercel AI SDK 6 · Vitest

## Before You Code

1. Read `.agent/rules/standards_rules.md` (Policies 1–5)
2. Read `.agent/rules/backend_rules.md` and `.agent/rules/domain_rules.md`
3. Run from `grade-wise-ai-backend-fastify/`:
   ```bash
   npm run typecheck && npm run build && npm test
   ```

## Project Layout

```
grade-wise-ai-backend-fastify/src/
  index.ts              # API server
  worker.ts             # BullMQ worker
  health.ts             # /api/health
  modules/<name>/
    index.ts            # Routes (thin)
    *.service.ts        # Business logic
    *.schema.ts         # Zod validation
    generation.ts       # (student-assessments) async AI generation
  queue/index.ts        # BullMQ queue + worker
  lib/redis.ts          # Redis client
  services/storage.ts   # S3/MinIO
  ai/                   # generateContent, providers
  plugins/              # cookie, cors, jwt, rate-limit, …
  utils/
    auth-cookie.ts      # setAuthCookie, clearAuthCookie
    crypto.ts           # encrypt keys, verifyGoogleIdToken
    errors.ts           # AppError hierarchy
  schemas/common.ts     # IdParamSchema, AssessmentIdParamSchema, …
  constants/roles.ts
  drizzle/              # Migrations + init-pgvector.sql
```

## Patterns (must follow)

| Task | Pattern |
|------|---------|
| Protect route | `preHandler: [authenticate, authorize(...INSTRUCTOR_ROLES)]` |
| Set session | `setAuthCookie(reply, token)` — never return token in JSON |
| Logout | `clearAuthCookie(reply)` |
| Google auth | Body `{ idToken }` → `verifyGoogleIdToken()` |
| Validate input | Zod + `fastify-type-provider-zod` |
| Errors | Throw `NotFoundError`, `ForbiddenError`, etc. |
| Success | `reply.send({ success: true, data })` |
| Long AI work | `enqueueAssessmentGeneration()` when `USE_ASYNC_JOBS=true` |
| AI call | `generateContent()` — never direct `@ai-sdk/*` in routes |
| Token limit | `maxOutputTokens` (SDK v6) |
| Encrypt AI keys | `encryptSecret()` on save, `decryptSecret()` on read |
| Imports | ESM with `.js` suffix |

## Module Map

| Prefix | Module |
|--------|--------|
| `/api/auth` | `modules/auth/` (+ `/me`, `/logout`) |
| `/api/assessments` | `modules/assessments/` |
| `/api/resources` | `modules/resources/` |
| `/api/config` | `modules/config/` |
| `/api/taking` | `modules/student-assessments/` (+ `/status`) |
| `/api/instructor-analytics` | `modules/instructor-analytics/` |
| `/api/student-analytics` | `modules/student-analytics/` |
| `/api/health` | `health.ts` |

## Shared Code (reuse first)

- `modules/assessments/question-generation.ts`
- `modules/student-assessments/generation.ts`
- `modules/analytics/shared.ts`
- `utils/auth-cookie.ts`, `utils/crypto.ts`
- `queue/index.ts`, `schemas/common.ts`, `constants/roles.ts`

## Env & Infrastructure

```bash
docker compose up -d postgres redis minio   # local infra
cp .env.example .env
```

| Variable | Required | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | Yes | PostgreSQL |
| `JWT_SECRET` | Yes | Session signing |
| `ENCRYPTION_KEY` | Recommended | AI key encryption |
| `FIREBASE_PROJECT_ID` | For Google auth | idToken verification |
| `REDIS_URL` | Optional | BullMQ + rate limit |
| `USE_ASYNC_JOBS` | Optional | Background generation |
| `S3_*` | Optional | Object storage |

```bash
npm run dev          # API on :5005
npm run dev:worker   # BullMQ worker
npm run db:push      # local schema
npm run db:migrate   # production migrations
npm run test         # Vitest
```

## References

- Modernization: `MIGRATION.md`
- Full rules: `.agent/rules/backend_rules.md`
- Domain: `.agent/rules/domain_rules.md`
- Workflow: `.agent/rules/workflow_rules.md`

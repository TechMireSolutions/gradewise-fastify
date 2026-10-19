---
trigger: always_on
glob: "grade-wise-ai-backend-fastify/**/*.ts"
description: "Fastify v5 + TypeScript + Drizzle ORM backend: structure, cookie auth, Redis, BullMQ, AI SDK, and DB patterns."
---

# Backend Rules — grade-wise-ai-backend-fastify

> **Mandatory:** `standards_rules.md` Policies 1–5.

**Stack:** Node ≥24 · Fastify 5 · TypeScript 6 (strict) · Drizzle ORM · PostgreSQL (pgvector) · Redis · BullMQ · Zod 4 · Vercel AI SDK 6 · Vitest

## Module System & Imports

- `"moduleResolution": "NodeNext"` — local imports **must** end in `.js`.
- ESM only. Exception: CJS-only packages via `createRequire(import.meta.url)`.
- `strict: true` — no `any`, guard indexed access.

## Project Structure

```
src/
  app.ts              # Fastify factory — plugins + routes
  index.ts            # Env validation + listen (PORT 5005)
  worker.ts           # BullMQ worker entry
  health.ts           # Health check aggregation
  db/                 # postgres client + Drizzle schema
  ai/                 # providers, generate, build-model, constants
  plugins/            # cookie, cors, helmet, jwt, rate-limit, multipart
  hooks/              # authenticate, authorize
  lib/redis.ts        # Redis client singleton
  queue/              # BullMQ queue + worker
  services/storage.ts # S3/MinIO upload scaffold
  modules/<name>/     # index.ts, *.service.ts, *.schema.ts
  constants/roles.ts
  schemas/common.ts
  utils/              # errors, auth-cookie, crypto, captcha, pdf
drizzle/              # Migrations + init-pgvector.sql
```

## Plugin Registration Order

```
helmet → cors → cookie → rate-limit → multipart → jwt
```

## Fastify Conventions

### Routes
```typescript
app.post("/path", {
  preHandler: [authenticate, authorize("instructor")],
  schema: { body: MyZodSchema, params: IdParamSchema },
}, async (request, reply) => {
  const data = await myService(request.body);
  return reply.send({ success: true, data });
});
```

### Error Handling
- Services throw `AppError` subclasses.
- Global handler returns `{ success: false, message }`.
- Route try/catch via `toHttpError()` when needed.

### Response Envelope
```typescript
reply.send({ success: true, message?: "...", data: { ... } });
```

## Auth (cookie-based)

- Cookie name: `gradewise_token` (httpOnly, secure in production).
- Set via `setAuthCookie(reply, token)` on login/signup/google-auth.
- Clear via `clearAuthCookie(reply)` on logout.
- `@fastify/jwt` reads cookie + Authorization header.
- **`/api/auth/me`** — return current user; **`/api/auth/logout`** — clear session.
- **Do not** return `token` in JSON responses.

### Google OAuth
```typescript
// Body: { idToken: string }
// Verify with verifyGoogleIdToken() in utils/crypto.ts
// Requires FIREBASE_PROJECT_ID or GOOGLE_CLIENT_ID
```

### Role guards
```typescript
preHandler: [authenticate, authorize("admin", "super_admin")]
// request.user: { id, email, role }
```

## Database (Drizzle ORM)

- PostgreSQL only · pgvector extension for future embeddings.
- Schema definitions:
  - `question_type` enum: `multiple_choice`, `short_answer`, `fill_in_the_blank`, `true_false`, `matching`
  - `assessments` table includes `language` column (text, default `'en'`)
- Multi-table writes → `db.transaction()`.
- `numeric` columns → `string` — use `Number()` for math.
- **Production migration parity:** Always run `npm run db:generate`, commit generated `drizzle/*.sql` and `drizzle/meta/_journal.json`, and run `npm run db:migrate`.
- Never create unjournaled or manual migration files outside `drizzle-kit`.
- **Local dev:** `npm run db:push` acceptable for experimentation only.
- **Assessment Deep Cloning (`cloneAssessmentService`)**:
  - Clones assessment metadata (title with `"Clone of "` prefix, description, instructions, language) and all child `question_blocks` in a single `db.transaction()`.
  - Resets `isExecuted` to `false` on the clone.
  - Route: `POST /api/assessments/:id/clone` guarded by `[authenticate, authorize(...INSTRUCTOR_ROLES)]`.
- **Assessment Immutability on Execution**:
  - `updateAssessmentService` and `deleteAssessmentService` verify `isExecuted === false`. If attempts exist, throw `BadRequestError("Cannot edit or delete an assessment with existing student attempts")`.
- **Instructor Analytics Isolation**:
  - Aggregations in `modules/instructor-analytics/` (`totalAssessments`, `executedAssessments`, `totalAttempts`, `totalResources`) must strictly filter by `instructorId` to prevent cross-tenant data leakage.
- **Database Query Consolidation & Aggregation**:
  - Never execute sequential unindexed queries for dashboard summaries.
  - Consolidate counts and filters using SQL conditional aggregation: `count(case when role = ... then 1 end)` or `count(case when is_executed then 1 end)`.
  - Combine related metric queries (`count` + `avg`) into a single join query against PostgreSQL.
- **Service Decomposition with Facade Pattern**:
  - Monolithic services (>300 lines) must be decomposed into focused single-responsibility files:
    - Common / Access Control (e.g., `assessments-common.ts`)
    - Domain Operations (e.g., `assessments-enrollment.service.ts`, `assessments-preview.service.ts`, `student-attempts.service.ts`, `student-submissions.service.ts`)
    - Pure Evaluation & Algorithms (e.g., `student-evaluation.service.ts`)
  - The root `<domain>.service.ts` file acts as a lightweight facade re-exporting all functions with 100% backward-compatible route contracts.
- **Pure Logic Isolation & Unit Testing**:
  - Isolate core business algorithms (e.g., `evaluateAnswer`, `normalizeMatchPairs`) from database I/O so they can be thoroughly tested with fast unit tests in `*.test.ts` (covering case insensitivity, whitespace, JSON variations, and multilingual true/false synonyms).
- **Admin Module (`/api/admin`)**:
  - `modules/admin/` provides single-query role overview counts and server-side search, pagination, and role filtering. Guarded by `[authenticate, authorize("admin", "super_admin")]`.

## Async Assessment Generation

When `USE_ASYNC_JOBS=true` and `REDIS_URL` set:

1. `startAssessmentService` enqueues BullMQ job → returns `{ status: "generating" }`.
2. Worker runs `generateQuestionsForAttempt()` in `modules/student-assessments/generation.ts`.
3. Client polls `GET /api/taking/assessments/:assessmentId/attempts/:attemptId/status`.

Run worker: `npm run dev:worker`.

## AI SDK v6

```typescript
const text = await generateContent(prompt, { maxOutputTokens: 4096, temperature: 0.7 });
```
- Use **`maxOutputTokens`** (not `maxTokens`).
- Never instantiate providers in services — use `generateContent` + rotation.
- AI keys encrypted in `system_configs` when `ENCRYPTION_KEY` set.
- After key changes: `invalidateConfigCache()`.

## Redis & Rate Limiting

- `REDIS_URL` enables Redis-backed `@fastify/rate-limit` and BullMQ.
- Without Redis: in-memory rate limit only (single instance).

## Object Storage

- `services/storage.ts` — S3-compatible (MinIO or any S3 endpoint).
- Set `S3_ENDPOINT`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_BUCKET`.

## Health Check

`GET /api/health` returns DB status, Redis ping, and feature flags.

## Shared Backend Utilities

| Path | Purpose |
|------|---------|
| `utils/auth-cookie.ts` | Cookie set/clear |
| `utils/crypto.ts` | Encrypt/decrypt keys, verify Google idToken |
| `constants/roles.ts` | Role arrays |
| `schemas/common.ts` | Param Zod schemas |
| `modules/assessments/question-generation.ts` | AI prompt + parse |
| `modules/student-assessments/generation.ts` | Question generation |
| `queue/index.ts` | BullMQ enqueue/worker |

## Testing

- Vitest: `npm test` · config: `vitest.config.ts`
- Place tests alongside source: `*.test.ts`
- CI runs tests on every push

## Code Style

- Thin routes, fat services.
- No `console.log` in production; `console.error` for failures.
- Destructive ops verify ownership/role first.

## Dependency Policy

- Latest stable (`npm outdated` before major work).
- Removed: `sharp`, `@fastify/static` (unused).
- Added: `@fastify/cookie`, `bullmq`, `ioredis`, `google-auth-library`, `@aws-sdk/client-s3`, `vitest`.

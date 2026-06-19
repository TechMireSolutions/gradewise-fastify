---
trigger: always_on
glob: "grade-wise-ai-backend-fastify/**/*.ts"
description: "Fastify v5 + TypeScript + Drizzle ORM backend: structure, cookie auth, Redis, BullMQ, AI SDK, and DB patterns."
---

# Backend Rules — grade-wise-ai-backend-fastify

> **Mandatory:** `standards_rules.md` Policies 1–5.

**Stack:** Node ≥22 · Fastify 5 · TypeScript 6 (strict) · Drizzle ORM · PostgreSQL (pgvector) · Redis · BullMQ · Zod 4 · Vercel AI SDK 6 · Vitest

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
- Multi-table writes → `db.transaction()`.
- `numeric` columns → `string` — use `Number()` for math.
- **Production:** `npm run db:generate` + commit + `npm run db:migrate`.
- **Local dev:** `npm run db:push` acceptable.

## Async Assessment Generation

When `USE_ASYNC_JOBS=true` and `REDIS_URL` set:

1. `startAssessmentService` enqueues BullMQ job → returns `{ status: "generating" }`.
2. Worker runs `generateQuestionsForAttempt()` in `modules/student-assessments/generation.ts`.
3. Client polls `GET /api/taking/assessments/:assessmentId/attempts/:attemptId/status`.

Run worker: `npm run dev:worker` or `docker compose up worker`.

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

- `services/storage.ts` — S3-compatible (MinIO in docker-compose).
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

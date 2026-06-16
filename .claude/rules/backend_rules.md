---
trigger: always_on
glob: "grade-wise-ai-backend-fastify/**/*.ts"
description: "Backend development guidelines for the Fastify v5 + TypeScript + Drizzle ORM stack: imports, DB patterns, error handling, auth, AI SDK, and response conventions."
---

# Backend Rules — grade-wise-ai-backend-fastify

**Stack**: Node.js 22 · Fastify v5 · TypeScript (strict) · Drizzle ORM 0.45 · PostgreSQL (postgres.js) · Zod v4 · Vercel AI SDK v6

---

## Module System & Imports

- TypeScript compiled with `"moduleResolution": "NodeNext"` — all local imports **must** end in `.js` even though the source files are `.ts`.
  - ✓ `import { db } from "../../db/index.js"`
  - ✗ `import { db } from "../../db/index"`
- ESM only — no `require()`. Exception: CJS packages (e.g. `pdf-parse`) must be loaded via `createRequire(import.meta.url)`.
- `strict: true` in tsconfig — no `any`, no implicit returns, no unchecked index access.
  - Use `Record<string, unknown>` when object shape is unpredictable.
  - Cast AI-parsed objects with `String(obj["field"])` / `Array.isArray(obj["field"])` rather than direct property access.
- Verify packages exist in `package.json` before importing. Never guess a package name.

---

## Project Structure

```
src/
  app.ts              # Fastify app factory — registers plugins then routes
  index.ts            # Entry point — validates env, starts server
  db/
    index.ts          # postgres.js client + drizzle instance
    schema.ts         # All Drizzle table definitions, enums, inferred types
  ai/
    providers.ts      # Multi-provider rotation with cooldown, 1-min config cache
    generate.ts       # generateContent() / generatePdfContent() wrappers
  plugins/
    jwt.ts            # @fastify/jwt setup + app.authenticate decorator
    rateLimit.ts      # @fastify/rate-limit global config
  hooks/
    authenticate.ts   # preHandler: verifies JWT, populates request.user
    authorize.ts      # preHandler factory: authorize("admin", "instructor")
  modules/
    auth/             # signup, login, google-auth, user management
    assessments/      # CRUD, enrollment, preview, physical paper
    resources/        # file upload, chunking, resource management
    config/           # AI provider key management (super_admin)
    student-assessments/  # start, submit, get submission details
    analytics/        # instructor-analytics, student-analytics
  utils/
    errors.ts         # AppError hierarchy
    pdf.ts            # PDFKit physical paper generator
```

---

## Fastify Conventions

### Plugin Registration
- Every plugin file must export a default function wrapped with `fastify-plugin` (breaks encapsulation so decorators/hooks are visible app-wide).
  ```typescript
  import fp from "fastify-plugin";
  export default fp(async function (app) { ... });
  ```
- Module route files export a plain `async function` (NOT wrapped in `fp`) — they run in their own scope, which is correct for route isolation.

### Route Files (`modules/<name>/index.ts`)
```typescript
export default async function routes(app: FastifyInstance) {
  app.post("/path", {
    preHandler: [app.authenticate, authorize("instructor")],
    schema: { body: MyZodSchema },
  }, handler);
}
```
- Always specify `schema` for request body and params — Zod schemas are applied via `fastify-type-provider-zod`.
- Rate-limit specific routes by adding `config: { rateLimit: { max, timeWindow } }` to the route options.

### Error Handling
- Throw typed `AppError` subclasses from service layer:
  ```typescript
  throw new NotFoundError("Assessment");    // 404
  throw new ForbiddenError("Access denied"); // 403
  throw new ConflictError("Already exists"); // 409
  ```
- The global error handler in `app.ts` converts them to `{ success: false, message }`. Controllers never call `reply.code().send()` for errors — only throw.
- Every route handler is `async` — Fastify catches unhandled promise rejections automatically. No manual try-catch needed in route handlers; put try-catch in services only when you want to recover gracefully (e.g. AI generation fallback).

### Response Format
All successful responses use:
```typescript
reply.send({ success: true, message: "...", data: { ... } });
```
Never return raw objects without the `success` envelope.

---

## Database (Drizzle ORM)

### Query Patterns
```typescript
// Select with filter
const rows = await db.select().from(users).where(eq(users.id, id)).limit(1);
const user = rows[0]; // always check for undefined

// Insert and return
const [created] = await db.insert(users).values({ ... }).returning();
if (!created) throw new AppError("CREATE_FAILED", "...", 500);

// Update
await db.update(users).set({ name }).where(eq(users.id, id));

// Aggregate (always guard for undefined)
const countResult = await db.select({ count: sql<number>`count(*)` }).from(enrollments)...;
const count = countResult[0]?.count ?? 0;
```

### Transactions
Use `db.transaction()` for any operation that writes to multiple tables:
```typescript
const result = await db.transaction(async (trx) => {
  const [assessment] = await trx.insert(assessments).values(...).returning();
  await trx.insert(questionBlocks).values(...);
  return assessment;
});
```

### Conflict Handling
```typescript
await db.insert(enrollments).values({ ... }).onConflictDoNothing();
```

### No Raw SQL in Features
- All queries go through Drizzle schema imports. Never write raw `sql` strings for table operations.
- `sql` template tag is allowed only for aggregate functions (`sql<number>\`count(*)\``) and ORDER BY expressions.
- No multi-DB abstraction layer — this backend targets PostgreSQL exclusively.

### Schema Rules
- Enums are defined in `schema.ts` via `pgEnum` and imported in services via the schema object.
- Inferred types (`typeof table.$inferSelect`) are used throughout — never write manual interface types that duplicate table structure.
- `numeric` columns (marks, scores) are stored as `string` in Drizzle. Use `Number(row.positiveMarks)` when doing math.

---

## Authentication & Authorization

```typescript
// Protect a route with JWT
preHandler: [app.authenticate]

// Protect and restrict by role
preHandler: [app.authenticate, authorize("admin", "super_admin")]
```

- `request.user` is typed as `{ id: number; email: string; role: string }` after `app.authenticate`.
- `authorize()` is a factory that returns a `preHandler` function — pass role strings as spread args.
- JWT payload: `{ id, email, role }`. Do not store sensitive data in JWT.
- JWT secret must be set via `JWT_SECRET` env var. The startup check in `index.ts` blocks launch if it's missing or uses the default in production.

---

## Zod v4 Validation

- Schema files live in each module: `modules/<name>/<name>.schema.ts`.
- Use `fastify-type-provider-zod` to register schemas on routes — this gives full TypeScript inference on `request.body`.
- Zod v4 syntax changes from v3:
  - `z.string().min(1)` still works.
  - Discriminated unions: `z.discriminatedUnion("type", [...])` is unchanged.
  - `z.infer<typeof Schema>` works the same.
  - No breaking changes to core validation API for our usage.

---

## AI SDK v6 (Vercel AI SDK)

### API
```typescript
import { generateText } from "ai";
const { text } = await generateText({
  model: aiModel,
  prompt: "...",
  system: "...",
  maxOutputTokens: 4096,   // NOT maxTokens — renamed in v6
  temperature: 0.7,
});
```
- The parameter is **`maxOutputTokens`** (v6 rename from `maxTokens` in v5). Always use this name.

### Provider Rotation
- Never instantiate AI SDK providers directly in services. Always use:
  ```typescript
  import { generateContent } from "../../ai/generate.js";
  const text = await generateContent(prompt, { maxOutputTokens: 4096, temperature: 0.7 });
  ```
- `generateContent` uses `callWithRotation("text", ...)` which round-robins keys, puts them on 60s cooldown on 429/503/529, and reads from DB with a 1-minute TTL cache.
- After any key change call `invalidateConfigCache()` from `src/ai/providers.ts`.

### Providers & Config Keys
Keys are stored in `system_configs` table with keys following the pattern:
- `TEXT_GEMINI_KEYS`, `TEXT_GROQ_KEYS`, `TEXT_OPENAI_KEYS`, `TEXT_CLAUDE_KEYS`, `TEXT_MISTRAL_KEYS`, `TEXT_DEEPSEEK_KEYS`
- `PDF_GEMINI_KEYS`, `PDF_OPENAI_KEYS`, etc.
- Model overrides: `TEXT_GEMINI_MODEL`, `PDF_OPENAI_MODEL`, etc.

---

## Error Hierarchy

```typescript
// src/utils/errors.ts
throw new NotFoundError("Assessment");         // 404: "Assessment not found"
throw new UnauthorizedError();                 // 401
throw new ForbiddenError("Access denied");     // 403
throw new ConflictError("Email already used"); // 409
throw new ValidationError("Invalid input");    // 422
throw new ServiceUnavailableError("AI");       // 503
throw new AppError("MY_CODE", "message", 500); // custom
```

---

## Environment Variables

Required at startup (validated in `index.ts`):
- `DATABASE_URL` — postgres.js connection string
- `JWT_SECRET` — must not be the default value in production

Optional:
- `JWT_EXPIRES_IN` — default `"24h"`
- `NODE_ENV` — `"development"` enables Drizzle query logging and auto-verifies emails
- `PORT` — default `3000`

---

## Code Style

- Controllers are thin — they extract params from `request`, call a service function, and send the response. No business logic in route handlers.
- Services own business logic and DB access. One service per module.
- No `console.log` in production paths — use `console.error` for error logging only.
- No hardcoded mock data or test seeds in production code.
- All destructive operations (delete assessment, delete key) must verify ownership/role before executing.

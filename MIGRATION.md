# GradeWise Modernization — Applied Changes

This document summarizes infrastructure and architecture upgrades applied across the monorepo.

## Phase 0 — Foundation

- **Docker Compose** (`docker-compose.yml`): Postgres (pgvector), Redis, MinIO, API, worker, web
- **Dockerfiles** for backend and frontend (Next.js standalone)
- **GitHub Actions CI** (`.github/workflows/ci.yml`): typecheck, build, vitest, lint, Playwright smoke
- **Vitest** backend tests (`npm test`)
- **Playwright** frontend smoke tests (`npm run test:e2e`)
- **Removed unused deps**: `sharp`, `@fastify/static`, `chart.js`, `recharts`, `lodash`, `html2canvas`, `@react-oauth/google`
- **Renamed** `src/scheema/` → `src/schemas/`

## Phase 1 — Security

- **httpOnly session cookies** (`gradewise_token`) — JWT no longer returned to client or stored in `localStorage`
- **`/api/auth/me`** and **`/api/auth/logout`** endpoints
- **Google OAuth**: verifies Firebase/Google **ID token** server-side (`google-auth-library`)
- **AI key encryption at rest** when `ENCRYPTION_KEY` is set
- **Strict CORS** in production (no `origin: true` fallback)
- **Next.js middleware** route protection (`src/middleware.js`)

## Phase 2 — Frontend

- **TanStack Query** provider (`src/components/Providers.jsx`)
- **`loading.js` / `error.js` / `not-found.jsx`** App Router conventions
- **`tsconfig.json`** for gradual TypeScript adoption
- **Cookie-based API client** (`withCredentials: true`)

## Phase 3 — Scalability

- **BullMQ** assessment generation queue + worker (`npm run dev:worker`)
- **Async assessment start** when `USE_ASYNC_JOBS=true` + `REDIS_URL` (polls `/status`)
- **Batch answer inserts** on submit
- **Redis-backed rate limiting** when `REDIS_URL` is set
- **S3/MinIO storage scaffold** (`src/services/storage.ts`)
- **pgvector** init SQL for Docker Postgres

## Phase 4 — Observability

- **`/api/health`** checks database + Redis + config flags

## Local development

```bash
# Infrastructure
docker compose up -d postgres redis minio

# Backend
cd grade-wise-ai-backend-fastify
cp .env.example .env   # set JWT_SECRET, ENCRYPTION_KEY, FIREBASE_PROJECT_ID
npm run db:push && npm run db:seed
npm run dev
npm run dev:worker     # separate terminal when USE_ASYNC_JOBS=true

# Frontend
cd grade-wise-ai-frontend-next
cp .env.example .env.local
npm run dev
```

## Required env updates

**Backend** (`.env`):
- `ENCRYPTION_KEY` — 32+ char secret for AI key encryption
- `FIREBASE_PROJECT_ID` — for Google ID token verification
- `REDIS_URL` — optional; enables async jobs + distributed rate limits
- `USE_ASYNC_JOBS=true` — enable background question generation

**Frontend** (`.env.local`):
- `NEXT_PUBLIC_API_URL=http://localhost:5005`
- Firebase vars unchanged (Google sign-in still uses Firebase popup; sends `idToken` to backend)

## Breaking changes

1. **Login/signup responses no longer include `token`** — session is cookie-only
2. **Google auth body** is now `{ idToken }` only (frontend updated)
3. **Protected routes** require valid session cookie + `/auth/me` validation

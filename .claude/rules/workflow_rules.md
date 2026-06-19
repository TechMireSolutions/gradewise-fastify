---
trigger: always_on
glob: "**/*"
description: "Quality gates, verification commands, and commit checklist. See standards_rules.md for full engineering policies."
---

# Workflow & Quality Rules

> **Mandatory policies:** `standards_rules.md` — Policies 1–5 (deps, structure, naming, DRY, security/infra/testing).

## Production Code Standards

- No hardcoded mock data, simulation blocks, or dummy text in active features.
- No `alert(...)` — use `react-hot-toast` or the shared `Modal` component.
- No unresolved TODOs, placeholder components, or broken links at commit time.
- Do not commit `.env` files — use `.env.example` templates only.
- Do not store JWT in `localStorage` or return tokens in auth JSON responses.

## Verification Before Commit

All checks must pass before committing or marking a task complete:

| Step | Command | Directory |
|------|---------|-----------|
| Frontend build | `npm run build` | `grade-wise-ai-frontend-next/` |
| Frontend lint | `npm run lint` | `grade-wise-ai-frontend-next/` |
| Frontend E2E (major UI) | `npm run test:e2e` | `grade-wise-ai-frontend-next/` |
| Backend typecheck | `npm run typecheck` | `grade-wise-ai-backend-fastify/` |
| Backend build | `npm run build` | `grade-wise-ai-backend-fastify/` |
| Backend unit tests | `npm test` | `grade-wise-ai-backend-fastify/` |

### Full local verification (recommended)

```bash
cd grade-wise-ai-backend-fastify && npm run typecheck && npm run build && npm test
cd grade-wise-ai-frontend-next && npm run build && npm run lint
```

CI runs the same gates in `.github/workflows/ci.yml`.

## Standards Compliance (summary)

| Policy | Rule file section |
|--------|-------------------|
| 1 — Latest dependencies | `standards_rules.md` → Policy 1 |
| 2 — File structure | `standards_rules.md` → Policy 2 |
| 3 — Naming | `standards_rules.md` → Policy 3 |
| 4 — DRY | `standards_rules.md` → Policy 4 |
| 5 — Security, infra, testing | `standards_rules.md` → Policy 5 |

Run the **Compliance checklist** at the bottom of `standards_rules.md` before every PR.

## Local Dev Checklist

1. `docker compose up -d postgres redis minio` (optional but recommended)
2. Backend `.env` from `.env.example` (`JWT_SECRET`, `ENCRYPTION_KEY`, `FIREBASE_PROJECT_ID`)
3. `npm run db:push && npm run db:seed` (backend)
4. `npm run dev` (backend) + `npm run dev:worker` if `USE_ASYNC_JOBS=true`
5. Frontend `.env.local` with `NEXT_PUBLIC_API_URL=http://localhost:5005`
6. `npm run dev` (frontend)

## Git

- Only commit when explicitly requested.
- Never commit secrets (`.env`, API keys, credentials).

---
trigger: always_on
glob: "**/*"
description: "High-level project overview: repository structure, commands, backend/frontend quick-ref, and domain model pointer."
---

# Gradewise AI — Project Overview

## What This App Is
Grade Wise AI is an **intelligent assessment platform** for educational institutions. It automates question generation, evaluation, and explainable feedback using LLM APIs (Gemini, OpenAI, Claude, Groq, Mistral, DeepSeek).

**Full domain model → see `domain_rules.md`** (roles, assessment system, question blocks, physical paper, multilingual/RTL, XAI feedback).

## Role Hierarchy (quick ref)
`super_admin` → `admin` → `instructor` → `student`
- **super_admin**: user management + AI API key configuration
- **admin**: user/role management + platform analytics + custom question types
- **instructor**: resource upload + assessment creation + student enrollment
- **student**: take assessments + view XAI feedback + track progress

## Repository Structure
- **Backend**: `grade-wise-ai-backend-fastify/` — Node.js 22 · Fastify v5 · TypeScript · Drizzle ORM · PostgreSQL
- **Frontend**: `grade-wise-ai-frontend-next/` — React 19 · Next.js · Tailwind CSS v4 · Zustand

## Commands
| Target | Command | Purpose |
|--------|---------|---------|
| Frontend | `npm run dev` | Dev server (Next.js) |
| Frontend | `npm run build` | Production build |
| Frontend | `npm run lint` | ESLint check |
| Frontend | `npm run start` | Start production server |
| Backend | `npm run dev` | Dev server (tsx watch) |
| Backend | `npm start` | Production start (compiled JS) |
| Backend | `npm run build` | Compile TypeScript |
| Backend | `npx tsc --noEmit` | Type-check without emit |
| Backend | `npx drizzle-kit push` | Push schema to DB |
| Backend | `npx drizzle-kit generate` | Generate migration files |

## Key Routes
| Path | Role | Purpose |
|------|------|---------|
| `/super-admin/dashboard` | super_admin | User management |
| `/super-admin/api-config` | super_admin | AI provider key management |
| `/admin/dashboard` | admin | Platform admin hub |
| `/instructor/dashboard` | instructor | Assessment workspace |
| `/instructor/resources` | instructor | Resource library |
| `/instructor/assessments` | instructor | Assessment list |
| `/instructor/assessments/create` | instructor | New assessment |
| `/instructor/assessments/[id]/edit` | instructor | Edit assessment config |
| `/instructor/assessments/[id]/enroll` | instructor | Manage student enrollment |
| `/instructor/assessments/[id]/analytics` | instructor | Assessment analytics |
| `/instructor/assessments/[id]/preview` | instructor | Preview assessment |
| `/student/dashboard` | student | Student portal |
| `/student/assessments/[assessmentId]/take` | student | Live exam (ExamLayout) |
| `/student/analytics` | student | Performance history |

## Backend (quick ref → full detail in `backend_rules.md`)
- TypeScript strict mode, `NodeNext` module resolution — local imports need `.js` extension.
- Drizzle ORM targeting PostgreSQL only — no multi-DB abstraction layer.
- Route handlers are thin; services own all business logic and DB access.
- Throw `AppError` subclasses (`NotFoundError`, `ForbiddenError`, etc.) — global handler converts to `{ success: false, message }`.
- All multi-table writes wrapped in `db.transaction()`.
- AI generation via `generateContent()` from `src/ai/generate.ts` — never instantiate SDK providers directly.
- `maxOutputTokens` (not `maxTokens`) in Vercel AI SDK v6.

## API Route Prefixes
| Prefix | Module |
|--------|--------|
| `/api/auth` | Authentication & user management |
| `/api/assessments` | Assessment CRUD, enrollment, preview, paper |
| `/api/resources` | Resource upload & management |
| `/api/config` | AI provider key management |
| `/api/taking` | Student assessment start/submit |
| `/api/instructor-analytics` | Instructor analytics |
| `/api/student-analytics` | Student analytics |

## Frontend (quick ref → full detail in `frontend_rules.md`)
- Next.js dynamic routing & layout wrapper system (`RootLayout`, `DashboardLayout`, `ExamLayout`).
- Zustand for global state (`src/store/`). No Redux.
- Zod schemas in `src/scheema/` + `react-hook-form` for all forms.
- Tailwind v4, curated palettes, `44×44px` touch targets, WCAG contrast ≥ 4.5:1.

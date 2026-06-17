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
- **Backend**: `grade-wise-ai-backend-fastify/` — Node.js 22 · Fastify v5 · TypeScript (strict) · Drizzle ORM 0.45 · PostgreSQL · Zod v4 · Vercel AI SDK v6
- **Frontend**: `grade-wise-ai-frontend-next/` — React 19.2.4 · Next.js 16.2.9 (App Router, Turbopack) · Tailwind CSS v4 · Zustand 5 · Firebase Auth · socket.io-client · Chart.js · Recharts

## Commands
| Target | Command | Directory | Purpose |
|--------|---------|-----------|---------|
| Frontend | `npm run dev` | `grade-wise-ai-frontend-next/` | Dev server (Next.js + Turbopack) |
| Frontend | `npm run build` | `grade-wise-ai-frontend-next/` | Production build |
| Frontend | `npm run lint` | `grade-wise-ai-frontend-next/` | ESLint check |
| Frontend | `npm run start` | `grade-wise-ai-frontend-next/` | Start production server |
| Backend | `npm run dev` | `grade-wise-ai-backend-fastify/` | Dev server (tsx watch) |
| Backend | `npm start` | `grade-wise-ai-backend-fastify/` | Production start (compiled JS) |
| Backend | `npm run build` | `grade-wise-ai-backend-fastify/` | Compile TypeScript |
| Backend | `npx tsc --noEmit` | `grade-wise-ai-backend-fastify/` | Type-check without emit |
| Backend | `npx drizzle-kit push` | `grade-wise-ai-backend-fastify/` | Push schema to DB |
| Backend | `npx drizzle-kit generate` | `grade-wise-ai-backend-fastify/` | Generate migration files |

## Key Routes
| Path | Role | Purpose |
|------|------|---------|
| `/login` | public | Email/password + Google OAuth login |
| `/signup` | public | Registration (with reCAPTCHA) |
| `/forgot-password` | public | Password reset flow |
| `/verify-email` | public | Email verification |
| `/super-admin/dashboard` | super_admin | User management |
| `/super-admin/api-config` | super_admin | AI provider key management |
| `/admin/dashboard` | admin | Platform admin hub |
| `/instructor/dashboard` | instructor | Assessment workspace |
| `/instructor/resources` | instructor | Resource library |
| `/instructor/students` | instructor | Register/manage students |
| `/instructor/assessments` | instructor | Assessment list |
| `/instructor/assessments/create` | instructor | New assessment |
| `/instructor/assessments/[id]` | instructor | Assessment detail |
| `/instructor/assessments/[id]/edit` | instructor | Edit assessment config |
| `/instructor/assessments/[id]/enroll` | instructor | Manage student enrollment |
| `/instructor/assessments/[id]/analytics` | instructor | Assessment analytics (Chart.js/Recharts) |
| `/instructor/assessments/[id]/preview` | instructor | Preview assessment as student |
| `/student/dashboard` | student | Student portal |
| `/student/assessments/[assessmentId]/take` | student | Live exam (ExamLayout, no navbar) |
| `/student/analytics` | student | Performance history + recommendations |
| `/profile` | all roles | User profile edit |

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
| `/api/assessments` | Assessment CRUD, enrollment, preview, physical paper |
| `/api/resources` | Resource upload & management |
| `/api/config` | AI provider key management (super_admin) |
| `/api/taking` | Student assessment start/submit/print |
| `/api/instructor-analytics` | Instructor analytics + overview |
| `/api/student-analytics` | Student performance analytics |

## Frontend (quick ref → full detail in `frontend_rules.md`)
- Next.js App Router with route groups: `(auth)`, `(dashboard)`, `(exam)`.
- Pages in `src/app/` are thin wrappers — all views dynamically imported with `ssr: false`.
- `react-router-dom` imports in `src/views/` are aliased to `src/lib/react-router-dom-mock.js` (Next.js shim). Do not add new react-router-dom imports outside views.
- Zustand 5 stores in `src/store/`. No Redux. No React Context for global state.
- Zod schemas in `src/scheema/` (note: typo in folder name — do not rename).
- Custom `apiClient.js`: retry logic, deduplication, 401 redirect, dynamic timeouts.
- Firebase + custom JWT for auth; reCAPTCHA v3 on signup.
- socket.io-client for real-time assessment progress.
- Chart.js (instructor analytics) + Recharts (student analytics).
- Tailwind v4, curated palettes, `44×44px` touch targets, WCAG contrast ≥ 4.5:1.
- PDF export: jsPDF + jspdf-autotable. DOCX export: docx library.

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
- **Backend**: `grade-wise-ai-backend-v2/` — Node.js · Express · ESM
- **Frontend**: `grade-wise-ai-frontend-next/` — React 19 · Next.js · Tailwind CSS v4 · Zustand

## Commands
| Target | Command | Purpose |
|--------|---------|---------|
| Frontend | `npm run dev -- --webpack` | Dev server (Next.js) |
| Frontend | `npm run build` | Production build |
| Frontend | `npm run lint` | ESLint check |
| Frontend | `npm run start` | Start production server |
| Backend | `npm run dev` | Dev server (nodemon) |
| Backend | `npm start` | Production start |
| Backend | `node --check index.js` | Syntax validation |

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
- ESM imports with `.js` extension on all local files.
- PostgreSQL placeholders (`$1`, `$2`) in every query — `DB/db.js` translates to SQLite/MySQL at runtime.
- `try-catch` in every controller → `{ success: false, message: "..." }` on errors.

## Frontend (quick ref → full detail in `frontend_rules.md`)
- Next.js dynamic routing & layout wrapper system (`RootLayout`, `DashboardLayout`, `ExamLayout`).
- Zustand for global state (`src/store/`). No Redux.
- Zod schemas in `src/scheema/` + `react-hook-form` for all forms.
- Tailwind v4, curated palettes, `44×44px` touch targets, WCAG contrast ≥ 4.5:1.

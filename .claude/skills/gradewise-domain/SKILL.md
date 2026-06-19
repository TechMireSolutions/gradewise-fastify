---
name: gradewise-domain
description: "Gradewise AI business domain — RBAC, assessments, async generation, enrollment, multilingual exams, XAI feedback, physical papers, AI provider config. ACTIVATE when implementing features that need business logic, role gates, or assessment lifecycle rules."
---

# Gradewise Domain Skill

## When to Use

- Role-based features (super_admin, admin, instructor, student)
- Assessment creation, execution, enrollment, analytics
- Question block configuration (MCQ, short answer, true/false, matching)
- Student exam flow, async generation, scoring, XAI feedback
- Physical paper generation (PDF/DOCX)
- Multilingual + RTL (EN, UR, AR, FA)
- AI provider key management

## Role Hierarchy

`super_admin` → `admin` → `instructor` → `student`

| Role | Key capabilities |
|------|------------------|
| super_admin | All users + AI API keys at `/super-admin/api-config` |
| admin | User/role management, platform oversight |
| instructor | Resources, assessments, enrollment, analytics |
| student | Take exams, view feedback, track progress |

## Assessment Lifecycle

1. Instructor uploads resources (PDF/DOCX/TXT) → chunked for AI context
2. Creates assessment: resources + prompt + question blocks
3. Enrolls students
4. Student starts → AI generates questions (sync or async via BullMQ)
5. Student submits → batch scoring + XAI feedback + study guide

### Async Generation (when enabled)

- `USE_ASYNC_JOBS=true` + Redis → start returns `{ status: "generating" }`
- Worker generates questions in background
- Frontend polls `/api/taking/assessments/:id/attempts/:attemptId/status`

### Business Rules

- **Edit/delete assessment** only if no student attempt exists (`is_executed === false`)
- Each student gets a unique AI-generated question set per attempt
- Physical paper: modal collects institute/teacher/subject/date + PDF or DOCX

## Question Blocks

| Type | Extra params |
|------|-------------|
| MCQ | option count (default 4) |
| Short answer | — |
| True/false | — |
| Matching | left count (3), right count (4) |

Shared: count (5), duration (60s), +marks (1), −marks (0.25)

## Multilingual

| Language | Direction |
|----------|-----------|
| English | LTR |
| Urdu, Arabic, Persian | RTL |

- Language chosen before exam starts
- UI strings via `src/utils/translations.js`
- `ExamLayout` applies dynamic `dir`

## Auth & Security (domain-level)

- Sessions are **httpOnly cookies** — not bearer tokens in browser storage
- Google sign-in requires verified **idToken** on backend
- AI keys encrypted when `ENCRYPTION_KEY` configured

## XAI Feedback (post-submit)

1. Score summary
2. Per-question: question, student answer, correct answer, source snippet
3. "Explain this" per question (AI)
4. Personalized study guide

## AI Providers (super_admin)

Providers: gemini, groq, openai, claude, mistral, deepseek  
Purposes: `pdf` (extraction) · `text` (generation, feedback)  
Keys in `system_configs` — encrypted at rest · rotated with cooldown

## References

- Modernization: `MIGRATION.md`
- Full domain rules: `.agent/rules/domain_rules.md`
- Backend: `.agent/skills/gradewise-backend/SKILL.md`
- Frontend: `.agent/skills/gradewise-frontend/SKILL.md`

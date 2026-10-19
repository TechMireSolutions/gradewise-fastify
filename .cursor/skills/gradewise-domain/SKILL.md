---
name: gradewise-domain
description: "Gradewise AI business domain — RBAC, assessments, async generation, enrollment, multilingual exams, XAI feedback, physical papers, AI provider config. ACTIVATE when implementing features that need business logic, role gates, or assessment lifecycle rules."
---

# Gradewise Domain Skill

## When to Use

- Role-based features (super_admin, admin, instructor, student)
- Assessment creation, execution, enrollment, analytics
- Question block configuration (MCQ, short answer, fill in the blank, true/false, matching)
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

- **Edit/delete assessment** only if no student attempt exists (`is_executed === false`). Executed assessments are immutable to preserve evaluation and audit history.
- **Assessment Cloning ("Clone & Version")**: Instructors duplicate existing assessments via `POST /api/assessments/:id/clone`, performing a deep transactional copy (`db.transaction`) of assessment details and question blocks, resetting `is_executed: false`.
- **Locked Edit Guard**: If an instructor attempts to edit an executed assessment, the form inputs are disabled and banner CTAs route to "Clone Assessment" or "View Analytics".
- **Assessment Action Suite**: Standardized via `AssessmentActionButtons` supporting `chips` (table) and `grid` (cards) modes for Edit, Clone, Preview, Analytics, Enroll, Paper, and Delete.
- **Assessment Metadata Standard**: Forms use `AssessmentMetadataCard` unifying Title, Language, and AI Prompt with RTL awareness, and render `AssessmentLockedNotice` when executed.
- **Answer Evaluation & Scoring Engine**:
  - MCQ, Short Answer, Fill in Blank: exact match after case/whitespace trimming.
  - Matching: JSON normalization across array of tuples, array of objects, or key-value map. Evaluated symmetrically.
  - True / False: multilingual synonyms supported (English `true`/`false`, `yes`/`no`, `correct`/`wrong`; Arabic/Urdu `ا`/`ب`).
  - Negative marks deducted only on non-empty incorrect answers; skipped questions receive 0.
- Each student gets a unique AI-generated question set per attempt.
- **Physical Paper Generation**: Modal collects institute/teacher/subject/date/duration + font sizes (`headerFontSize`, `questionFontSize`, `optionFontSize`) which automatically persist in `localStorage` (`gradewise_paper_settings`). Outputs PDF or DOCX.

## Question Blocks

DB Enum `question_block_type`: `'multiple_choice', 'short_answer', 'fill_in_the_blank', 'true_false', 'matching'`

| Type | Extra params |
|------|-------------|
| Multiple Choice (`multiple_choice`) | option count (default 4) |
| Short Answer (`short_answer`) | — |
| Fill in the Blank (`fill_in_the_blank`) | `correct_answer` = missing word/phrase (exact match) |
| True / False (`true_false`) | Multilingual synonyms (EN, UR, AR) |
| Matching (`matching`) | left count (3), right count (4) |

Shared: count (5), duration (60s), +marks (1), −marks (0.25)

## Multilingual & RTL

| Language | Code | Direction |
|----------|------|-----------|
| English | `en` | LTR |
| Urdu | `ur` | RTL |
| Arabic | `ar` | RTL |
| Persian (Farsi) | `fa` | RTL |

- Assessment schema stores `language` column (`'en'` default).
- Language chosen before exam starts; persists through attempt generation and scoring.
- UI strings via `src/utils/translations.js`.
- `ExamLayout` and instructor preview/prompt components (`PromptTab`, `QuestionCard`) apply dynamic `dir` (`ltr` or `rtl`) based on the assessment language.
- Text displays and inputs must strictly use CSS logical properties (`text-start` / `text-end`, `ms-*`, `me-*`, `ps-*`, `pe-*`) with dynamic `dir` to mirror alignment without physical `text-left` or `text-right` classes.
- Question timers use `tabular-nums` for rock-steady countdowns across LTR and RTL.
- Pure semantic border tokens (`border-border`) used throughout; hardcoded grayscale borders (`border-slate-600`) are strictly forbidden.

## Auth, Security & Forms (domain-level)

- Sessions are **httpOnly cookies** (`gradewise_token`) — not bearer tokens in browser storage.
- Google sign-in requires verified **idToken** on backend via `google-auth-library`.
- **Password policy standard (5 points):** $\ge 8$ chars, at least one uppercase letter, one lowercase letter, one number, and one special character (`@$!%*?&`). Enforced in Zod schemas and visually verified via live requirement checklists across login, signup, reset password, and user creation/editing.
- **Form design standard:** All forms across all 4 portals use shared UI primitives (`PasswordInput`, `Select`, `Textarea`, `Label`), accessible error linking (`aria-errormessage`), `:user-invalid` styling, and IME-safe Enter submissions.
- AI keys encrypted in `system_configs` when `ENCRYPTION_KEY` configured.

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

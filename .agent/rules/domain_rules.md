---
trigger: always_on
glob: "**/*"
description: "Complete GradeWise AI domain model — roles, capabilities, assessment system, question blocks, multilingual support, XAI feedback, physical paper generation, and business rules."
---

# GradeWise AI — Domain Model & Business Rules

## Platform Identity
- **Full name**: Grade Wise AI (Intelligent Assessment Platform)
- **Core purpose**: Fully automate the educational assessment lifecycle — question generation, evaluation, and explainable feedback.
- **AI engine**: Google Gemini, OpenAI (ChatGPT), Anthropic Claude, Groq, Mistral, DeepSeek — configured per-purpose (PDF extraction / text generation).
- **Access model**: Secure, dedicated portals per role; single unified sign-in portal for all users.

---

## RBAC — Role Hierarchy

Roles (highest → lowest authority): `super_admin` → `admin` → `instructor` → `student`

### Super Admin (`super_admin`)
- Manages all users including admins.
- Configures AI provider API keys via `/super-admin/api-config` (per purpose: `pdf` / `text`).
- Owns `/super-admin/dashboard` (user management) and `/super-admin/api-config` (API key management).
- Only role that can add/remove API keys and change AI models per provider.

### Admin (`admin`)
- Registers new Instructors and Students (individually or bulk upload).
- Views and manages all user profiles; can modify roles (e.g. promote Student → Instructor).
- Monitors system-wide KPIs, analytics, and API cost dashboard.
- Performs audits: user activity, student performance, assessment history.
- Defines new custom question types to extend the platform.
- Cannot change their own role.

### Instructor (`instructor`)
- Registers student accounts; enrolls students into specific assessments.
- Uploads course resources (PDF, DOCX, TXT, video URLs, webpage URLs) — system vectorizes automatically for AI analysis.
- Creates assessments by combining resources + Question Blocks with AI generation rules.
- Manages enrolled students for each assessment.
- Cannot change their own role.
- Accessible routes also available to `admin` and `super_admin`.

### Student (`student`)
- Takes unique, timed assessments generated in real-time by the AI.
- Selects preferred language (English / Urdu / Arabic / Persian) — triggers full UI translation + LTR/RTL layout switch.
- Reviews detailed XAI feedback and personalized study guide after submission.
- Accesses complete history of past assessments.
- Cannot change their own role.

---

## Assessment System

### Question Block Types
Each assessment is composed of one or more typed blocks. Every block is fully configurable:

| Type | Type-Specific Parameters |
|------|--------------------------|
| **MCQ** (Multiple Choice) | Number of choices (default: 4) |
| **Short Answer** | — |
| **True / False** | — |
| **Matching** | Left-side option count (default: 3), Right-side option count (default: 4) |

**Common parameters for every block:**
- Number of questions (default: 5)
- Duration per question in seconds (default: 60s)
- Positive marks (default: +1)
- Negative marks (default: −0.25)

### Assessment Creation Flow (Instructor)
1. Select resources (already uploaded, vectorized).
2. Name the assessment + write high-level AI directives (e.g. "Focus on conceptual understanding").
3. Add Question Blocks — one or more, each with its own type and parameters.
4. Submit → backend constructs the AI prompt and stores it.

### Assessment Lifecycle & Business Rules
- **Edit / Delete**: only allowed if **no student has started an attempt** yet (`is_executed === false`).
- **View Prompt**: show the AI prompt constructed from resources + block config.
- **Preview as Student**: instructor runs a live demo of the assessment experience.
- **Manage Enrollment**: add or remove students after creation.
- **View Analytics & Results**: per-student and per-question breakdown including Q&A pairs and full stats.
- **Generate Physical Paper**: produce a printable version with answer key.

### Async Question Generation (infrastructure)

When `USE_ASYNC_JOBS=true` and Redis is available:

1. Student calls **start** → backend creates attempt, enqueues BullMQ job, returns `{ status: "generating" }`.
2. Worker generates questions via `modules/student-assessments/generation.ts`.
3. Frontend polls **`GET /api/taking/assessments/:assessmentId/attempts/:attemptId/status`** until `{ status: "ready" }`.
4. Without async mode, generation runs synchronously in the start request (legacy behavior).

### Session & Auth (platform)

- All roles authenticate via **httpOnly cookie** (`gradewise_token`) — not JWT in browser storage.
- Google sign-in: frontend sends Firebase **idToken**; backend verifies before creating session.
- Protected frontend routes: Next.js `middleware.js` + `ProtectedRoute` + `GET /api/auth/me`.

---

## Physical Paper Generation

Triggered from the assessment's action menu. A modal collects:

| Field | Notes |
|-------|-------|
| Institute Name | Text input |
| Teacher Name | Text input |
| Subject Name | Text input |
| Paper Date | Date input |
| Paper Time | Time input |
| Paper Duration | Text / duration input |
| Total Marks | Number |
| Notes / Instructions | Textarea |
| Page Size | Dropdown: A4 / A5 / Letter |
| Font Size | User-configurable (header size vs body size) |
| Output Format | PDF or DOCX (user selects) |

**Format rules for generated paper:**
- Questions: **bold**
- Answer options: normal weight
- Header (institute/teacher/subject/date): larger font, user-adjustable
- Answer key printed separately or appended as a final page

---

## Multilingual & RTL Support

Student assessment interface supports four languages:

| Language | Direction |
|----------|-----------|
| English  | LTR |
| Urdu     | RTL |
| Arabic   | RTL |
| Persian (Farsi) | RTL |

**Implementation rules:**
- Language selection appears before the assessment begins.
- Switching language triggers full UI translation AND layout direction change (`dir="rtl"` / `dir="ltr"`).
- RTL languages: mirror flex layouts, text-align, icon placement, and padding/margin where applicable.
- AI generates questions in the selected language.
- All static UI strings (buttons, labels, instructions) must also switch language — use a translation map or i18n library.
- `ExamLayout` wrapper must support the `dir` attribute dynamically based on the selected language.

---

## Resource Management (Instructor)

Supported upload types:
- **Files**: PDF, DOCX, TXT (and other common document formats)
- **Links**: YouTube/video URLs, web page URLs

Processing:
- Backend automatically vectorizes all resources for AI similarity search and retrieval during generation.
- Resources can have visibility settings (private to instructor / shared).

---

## XAI Feedback System (Student Post-Submission)

After an assessment is submitted, the student receives:
1. **Score summary** — total marks earned.
2. **Per-question review**: original question, student's submitted answer, correct answer.
3. **Contextual justification snippet** — passage from the source material supporting the correct answer.
4. **On-demand AI explanation** — student can request a deeper explanation for any misunderstood concept.
5. **Personalized Study Guide** — AI-generated plan targeting the student's weak areas.

All feedback is delivered in the language the student selected for the assessment.

---

## AI Provider Configuration (Super Admin)

Managed at `/super-admin/api-config`:
- **Providers**: `gemini`, `groq`, `openai`, `claude`, `mistral`, `deepseek`
- **Purposes**: `pdf` (PDF text extraction) · `text` (question generation, evaluation, feedback)
- Multiple keys per provider/purpose → load-balanced automatically
- Keys stored encrypted in DB — never shown after save
- Model selectable per provider per purpose (e.g. `gemini-2.5-flash` for PDF, `gpt-4o` for text)

---

## Platform-Level Features

- **Feedback form** (user-submitted): Rating · Suggestion · Problem faced
- **Captcha** required at signup to prevent bot registration
- **Resource alphabet count check** (backend validation on uploaded text resources)
- **Bulk user registration** — admin uploads a file to register multiple users at once
- **Super admin security hardening** — additional authentication guards on super admin routes

---

## Architecture Principles

- **SOLID + SRP**: every module/controller/component has one responsibility.
- **Mobile-first responsive**: all pages must work on mobile before scaling up.
- **Role-gate every route**: `ProtectedRoute` with `requiredRole` on every protected page.
- No business logic inside React components — extract to `src/utils/` or `src/hooks/` (frontend) or `src/modules/*/`.service.ts` (backend).

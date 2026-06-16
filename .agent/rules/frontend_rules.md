---
trigger: always_on
glob: "grade-wise-ai-frontend-next/**/*.{js,jsx,css}"
description: "Frontend styling, layout, Next.js hydration, forms with Zod, state management, multilingual/RTL, and GradeWise-specific component patterns."
---

# Frontend Rules — grade-wise-ai-frontend-next

**Stack**: React 19 · Next.js (App Router) · Tailwind CSS v4 · Zustand · Zod

## Routing & Layouts
- Next.js App Router for routing. Eagerly load global layout and home configs; dynamic import pages/views from `src/views/` using `next/dynamic` with `{ ssr: false }` where necessary to prevent hydration mismatches on client-only states.
- Layout wrappers:
  - `src/app/layout.js` (RootLayout) — global styling, metadata, and standard toast notifications setup.
  - `src/app/(dashboard)/layout.jsx` (DashboardLayout) — wraps all dashboard pages with `Navbar` and `Footer`.
  - `src/app/(exam)/layout.jsx` (ExamLayout) — zero-navigation, distraction-free (**assessment `/take` route only**, applies `dir` dynamically for RTL/LTR language support).
- Guard protected routes using `<ProtectedRoute requiredRole="...">`.

## Hydration Safety
- Since the frontend uses Zustand storage persist layers and browser APIs, server/client hydration mismatches can occur.
- Use client-side check (`useHydrated` hook or `dynamic(..., { ssr: false })`) for components using browser API, local storage, or Zustand persistent state to avoid Next.js hydration mismatch errors (e.g. as used in `ExamLayout` and pages like `student/assessments/[assessmentId]/take/page.jsx`).

## State Management
- Global state → Zustand stores in `src/store/`. One store per domain, kept focused.
- **No Redux. No React Context** for shared/global state.

## Forms
- Every form: `react-hook-form` + Zod schema from `src/scheema/` via `@hookform/resolvers/zod`.
- Instant field-level error feedback: red border on invalid field, submit button disabled while processing.

## Styling — Tailwind CSS v4
- Init via `@import "tailwindcss";` in `src/app/globals.css`.
- Palettes: slate · indigo · violet · emerald with gradient backgrounds. No plain red/blue/green.
- Dark mode required on all pages (light + dark variants).
- Fonts: Outfit, Inter, or Roboto. No system/browser defaults.
- Transitions: `150ms–300ms` ease-out on hover/focus/active. No instant state snaps.
- Icons: `react-icons/fa` (FontAwesome) or `lucide-react` SVGs only. No raw emojis in controls or nav.
- Touch targets: minimum `44×44px`.
- Drop-shadows, rounded corners, subtle border contrast on cards and panels.
- WCAG contrast ≥ 4.5:1. All interactive elements must have visible focus states.

## Multilingual & RTL (Student Assessment Pages)
- Language options: **English** (LTR) · **Urdu** (RTL) · **Arabic** (RTL) · **Persian** (RTL).
- Language selection shown before the assessment starts; stored in component/Zustand state for the session.
- On language change: set `document.documentElement.dir` (or apply `dir` to the `ExamLayout` root) AND update text content via a translation map.
- RTL adjustments: reverse `flex-row` to `flex-row-reverse` where needed, use `text-right` / `text-start`, mirror icon positions, adjust padding sides (`ps-*` / `pe-*` preferred over `pl-*` / `pr-*` for RTL-safe spacing).
- All AI-generated question/answer content is in the selected language — do not assume English.

## Assessment-Specific Patterns

### Question Block Builder (Instructor — Create/Edit Assessment)
- Each block has a `type` (MCQ / ShortAnswer / TrueFalse / Matching) + shared params (count, duration, +marks, −marks).
- MCQ adds: `optionCount` (default 4).
- Matching adds: `leftCount` (default 3) + `rightCount` (default 4).
- Render block config in a card per block; allow add / remove blocks dynamically.
- Defaults: questions=5, duration=60s, posMarks=1, negMarks=0.25.

### Assessment Actions Menu (Instructor)
Each assessment card/row exposes these actions — gate each by business rules:
- **Edit** — disabled if any student attempt exists.
- **Delete** — disabled if any student attempt exists; show confirmation modal.
- **View Prompt** — opens a read-only modal showing the AI-constructed prompt.
- **Preview as Student** — navigates to a demo/preview mode inside `ExamLayout`.
- **Manage Enrollment** — open enrollment management panel.
- **View Analytics** — navigate to analytics page with per-student + per-question breakdown.
- **Generate Physical Paper** — opens the physical paper modal (see below).

### Physical Paper Modal (Instructor)
Fields collected before generating:
- Institute Name · Teacher Name · Subject Name
- Paper Date · Paper Time · Paper Duration · Total Marks · Notes
- Page Size (dropdown: A4 / A5 / Letter)
- Font size preference (header vs body, user-adjustable)
- Output format (PDF / DOCX)

Format rules applied to output:
- Questions: bold · Options: normal weight · Header: larger font (user-specified size)
- Answer key included (separate page or appended).

### XAI Feedback Page (Student Post-Submission)
Display in order:
1. Score summary card (marks earned / total).
2. Per-question rows: question text · student's answer · correct answer · contextual snippet from source.
3. "Explain this" button per question — triggers AI explanation call.
4. Personalized Study Guide section (AI-generated, collapsible or separate tab).
5. All content rendered in the assessment's selected language (respect `dir` for RTL languages).

### Resource Upload (Instructor)
- Accepted file types: PDF, DOCX, TXT.
- Accepted link types: video URL (YouTube etc.), web page URL.
- Show upload progress; display vectorization status after upload.
- Each resource card shows: name, type icon, visibility toggle, delete action.

## Component Conventions
- Pages under `src/app/` are orchestration-only or route entry points. Actual page rendering logic belongs in `src/views/`.
- Reusable UI in `src/components/`. Extract any element used in 2+ pages.
- Utilities in `src/utils/` or `src/lib/`. No inline helper functions that belong in utils.
- Use `react-hot-toast` for all toast notifications. Never `alert()`.
- Confirmation before any destructive action (delete assessment, delete key, remove student) via the shared `Modal` component.

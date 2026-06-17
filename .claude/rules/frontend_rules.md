---
trigger: always_on
glob: "grade-wise-ai-frontend-next/**/*.{js,jsx,ts,tsx,css}"
description: "Frontend stack, routing, state management, API client, auth, hooks, styling, and GradeWise-specific component patterns."
---

# Frontend Rules — grade-wise-ai-frontend-next

**Stack**: React 19.2.7 · Next.js 16.2.9 (App Router, Turbopack) · Tailwind CSS v4 · Zustand 5.0.14 · Zod 4.4.3 · ESLint 10.5.0

---

## Key Dependencies (exact versions)

| Package | Version | Purpose |
|---------|---------|---------|
| next | 16.2.9 | App Router, SSR, routing |
| react / react-dom | 19.2.7 | UI framework |
| tailwindcss | 4 (via @tailwindcss/postcss) | Styling |
| zustand | 5.0.14 | Global state management |
| zod | 4.4.3 | Schema validation |
| react-hook-form | 7.79.0 | Form handling |
| @hookform/resolvers | 5.4.0 | Zod ↔ react-hook-form bridge |
| axios | 1.18.0 | HTTP client |
| react-hot-toast | 2.6.0 | Toast notifications |
| lucide-react | 1.20.0 | SVG icon set |
| react-icons | 5.6.0 | Additional icons (FontAwesome via `react-icons/fa`) |
| firebase | 12.15.0 | Google OAuth (signInWithPopup) |
| @react-oauth/google | 0.13.5 | Google OAuth button |
| react-google-recaptcha | 3.1.0 | reCAPTCHA v3 |
| socket.io-client | 4.8.3 | WebSocket (assessment progress streaming) |
| chart.js + react-chartjs-2 | 4.5.1 / 5.3.1 | Analytics charts (instructor) |
| recharts | 3.8.1 | Additional chart components |
| jspdf + jspdf-autotable | 4.2.1 / 5.0.8 | PDF report generation |
| html2canvas | 1.4.1 | Screenshot capture for export |
| docx | 9.7.1 | DOCX physical paper export |
| pdf-lib | 1.17.1 | PDF manipulation |
| file-saver | 2.0.5 | Browser file downloads |
| lodash | 4.18.1 | Utility functions |

---

## Project Structure

```
src/
├── app/                        # Next.js App Router — thin page wrappers only
│   ├── layout.js               # RootLayout: global meta + Toaster
│   ├── globals.css             # Tailwind v4 + custom animations
│   ├── (auth)/                 # Auth route group (no navbar)
│   ├── (dashboard)/            # Protected route group (Navbar + Footer)
│   │   ├── layout.jsx          # DashboardLayout with dynamic Navbar/Footer
│   │   └── ...role-specific routes
│   └── (exam)/                 # Assessment taking — no navigation, ExamLayout
│       └── student/assessments/[assessmentId]/take/page.jsx
├── api/                        # API integration layer (NOT Next.js API routes)
│   ├── auth.api.js
│   ├── assessment.api.js
│   ├── studentAssessment.api.js
│   ├── resource.api.js
│   ├── instructorAnalytics.api.js
│   ├── studentAnalytics.api.js
│   └── config.api.js
├── components/                 # Reusable React components
│   ├── ProtectedRoutes.jsx     # Role-based access wrapper
│   ├── Navbar.jsx              # Role-aware navigation
│   ├── Footer.jsx
│   ├── ErrorBoundary.jsx
│   ├── PhysicalPaperModal.jsx  # Physical exam paper generation modal
│   ├── QuestionCard.jsx
│   └── ui/                     # UI primitives (custom — NOT shadcn/ui)
│       ├── Card.jsx            # Card, CardHeader, CardContent
│       ├── LoadingSpinner.jsx  # size/type/color props
│       └── Modal.jsx
├── config/
│   ├── firebase.js             # Firebase app + GoogleAuthProvider init
│   └── captcha.js              # reCAPTCHA v3 helpers (loadRecaptcha, getCaptchaToken)
├── hooks/
│   ├── useHydrated.js          # Returns false until mount (prevents SSR mismatch)
│   ├── useAssessmentSocket.js  # socket.io listener for assessment progress events
│   ├── useAssessmentPreview.js # Combines getAssessmentById + fetchPreviewQuestions
│   └── useRecaptchaInit.js     # Loads reCAPTCHA script on mount
├── lib/
│   ├── apiClient.js            # Axios instance with advanced interceptors
│   └── react-router-dom-mock.js  # Shim: maps react-router-dom API → Next.js
├── scheema/                    # Zod validation schemas (folder name has intentional typo — do NOT rename)
│   ├── authSchemas.js          # loginSchema, signupSchema
│   ├── assessmentSchemas.js    # createAssessmentSchema (with question blocks)
│   ├── editAssessmnetSchemas.js
│   ├── passwordSchemas.js
│   ├── resourceSchema.js       # file MIME types, size limits (10 MB max)
│   └── studentSchemas.js
├── store/                      # Zustand stores (one per domain)
│   ├── authStore.js
│   ├── assessmentStore.js
│   ├── studentAssessmentStore.js
│   ├── resourceStore.js
│   ├── useInstructorAssessmentAnalyticsStore.js
│   └── useStudentAnalyticsStore.js
├── utils/
│   ├── redirectByRole.js       # Role → route mapping helper
│   ├── promptGenerator.js      # Build AI assessment prompts
│   ├── pdfGenerator.js         # jsPDF export utilities (373 lines)
│   ├── docxGenerator.js        # docx export utilities (220 lines)
│   ├── paperUtils.js           # Physical paper formatting helpers
│   └── translations.js         # i18n map (EN/AR/UR/FA, ~400 strings)
└── views/                      # Page-level rendering components (kept for ssr:false boundary)
    ├── Home.jsx
    ├── Login.jsx, Signup.jsx, ...
    ├── Admin/
    ├── Instructor/AssessmentManagement/
    ├── Student/AssesmentManagement/
    └── SuperAdmin/
```

---

## Routing & Layouts

- **App Router** route groups: `(auth)`, `(dashboard)`, `(exam)`
- Every page under `src/app/` is a thin wrapper that dynamically imports the real view:
  ```jsx
  "use client";
  import dynamic from "next/dynamic";
  const MyView = dynamic(() => import("@/views/.../MyView"), { ssr: false });
  export default function Page() {
    return (
      <ProtectedRoute requiredRole="instructor">
        <MyView />
      </ProtectedRoute>
    );
  }
  ```
  `ssr: false` is **required** on all view imports — Zustand persist + Firebase use browser APIs.
- Layouts:
  - `RootLayout` (`app/layout.js`) — global metadata + Toaster
  - `DashboardLayout` (`app/(dashboard)/layout.jsx`) — Navbar + Footer
  - `ExamLayout` (`app/(exam)/layout.jsx`) — zero navigation, `dir` prop for RTL/LTR

---

## React-Router-Dom Mock (IMPORTANT)

All views in `src/views/` import from `"react-router-dom"`. This is intentional — `next.config.mjs` aliases the package to `src/lib/react-router-dom-mock.js`, which re-exports Next.js equivalents:

| react-router-dom import | Actual implementation |
|-------------------------|----------------------|
| `Link` | wraps `next/link` (maps `to` prop → `href`) |
| `useNavigate()` | returns `router.push` / `router.replace` from `next/navigation` |
| `useParams()` | wraps `useParams` from `next/navigation` |
| `useLocation()` | returns `{ pathname }` from `usePathname` |
| `useSearchParams()` | wraps Next.js `useSearchParams` |
| `Navigate` | `useEffect`-based redirect component |

**Rules:**
- Do NOT import from `react-router-dom` in `src/app/`, `src/components/`, `src/hooks/`, or `src/lib/`. Use `next/link` and `next/navigation` there.
- For `src/views/` files, the mock import is acceptable.
- When creating a **new view**, prefer native Next.js imports to keep the migration moving forward.

---

## API Client (`src/lib/apiClient.js`)

The axios instance has production-grade interceptors. Always use it for all API calls — never create bare `axios` instances.

- **Request interceptor:**
  - Offline guard (`navigator.onLine` check)
  - Performance timing
  - Dynamic timeout: **120s** for heavy endpoints (preview, generate, take, submit, resources, blob); **15s** otherwise
  - Attaches `Authorization: Bearer <token>` read from localStorage

- **Response interceptor:**
  - Automatic retry on GET requests only (max 3, exponential backoff + jitter): triggers on network error, ECONNABORTED, 408/503/504
  - Error normalization: all errors expose `{ message, status, isNetworkError, isOffline }`
  - **401 handler:** clears localStorage and redirects to `/login` via `window.location.href`

- **Deduplication:** concurrent identical GET requests (same URL + params) share one in-flight promise

---

## State Management — Zustand 5

All global state lives in `src/store/`. **No Redux. No React Context for shared/global state.**

| Store | Key State | Key Actions |
|-------|-----------|-------------|
| `authStore` | `token`, `user { id, name, email, role }` | `login`, `googleAuth`, `signup`, `registerStudent`, `logout`, `getUsers`, `changeUserRole`, `deleteUser` |
| `assessmentStore` | `assessments[]`, `currentAssessment`, `enrolledStudents[]` | `getInstructorAssessments`, `createAssessment`, `updateAssessment`, `deleteAssessment`, `generatePhysicalPaper`, `enrollStudent`, `unenrollStudent`, `fetchPreviewQuestions` |
| `studentAssessmentStore` | `assessmentQuestions[]`, `timeRemaining`, `attemptId`, `submission` | `startAssessment`, `updateAnswer`, `submitAssessment`, `printPaper`, `getSubmissionDetails` |
| `resourceStore` | `resources[]` | `fetchResources`, `uploadResources`, `deleteResource` |
| `useInstructorAssessmentAnalyticsStore` | `overview { assessments, executedAssessments, resources }`, `students[]`, `studentQuestions[]` | `getInstructorOverview`, `fetchAssessments`, `fetchAssessmentStudents`, `fetchStudentQuestions` |
| `useStudentAnalyticsStore` | `assessments[]`, `analytics`, `performance[]`, `recommendations` | `fetchOverview`, `fetchPerformance`, `fetchRecommendations`, `fetchAssessmentDetails`, `downloadReport` |

**Auth persistence:** localStorage via Zustand `persist` middleware, key: `"auth-storage"`.

**Critical pattern:** Zustand actions are stable references across renders. For one-time data fetches on mount, always use `useEffect(() => { fetchData(); }, [])` — do NOT include store functions in the dependency array.

---

## Hydration Safety

Since the app uses Zustand localStorage persist and Firebase (browser APIs), SSR can cause hydration mismatches.

- Use `useHydrated()` hook before reading any persisted auth state
- `ProtectedRoute` renders `<LoadingSpinner />` until hydrated, then performs auth checks
- All views imported with `ssr: false` — this is the primary guard
- Never access `localStorage`, `window`, or `document` at module top level

---

## Route Protection

```jsx
<ProtectedRoute requiredRole={["instructor", "admin", "super_admin"]}>
  <MyView />
</ProtectedRoute>
```

`ProtectedRoute` flow:
1. Shows `<LoadingSpinner />` until `useHydrated()` is true
2. Checks `authStore.token` and `authStore.user.role`
3. `router.replace("/login")` if no token; `router.replace("/")` if wrong role
4. Returns `children` when authorized

---

## Forms

- Every form: `react-hook-form` + Zod schema from `src/scheema/` via `@hookform/resolvers/zod`
- The schema folder is named `scheema/` (typo is intentional — do not rename, it would break all imports)
- Instant field-level feedback: red border on invalid field, submit button disabled while loading
- Use `react-hot-toast` for all success/error notifications — never `alert()`

---

## Authentication — Firebase + Custom JWT

- **Email/password**: custom backend JWT via `auth.api.js`
- **Google OAuth**: Firebase `signInWithPopup` → Firebase ID token → backend → custom JWT
- Config: `src/config/firebase.js` (Firebase app + GoogleAuthProvider init)
- **reCAPTCHA v3**: required on signup — `src/config/captcha.js` + `useRecaptchaInit` hook

---

## Custom Hooks

| Hook | Returns | When to Use |
|------|---------|-------------|
| `useHydrated` | `boolean` | Any component reading Zustand persist / localStorage |
| `useAssessmentSocket` | `{ socketId, progress, progressMessage }` | Assessment taking and preview (live AI generation progress) |
| `useAssessmentPreview` | `{ assessment, previewQuestions }` | Assessment preview page |
| `useRecaptchaInit` | void | Signup page — loads reCAPTCHA script |

---

## Styling — Tailwind CSS v4

- Init via `@import "tailwindcss";` in `src/app/globals.css` — no tailwind.config.js needed
- Dark mode: `html.dark` class applied by default (`className="... dark"` on `<html>` in RootLayout)
- **Custom animations** in `globals.css`: `animate-blob` (7s), `animate-float` (3s), `animate-gradient` (3s), `animate-fade-in` (0.6s); delay utilities: `animation-delay-2000`, `animation-delay-4000`
- Color palette: slate · indigo · violet · emerald with gradient backgrounds — no plain red/blue/green
- Fonts: Outfit, Inter, or Roboto — no system/browser defaults
- Transitions: `150ms–300ms` ease-out on hover/focus/active — no instant state snaps
- Icons: `lucide-react` or `react-icons/fa` SVGs only — no raw emojis in controls or nav
- Touch targets: minimum `44×44px`
- WCAG contrast ≥ 4.5:1 in both light and dark mode
- UI primitives are custom components in `src/components/ui/` — this project does **not** use shadcn/ui

---

## Charts & Data Visualization

- **Instructor analytics**: Chart.js via `react-chartjs-2` — bar, line, doughnut charts
- **Student analytics**: Recharts — performance/trend line charts
- Match chart type to data: trend → line, comparison → bar, proportion → donut/pie
- Always include legend, tooltips, and accessible color pairs (never red/green only for colorblind safety)

---

## PDF / DOCX Export

- `src/utils/pdfGenerator.js` — jsPDF + jspdf-autotable for student report PDFs
- `src/utils/docxGenerator.js` — docx library for physical paper DOCX export
- `assessmentStore.generatePhysicalPaper()` — handles blob response; caller must `URL.createObjectURL` + trigger download
- Physical paper modal: `src/components/PhysicalPaperModal.jsx`

---

## WebSocket (Assessment Progress)

- `socket.io-client` — used only via `useAssessmentSocket` hook
- Listens for `assessment-progress` events during AI question generation
- Only use in assessment taking and preview flows

---

## Multilingual & RTL (Student Assessment Pages)

- Languages: **English** (LTR) · **Urdu** (RTL) · **Arabic** (RTL) · **Persian** (RTL)
- Translation strings: `src/utils/translations.js` (~400 strings per language)
- Language selection before assessment starts; stored in component/Zustand state for the session
- On language change: set `dir` on `ExamLayout` root AND swap text via translation map
- RTL CSS: `flex-row-reverse`, `text-right` / `text-start`, `ps-*` / `pe-*` (RTL-safe spacing)
- AI generates question/answer content in the selected language

---

## Assessment-Specific Patterns

### Question Block Types (Instructor Create/Edit)
| Type | Extra params |
|------|-------------|
| MCQ (`multiple_choice`) | `optionCount` (default 4) |
| ShortAnswer | — |
| TrueFalse (`true_false`) | — |
| Matching | `leftCount` (default 3), `rightCount` (default 4) |

Shared per block: `question_count` (5), `duration_per_question` (60s), `positive_marks` (1), `negative_marks` (0.25)

### Assessment Actions (Instructor) — Gate by Business Rules
- **Edit** — disabled if `is_executed` is true (any student attempt exists)
- **Delete** — disabled if `is_executed`; show confirmation `Modal` first
- **View Prompt** — read-only modal
- **Preview** — navigate to ExamLayout preview route
- **Manage Enrollment** — enroll/unenroll students by email
- **View Analytics** — Chart.js / Recharts per-student + per-question breakdown
- **Generate Physical Paper** — `PhysicalPaperModal` → `assessmentStore.generatePhysicalPaper()` → blob download

### Physical Paper Modal Fields
Institute Name · Teacher Name · Subject Name · Paper Date · Paper Time · Paper Duration · Total Marks · Notes · Page Size (A4/A5/Letter) · Font sizes (header vs body) · Output format (PDF/DOCX)

### XAI Feedback Page (Student Post-Submission)
1. Score summary card (earned / total)
2. Per-question: question text · student's answer · correct answer · source snippet
3. "Explain this" button per question → AI explanation
4. Personalized Study Guide (AI-generated, collapsible)
5. All content in the assessment's selected language, `dir` respected

---

## Environment Variables

| Variable | Required | Default | Notes |
|----------|----------|---------|-------|
| `NEXT_PUBLIC_API_URL` | No | `http://localhost:5005` | Backend base URL |

API calls go through the Next.js rewrite (`/api/*` → `${NEXT_PUBLIC_API_URL}/api/*`). Never hardcode the backend URL in API files.

---

## next.config.mjs Settings

```js
// API proxy — all /api/* calls forward to backend
rewrites: [{ source: "/api/:path*", destination: "${NEXT_PUBLIC_API_URL}/api/:path*" }]

// react-router-dom alias (both webpack and turbopack must be set)
webpack: config.resolve.alias["react-router-dom"] = "./src/lib/react-router-dom-mock.js"
turbopack.resolveAlias: { "react-router-dom": "./src/lib/react-router-dom-mock.js" }
```

---

## Component Conventions

- Pages in `src/app/` are orchestration only — dynamic import + ProtectedRoute. No logic.
- Rendering logic belongs in `src/views/`. Reusable elements in `src/components/`.
- UI primitives in `src/components/ui/` — extend these before creating new ones.
- Custom hooks in `src/hooks/`. Never inline hook logic into views.
- Utilities in `src/utils/`. No inline helpers that belong in utils.
- `react-hot-toast` for all notifications. Never `alert()`.
- Confirm before any destructive action via the shared `Modal` component.
- No `console.log` in production paths — `console.error` only.

---

## Dependency Maintenance Policy

**Always keep dependencies at the latest stable version.** Run `npm outdated` before any major feature work and upgrade anything flagged.

### Upgrade Decision Matrix
| Semver change | Action |
|---------------|--------|
| Patch (x.y.**Z**) | Upgrade immediately — always safe |
| Minor (x.**Y**.z) | Upgrade immediately — backwards-compatible by spec |
| Major (**X**.y.z) | Check release notes + peer deps first, then upgrade |

### Upgrade Steps
```bash
# 1. Identify outdated packages
npm outdated

# 2. Upgrade all safe packages at once
npm install pkg1@latest pkg2@latest ...

# 3. Verify — no remaining output = fully current
npm outdated

# 4. Check for vulnerabilities
npm audit
```

### Known Transitive Vulnerabilities (accepted, cannot self-fix)
| Package | Vulnerability | Why unfixable |
|---------|--------------|---------------|
| `next` → internal `postcss < 8.5.10` | PostCSS XSS via unescaped `</style>` (moderate) | `npm audit fix --force` downgrades Next to 9.3.3 — catastrophic. Awaiting Next.js internal patch. |

### Major Version Notes
- **eslint 9 → 10**: `eslint-config-next` declares `peerDependencies: { eslint: ">=9.0.0" }` — upgrade is safe.
- **Next.js**: Pin exact version (no `^` caret) to avoid accidental breaking-change updates between minors during active development.

### Rules for AI Agents
- When adding a **new dependency**, always use the latest stable version — never an old pinned version.
- Never add `--legacy-peer-deps` as a workaround; resolve the actual conflict.
- After any dependency change, run `npm outdated` to confirm no regressions.

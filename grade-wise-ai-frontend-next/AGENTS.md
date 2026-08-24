# Gradewise AI — Frontend Agent Rules

> **Stack:** Next.js 16 · React 19 · Tailwind 4 · Zustand 5 · TanStack Query 5 · Zod 4 · Playwright
> **Port:** 3000 (dev) | **Path:** `grade-wise-ai-frontend-next/`

---

## ⚠️ This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

---

## Quick Commands

```bash
npm run dev          # http://localhost:3000
npm run build        # production build
npm run lint         # ESLint flat config
npm run test:e2e     # Playwright E2E
npm run start        # serve production build
```

### Quality Gates (before every commit)

```bash
npm run build && npm run lint
```

---

## Non-Negotiables

1. **httpOnly cookie session** — `withCredentials: true` on all API calls. Never store JWT in localStorage/sessionStorage.
2. **Middleware auth** — `proxy.js` (Next.js 16 convention) checks `gradewise_token` cookie. Redirects unauthenticated to `/login?next=<path>`.
3. **Server state** — All data fetching via TanStack Query. No manual `useEffect` data fetching.
4. **Client state** — Zustand for auth user, theme, assessment-taking state, UI state only.
5. **Zod validation** — All forms use react-hook-form + Zod resolver. Shared validators in `src/schemas/fields.js`.
6. **No `any` types** — TypeScript strict mode. Use proper types for all props and API responses.
7. **Tailwind v4** — No `tailwind.config.js`. CSS-first config in `globals.css` with `@theme inline {}`.
8. **Dark mode** — Class-based (`.dark` on `<html>`). Use theme tokens, not hardcoded colors.

---

## Directory Structure

```
src/
├── app/                    # Next.js 16 App Router (thin page wrappers)
│   ├── (auth)/             # Login, signup, verify, forgot-password
│   │   ├── login/page.jsx
│   │   ├── signup/page.jsx
│   │   ├── verify/page.jsx
│   │   └── forgot-password/page.jsx
│   ├── (dashboard)/        # Instructor + Student dashboards
│   │   ├── dashboard/page.jsx
│   │   ├── assessments/page.jsx
│   │   ├── instructor-analytics/page.jsx
│   │   └── student-analytics/page.jsx
│   ├── (exam)/             # Exam taking layout (RTL support)
│   │   ├── taking/[assessmentId]/page.jsx
│   │   └── submission/[submissionId]/page.jsx
│   ├── layout.jsx          # Root layout (Providers, Toaster, globals.css)
│   ├── globals.css         # Tailwind v4 @theme tokens + dark mode
│   └── page.jsx            # Landing page redirect
├── components/
│   ├── ui/                 # Design system primitives
│   │   ├── Button.jsx      # Variants: primary, secondary, outline, ghost, danger, google
│   │   ├── Card.jsx        # Card, CardHeader, CardContent, CardTitle
│   │   ├── Input.jsx       # + InputLabel, InputError
│   │   ├── Modal.jsx       # Dialog-based modal (defaultOpen, onOpenChange)
│   │   ├── Badge.jsx       # Color variants: default, success, warning, danger, info
│   │   ├── Spinner.jsx     # Loading spinner (sm/md/lg)
│   │   ├── Alert.jsx       # Alert variants
│   │   ├── Select.jsx      # Select + SelectContent, SelectItem
│   │   ├── Tooltip.jsx     # Tooltip
│   │   └── ScrollArea.jsx  # Scroll area
│   ├── Layout/             # Sidebar, Header, NotificationBell, ThemeToggle
│   ├── ProtectedRoutes.jsx # Client-side route guard (useAuthStore)
│   ├── Providers.jsx       # Context wrapper (TanStack Query, theme, etc.)
│   ├── LandingPage.jsx     # Marketing landing page
│   └── PdfPreview.jsx      # PDF preview component
├── features/               # Domain modules
│   ├── auth/               # api.js + store.js (Zustand)
│   ├── assessments/        # api.js + store.js
│   ├── student-assessment/ # api.js + store.js (exam state)
│   ├── ai-config/          # api.js (super admin)
│   ├── resources/          # api.js + store.js
│   ├── instructor-analytics/ # api.js + store.js
│   ├── student-analytics/  # api.js + store.js
│   └── theme/              # resolveTheme.js + store.js
├── hooks/
│   └── useAssessmentTimer.js
├── lib/
│   ├── apiClient.js        # Axios instance (withCredentials, base URL)
│   ├── cn.js               # clsx + tailwind-merge
│   ├── firebase.js         # Firebase config + init
│   ├── emailVerification.js
│   ├── formatDate.js
│   ├── assessmentUtils.js
│   ├── resendVerification.js
│   └── studentHelpers.js
│   └── ui.js               # UI component catalog
├── proxy.js                # Next.js 16 middleware (auth gate)
├── schemas/                # Zod schemas
│   ├── authSchemas.js
│   ├── assessmentSchemas.js
│   ├── aiConfigSchemas.js
│   └── fields.js           # Shared field validators
└── views/                  # Page-level components by role
    ├── Auth/               # LoginView, SignupView, ForgotPasswordView, VerifyView
    ├── Instructor/         # DashboardView, AssessmentsView, etc.
    ├── Student/            # StudentDashboardView, AssessmentDetailView, etc.
    ├── Admin/              # AdminDashboardView
    ├── SuperAdmin/         # SuperAdminDashboardView, SuperAdminApiConfig.jsx
    └── Exam/               # ExamLayout, ExamQuestionView, ExamSubmittedView
```

---

## Feature Module Pattern

```
src/features/<domain>/
├── api.js     # API calls (uses shared apiClient)
└── store.js   # Zustand store (optional)
```

### API Pattern (`features/*/api.js`)

```javascript
import apiClient from '@/lib/apiClient';

export const featureApi = {
  getData: async (id) => {
    const { data } = await apiClient.get(`/api/<domain>/${id}`);
    return data;
  },
  createData: async (payload) => {
    const { data } = await apiClient.post('/api/<domain>', payload);
    return data;
  },
};
```

### Store Pattern (`features/*/store.js`)

```javascript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useFeatureStore = create(
  persist(
    (set, get) => ({
      // state
      data: null,
      // actions
      setData: (data) => set({ data }),
    }),
    { name: 'feature-storage' }
  )
);
```

---

## Component Conventions

### Button Variants

```jsx
<Button variant="primary">Save</Button>      // edu-teal bg
<Button variant="secondary">Cancel</Button>  // edu-navy bg
<Button variant="outline">Back</Button>      // border only
<Button variant="ghost">Close</Button>       // no bg
<Button variant="danger">Delete</Button>     // red bg
<Button variant="google">Sign in</Button>    // Google OAuth
```

### Modal Pattern

```jsx
<Modal open={open} onOpenChange={setOpen} title="Dialog Title">
  <Modal.Content>
    {/* body */}
  </Modal.Content>
  <Modal.Footer>
    <Button onClick={handleSave}>Save</Button>
  </Modal.Footer>
</Modal>
```

### Theme Tokens (Tailwind v4)

```css
@theme inline {
  --color-edu-navy: #0a1628;
  --color-edu-teal: #0d9488;
  --color-edu-sky: #0ea5e9;
  --color-edu-gold: #f59e0b;
  --font-quran: 'Amiri', serif;
}
```

Usage: `text-edu-navy`, `bg-edu-teal`, `font-quran`

---

## API Integration

### Axios Client (`lib/apiClient.js`)

```javascript
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,  // CRITICAL: sends httpOnly cookie
});
```

- **No Authorization header** — cookie handles auth
- **No token in request body** — cookie only
- **All requests** automatically include credentials

### TanStack Query Pattern

```javascript
import { useQuery, useMutation, useQueryClient } from '@tanstack/query-key-fn';

// Query
const { data, isLoading } = useQuery({
  queryKey: ['assessments'],
  queryFn: () => assessmentsApi.list(),
});

// Mutation
const queryClient = useQueryClient();
const mutation = useMutation({
  mutationFn: assessmentsApi.create,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['assessments'] });
  },
});
```

---

## Authentication Flow

1. **Login** → POST `/api/auth/login` → httpOnly cookie set → redirect to `/dashboard`
2. **Google Auth** → Firebase popup → `getIdToken()` → POST `/api/auth/google-auth` → cookie set
3. **Session check** → GET `/api/auth/me` → returns user object (used by `useAuthStore`)
4. **Logout** → POST `/api/auth/logout` → cookie cleared → redirect to `/login`
5. **Middleware** → `proxy.js` checks `gradewise_token` cookie on every request

---

## RBAC Enforcement

```jsx
// Component-level
<ProtectedRoutes allowedRoles={['instructor', 'admin', 'super_admin']}>
  <InstructorDashboard />
</ProtectedRoutes>

// Store-level
const user = useAuthStore((s) => s.user);
if (user?.role !== 'super_admin') return null;
```

Roles: `super_admin` > `admin` > `instructor` > `student`

---

## RTL Support

Exam layout supports RTL via:
- `dir="rtl"` attribute on exam container
- `font-quran` font family for Arabic/Persian/Urdu
- CSS logical properties (`margin-inline-start`, `padding-inline-end`)

---

## Common Pitfalls

1. **API URL** — Use `NEXT_PUBLIC_API_URL` env var, never hardcoded URLs
2. **Cookie auth** — `withCredentials: true` required on ALL API calls
3. **Middleware** — `proxy.js` runs on every request; keep it lightweight
4. **Dark mode** — Use `cn()` with `dark:` prefix, not hardcoded colors
5. **Tailwind v4** — No `tailwind.config.js`; all config in `globals.css`
6. **Zustand persist** — Use `persist` middleware for stores that survive refresh
7. **Query invalidation** — Always invalidate related queries after mutations
8. **Firebase config** — All `NEXT_PUBLIC_FIREBASE_*` vars must be set in `.env.local`
9. **RECAPTCHA** — Set `NEXT_PUBLIC_RECAPTCHA_SITE_KEY=dummy-key` to bypass
10. **Next.js 16** — Use `proxy.js` not `middleware.js`; read docs in `node_modules/next/dist/docs/`

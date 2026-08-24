# Gradewise AI — Frontend

> See `AGENTS.md` for full agent rules.

**Stack:** Next.js 16 · React 19 · Tailwind 4 · Zustand 5 · TanStack Query 5 · Zod 4 · Playwright
**Port:** 3000

## Quick Commands

```bash
npm run dev          # http://localhost:3000
npm run build        # production build
npm run lint         # ESLint flat config
npm run test:e2e     # Playwright E2E
```

## Key Files

| File | Purpose |
|------|---------|
| `src/proxy.js` | Next.js 16 middleware — auth gate |
| `src/lib/apiClient.js` | Axios instance (withCredentials) |
| `src/lib/cn.js` | clsx + tailwind-merge |
| `src/lib/firebase.js` | Firebase config |
| `src/components/ui/` | Design system primitives |
| `src/features/*/` | Domain modules (api.js + store.js) |
| `src/schemas/fields.js` | Shared Zod validators |
| `src/views/<Role>/` | Page-level components |
| `src/app/globals.css` | Tailwind v4 @theme tokens |

## Environment (`.env.local`)

```env
NEXT_PUBLIC_API_URL=https://gradewiseai.techmiresolutions.com
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=grade-wise-ai-v2
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=dummy-key
```

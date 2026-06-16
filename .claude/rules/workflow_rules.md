---
trigger: always_on
glob: "**/*"
description: "General software development quality standards, linter validations, build checks, and code hygiene rules."
---

# Workflow & Quality Rules

## Production Code Standards
- No hardcoded mock data, simulation blocks, or dummy text in active features.
- No `alert(...)` — use `react-hot-toast` or custom modal/toast notifications.
- No unresolved TODOs, placeholder components, or broken links at commit time.

## Verification Before Commit
| Step | Command | Directory |
|------|---------|-----------|
| Frontend build | `npm run build` | `grade-wise-ai-frontend-next/` |
| Frontend lint | `npm run lint` | `grade-wise-ai-frontend-next/` |
| Backend syntax | `node --check index.js` | `grade-wise-ai-backend-v2/` |

All three must pass before committing or submitting a task.

## Code Cleanliness
- Pages are orchestration-only. Reusable UI elements belong in `src/components/`.
- Extract repeated logic into `src/utils/` (frontend) or `grade-wise-ai-backend-v2/helper/` (backend).
- Naming conventions:
  - Variables/functions → `camelCase`
  - Classes/React components → `PascalCase`
  - Configuration constants → `UPPER_SNAKE_CASE`

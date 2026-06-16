---
trigger: always_on
glob: "grade-wise-ai-backend-v2/**/*.js"
description: "Backend development guidelines, ESM rules, DB compatibility rules, error handling, and server config instructions."
---

# Backend Rules — grade-wise-ai-backend-v2

**Stack**: Node.js · Express.js · ESM modules

## Imports
- ESM only: `import x from "y"`.
- Local imports **must** include `.js` extension.
  - ✓ `import pool from "./DB/db.js"`
  - ✗ `import pool from "./DB/db"`
- Verify all packages exist in `package.json` before importing.

## Database
- Supported engines: SQLite (dev) · MySQL/MariaDB · PostgreSQL (prod).
- Write **all** queries with PostgreSQL placeholders (`$1`, `$2`, …). `DB/db.js` translates at runtime:
  - `$1`, `$2` → `?` for SQLite/MySQL
  - `NOW()` and interval syntax → dialect equivalents
  - `::type` casting and `REGEXP` → dialect equivalents
  - `ON CONFLICT` → MySQL `ON DUPLICATE KEY` / SQLite equivalent
- Never write dialect-specific SQL in controllers or repositories. Trust `DB/db.js`.
- Custom tables/migrations must align with schemas defined in `DB/db.js`.

## Error Handling
- Wrap every controller in `try-catch`.
- Log full error + stack trace to `console.error`.
- Return: `{ success: false, message: "<human-readable description>" }`.
- No uncaught promise rejections — always `.catch()` or `await` inside `try-catch`.

## Config & Seeding
- API keys (`GEMINI_KEYS`, `GROQ_KEYS`, etc.) live in the `system_configs` table, seeded from env vars at bootstrap.
- Default super admin `superadmin@gmail.com` is seeded on startup — role must be `super_admin`.

# Gradwise AI - Onboarding & Conventions

This file outlines the workspace structure, build/run commands, coding guidelines, and the rules/skills configuration for Gradwise AI.

---

## 📂 Repository Structure

- **Backend Component**: `grade-wise-ai-backend-v2/` (Node.js, Express, ESM Modules)
- **Frontend Component**: `grade-wise-ai-frontend-next/` (React 19, Next.js 16 App Router, Tailwind CSS v4, Zustand)

---

## 🤖 Agent Rules & Skills Architecture

This project is configured with localized guidelines and custom agent skills to ensure consistency when code is modified by AI agents (e.g. Gemini/Antigravity or Claude Code).

### 1. Workspace Rules
Rules are grouped into context-specific markdown files with trigger conditions:
- **Antigravity rules**: Located in [.agent/rules/](file:///c:/Users/Hassan/Desktop/Gradwise-zohair/.agent/rules/)
- **Claude rules**: Mirrored in [.claude/rules/](file:///c:/Users/Hassan/Desktop/Gradwise-zohair/.claude/rules/)
- **Cursor rules**: Maintained at [.cursorrules](file:///c:/Users/Hassan/Desktop/Gradwise-zohair/.cursorrules)

*Files:*
- `domain_rules.md`: **Full application domain model** — RBAC roles, assessment system, question block types, physical paper generation, multilingual/RTL support, XAI feedback, AI provider configuration, business rules. Read this when building or modifying any feature.
- `antigravity_rules.md`: Connection parameters, model details, agent design, connection lifecycles, hooks.
- `backend_rules.md`: Node/Express, ESM import syntax (extensions), database translation, controller error patterns.
- `frontend_rules.md`: React 19, Zustand stores, Zod schemas with react-hook-form, routing, lazy loading, multilingual/RTL, assessment-specific component patterns.
- `project_rules.md`: Repository structure, commands, role hierarchy quick-ref, key routes table.
- `ui.md`: Front-End typography, harmonious HSL palettes, transitions, minimum hit areas.
- `workflow_rules.md`: No placeholders rule, build check instructions, code cleanliness.

### 2. Local Custom Skills
Specialized skills are installed locally inside the workspace to extend agent capabilities:
- **Antigravity skills**: Located in [.agent/skills/](file:///c:/Users/Hassan/Desktop/Gradwise-zohair/.agent/skills/)
- **Claude skills**: Mirrored in [.claude/skills/](file:///c:/Users/Hassan/Desktop/Gradwise-zohair/.claude/skills/)

*Active Skills:*
- `ui-ux-pro-max`: Premium UI design guidelines and styling patterns.
- `ui-styling`: Custom style and design specifications.
- `design`: Logo and media assets generator.
- `design-system`: Token configurations.
- `slides`: Dynamic HTML presentation layout generation.
- `banner-design`: Website hero and social media creative banner generator.
- `brand`: Messaging standards and brand compliance.
- `google-antigravity-sdk`: Agent orchestrator and connection helper (Antigravity only).

---

## 🚀 Commands

### Backend (`grade-wise-ai-backend-v2`)
- **Run dev server**: `npm run dev` (Runs nodemon index.js)
- **Start server**: `npm start` (Runs node index.js)
- **Syntax check**: `node --check index.js`

### Frontend (`grade-wise-ai-frontend-next`)
- **Run dev server**: `npm run dev -- --webpack` (Launches Next.js in Webpack mode)
- **Build production app**: `npm run build`
- **Start production server**: `npm run start`
- **Run linter**: `npm run lint`

---

## 💡 Coding Guidelines & Conventions

### Backend (Node/Express/ESM)
- **Module Imports**: ESM syntax only. Local imports **must** include the `.js` extension (e.g. `import pool from "./DB/db.js"`).
- **Database Access**: Write standard queries with Postgres placeholders (`$1`, `$2`). The custom database wrapper in `DB/db.js` translates them dynamically to SQLite or MySQL depending on the environment. Do not write dialect-specific code in controllers.
- **Error Handling**: Standardize error reporting via try-catch and return structured `{ success: false, message: ... }` JSON payloads.

### Frontend (React/Next.js/Tailwind v4)
- **State Management**: Use Zustand stores for global components state. Do not introduce Redux.
- **Form Validation**: Define schemas using Zod under `src/scheema/` and validate using React Hook Form.
- **Dynamic Client Components**: Legacy pages and components using browser globals/Zustand storage persist layers must be imported dynamically with `ssr: false`.
- **Styling**: Standard Tailwind CSS v4. No raw emojis in controls, minimum `44x44px` touch hit area, Outfit/Inter/Roboto fonts.

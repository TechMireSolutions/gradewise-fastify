---
name: ui-ux-design-consistency
description: Review and enforce project-wide UI/UX consistency, semantic Tailwind tokens, WCAG AA contrast, container queries, and RTL/LTR logical layouts.
---

# UI/UX Consistency & Modernization Skill

Use this skill when auditing, designing, or refactoring UI components and pages in GradeWise AI.

## Workflow

### 1. Audit Phase
Inspect components against the 6 consistency pillars:
1. **Neutrals**: Search for `slate-`, `gray-`, `zinc-`, `neutral-`. Replace with `bg-card`, `bg-background`, `border-border`, `text-foreground`, `text-muted-foreground`.
2. **Contrast**: Check all badge and status indicators in light mode. Flag any bare `text-*-400` on light surfaces. Convert to `text-*-700 dark:text-*-400`.
3. **Alignment**: Search for `text-left` and `text-right`. Convert to `text-start` and `text-end`. Verify `dir="rtl"` behaves correctly for Arabic/Urdu/Persian.
4. **Landmarks**: Ensure the view has `<MainLandmark>` wrapping the primary content.
5. **Form Controls**: Verify form inputs use `<Label>`, `<Input>`, `<Select>`, `<Textarea>`, and `<Button>`.
6. **Container Queries**: Check if reusable cards (stat tiles, block cards) have `@container` on the parent container.

### 2. Replacement Map

| Legacy / Deprecated Pattern | Modern Standard Pattern |
| :--- | :--- |
| `text-left` | `text-start` |
| `text-right` | `text-end` |
| `text-emerald-400` (light surface) | `text-emerald-700 dark:text-emerald-400` |
| `text-red-400` (light surface) | `text-red-700 dark:text-red-400` |
| `text-indigo-400` (light surface) | `text-indigo-700 dark:text-indigo-300` |
| `text-amber-400` (light surface) | `text-amber-700 dark:text-amber-400` |
| Ad-hoc `<span>` status pill | `<StatusBadge variant="...">` |
| Ad-hoc empty `div` / icon | `<EmptyState icon={...} title="..." description="..." />` |
| `<div className="max-w-5xl mx-auto...">` | `<MainLandmark className={pageInnerNarrow}>` |
| `<button className={btn.secondary}>` | `<Button variant="secondary">` |

### 3. Verification Gate
Whenever modifications are completed:
1. `npm run test:unit` in `grade-wise-ai-frontend-next` (verify all unit tests pass).
2. `npm run lint` in `grade-wise-ai-frontend-next` (verify 0 ESLint errors/warnings).
3. `npm run build` in `grade-wise-ai-frontend-next` (clean production build).
4. `npm run typecheck && npm run build && npm test` in `grade-wise-ai-backend-fastify` (verify backend integrity).

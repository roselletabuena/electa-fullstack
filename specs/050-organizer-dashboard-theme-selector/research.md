# Research & Architecture Decisions: Organizer Dashboard Theme Selector

**Feature ID**: `050-organizer-dashboard-theme-selector`  
**Ticket**: [VS-122](https://the-three-devsketeers.atlassian.net/browse/VS-122)  
**Date**: 2026-10-24  

---

## 1. Stack Context & Boundaries

| Concern | Decision | Rationale |
| --- | --- | --- |
| Framework | Next.js 16 App Router | Dashboard page uses React Server Component shell with client boundary in `GeneralBrandingForm.tsx`. |
| Language | TypeScript 5 (strict mode) | Zero `any`, zero `!`, explicit typing for all components and props. |
| Form Library | React Hook Form + Zod | `zodResolver(updateEventBrandingSchema)` provides client-side validation and dirty state tracking. |
| Theming System | `THEME_REGISTRY` in `src/features/events/theme/theme-registry.ts` | Single source of truth for all theme definitions, color tokens, and CSS variables. |
| Server Mutations | Server Action `updateEventBrandingAction` | Encapsulates ownership authorization (`requireEventOwnership`), atomic Prisma update, and audit logging. |
| Styling | Tailwind CSS v4 + Zero-Radius Brutalism | `--radius: 0px`, `rounded-none`, high-contrast WCAG 2.1 AA dual-theme compatibility. |

---

## 2. Technical Decisions & Rationale

### Decision 1: ThemeSelectorCard Component Design
- **Structure**: Each card in the theme selector grid displays:
  - Theme Display Name (e.g. "Electa Opal (Default)", "Pageant Editorial Haute-Couture")
  - Theme Description
  - Active Selection Radio / Checkmark Badge
  - Primary Swatches: Base Background, Surface Background, Primary Accent, Text Primary
  - Typography Tags: Heading Font and Body Font
- **State Handling**: Cards act as interactive radio-like buttons (`role="radio"`, `aria-checked`). Clicking invokes `onSelect(themeId)`.
- **Keyboard Navigation**: Accessible with Tab and Enter/Space selection.

### Decision 2: Real-Time Appearance Preview Card
- **Structure**: Rendered below or alongside the theme selection grid.
- **Dynamic Theming**: Applies the selected theme's CSS variables (`themeTokensToCssVars(themeDef.tokens)`) to an isolated preview container.
- **Demonstration Elements**:
  - Sample Event Header (Event Title, Category Sash, Live Badge)
  - Miniature Countdown Timer block
  - Sample Contestant Card snippet with Candidate Number and Dual-Action buttons
- **Benefits**: Organizers can immediately visualize how their public event page will look before committing the change.

### Decision 3: Form State & React Hook Form Integration
- **Controlled Integration**: In `GeneralBrandingForm.tsx`:
  - `theme: (event.theme as EventTheme) || "ELECTA_DEFAULT"` in `defaultValues`.
  - `setValue("theme", selectedTheme, { shouldDirty: true, shouldValidate: true })` when an organizer clicks a card.
  - `watchedTheme = useWatch({ control, name: "theme" }) ?? (event.theme || "ELECTA_DEFAULT")`.
  - Resetting the form (`reset()`) reverts `theme` to `event.theme` and clears `isDirty`.

### Decision 4: Audit Logging & Server Action
- `updateEventBrandingAction` records both `previousVal.theme` and `newVal.theme` in `eventAuditLog` to preserve complete provenance for audit trails.

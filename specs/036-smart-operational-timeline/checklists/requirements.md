# Requirements Quality & Acceptance Checklist: Smart Operational Timeline & Draft Recovery

**Feature ID**: `036-smart-operational-timeline`  
**Jira Key**: [VS-105](https://the-three-devsketeers.atlassian.net/browse/VS-105)  
**Parent Epic**: [VS-102](https://the-three-devsketeers.atlassian.net/browse/VS-102)  

---

## 1. Quality & Completeness ("Unit Tests for English")

- [x] **CH-1 Specificity**: Explicit durations specified (`+7 Days`, `+14 Days`, `+30 Days`).
- [x] **CH-2 Boundary Conditions**: Minimum 1-hour temporal window validation between `startsAt` and `endsAt`.
- [x] **CH-3 Storage Mechanism**: Tab-isolated browser `sessionStorage` with key `electa:create_event_draft`.
- [x] **CH-4 Recovery Lifecycle**: Automatically pre-fills form on mount if draft exists; displays dismissible banner; provides "Clear Draft" button.
- [x] **CH-5 Cleanup**: Draft deleted from `sessionStorage` upon successful event creation.
- [x] **CH-6 Zero-Radius Branding**: Strict `rounded-none` on chips, alerts, and buttons.
- [x] **CH-7 WCAG 2.1 AA Dual-Theme Parity**: Tested in light mode (`bg-white`, `border-slate-300`, `text-slate-700`) and dark mode (`dark:bg-white/5`, `dark:border-white/10`, `dark:text-slate-300`).
- [x] **CH-8 Keyboard & Accessibility**: Preset buttons have clear labels, `type="button"`, and appropriate `aria-pressed` attributes.

---

## 2. Test Verification Gate

- [ ] Vitest covers date calculation helper (`addDaysToDate`, formatting).
- [ ] Vitest covers preset chip click interaction updating `endsAt` and active styling.
- [ ] Vitest covers temporal warning and button disabled state for intervals < 1 hour.
- [ ] Vitest covers `sessionStorage` saving on change and restoring on mount.
- [ ] Vitest covers "Clear Draft" resetting form and wiping `sessionStorage`.
- [ ] Vitest covers draft removal on successful event submission.
- [ ] `npm run typecheck` passes with zero errors.
- [ ] `npm run lint` passes with zero errors.
- [ ] `npm run test:unit` passes 100%.

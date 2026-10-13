# Requirements Quality & Acceptance Checklist: Visual Design System & Brutalist Re-skin of /events/new

**Feature ID**: `037-brutalist-reskin-events-new`  
**Jira Key**: [VS-103](https://the-three-devsketeers.atlassian.net/browse/VS-103)  
**Parent Epic**: [VS-102](https://the-three-devsketeers.atlassian.net/browse/VS-102)  

---

## 1. Quality & Completeness Checklist

- [x] **CH-1 Zero-Radius Enforcement**: All cards, inputs, buttons, pills, badges, preview viewports, and modals in `/events/new` strictly exhibit `rounded-none`.
- [x] **CH-2 No Prohibited Border Radii**: Zero occurrences of `rounded-sm`, `rounded-md`, `rounded-lg`, `rounded-xl`, `rounded-2xl`, or `rounded-full` in `CreateEventForm`, `SlugAvailabilityBadge`, `BannerAspectPreview`, or `/events/new/page.tsx` (excluding pure circular spinners if any).
- [x] **CH-3 Typography Hierarchy**:
  - Headings strictly use `font-heading` (`Outfit`, font-extrabold/black).
  - Body copy, labels, and helper text strictly use `font-sans` (`Sora`).
  - Public URL slug, prefix `/events/`, and preview badges strictly use `font-mono` (`JetBrains Mono`).
- [x] **CH-4 Action Button Standard**: Primary button adheres to `.btn-primary` standard (`bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-extrabold uppercase tracking-widest text-xs border border-slate-900 dark:border-slate-100 rounded-none shadow-xs hover:bg-slate-800 dark:hover:bg-slate-200`).
- [x] **CH-5 Dual-Theme Parity & WCAG 2.1 AA**:
  - Light mode defaults to Opal Slate-50 background (`bg-slate-50`), crisp white card surface (`bg-white border-slate-300`), and `text-slate-900`.
  - Dark mode surfaces use Obsidian `dark:bg-[#0d1424]` and borders `dark:border-slate-800`.
  - Contrast ratios meet or exceed 4.5:1 for body copy and 3:1 for large text/UI components.
- [x] **CH-6 Interactive Slug Debounce & Availability**:
  - Title input automatically auto-populates sanitized slug when slug has not been manually edited.
  - After 300ms debounce, `SlugAvailabilityBadge` reflects status with zero-radius styling and live region semantics.
  - Reset to Title button restores auto-slug synchronization and satisfies touch target minimums (>= 44x44px).
- [x] **CH-7 Responsive Viewports**:
  - Fully responsive from mobile 390px up to desktop 1440px.
  - Action buttons stack vertically on small screens and align horizontally on desktop (`sm:flex-row`).

---

## 2. Test Verification Gate

- [ ] Vitest covers rendering of zero-radius brutalist card surface and inputs.
- [ ] Vitest covers brand typography font classes on headings, body, and slug.
- [ ] Vitest covers `.btn-primary` class and touch target sizing.
- [ ] Vitest covers debounced slug verification badge and mobile reset action.
- [ ] `npm run typecheck` passes with zero errors.
- [ ] `npm run lint` passes with zero errors.
- [ ] `npm run test:unit` passes 100%.

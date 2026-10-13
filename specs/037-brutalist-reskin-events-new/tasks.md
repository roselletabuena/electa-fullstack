# Implementation Tasks: Visual Design System & Brutalist Re-skin of /events/new

**Feature ID**: `037-brutalist-reskin-events-new`  
**Jira Key**: [VS-103](https://the-three-devsketeers.atlassian.net/browse/VS-103)  
**Parent Epic**: [VS-102](https://the-three-devsketeers.atlassian.net/browse/VS-102)  

---

## Task Matrix

- [x] **Task 1: Reskin `SlugAvailabilityBadge` with Zero-Radius Geometry and Dual-Theme WCAG 2.1 AA Contrast**
  - **File(s)**: `src/features/events/components/SlugAvailabilityBadge.tsx`, `tests/unit/events/slug-availability-badge.test.tsx`
  - Replace `rounded-full` with `rounded-none`.
  - Use `font-mono text-xs font-semibold uppercase tracking-wider`.
  - Ensure high-contrast colors across all 5 badge states (`checking`, `available`, `unavailable`, `reserved`, `invalid`).
  - Add unit tests verifying zero-radius classes and role/aria attributes.
  - Commits:
    - `test(events): [VS-103] add unit tests for brutalist zero-radius slug availability badge`
    - `feat(events): [VS-103] reskin SlugAvailabilityBadge with zero-radius geometry and accessible color contrast`

- [x] **Task 2: Reskin `BannerAspectPreview` with Brutalist Zero-Radius Surface and Brand Loading Indicator**
  - **File(s)**: `src/features/events/components/dashboard/BannerAspectPreview.tsx`, `tests/unit/events/banner-aspect-preview.test.tsx`
  - Remove all `rounded-lg`, `rounded-md`, `rounded-xl`, and `rounded-full` classes; replace with `rounded-none`.
  - Replace off-brand `border-violet-500` loading spinner with `border-sky-600 dark:border-sky-400`.
  - Aspect ratio pill toggles use zero-radius brutalist design tokens.
  - Add unit tests verifying aspect ratio switching and zero-radius geometry.
  - Commits:
    - `test(events): [VS-103] add unit tests for brutalist banner aspect preview`
    - `feat(events): [VS-103] reskin BannerAspectPreview with brutalist zero-radius geometry`

- [x] **Task 3: Overhaul `CreateEventForm` with Brutalist Cards, Inputs, Typography, Reset Action & .btn-primary Button**
  - **File(s)**: `src/features/events/components/CreateEventForm.tsx`
  - Form container card: `.card-style` crisp white surface (`bg-white border-slate-300 rounded-none shadow-xs dark:bg-[#0d1424] dark:border-slate-800`).
  - Headings: `font-heading font-bold text-slate-900 dark:text-white`.
  - Labels: `font-sans text-xs font-bold uppercase tracking-wider`.
  - Text inputs and textareas: `rounded-none border-slate-300 bg-white font-sans text-sm focus:border-sky-600 focus:ring-1 focus:ring-sky-600 dark:border-slate-700 dark:bg-slate-950`.
  - Slug prefix and input: `font-mono text-sm rounded-none`.
  - Reset to Title action: touch-friendly button with `min-h-[44px]` touch target, flex alignment, and focus rings.
  - Action buttons: `.btn-primary` styling (`bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-extrabold uppercase tracking-widest text-xs border border-slate-900 dark:border-slate-100 rounded-none min-h-[44px] px-6`) and secondary cancel button (`rounded-none min-h-[44px] px-5`).
  - Commit:
    - `feat(events): [VS-103] reskin CreateEventForm with brutalist tokens, zero-radius inputs, and btn-primary styling`

- [x] **Task 4: Polish `/events/new/page.tsx` Header, Breadcrumbs & Suspense Skeleton**
  - **File(s)**: `src/app/(dashboard)/events/new/page.tsx`, `tests/unit/events/create-event-page.test.tsx`
  - Ensure Opal Slate-50 default Light mode background and Obsidian Dark mode.
  - Breadcrumb button uses `font-sans font-bold` and touch-friendly target.
  - Header uses `font-heading font-black tracking-tight` (`Outfit`).
  - Setup wizard badge uses `rounded-none`.
  - Suspense loading container uses `rounded-none border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/50`.
  - Commit:
    - `feat(events): [VS-103] apply brutalist page tokens and zero-radius geometry to /events/new page`

- [x] **Task 5: Comprehensive Unit Test Suite & Mobile Viewport / Touch Target Assertions**
  - **File(s)**: `tests/unit/events/create-event-form.test.tsx`
  - Assert zero-radius classes across form card, inputs, badges, and buttons.
  - Assert `font-mono` on slug input.
  - Assert `.btn-primary` classes on submit button.
  - Assert `min-h-[44px]` on interactive buttons.
  - Ensure all existing draft recovery, temporal window, and submission tests continue passing.
  - Commit:
    - `test(events): [VS-103] update CreateEventForm tests for brutalist zero-radius styling, typography, and touch targets`

- [ ] **Task 6: Convergence, Quality Gates & Auto PR**
  - Verify all tasks completed.
  - Execute `npm run typecheck`, `npm run lint`, `npm run test:unit`.
  - Execute `constitution-check`.
  - Push branch and create Pull Request via `gh pr create` with PR template in `.specify/pr-body.md`.
  - Transition Jira ticket `VS-103` to `Done`.

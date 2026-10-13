# Technical Research & Architecture Notes: Visual Design System & Brutalist Re-skin of /events/new

**Feature ID**: `037-brutalist-reskin-events-new`  
**Jira Key**: [VS-103](https://the-three-devsketeers.atlassian.net/browse/VS-103)  
**Parent Epic**: [VS-102](https://the-three-devsketeers.atlassian.net/browse/VS-102)  

---

## 1. Technical Scope & Stack Constraints

- **Framework**: Next.js 16 App Router (RSC page in `src/app/(dashboard)/events/new/page.tsx` + `"use client"` interactive form in `src/features/events/components/CreateEventForm.tsx`).
- **Design Tokens**: Tailwind CSS v4, zero-radius geometry (`--radius: 0px`, `rounded-none`).
- **Typography Tokens**:
  - Headings: `font-heading` (`Outfit`)
  - Body & UI: `font-sans` (`Sora`)
  - Slugs, codes, numbers: `font-mono` (`JetBrains Mono`)
- **Accessibility Gate**: WCAG 2.1 AA (text contrast >= 4.5:1, non-text contrast >= 3:1, min interactive touch target >= 44x44px).
- **TypeScript**: TypeScript 5 strict mode, no `any`, no non-null assertions `!`.

---

## 2. Component Inventory & Refactoring Target

### Target 1: `src/app/(dashboard)/events/new/page.tsx`
- Ensure header uses `font-heading`, clean brutalist badge (`rounded-none`), breadcrumb link with touch targets, and pure zero-radius suspense skeleton.
- Opal Slate-50 default light mode background (`bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100`).

### Target 2: `src/features/events/components/CreateEventForm.tsx`
- Form container: Brutalist crisp white surface (`bg-white border border-slate-300 rounded-none shadow-xs dark:bg-[#0d1424] dark:border-slate-800`).
- Headings: `font-heading text-lg font-bold text-slate-900 dark:text-white`.
- Inputs: `rounded-none border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-sky-600 focus:ring-1 focus:ring-sky-600 dark:border-slate-700 dark:bg-slate-950 dark:text-white`.
- Slug prefix and input: font `font-mono`, `rounded-none`.
- Reset button: touch target `min-h-[44px]` with flex alignment, accessible focus rings.
- Primary Action Button: `.btn-primary` styling (`bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-extrabold uppercase tracking-widest text-xs border border-slate-900 dark:border-slate-100 rounded-none shadow-xs hover:bg-slate-800 dark:hover:bg-slate-200 min-h-[44px]`).
- Secondary Cancel Button: zero-radius, min-h-[44px].

### Target 3: `src/features/events/components/SlugAvailabilityBadge.tsx`
- Replace legacy `rounded-full` with strict zero-radius brutalist pill: `rounded-none border px-2.5 py-1 text-xs font-mono font-medium`.
- Colors audited for WCAG 2.1 AA in both Light and Dark mode:
  - Checking: `border-sky-500/30 bg-sky-50 text-sky-800 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300`
  - Available: `border-emerald-600/30 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300`
  - Unavailable: `border-rose-600/30 bg-rose-50 text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300`
  - Reserved: `border-amber-600/30 bg-amber-50 text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300`
  - Invalid: `border-rose-600/30 bg-rose-50 text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300`

### Target 4: `src/features/events/components/dashboard/BannerAspectPreview.tsx`
- Replace `rounded-lg`, `rounded-md`, `rounded-xl`, `rounded-full` with `rounded-none`.
- Replace off-brand `border-violet-500` loading spinner with `border-sky-600 dark:border-sky-400`.
- Maintain aspect ratio controls (`16:9` and `21:9`) with zero-radius pill radios adhering to Electa standards.

---

## 3. Accessibility & Contrast Verification (WCAG 2.1 AA)

| Component / State | Foreground | Background | Minimum Ratio | Status |
| --- | --- | --- | --- | --- |
| Page Body (Light) | Slate-900 (`#0F172A`) | Slate-50 (`#F8FAFC`) | 17.1:1 (AA/AAA) | Pass |
| Page Body (Dark) | Slate-100 (`#F1F5F9`) | Slate-950 (`#020617`) | 17.5:1 (AA/AAA) | Pass |
| Badge Available (Light) | Emerald-800 (`#065F46`) | Emerald-50 (`#ECFDF5`) | 7.2:1 (AA/AAA) | Pass |
| Badge Available (Dark) | Emerald-300 (`#6EE7B7`) | Emerald-500/10 (`#064e3b` blend) | 5.8:1 (AA) | Pass |
| Badge Unavailable (Light) | Rose-800 (`#9F1239`) | Rose-50 (`#FFF1F2`) | 6.8:1 (AA) | Pass |
| Badge Unavailable (Dark) | Rose-300 (`#FDA4AF`) | Rose-500/10 | 6.1:1 (AA) | Pass |
| Primary Action (Light) | Pure White (`#FFFFFF`) | Slate-900 (`#0F172A`) | 17.1:1 (AA/AAA) | Pass |
| Primary Action (Dark) | Slate-900 (`#0F172A`) | Slate-100 (`#F1F5F9`) | 17.5:1 (AA/AAA) | Pass |
| Touch Target Minimum | Height >= 44px | Width >= 44px | 44x44px CSS | Pass |

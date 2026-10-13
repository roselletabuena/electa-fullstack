# Feature Specification: Visual Design System & Brutalist Re-skin of /events/new

**Feature ID**: `037-brutalist-reskin-events-new`  
**Jira Key**: [VS-103](https://the-three-devsketeers.atlassian.net/browse/VS-103)  
**Parent Epic**: [VS-102: Event Creation Experience & Organizer Onboarding Overhaul](https://the-three-devsketeers.atlassian.net/browse/VS-102)  
**Related Tickets**: [VS-105](https://the-three-devsketeers.atlassian.net/browse/VS-105), [VS-86](https://the-three-devsketeers.atlassian.net/browse/VS-86)  
**Status**: In Progress  
**Created**: 2026-10-13  

---

## 🎯 Executive Summary

The `/events/new` route serves as the primary gateway for competition organizers creating new pageants and competitions on Electa. In previous iterations, the page retained legacy rounded styling (`rounded-full`, `rounded-xl`, `rounded-md`), subtle off-brand colors, and lacked the distinctive brutalist polish mandated by the Electa design system.

This feature overhauls `/events/new` and its core subcomponents (`CreateEventForm`, `SlugAvailabilityBadge`, `BannerAspectPreview`, and the page container) to strictly enforce:
1. **Electa Zero-Radius Geometry**: Strict `rounded-none` / `--radius: 0px` across all cards, inputs, pills, badges, buttons, and preview viewports.
2. **Brand Typography System**: Headings rendered in `Outfit` (`font-heading`), body copy in `Sora` (`font-sans`/`font-body`), and slugs/codes in `JetBrains Mono` (`font-mono`).
3. **Dual-Theme WCAG 2.1 AA Parity**: Default Opal Slate-50 (`#F8FAFC`) with crisp pure white card surfaces (`#FFFFFF`) and Slate-900 typography in Light Mode; Obsidian (`#090D16`/`#0d1424`) in Dark Mode, ensuring >= 4.5:1 text contrast and >= 3:1 UI component contrast across both themes.
4. **Interactive Slug Verification & Reset**: Debounced real-time slug availability feedback badge with WCAG 2.1 AA compliant badges and mobile-friendly touch targets (>= 44x44px).
5. **Primary Action Button Styling**: Canonical `.btn-primary` styling (`bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-extrabold uppercase tracking-widest text-xs border border-slate-900 dark:border-slate-100`).

---

## 👥 Actors & User Roles

- **Competition Organizer**: Navigates to `/events/new` to register a new pageant event, relying on a legible, distraction-free brutalist interface with instant slug feedback.
- **Mobile Organizer**: Operates the form on mobile viewports (e.g. 390px width) with comfortable 44px+ touch targets for reset buttons, aspect ratio switches, and submit controls.
- **Accessibility & Screen Reader User**: Reads semantic labels, live regions (`aria-live="polite"`), and clear focus indicators in both light and dark modes.

---

## 📋 Functional Requirements

1. **FR-1 Zero-Radius Brutalist Layout**:
   - All interactive controls, cards, badges, inputs, aspect preview containers, and wrappers MUST exhibit `rounded-none`.
   - Remove all legacy `rounded-full`, `rounded-xl`, `rounded-lg`, and `rounded-md` classes from `/events/new` page and child components.

2. **FR-2 Brand Typography Enforcement**:
   - Headings (H1, H2) must use `font-heading` (`Outfit`, font-extrabold/black).
   - Body copy, labels, and helper descriptions must use `font-sans` (`Sora`).
   - Public URL slugs, prefix `/events/`, and preview badges must use `font-mono` (`JetBrains Mono`).

3. **FR-3 Dual-Theme Color & Contrast Compliance**:
   - Default Light Mode uses `#F8FAFC` background, pure white card surface (`bg-white border-slate-300`), and `text-slate-900`.
   - Dark Mode uses Obsidian (`dark:bg-slate-950` / `dark:bg-[#0d1424]`, `dark:border-slate-800`, `dark:text-white` / `dark:text-slate-100`).
   - Remove any off-brand gradients or colors (e.g., violet/indigo spinners). Use sky/slate tokens (`border-sky-500`, `text-sky-600`, etc.).
   - Ensure all badge states in `SlugAvailabilityBadge` achieve >= 4.5:1 contrast in both light and dark mode.

4. **FR-4 Interactive Slug Verification & Reset**:
   - Real-time debounced (300ms) check against `/api/events/check-slug`.
   - Zero-radius badge indicating checking, available, unavailable, reserved, or invalid states.
   - Touch-friendly `Reset to Title` button with min-h-[44px] touch target for mobile viewports.

5. **FR-5 Canonical Action Button Styling**:
   - Primary submit button adheres to Electa `.btn-primary` tokens: `bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-extrabold uppercase tracking-widest text-xs border border-slate-900 dark:border-slate-100 rounded-none shadow-xs hover:bg-slate-800 dark:hover:bg-slate-200 min-h-[44px] px-6`.
   - Cancel button adheres to secondary styling: `border border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white rounded-none min-h-[44px] px-5`.

---

## 🧪 Acceptance Criteria (Gherkin Scenarios)

### Scenario 1: Brutalist Zero-Radius Layout & Brand Tokens (Happy Path)
- **Given** an authenticated organizer navigates to `/events/new`,
- **When** the page renders in either Light Mode (Opal `#F8FAFC`) or Dark Mode (Obsidian `#090D16`),
- **Then** all inputs, buttons, cards, badges, and container elements strictly exhibit zero border-radius (`rounded-none`, `--radius: 0px`),
- **and Then** typography strictly uses `Outfit` for headings, `Sora` for body copy, and `JetBrains Mono` for slugs,
- **and Then** primary buttons use the `.btn-primary` styling (`bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-extrabold uppercase`).

### Scenario 2: Real-time Debounced Slug Verification (Validation & Error Handling)
- **Given** an organizer enters an Event Title (e.g. `"Miss Earth Philippines 2026"`),
- **When** they have not manually edited the slug input,
- **Then** the URL slug field is automatically populated with the sanitized slug (`"miss-earth-philippines-2026"`),
- **and Then** after 300ms of debounce, the `SlugAvailabilityBadge` queries `/api/events/check-slug` and visually displays whether the slug is available or taken with WCAG 2.1 AA compliant color contrast.

### Scenario 3: Mobile Viewport & Custom Slug Reset (Edge Case)
- **Given** an organizer on a mobile viewport (390px) has customized their slug,
- **When** they click the `"Reset to Title"` action,
- **Then** the slug is re-synchronized to the sanitized version of the current title and re-validated,
- **and Then** touch targets on all interactive buttons meet or exceed 44x44px.

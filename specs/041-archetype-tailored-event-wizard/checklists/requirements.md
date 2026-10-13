# Requirements Quality Checklist: Archetype-Tailored Event Wizard & Taxonomy Configuration UI

**Feature**: `041-archetype-tailored-event-wizard`  
**Ticket**: [VS-84](https://the-three-devsketeers.atlassian.net/browse/VS-84)  
**Date**: 2026-10-13  

---

## 1. Requirements Quality & Scope Completeness

- [x] **Clear Actor & Value Proposition**: Organizer can configure events tailored to student council, hackathon, pageant, or custom formats without confusing mismatched settings.
- [x] **Dynamic Form Adaptation**: Switching between archetypes updates taxonomy fields, terminology labels, and validation sub-schemas in real time.
- [x] **Form State Preservation**: Common event fields (`title`, `slug`, `startsAt`, `endsAt`, `bannerUrl`, `description`) remain intact when switching archetypes or stepping backwards/forwards in the wizard.
- [x] **Conditional Validation Rules**: Enforces that hackathons require at least one track/category before progression, and student council positions have valid seat limits (`maxSelectionsPerVoter >= 1`).
- [x] **Settings Tab Adaptation**: Dashboard settings tab (`CategoryAwardsSettingsForm`) dynamically renders positions/tracks or divisions based on the persisted event archetype.

---

## 2. Design System & Branding Enforcement (Electa Guidelines)

- [x] **Zero-Radius Geometry**: All buttons, inputs, cards, dialogs, badges, and tabs strictly use `--radius: 0px` (`rounded-none`).
- [x] **Light Mode Default**: Base background defaults to `#F8FAFC` (Opal Slate-50) with pure white `#FFFFFF` cards and `#CBD5E1` hairline borders.
- [x] **Dark Mode Parity**: All dark theme styles are properly scoped under `dark:` classes (`dark:bg-slate-950`, `dark:bg-[#0d1424]`, `dark:border-slate-800`).
- [x] **Typography Consistency**: Outfit headings (`font-heading font-black tracking-tight`), Sora body (`font-sans`), JetBrains Mono (`font-mono`) for metrics.
- [x] **Tailwind CSS v4 Compliance**: Uses `bg-linear-to-*` for gradients and fraction utilities (`aspect-16/9`) where applicable.

---

## 3. Accessibility & Usability (WCAG 2.1 AA)

- [x] **Contrast Requirements**: 4.5:1 minimum contrast for body text and 3:1 for large text/interactive borders across both light and dark modes.
- [x] **Touch Targets**: Minimum 44x44px touch targets on buttons, toggles, chips, and selector tiles.
- [x] **Screen Reader Support**: Archetype selector includes `role="radiogroup"`, `aria-checked`, and descriptive labels.
- [x] **Responsive Adaptation**: Zero horizontal scrolling or clipped forms on 320px mobile viewports.

---

## 4. Architectural & Constitution Standards (§I–§VI)

- [x] **§I Strict Type Safety**: No `any` or `!`. Explicit TypeScript interfaces for all inputs and DTOs.
- [x] **§II Server-First & Boundary Isolation**: Server Actions (`createEventAction`) validate inputs with Zod and return typed results. Client components isolated with `"use client"`.
- [x] **§III State Separation**: Server data managed via TanStack Query; client draft form state in React Hook Form + sessionStorage.
- [x] **§IV Security**: Authenticated session required for event creation and taxonomy modifications.
- [x] **§V Feature Colocation**: Components and hooks placed under `src/features/events/components/` and `src/features/events/hooks/`.
- [x] **§VI Test-First**: Comprehensive unit tests covering dynamic form adaptation, validation, and zero-radius styling in Vitest.

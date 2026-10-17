# Requirements Quality Checklist: Disable Non-Pageant Archetypes

**Feature ID**: `047-disable-non-pageant-archetypes`  
**Jira Key**: `VS-117`  
**Date**: 2026-10-17  

---

## 1. Specification & Acceptance Completeness

- [x] **Primary User Story**: Mike Cohn format defined with clear actor, outcome, and benefit.
- [x] **Scenario 1 (Pageant Selection)**: Verifies Beauty Pageant remains active, selectable, and displays the "Selected" badge.
- [x] **Scenario 2 (Disabled Archetypes)**: Verifies Student Council, Hackathon, and Custom Contest display "COMING SOON" pill badge, have `opacity-60 cursor-not-allowed` styling, and do not trigger selection on click or keyboard press.
- [x] **Scenario 3 (Backend Guardrail)**: Verifies Server Action and API endpoints reject non-pageant submissions with `400 BAD_REQUEST`.
- [x] **Scenario 4 (Accessibility)**: Verifies `aria-disabled="true"` and non-focusable or non-selectable keyboard behavior.

---

## 2. Electa Design System & Branding (§Branding)

- [x] **Light Mode Default**: Base styling defaults to Opal slate-50 and crisp white card surfaces.
- [x] **Strict Zero-Radius**: All badges, cards, and pill elements use `rounded-none` (`--radius: 0px`). No rounded pills allowed.
- [x] **Brand Typography**: Headings use Outfit (`font-heading`), body uses Sora (`font-sans`), numbers/badges use JetBrains Mono / Sora bold.
- [x] **No UI Slop**: Distinct border styling (`border-amber-300`, `dark:border-amber-700/60`) and intentional badge placement.

---

## 3. WCAG 2.1 AA Color Contrast Parity

- [x] **Light Theme Contrast**: "COMING SOON" badge foreground `#78350f` against background `#fef3c7` is **8.15:1** (exceeds 4.5:1 AA and 7.0:1 AAA).
- [x] **Dark Theme Contrast**: "COMING SOON" badge foreground `#fde68a` against `#451a03` / `#0d1424` is **12.03:1** (exceeds 4.5:1 AA and 7.0:1 AAA).
- [x] **Dual-Theme Scoping**: All dark mode classes properly scoped behind `dark:` variant classes; zero naked dark-mode text.

---

## 4. Electa Constitution Compliance (§I–§VI)

- [x] **§I Strict Type Safety**: Strict TypeScript 5; zero `any`; zero non-null assertions (`!`); typed Zod schemas.
- [x] **§II Server-First & Boundary Isolation**: Client component `"use client"` retained only where interaction occurs (`ArchetypeSelector`, `EventCreationWizard`); Server Action validated.
- [x] **§III State Separation**: Single source of truth in React Hook Form + Zod validation; no server state leaks into Zustand.
- [x] **§IV Secure-by-Design**: Authenticated session verified via `getSession()`; no raw `process.env` access.
- [x] **§V Vertical Slice Architecture**: Changes colocated under `src/features/events/` and `src/lib/validations/`.
- [x] **§VI Test-First & Quality Gates**: Unit tests in Vitest cover component rendering, interaction disabling, and boundary rejection.

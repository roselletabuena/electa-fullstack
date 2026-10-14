# Implementation Plan: Dedicated Judge Portal & Weighted Rubric Scorecard UI

**Feature ID**: `045-judge-portal-rubric-scorecard`  
**Ticket**: [VS-115](https://the-three-devsketeers.atlassian.net/browse/VS-115)  
**Parent Epic**: [VS-82](https://the-three-devsketeers.atlassian.net/browse/VS-82)  
**Status**: Ready for Implementation  

---

## 1. Architecture Overview & Component Boundaries

The Dedicated Judge Portal provides a focused, high-speed scoring experience for hackathon judges during live pitch sessions.

```
src/
├── app/(dashboard)/events/[slug]/judging/
│   └── page.tsx                     # Server component with auth check, data fetching & layout
└── features/hackathons/
    ├── components/
    │   ├── judging-progress-bar.tsx  # Accessible progress bar & filter pill controls
    │   ├── rubric-scorecard-modal.tsx# Scorecard dialog with 1-10 tactile controls & live calculation
    │   ├── judge-portal.tsx          # Client console managing grid, active modal & optimistic states
    │   └── judge-auth-guard.tsx      # Fallback UI for unauthorized users
    ├── actions/
    │   └── submit-scorecard.ts       # Server action (VS-114)
    ├── services/
    │   └── rubric-service.ts         # Math calculation, retrieval and persistence
    └── types/
        └── rubric.ts                 # Domain and UI DTOs
```

---

## 2. Technical Stack & Invariants

- **Zero-Radius Geometry**: All buttons, cards, modals, segmented rating chips, badges, and progress tracks MUST use `rounded-none`.
- **Default Light Theme**: Base surface is Opal Slate-50 (`#F8FAFC`), crisp white cards (`#FFFFFF`) with hairline slate-300 borders (`border border-slate-300`). Dark theme is scoped cleanly with `dark:`.
- **Accessibility**: Full WCAG 2.1 AA compliance with minimum 4.5:1 text contrast, accessible ARIA attributes (`role="radiogroup"`, `role="radio"`, `aria-checked`, `aria-live="polite"`), and keyboard accessibility (`1`–`9`, `0` for 10).
- **Type Safety**: TypeScript 5 strict mode, no `any`, no non-null assertions `!`.
- **Boundary Validation**: Server action validated with Zod, search params / params safely unwrapped with `await`.

---

## 3. Test Strategy & TDD Workflow

1. **Unit Tests**:
   - `judging-progress-bar.test.tsx`:
     - Renders correct count and percentage (`7/10 Evaluated (70%)`).
     - Toggles filter pills (`All`, `Pending Review`, `Completed`) and triggers `onFilterChange`.
     - Meets zero-radius and contrast requirements.
   - `rubric-scorecard-modal.test.tsx`:
     - Calculates live weighted composite score instantly on score selection.
     - Supports keyboard inputs (`1`–`9` and `0` for 10).
     - Validates missing criterion on final submit, scrolling to and displaying error message.
     - Emits draft save and final submit events with correct payloads.
   - `judge-portal.test.tsx`:
     - Filters projects based on active filter mode.
     - Opens scorecard modal when clicking evaluate on a project card.
     - Optimistically updates project card evaluation status when evaluation is submitted.
   - `judging-page.test.tsx`:
     - Server component rejects unauthenticated/non-judge users with forbidden/unauthorized state.
     - Renders judging portal for authorized judges.

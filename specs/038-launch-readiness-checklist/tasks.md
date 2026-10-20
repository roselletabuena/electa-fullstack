# Implementation Tasks: Launch Readiness Checklist

**Feature ID**: `038-launch-readiness-checklist`  
**Jira Key**: [VS-106](https://the-three-devsketeers.atlassian.net/browse/VS-106)

---

## Task Breakdown

### Phase 1: Setup & Domain Types

- [x] **Task 1.1**: Define Launch Readiness Types & Contracts
  - Create `src/features/events/types/launch-readiness.ts` with Zod schemas and TypeScript interfaces.
  - Export them from `src/features/events/types/index.ts`.
  - Ensure zero `any` and zero non-null assertions.

### Phase 2: Core Utility & Pure Business Logic

- [x] **Task 2.1**: Implement `computeLaunchReadinessSnapshot` Utility (TDD)
  - Write unit tests in `tests/unit/events/launch-readiness.test.ts` covering all milestone permutations (0/4, 1/4, 2/4, 3/4, 4/4 completed, draft vs published).
  - Implement `src/features/events/utils/launch-readiness.ts`.
  - Verify all utility tests pass.

### Phase 3: UI Component Implementation

- [x] **Task 3.1**: Implement `LaunchReadinessChecklist` Component (TDD)
  - Write component tests in `tests/unit/events/launch-readiness-checklist.test.tsx` verifying:
    - Rendering in DRAFT state with all 4 milestones, badges, and progress bar.
    - In-flow collapse/expand toggle behavior with localStorage persistence.
    - Deep links to Divisions (`tab=categories`), Contestants (`/contestants`), and Voting Rules (`tab=voting-rules`).
    - Compact "Ready & Live" banner when `publicationStatus === "PUBLISHED"`.
    - Dismissal behavior persisting to `localStorage`.
    - Dual-theme WCAG 2.1 AA compliant colors and zero-radius geometry.
  - Implement `src/features/events/components/dashboard/LaunchReadinessChecklist.tsx`.
  - Verify all component tests pass.

### Phase 4: Page Integration & End-to-End Verification

- [x] **Task 4.1**: Integrate Widget into Settings Page (`/events/[slug]/settings`)
  - Update `src/app/(dashboard)/events/[slug]/settings/page.tsx` to query counts and pass snapshot into `<LaunchReadinessChecklist />`.
  - Maintain `<Suspense>` boundary and server-first RSC performance.
- [x] **Task 4.2**: Full Quality Gate Verification
  - Run `npm run typecheck`, `npm run lint`, `npm run test:unit`.
  - Ensure 100% clean check and no regressions.

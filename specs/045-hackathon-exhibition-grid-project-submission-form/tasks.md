# Implementation Tasks: Hackathon Exhibition Grid & Project Submission Form

**Feature ID**: `045-hackathon-exhibition-grid-project-submission-form`  
**Ticket**: [VS-113](https://the-three-devsketeers.atlassian.net/browse/VS-113)  

---

## Phase 1: Setup & Contracts
- [ ] T001: Export contracts and action interfaces in `src/features/hackathons/types/submission.ts` and `src/features/hackathons/index.ts`

## Phase 2: Server Action & Mutation Logic (TDD)
- [ ] T002: Implement `src/features/hackathons/actions/submit-project.ts` with `getSession()` auth, Zod validation, and revalidation
- [ ] T003: Write comprehensive unit tests for `submit-project.ts` in `tests/unit/hackathons/submit-project-action.test.ts`

## Phase 3: Core UI Components (TDD)
- [ ] T004: Implement `src/features/hackathons/components/project-card.tsx` with zero-radius brutalist styling, track badges, and external link chips
- [ ] T005: Implement `src/features/hackathons/components/submission-form.tsx` dialog with form validation, team member inputs, and server action binding
- [ ] T006: Implement `src/features/hackathons/components/exhibition-grid.tsx` with `nuqs` track filtering, search, empty states, and modal trigger
- [ ] T007: Write unit tests in `tests/unit/hackathons/project-card.test.tsx` and `tests/unit/hackathons/exhibition-grid.test.tsx` covering all acceptance criteria scenarios

## Phase 4: Route Integration & Page Assembly
- [ ] T008: Implement `src/app/(public)/events/[slug]/projects/page.tsx` with RSC data loading, non-hackathon guards, and `<Suspense>` boundary
- [ ] T009: Export all new components in `src/features/hackathons/index.ts`

## Phase 5: Verification & Quality Gates
- [ ] T010: Run full test suite (`npm run test:unit`) and verify 100% pass
- [ ] T011: Run typecheck (`npm run typecheck`) and linter (`npm run lint`)
- [ ] T012: Perform code review and standards audit
- [ ] T013: Open Pull Request via `pr-creator` and post completion changelog to Jira VS-113

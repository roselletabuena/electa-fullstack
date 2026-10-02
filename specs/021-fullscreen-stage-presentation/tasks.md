# Implementation Tasks: Fullscreen Stage Presentation Mode for LED Screens

**Feature ID**: `021-fullscreen-stage-presentation`  
**Jira Key**: `VS-23`  
**Status**: Ready for Implementation

---

## Phase 1: Contracts, Types & Feature Slice Setup

- [ ] **Task 1.1**: Define TypeScript interfaces and Zod validation contracts in `src/features/stage-display/types/index.ts`.
- [ ] **Task 1.2**: Create feature barrel export in `src/features/stage-display/index.ts`.

---

## Phase 2: Stage Audio Synthesizer & Canvas Confetti (TDD)

- [ ] **Task 2.1**: Implement `sound-synthesizer.ts` using Web Audio API for chime, drumroll, and victory fanfare.
- [ ] **Task 2.2**: Implement `confetti-cannon.ts` for high-performance 60fps canvas particle rendering.
- [ ] **Task 2.3**: Write unit tests in `tests/unit/stage-display/sound-synthesizer.test.ts` and `tests/unit/stage-display/confetti-cannon.test.ts`.

---

## Phase 3: Stage UI Components & Electa Branding

- [ ] **Task 3.1**: Create `useStageHotkeys.ts` hook for keyboard shortcuts (`F`, `Space`, `ArrowRight`, `ArrowLeft`, `R`, `M`).
- [ ] **Task 3.2**: Create `StageOperatorDock.tsx` with zero-radius brutalist controls and audio/mode toggles.
- [ ] **Task 3.3**: Create `StageLiveTally.tsx` showing stage-scaled high-contrast live podium cards and ranking grid.
- [ ] **Task 3.4**: Create `StageWinnerReveal.tsx` featuring animated step-by-step rank unveil sequence with sound and confetti triggers.
- [ ] **Task 3.5**: Create `StageDisplayView.tsx` wrapping the stage canvas in 16:9 dark luxury styling.

---

## Phase 4: Dedicated Route & Integration

- [ ] **Task 4.1**: Create Next.js Server Component route `src/app/(public)/events/[slug]/stage-display/page.tsx` with data fetching, fallback, and Mystery Freeze shielding.
- [ ] **Task 4.2**: Add stage display link to event navigation / organizer dashboard quick actions.

---

## Phase 5: Verification & Quality Gate

- [ ] **Task 5.1**: Write component and integration unit tests in `tests/unit/stage-display/stage-display.test.tsx`.
- [ ] **Task 5.2**: Run `npm run typecheck`, `npm run lint`, and `npm run test:unit`.
- [ ] **Task 5.3**: Perform `constitution-check` and sync knowledge graph with `graphify-auto-sync`.

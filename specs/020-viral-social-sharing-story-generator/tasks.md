# Tasks: Viral Social Sharing "I Voted" Story Generator

**Input**: Design documents from `specs/020-viral-social-sharing-story-generator/`  
**Prerequisites**: `spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/story-generator.ts`

---

## Phase 1: Setup & Contracts

- [x] T001 [P] Create story types and schemas in `src/features/voting/types/story.ts`
- [x] T002 [P] Sync contracts with `specs/020-viral-social-sharing-story-generator/contracts/story-generator.ts`

---

## Phase 2: Foundational Utilities (Red-Green-Refactor)

- [x] T003 [P] Implement dynamic QR code generator helper in `src/features/voting/utils/qr-generator.ts`
- [x] T004 [P] Unit test QR generator helper in `tests/unit/voting/qr-generator.test.ts`
- [x] T005 [P] Implement offscreen 1080x1920 2D canvas drawing engine in `src/features/voting/utils/story-canvas-generator.ts`
- [x] T006 [P] Unit test canvas generator fallback & export logic in `tests/unit/voting/story-canvas-generator.test.ts`

---

## Phase 3: User Story 1 & 2 - UI Modal & Sharing Actions

- [x] T007 [P] Create responsive 9:16 Canvas preview component in `src/features/voting/components/StoryCardPreview.tsx`
- [x] T008 [P] Create 1-Tap Share, Download, and Copy Link buttons in `src/features/voting/components/StoryActionButtons.tsx`
- [x] T009 [P] Create post-vote celebration modal dialog in `src/features/voting/components/VoteStoryModal.tsx`
- [x] T010 Integrate `VoteStoryModal` trigger into voting completion flows in `src/features/events/components/EventPageClient.tsx` and `src/features/contestants/components/ContestantProfileModal.tsx`

---

## Phase 4: Polish & Verification

- [x] T011 Run full TypeScript compiler typecheck (`npm run typecheck`)
- [x] T012 Run complete unit test suite (`npm run test:unit`)
- [x] T013 Verify zero-radius geometry and WCAG 2.1 AA dual-theme contrast

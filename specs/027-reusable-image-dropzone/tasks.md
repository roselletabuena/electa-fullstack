# Tasks: Reusable Image Upload & Dropzone Component (VS-45)

**Feature**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)  
**Tracking Issue**: [VS-45](https://the-three-devsketeers.atlassian.net/browse/VS-45)  
**Parent Epic**: [VS-40](https://the-three-devsketeers.atlassian.net/browse/VS-40) ([Electa] Media & Image Management via AWS S3)  
**Status**: Ready for Implementation  

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish domain types, Zod schemas, and folder scaffolding for the media feature slice.

- [x] T001 [P] Create TypeScript interfaces and Zod validation schemas (`MediaFolder`, `UploadedMedia`, `UploadError`, `ImageDropzoneProps`, `UploadState`) in `src/features/media/types/index.ts`
- [x] T002 [P] Establish barrel export structure in `src/features/media/index.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core transport client for direct browser-to-S3 binary transfers with upload progress tracking.

**⚠️ CRITICAL**: Must complete before implementing User Story components.

### Tests for Foundational Prerequisites 🧪
- [x] T003 [P] Unit tests for S3 upload transport utility (XHR mock, progress event calculation, custom headers, abort signal) in `tests/unit/media/s3-upload-client.test.ts`

### Implementation for Foundational Prerequisites
- [x] T004 Implement Promise-wrapped `uploadToS3WithProgress()` utility with `xhr.upload.onprogress` and `abort()` handle in `src/features/media/utils/s3-upload-client.ts`

**Checkpoint**: Foundational transport client is operational and verified by unit tests.

---

## Phase 3: User Story 1 - Drag-and-Drop Image Upload with Direct S3 Transfer (Priority: P1) 🎯 MVP

**Goal**: Deliver a functioning client-side dropzone that accepts dropped or selected files, fetches a presigned upload URL from `/api/media/presigned-url`, uploads the binary directly to S3 with live progress, and emits the stored asset details.

**Independent Test**: Mount `<ImageDropzone folder="events/banners" onUploadComplete={...} />`, drop a valid 3MB JPEG image, verify that a presigned URL is requested, progress transitions from 0% to 100%, and `onUploadComplete` fires with the final asset key and public URL.

### Tests for User Story 1 🧪
> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**
- [x] T005 [P] [US1] Unit tests for `useImageUpload` hook (idle state, presigning handshake, upload dispatch, success callback) in `tests/unit/media/use-image-upload.test.ts`
- [x] T006 [P] [US1] Component tests for `ImageDropzone` (render drop area, file dragover/drop handlers, progress bar, preview thumbnail) in `tests/unit/media/image-dropzone.test.tsx`

### Implementation for User Story 1
- [x] T007 [US1] Implement `useImageUpload` headless hook managing file selection, presigned URL API request, and direct S3 upload in `src/features/media/hooks/use-image-upload.ts`
- [x] T008 [US1] Implement `<ImageDropzone />` component with zero-radius brutalist styling, drag-and-drop state listeners, progress bar, and preview in `src/features/media/components/ImageDropzone.tsx`
- [x] T009 [US1] Export `ImageDropzone` and `useImageUpload` through `src/features/media/index.ts`

**Checkpoint**: User Story 1 (MVP) is fully functional and independently verifiable.

---

## Phase 4: User Story 2 - Instant Client-Side Boundary Validation & Error Feedback (Priority: P2)

**Goal**: Prevent wasted network transfers by immediately rejecting files exceeding size thresholds (5MB avatars, 10MB banners) or with unsupported MIME types before initiating any network calls.

**Independent Test**: Select a 12MB file or a PDF/GIF; verify that the dropzone renders an immediate accessible error alert and dispatches zero HTTP requests to `/api/media/presigned-url` or AWS S3.

### Tests for User Story 2 🧪
- [x] T010 [P] [US2] Unit tests for client-side MIME and size boundary validation in `tests/unit/media/image-validation.test.ts`
- [x] T011 [P] [US2] Component tests verifying instant error alert rendering and zero-network dispatch in `tests/unit/media/image-dropzone-validation.test.tsx`

### Implementation for User Story 2
- [x] T012 [US2] Implement client-side validation logic (MIME whitelist, size checks, empty file checks) in `src/features/media/utils/client-validation.ts`
- [x] T013 [US2] Integrate validation into `useImageUpload` hook and render high-contrast error banners in `src/features/media/components/ImageDropzone.tsx`

**Checkpoint**: User Stories 1 AND 2 are both functional and testable independently.

---

## Phase 5: User Story 3 - Resilient Error Recovery & Transient Failure Retries (Priority: P3)

**Goal**: Enable users to abort active uploads and retry failed uploads with 1 click without losing unsaved parent form data.

**Independent Test**: Simulate an S3 network failure during upload; verify that an error state with a "Retry" button appears, and clicking "Retry" successfully recommences the upload without clearing parent form inputs.

### Tests for User Story 3 🧪
- [x] T014 [P] [US3] Unit tests for upload abort cancellation and transient error retry logic in `tests/unit/media/use-image-upload-retry.test.ts`
- [x] T015 [P] [US3] Component tests for Cancel button aborting active transfer and Retry button triggering upload re-attempt in `tests/unit/media/image-dropzone-retry.test.tsx`

### Implementation for User Story 3
- [x] T016 [US3] Add `cancelUpload()` and `retryUpload()` methods to `src/features/media/hooks/use-image-upload.ts`
- [x] T017 [US3] Add interactive "Cancel" and "Retry" buttons with brutalist styling in `src/features/media/components/ImageDropzone.tsx`

**Checkpoint**: User Stories 1, 2, and 3 are fully operational.

---

## Phase 6: User Story 4 - Keyboard Navigation & Screen Reader Accessibility (Priority: P4)

**Goal**: Deliver full WCAG 2.1 AA accessibility compliance including keyboard activation, visible focus rings, live region announcements, and dual-theme contrast.

**Independent Test**: Navigate to the dropzone using Tab only, press Space/Enter to trigger the file dialog, and verify that `aria-live="polite"` announces upload milestones (0%, 50%, 100%) and error messages.

### Tests for User Story 4 🧪
- [x] T018 [P] [US4] Accessibility unit tests (keyboard focus, Enter/Space activation, ARIA attributes, live regions) in `tests/unit/media/image-dropzone-a11y.test.tsx`

### Implementation for User Story 4
- [x] T019 [US4] Implement accessible hidden file input (`sr-only`), container `role="button"` and `tabIndex={0}`, with Enter/Space keyboard handlers in `src/features/media/components/ImageDropzone.tsx`
- [x] T020 [US4] Add `aria-live="polite"` live status announcer and verify WCAG 2.1 AA light/dark color contrast in `src/features/media/components/ImageDropzone.tsx`

**Checkpoint**: All 4 user stories are fully implemented, accessible, and testable independently.

---

## Phase 7: Polish & Quality Gates

**Purpose**: Memory leak hygiene, styling consistency, and automated quality verification.

- [x] T021 [P] Ensure memory hygiene via `URL.revokeObjectURL()` cleanup in `src/features/media/components/ImageDropzone.tsx`
- [x] T022 Strict TypeScript type check verification (`npm run typecheck`)
- [x] T023 ESLint code style check verification (`npm run lint`)
- [x] T024 Run full Vitest unit test suite (`npm run test:unit`) confirming 100% passing tests with zero regressions

---

## Dependencies & Execution Order

### Phase Dependencies
- **Setup (Phase 1)**: Can start immediately.
- **Foundational (Phase 2)**: Depends on Phase 1 — BLOCKS all user stories.
- **User Story 1 (Phase 3 - MVP)**: Depends on Foundational Phase 2.
- **User Story 2 (Phase 4)**: Extends US1 with validation guards.
- **User Story 5 (Phase 5)**: Extends US1/US2 with retry and cancellation.
- **User Story 6 (Phase 6)**: Hardens US1–US3 with accessibility compliance.
- **Polish (Phase 7)**: Depends on all user stories being complete.

---

## Parallel Execution Opportunities

- `T001` (Types) and `T002` (Barrel export) can be built in parallel.
- `T005` (Hook tests) and `T006` (Component tests) can be written in parallel.
- `T010` (Validation tests) and `T011` (Component validation tests) can run in parallel.
- `T014` (Retry hook tests) and `T015` (Retry component tests) can run in parallel.

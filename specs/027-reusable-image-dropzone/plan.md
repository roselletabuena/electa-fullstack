# Implementation Plan: Reusable Image Upload & Dropzone Component (VS-45)

**Branch**: `feature/VS-45-reusable-image-dropzone` | **Date**: 2026-10-07 | **Spec**: [spec.md](spec.md)  
**Tracking Issue**: [VS-45](https://the-three-devsketeers.atlassian.net/browse/VS-45)  
**Parent Epic**: [VS-40](https://the-three-devsketeers.atlassian.net/browse/VS-40) ([Electa] Media & Image Management via AWS S3)  

**Input**: Feature specification from `/specs/027-reusable-image-dropzone/spec.md`

---

## Summary

Deliver a production-ready, client-side `<ImageDropzone />` React component in `src/features/media/components/ImageDropzone.tsx`.  
The component:
1. Validates selected image files client-side against strict MIME type whitelists (`image/jpeg`, `image/png`, `image/webp`) and size thresholds (5MB avatars, 10MB banners) before initiating any network activity.
2. Handshakes with the authenticated `POST /api/media/presigned-url` endpoint to obtain short-lived S3 PUT upload authorizations.
3. Transmits the binary image payload directly to the AWS S3 media bucket (`electa-dev-media-assets` in `ap-southeast-1`) via native `XMLHttpRequest`, tracking continuous byte progress (0% to 100%) and supporting user cancellation.
4. Complies with VoteSphere brutalist-refined zero-radius styling (`rounded-none`, hairline borders) and WCAG 2.1 AA dual-theme contrast in Light and Dark modes.
5. Emits structured asset keys and public URLs to parent forms via an accessible `onUploadComplete` callback.

---

## Technical Context

**Language/Version**: TypeScript 5.9 / React 19 / Next.js 16.0.7 (App Router)  
**Primary Dependencies**: React 19, Lucide React (icons), Tailwind CSS v4, Zod  
**Storage**: AWS S3 direct browser upload via presigned PUT URLs (`ap-southeast-1`)  
**Testing**: Vitest (`npm run test:unit`) with `@testing-library/react` and mock `XMLHttpRequest`  
**Target Platform**: Modern Desktop and Mobile Web Browsers (Chrome, Safari, Firefox, Edge)  
**Project Type**: Reusable Client UI Component & Custom Hook  
**Performance Goals**: < 100ms client validation latency; 60fps smooth progress bar animation; zero main-thread blocking  
**Constraints**: Zero `rounded-*` corners (brutalist 0px tokens only); dual-theme Opal Light default + Dark parity; no direct server payload streaming through Node.js; strict memory hygiene via `URL.revokeObjectURL()`  
**Scale/Scope**: 1 reusable component (`ImageDropzone`), 1 headless hook (`useImageUpload`), 1 transport helper (`s3-upload-client`), and comprehensive unit test suites  

---

## Constitution Check

_GATE: All principles from VoteSphere Constitution (§I–§VI) must pass before implementation._

| Principle | Requirement | Plan Conformance | Status |
| :--- | :--- | :--- | :---: |
| **§I. Strict Type Safety** | No `any`, non-null assertions, strict Zod boundary parsing | Props, progress states, and emitted events defined with strict TypeScript interfaces. Validated against Zod schemas in `types/`. | ✅ PASS |
| **§II. Server-First & Boundary Isolation** | `"use client"` only when browser events required | Dropzone is an isolated client boundary marked `"use client"`. Consumes server endpoints via typed `fetch` / `XMLHttpRequest`. | ✅ PASS |
| **§III. State Separation** | Server data via TanStack Query / direct API; client state in hooks | Upload state (progress, abort controller, error) managed locally inside `useImageUpload` hook without polluting global stores. | ✅ PASS |
| **§IV. Secure-by-Design & Auth** | Authenticated uploads; no leaked credentials | Upload authorizations obtained exclusively through authenticated `/api/media/presigned-url` protected by Cognito sessions. Zero AWS credentials in browser. | ✅ PASS |
| **§V. Colocation & Modularity** | Vertical feature slicing under `src/features/` | Code colocated in `src/features/media/` (`components/`, `hooks/`, `utils/`, `types/`). Clean public exports in `src/features/media/index.ts`. | ✅ PASS |
| **§VI. Test-First Quality Gates** | Automated Vitest unit tests in `tests/unit/` | Unit test suites in `tests/unit/media/` testing validation, progress tracking, aborting, and error recovery with mock XHR. | ✅ PASS |

---

## Project Structure

### Documentation (this feature)

```text
specs/027-reusable-image-dropzone/
├── spec.md              # Feature specification
├── plan.md              # This architecture and implementation plan
├── research.md          # Technical research & design decisions (XHR vs fetch, a11y)
├── data-model.md        # State machine, sequence diagram & TypeScript interfaces
├── quickstart.md        # Developer usage & React Hook Form integration guide
├── checklists/
│   └── requirements.md  # Specification quality checklist
└── contracts/
    ├── image-dropzone-props-contract.json
    └── upload-result-contract.json
```

### Source Code & Test Layout

```text
src/
└── features/
    └── media/
        ├── components/
        │   └── ImageDropzone.tsx       # Interactive dropzone UI component (Zero-radius)
        ├── hooks/
        │   └── use-image-upload.ts     # Headless upload state machine & workflow
        ├── utils/
        │   └── s3-upload-client.ts     # Promise-wrapped XMLHttpRequest S3 PUT client
        ├── types/
        │   └── index.ts                # TypeScript interfaces, schemas & prop types
        └── index.ts                    # Public barrel export

tests/
└── unit/
    └── media/
        ├── s3-upload-client.test.ts    # Transport utility tests (progress, headers, abort)
        ├── use-image-upload.test.ts    # Headless upload hook state transitions
        └── image-dropzone.test.tsx     # Dropzone component rendering, drag events & a11y
```

---

## Implementation Phases

### Phase 0: Research & Decision Documentation ✅
- Evaluate S3 PUT progress tracking (select `XMLHttpRequest` over `fetch` due to progress listener availability).
- Document memory hygiene patterns with `URL.createObjectURL` and `URL.revokeObjectURL`.
- Define brutalist zero-radius styling rules and WCAG 2.1 AA dual-theme tokens.

### Phase 1: Contracts, Interfaces & Design Artifacts ✅
- Define `ImageDropzoneProps`, `UploadedMedia`, and `UploadState` interfaces in `data-model.md`.
- Export JSON schema contracts in `contracts/`.
- Provide consumer integration patterns in `quickstart.md`.

### Phase 2: Direct S3 Transport Utility & Headless Hook ⏳
- **T1**: Implement `uploadToS3WithProgress()` in `src/features/media/utils/s3-upload-client.ts` with progress callback and `abort()` cancellation.
- **T2**: Unit tests for `s3-upload-client.ts` verifying progress math, headers, cancellation, and error handling in `tests/unit/media/s3-upload-client.test.ts`.
- **T3**: Implement `useImageUpload()` headless hook in `src/features/media/hooks/use-image-upload.ts` managing validation, presigned URL retrieval, and upload dispatch.
- **T4**: Unit tests for `useImageUpload()` verifying error states, retries, and lifecycle cleanup in `tests/unit/media/use-image-upload.test.ts`.

### Phase 3: Zero-Radius Dropzone Component ⏳
- **T5**: Implement `<ImageDropzone />` component in `src/features/media/components/ImageDropzone.tsx` with sharp 0px brutalist geometry, drag-and-drop event handlers, progress bar, cancel/retry buttons, and keyboard accessibility.
- **T6**: Component unit tests in `tests/unit/media/image-dropzone.test.tsx` verifying drag states, file selection, error alerts, progress rendering, and ARIA attributes.
- **T7**: Export public members from `src/features/media/index.ts`.

### Phase 4: Quality Gate Verification ⏳
- Run `npm run typecheck` to verify zero strict TypeScript errors.
- Run `npm run lint` to ensure ESLint conformance.
- Run `npm run test:unit` to verify 100% test pass rate with zero regression across all existing suites.

---

## Complexity Tracking

_No constitutional violations. Zero complexity exceptions._

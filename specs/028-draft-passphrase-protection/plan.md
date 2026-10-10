# Implementation Plan: Draft Event Passphrase Protection & Access Control

**Branch**: `feature/VS-80-draft-passphrase-protection` | **Date**: 2026-10-08 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/028-draft-passphrase-protection/spec.md`

## Summary

Remediate the critical draft preview security bypass documented in [VS-80](https://the-three-devsketeers.atlassian.net/browse/VS-80) by:

1. Enforcing strict event ownership checks (`session.userId === event.organizerId`) on draft event pages (`/events/[slug]`) so only verified creators bypass the passphrase prompt.
2. Protecting `GET /api/events/[slug]` against unauthenticated data leakage for unpublished draft events, returning `404 Not Found` unless the caller is verified as the owner or provides a valid preview cookie.
3. Cryptographically binding preview cookies to the active passphrase hash digest (`computePassphraseDigest`), guaranteeing instant invalidation when an organizer rotates or clears the passphrase.
4. Providing an intuitive, zero-radius guidance callout in `ScheduleLifecycleForm` instructing organizers why their active session bypasses the gate and advising incognito testing.

## Technical Context

**Language/Version**: TypeScript 5.8 (Strict mode, `noImplicitAny`, exact optional property types)  
**Primary Dependencies**: Next.js 16 (App Router, React Server Components), React 19, Zod 3.24+, Tailwind CSS v4, Lucide React  
**Storage**: PostgreSQL via Prisma ORM (`draftPassphraseHash`, `organizerId`, `EventAuditLog`) with in-memory mock fallback  
**Testing**: Vitest 3.0+ (`tests/unit/events/draft-auth.test.ts`)  
**Target Platform**: Node.js 22 LTS server environment / Modern web browsers  
**Project Type**: Next.js Fullstack Web Application  
**Performance Goals**: <50ms token signing and cryptographic verification overhead; zero database schema migrations required  
**Constraints**: Zero plain text credentials or raw hash leakage; WCAG 2.1 AA dual-theme color contrast; strict zero-radius (`rounded-none`) design system geometry  
**Scale/Scope**: Impacts all draft event pages, event retrieval API route, preview token utility, and schedule lifecycle settings

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle                                  | Check / Constraint                                                                                                                            | Status   | Notes                                                                |
| :----------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------- | :------- | :------------------------------------------------------------------- |
| **§I. Strict Type Safety**                 | Zero `any`, zero non-null assertions (`!`), explicit interfaces for `PreviewTokenPayload`, `PublicEventDto`                                   | **PASS** | Fully typed with Zod schema validation at boundaries.                |
| **§II. Server-First & Boundary Isolation** | Server Components default (`page.tsx`), async Next request APIs awaited (`await cookies()`, `await params`), typed `ApiResponse<T>` envelopes | **PASS** | `GET /api/events/[slug]` returns standard `apiSuccess`/`apiError`.   |
| **§III. Single Source of Truth**           | Prisma model single source of truth; no server data mirrored to client global store                                                           | **PASS** | State derived from DB event entity or `getMockEventBySlug`.          |
| **§IV. Secure-by-Design**                  | Defense-in-depth on page and route handlers; `getSession()` verification; constant-time comparison                                            | **PASS** | Eliminates data leakage; prevents timing attacks.                    |
| **§V. Feature Colocation**                 | Vertical slice under `src/features/events/`                                                                                                   | **PASS** | Utilities colocated in `src/features/events/utils/preview-token.ts`. |
| **§VI. Test-First Quality Gates**          | Unit tests in Vitest covering token generation, tampering, expiration, and rotation invalidation                                              | **PASS** | Existing test suite updated and extended in `tests/unit/events/`.    |

## Project Structure

### Documentation (this feature)

```text
specs/028-draft-passphrase-protection/
├── spec.md              # Feature specification derived from VS-80
├── plan.md              # This implementation plan
├── research.md          # Phase 0 architectural & security research
├── data-model.md        # Phase 1 entity schemas & state matrix
├── quickstart.md        # Phase 1 runnable validation scenarios
├── contracts/           # Phase 1 interface & UI contracts
│   └── draft-preview-access.md
└── checklists/
    └── requirements.md  # Quality validation checklist
```

### Source Code Layout

```text
src/
├── app/
│   ├── (public)/
│   │   └── events/
│   │       └── [slug]/
│   │           └── page.tsx              # Gating logic: owner bypass vs guest challenge
│   └── api/
│       └── events/
│           └── [slug]/
│               ├── route.ts              # Protect draft data, return 404 for unauthorized
│               └── preview-auth/
│                   └── route.ts          # Passphrase auth: sign token with digest
├── features/
│   └── events/
│       ├── components/
│       │   └── dashboard/
│       │       └── ScheduleLifecycleForm.tsx  # Organizer testing guidance card
│       ├── types/
│       │   └── index.ts                  # PublicEventDto (organizerId support)
│       └── utils/
│           ├── preview-token.ts          # computePassphraseDigest, digest-aware sign/verify
│           └── mock-data.ts              # mockDraftEvent organizerId alignment
tests/
└── unit/
    └── events/
        └── draft-auth.test.ts            # Unit tests for digest validation & rotation
```

**Structure Decision**: Next.js App Router fullstack structure adhering to Electa feature vertical slice conventions under `src/features/events/`.

## Complexity Tracking

| Violation | Why Needed                                                                   | Simpler Alternative Rejected Because |
| :-------- | :--------------------------------------------------------------------------- | :----------------------------------- |
| _None_    | No constitutional violations; uses existing Prisma schema without migrations | N/A                                  |

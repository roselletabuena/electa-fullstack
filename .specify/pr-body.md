## 📌 Jira Ticket

- **Issue**: [VS-80](https://the-three-devsketeers.atlassian.net/browse/VS-80)
- **Issue Type**: Bug
- **Priority**: High
- **Parent Epic / Feature**: [VS-34](https://the-three-devsketeers.atlassian.net/browse/VS-34) (Organizer Event Operational Schedule & Publication Lifecycle Controls)

---

## 🎯 Executive Summary

Remediates critical draft preview security bypasses where unauthorized authenticated users could inspect unlaunched draft events without passphrase verification, and secures the public event API endpoint against leaking confidential contestant rosters and draft configurations. Also implements cryptographic preview token invalidation on passphrase rotation and adds in-context guidance for organizers.

---

## 🧱 Key Architectural & Code Changes

- **Module / Feature Slice**: `src/features/events/`, `src/app/(public)/events/[slug]/`, `src/app/api/events/[slug]/`
- **Key Changes**:
  - **Strict Ownership Gate**: Replaced `if (session)` with `session?.userId === event.organizerId` in `src/app/(public)/events/[slug]/page.tsx`, ensuring only authentic event owners bypass the passphrase prompt while non-owners are challenged with `DraftPassphraseModal`.
  - **Public API Route Protection**: Updated `GET /api/events/[slug]` in `src/app/api/events/[slug]/route.ts` to block unauthorized draft requests, returning HTTP 404 unless the caller is verified as the owner or provides a valid preview cookie.
  - **Passphrase Digest Binding**: Enhanced `src/features/events/utils/preview-token.ts` with `computePassphraseDigest()` and bound the preview token to the active passphrase hash digest, guaranteeing instant invalidation when an organizer rotates or clears the passphrase.
  - **Organizer UX Guidance**: Added an Opal theme zero-radius informational callout in `ScheduleLifecycleForm.tsx` explaining owner session bypass and providing a quick "Copy Public Link" button to facilitate Incognito testing.

---

## 🧪 Testing & Verification Report

- [x] **Unit & Integration Tests**: `npm run test:unit -- tests/unit/events/draft-` (19 tests passing)
- [x] **TypeScript Strict Typecheck**: `npm run typecheck` (0 errors)
- [x] **ESLint Linting**: `npm run lint` (0 warnings/errors)
- [x] **Environment Validation**: Verified zero raw `process.env` bypasses (§IV)

```text
 ✓ tests/unit/events/draft-auth.test.ts (9 tests) 15ms
 ✓ tests/unit/events/draft-ownership.test.ts (5 tests) 6ms
 ✓ tests/unit/events/draft-api-route.test.ts (5 tests) 396ms

 Test Files  3 passed (3)
      Tests  19 passed (19)
```

---

## 🏛️ VoteSphere Constitution Compliance Checklist

- [x] **§I: Strict Type Safety & Boundary Validation**: TypeScript 5 strict mode enforced with zero `any` or `!`. Validated with Zod schemas.
- [x] **§II: Server-First & Boundary Isolation**: Next.js 16 RSC default; route handlers return typed `ApiResponse<T>` envelopes; all async request APIs (`cookies()`, `params`) properly awaited.
- [x] **§III: Single Source of Truth**: State derived from Prisma singleton / domain types without global store duplication.
- [x] **§IV: Secure-by-Design & Auth Integrity**: Defense-in-depth on page and route handlers; constant-time string comparison for cryptographic token verification to prevent timing attacks.
- [x] **§V: Feature Colocation**: Vertical slice colocation under `src/features/events/`.
- [x] **§VI: Test-First & Atomic Conventional Commits**: 5 single-purpose Conventional Commits; 19 automated Vitest unit tests verifying ownership, token invalidation, and API security.

---

## 📸 Visual Evidence / UI Preview

- Tested on desktop and mobile viewports.
- Non-owner and Incognito access attempts are properly intercepted by `DraftPassphraseModal`.
- Direct unauthenticated API requests to draft slugs return HTTP 404 Not Found.
- Settings page displays zero-radius sky-toned guidance card with "Copy Public Link" button.

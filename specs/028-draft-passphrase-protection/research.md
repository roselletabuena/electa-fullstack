# Technical Research: Draft Event Passphrase Protection & Access Control

**Feature**: `028-draft-passphrase-protection`  
**Spec**: [spec.md](./spec.md)  
**Parent Ticket**: [VS-80](https://the-three-devsketeers.atlassian.net/browse/VS-80) (Parent Feature: [VS-34](https://the-three-devsketeers.atlassian.net/browse/VS-34))

---

## 1. Problem Statement & Root Cause Analysis

### Identified Vulnerabilities in Current Codebase

1. **Organizer vs. Non-Owner Session Ambiguity (`page.tsx:111-120`)**:
   - `if (session)` currently permits ANY logged-in user (regardless of whether they own the event) to view the draft event with full contestant roster and details in `accessMode="organizer"`.
   - Any registered voter or organizer on the platform can bypass the draft passphrase modal simply by holding an active session cookie.
2. **Data Leakage via Public API (`GET /api/events/[slug]`)**:
   - `src/app/api/events/[slug]/route.ts` retrieves events using `getMockEventBySlug` (or database queries) and directly returns 200 OK with sanitized contestant rosters.
   - It performs zero checks on `event.operationalState === 'Draft'` or authorization headers/cookies, allowing unauthenticated network inspection of unpublished drafts.
3. **Stale Token Retention on Passphrase Rotation (`preview-token.ts`)**:
   - `signPreviewToken` embeds only `{ slug, exp }` into the HMAC-signed JWT-like preview token.
   - If an organizer updates the passphrase or clears it to revoke preview access, previously issued cookies (`vs_preview_[slug]`) continue to grant access until the 24-hour expiration window lapses.
4. **Organizer Testing Friction & Misconception**:
   - Organizers setting a passphrase often test the link in the same browser window where they remain logged in as the event owner.
   - Without in-context guidance, organizers assume the passphrase gate failed to save or is non-functional because their owner session automatically bypasses it.

---

## 2. Research Decisions & Architectural Choices

### Decision 1: Ownership Verification Protocol for Draft Previews

- **Chosen Pattern**: Strict Server-Side Identity Comparison (`session?.userId === event.organizerId`).
- **Rationale**:
  - In Next.js 16 App Router Server Components (`src/app/(public)/events/[slug]/page.tsx`), `getSession()` retrieves the verified user session directly from encrypted session cookies / AWS Cognito tokens.
  - The event entity carries `organizerId`.
  - Comparing `session.userId === event.organizerId` guarantees that only the verified creator of the event bypasses the passphrase prompt.
  - Non-owner authenticated users (`session.userId !== event.organizerId`) fall through to the guest preview verification flow, exactly like unauthenticated visitors.
- **Alternatives Considered**:
  - _Role-based admin bypass_: Allowing system admins (`ADMIN` role) to bypass. While useful for global admins, the primary vulnerability was ordinary logged-in voters bypassing the gate. We ensure owners (and optional verified admins) bypass, while regular authenticated voters are strictly gated.
  - _Requiring organizers to always enter the passphrase_: Rejected because it degrades organizer UX, forcing repetitive credential input during event setup and preview refreshes.

### Decision 2: Public API Route Authorization & Error Masking

- **Chosen Pattern**: Defense-in-depth gate in `src/app/api/events/[slug]/route.ts` returning `404 Not Found` for unauthorized draft requests.
- **Rationale**:
  - Returning `404 Not Found` rather than `401 Unauthorized` or `403 Forbidden` prevents attackers from probing slugs to determine the existence or title of private, unannounced contests.
  - When `event.operationalState === "Draft"`, the route inspects:
    1. Authenticated session (`session?.userId === event.organizerId`).
    2. Signed preview cookie (`vs_preview_${slug}`) verified against the active passphrase digest.
  - If neither credential is valid, the endpoint returns a standard `apiError("Event not found", 404)` envelope.
- **Alternatives Considered**:
  - _Returning 401/403_: Exposes the existence of unpublished drafts and invites targeted brute-force attacks against the slug.
  - _Completely disabling the public API for drafts_: Rejected because client components or mobile preview clients may consume this endpoint when presenting authorized previews.

### Decision 3: Cryptographic Token Invalidation via Passphrase Digest

- **Chosen Pattern**: Incorporate a truncated cryptographic digest of the active `draftPassphraseHash` (or a dedicated version salt) into the `PreviewTokenPayload`.
- **Rationale**:
  - When a draft review passphrase is set, its hashed representation exists in the database as `draftPassphraseHash`.
  - Generating a lightweight digest (e.g., `createHash("sha256").update(draftPassphraseHash).digest("hex").slice(0, 16)`) and including it in the signed preview token payload binds the token to that specific passphrase iteration.
  - When `verifyPreviewToken(token, slug, currentPassphraseDigest)` runs:
    - If `currentPassphraseDigest` does not match `payload.digest`, verification fails immediately.
    - If the passphrase was cleared (`draftPassphraseHash === null`), `currentPassphraseDigest` is null, causing all previously issued tokens to fail verification immediately.
  - Zero database schema migrations required (uses existing `draftPassphraseHash`).
- **Alternatives Considered**:
  - _Storing active preview session IDs in Redis / database_: Over-engineered and introduces network roundtrips for what is a lightweight guest preview token.
  - _Relying solely on cookie deletion on the organizer's browser_: Ineffective because it only deletes cookies on the organizer's client, not on external judges' or reviewers' devices.

### Decision 4: In-Context Organizer UX Guidance

- **Chosen Pattern**: Dedicated high-contrast informational card/banner inside `ScheduleLifecycleForm.tsx` beneath the Draft Review Passphrase input.
- **Rationale**:
  - Directly addresses the organizer confusion described in VS-80 ("Organizer/Authenticated Session directly shown preview page without being prompted").
  - Clear message: "You are logged in as the event organizer, so you will automatically bypass this passphrase prompt when previewing. To test the guest reviewer experience, open the link in an Incognito / Private browsing window."
  - Includes a quick-action "Copy Preview Link" button with toast notification.
  - Complies strictly with Electa Branding: Opal Slate-50 background, zero-radius (`rounded-none`), Outfit/Sora fonts, WCAG 2.1 AA contrast.

---

## 3. Technology Stack & Compatibility Matrix

| Component        | Technology                                                       | Version / Standard                     |
| :--------------- | :--------------------------------------------------------------- | :------------------------------------- |
| **Framework**    | Next.js App Router                                               | 16 (React Server Components)           |
| **Language**     | TypeScript                                                       | 5 (Strict mode)                        |
| **Validation**   | Zod                                                              | 3.24+                                  |
| **Styling**      | Tailwind CSS v4                                                  | Zero-radius, `@theme`, Opal Light Mode |
| **Cryptography** | Node.js `crypto` (`timingSafeEqual`, `createHmac`, `createHash`) | Built-in                               |
| **Testing**      | Vitest                                                           | 3.0+                                   |

---

## 4. Constitution Compliance Analysis

- **§I. Type Safety**: `PreviewTokenPayload` and `PublicEventDto` are explicitly typed with zero `any` or non-null assertions.
- **§II. Server-First & Boundary Isolation**: Server Components handle initial authorization gate; API route returns typed `ApiResponse<T>`. All async Next.js request APIs (`cookies()`, `params`) are awaited.
- **§III. State Separation**: Prisma singleton is single source of truth; no server data mirrored to global client stores.
- **§IV. Secure-by-Design**: Authenticated via `getSession()`; defense-in-depth on both page and API routes; constant-time signature comparison to eliminate timing attacks.
- **§V. Feature Colocation**: Utilities located in `src/features/events/utils/preview-token.ts` and UI in `src/features/events/components/`.
- **§VI. Test-First Quality**: Unit tests in Vitest covering token generation, tampering, expiration, digest invalidation, and ownership checks.

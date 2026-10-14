# Research & Architecture Decisions: Real-Time Turnout Gauge & Certified Election Audit Dashboard

**Feature**: `046-realtime-turnout-gauge-audit-dashboard`
**Date**: 2026-10-15
**Jira Key**: VS-111

## Stack Context (Pre-established — do not change)

| Concern       | Decision                                                                |
| ------------- | ----------------------------------------------------------------------- |
| Framework     | Next.js 16 App Router — default to RSC, `"use client"` only when needed |
| Language      | TypeScript 5 strict mode — no `any`, no `!`                             |
| Database      | PostgreSQL via Supabase, Prisma ORM (`src/lib/db.ts` singleton)         |
| Auth          | AWS Cognito via `getSession()` from `src/lib/auth/get-session.ts`       |
| Server State  | TanStack Query / React Server Component direct fetch                    |
| Client State  | Component local state (`useState`) for export format / view modes       |
| API Responses | `ApiResponse<T>` envelope from `src/lib/api/response.ts`                |
| Env Vars      | All via `src/env.ts` — never `process.env` directly                     |
| Styling       | Tailwind CSS 4 `@theme` tokens in `src/app/globals.css`                 |
| Branding/UI   | Default to Light Mode (Opal `#F8FAFC`), strict zero-radius (`rounded-none`), Outfit & Sora typography |

---

## Technical Decisions & Rationale

### 1. Separation of Concerns & Ballot Sealing
- **Decision**: Keep turnout calculation decoupled from candidate vote counts. Pre-closure endpoints and queries ONLY count `VoterParticipation` and `StudentRosterEntry`. The database query for candidate tally (`BallotSelection` aggregation) is strictly guarded behind a time check (`event.endsAt <= now`).
- **Rationale**: In electronic student elections, leakage of interim candidate rankings causes bandwagon or voter suppression effects. Enforcing the seal at both the data layer and presentation layer ensures compliance with institutional election bylaws.

### 2. Turnout Gauge Visualization
- **Decision**: Implement a custom SVG-based brutalist radial/linear gauge with high-contrast segments, zero border-radius indicators, and tabular monospace numbers (`font-mono`).
- **Rationale**: Avoids bulky external chart dependencies, aligns with Electa's zero-radius brutalist design language, and provides crisp SVG vector rendering with full accessibility (`role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`).

### 3. Decoupled Ballot Auditing
- **Decision**: Query `BallotSelection` records (created in VS-110) grouped by `officeId` and `candidateId`. Winners are determined per office based on the highest selection count.
- **Rationale**: `BallotSelection` contains zero voter identity metadata (only `receiptHash`), guaranteeing voter privacy while preserving complete tally auditability.

### 4. Tamper-Evident Certified Export
- **Decision**: Generate canonical JSON and RFC 4180 compliant CSV exports containing a SHA-256 cryptographic hash calculated from the sorted audit payload.
- **Rationale**: Commissioners can print or distribute the certified tally file to university administration, and any party can verify that the tally has not been altered by recomputing the SHA-256 digest.

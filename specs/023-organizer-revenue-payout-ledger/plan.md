# Implementation Plan: Organizer Command Center, Revenue Tracker & Payout Ledger (VS-24)

**Branch**: `023-organizer-revenue-payout-ledger` | **Date**: 2026-10-03 | **Spec**: [spec.md](file:///c:/Users/Roselle%20Tabuena/workspace/vote-sphere-workspace/vote-sphere/specs/023-organizer-revenue-payout-ledger/spec.md)

---

## Summary

Build an executive-grade financial command center and payout ledger for pageant organizers. The system computes real-time Gross Vote Sales, Payment Gateway Processing Fees, an Admin-Configurable Platform Commission (defaulting to 12.0%, stored as `takeRatePercentage` on `Event`), and Net Organizer Revenue with automatic balance locking. It features RFC 4180 streaming CSV and print-ready PDF audit log exports with masked voter identifiers (`vot_***...`) and salted SHA-256 IP hashing for privacy compliance (RA 10173), a self-service payout request interface with manual admin bank/GCash fulfillment tracking, and live contestant roster visibility and ordering controls.

---

## Technical Context

- **Language/Version**: TypeScript 5.7+ (strict mode, zero `any`, zero non-null assertions)
- **Primary Dependencies**:
  - **Framework**: Next.js 16 (App Router, React 19, Server Components default)
  - **Styling**: Tailwind CSS v4, Lucide React, Radix UI primitives
  - **State & Forms**: React Hook Form, Zod 3.x, `@hookform/resolvers/zod`, `nuqs`
  - **Data Layer**: Prisma ORM 6.x (`@prisma/client`, singleton in `src/lib/db.ts`)
  - **Environment**: `@t3-oss/env-nextjs` via `src/env.ts`
- **Storage**: PostgreSQL (Supabase hosted) with Prisma migrations
- **Testing**: Vitest (`tests/unit/`), `@testing-library/react`
- **Target Platform**: Node.js 20+ runtime on Vercel Serverless
- **Project Type**: Full-stack Next.js web application
- **Performance Goals**: Sub-second financial telemetry aggregation (< 1s), audit log CSV streaming generation (< 3s for 10k rows)
- **Constraints**:
  - Zero-radius brutalist Electa design system (`--radius: 0px`, `rounded-none`)
  - WCAG 2.1 AA dual-theme parity (Light Opal `#F8FAFC` default, dark mode scoped)
  - Zero PII leakage in export logs (salted SHA-256 IP hashing)
  - Zero double-withdrawal vulnerability (Prisma transactional balance locking)
- **Scale/Scope**: Support 50,000+ vote transactions per event with sub-500ms roster updates

---

## Constitution Check

_GATE: Evaluated against Electa Constitution §I–§VI. Result: ALL GATES PASS._

- **§I. Strict Type Safety & Boundary Validation**:
  - ✅ All Route Handlers, Server Actions, and forms validate payload boundaries with Zod schemas (`createPayoutRequestSchema`, `auditLogQuerySchema`, etc.).
  - ✅ Zero `any` or non-null assertions (`!`); explicit interfaces for financial summaries and payout models.
- **§II. Server-First & Boundary Isolation (Next.js 16 App Router)**:
  - ✅ Default to React Server Components (`page.tsx` awaits async request params).
  - ✅ Route Handlers return standard `ApiResponse<T>` envelopes (`apiSuccess()`, `apiError()`). Direct form actions use Server Actions.
  - ✅ Suspense boundaries wrap dynamic client search parameter consumers.
- **§III. Strict State Separation & Single Source of Truth**:
  - ✅ Prisma schema is the single source of truth for `Event`, `PayoutRequest`, and `PaymentTransaction`.
  - ✅ No server financial data mirrored into client global state; TanStack Query manages query cache.
  - ✅ URL state (pagination, date filtering) managed via `nuqs`.
- **§IV. Secure-by-Design & Auth Integrity**:
  - ✅ Protected actions and routes strictly authenticate via `getSession()` and `requireEventOwnership()`.
  - ✅ Take-rate modification restricted strictly to Platform Admin role with `HTTP 403 Forbidden` guardrails for organizers.
  - ✅ All environment variables accessed through `src/env.ts`.
- **§V. Feature Colocation & Modular Architecture**:
  - ✅ Colocated under `src/features/events/` and `src/features/contestants/` vertical slices (`components/`, `actions/`, `services/`, `types/`, `utils/`).
  - ✅ Named exports used across all internal modules; default exports reserved only for Next.js routing files.
- **§VI. Test-First & Zero-Regression Quality Gates**:
  - ✅ Vitest unit tests for financial telemetry math, payout balance locking, CSV streaming sanitizer, and contestant reordering.
  - ✅ Code must pass `npm run typecheck`, `npm run lint`, and `npm run test:unit`.

---

## Project Structure

### Documentation (this feature)

```text
specs/023-organizer-revenue-payout-ledger/
├── spec.md              # Feature specification with clarifications
├── checklists/
│   └── requirements.md  # Spec quality checklist (17/17 passing)
├── research.md          # Technical research & architectural decisions
├── data-model.md        # Prisma schema updates & domain TypeScript interfaces
├── quickstart.md        # Step-by-step verification and test guide
├── contracts/           # Interface contracts for APIs and actions
│   ├── financial-telemetry.contract.ts
│   ├── payout-ledger.contract.ts
│   ├── audit-log-export.contract.ts
│   └── contestant-management.contract.ts
├── plan.md              # This implementation plan
└── tasks.md             # Execution task list (/speckit-tasks output)
```

### Source Code Architecture

```text
vote-sphere/
├── prisma/
│   └── schema.prisma                                     # Add takeRatePercentage & PayoutRequest model
├── src/
│   ├── app/
│   │   ├── (dashboard)/
│   │   │   └── events/
│   │   │       └── [slug]/
│   │   │           ├── revenue/
│   │   │           │   └── page.tsx                      # Financial command center RSC
│   │   │           └── contestants/
│   │   │               └── page.tsx                      # Enhanced roster management with reorder
│   │   └── api/
│   │       └── events/
│   │           └── [slug]/
│   │               ├── finance/
│   │               │   └── metrics/route.ts              # Financial telemetry API route
│   │               └── audit-logs/
│   │                   ├── route.ts                      # Paginated audit log search route
│   │                   └── export/route.ts               # Streaming CSV export route
│   └── features/
│       ├── events/
│       │   ├── actions/
│       │   │   ├── request-payout.ts                     # Server Action: submit payout with balance lock
│       │   │   ├── fulfill-payout.ts                     # Server Action: admin payout approval & ref entry
│       │   │   └── update-take-rate.ts                   # Server Action: admin-only take-rate modification
│       │   ├── components/
│       │   │   ├── dashboard/
│       │   │   │   └── OrganizerDashboardHeader.tsx      # Add "Revenue & Payouts" navigation tab
│       │   │   └── revenue/
│       │   │       ├── RevenueSummaryCards.tsx           # Gross, Gateway Fees, Take-Rate, Net Balance
│       │   │       ├── ContestantRevenueShareTable.tsx   # Revenue by contestant breakdown
│       │   │       ├── PaymentChannelBreakdownCard.tsx   # QR Ph vs GCash vs Card chart/table
│       │   │       ├── PayoutRequestModal.tsx            # Payout submission modal with bank/GCash inputs
│       │   │       ├── PayoutLedgerTable.tsx             # Historical payout requests & status badges
│       │   │       └── AuditLogsTab.tsx                  # Transaction logs table with CSV/PDF buttons
│       │   ├── services/
│       │   │   ├── financial-metrics.ts                  # Aggregation service with decimal math
│       │   │   └── payout-service.ts                     # Transactional balance locking & withdrawal
│       │   ├── types/
│       │   │   └── revenue.ts                            # Domain interfaces & summary types
│       │   └── utils/
│       │       └── csv-exporter.ts                       # RFC 4180 streaming sanitizer & IP hasher
│       └── contestants/
│           ├── actions/
│           │   ├── update-contestant-status.ts           # Server Action: toggle ACTIVE/HIDDEN/DISQUALIFIED
│           │   └── reorder-contestants.ts                # Server Action: batch update sequence numbers
│           └── components/
│               └── OrganizerContestantTable.tsx          # Enhanced with quick visibility & drag/reorder
└── tests/
    └── unit/
        ├── events/
        │   ├── financial-metrics.test.ts                 # Tests for gross, fee, take-rate, and net math
        │   ├── payout-ledger.test.ts                     # Tests for balance locking & double-spend prevention
        │   └── audit-log-export.test.ts                  # Tests for CSV formatting & PII masking
        └── contestants/
            └── roster-reorder.test.ts                    # Tests for candidate number reordering & status
```

---

## Complexity Tracking

| Aspect                             | Decision                                   | Rationale                                                                                                    |
| :--------------------------------- | :----------------------------------------- | :----------------------------------------------------------------------------------------------------------- |
| **Prisma Transactional Locking**   | Use interactive `$transaction` for payouts | Non-negotiable to prevent race conditions during rapid concurrent withdrawal submissions.                    |
| **Deterministic Gateway Fee Math** | Calculate per payment channel              | Matches PayMongo settlement deductions (QR Ph 1.5%, GCash/Maya 2.0%, Card 3.5% + ₱15) with zero discrepancy. |
| **Salted SHA-256 IP Hashing**      | Salted HMAC hashing of voter IPs           | Guarantees non-reversible cryptographic compliance with statutory voter privacy standards (RA 10173).        |
| **Admin Take-Rate Boundary**       | Strict server-side role check (`isAdmin`)  | Prevents organizers from modifying their commission rate, strictly enforcing platform business model.        |

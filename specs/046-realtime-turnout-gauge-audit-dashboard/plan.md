# Implementation Plan: Real-Time Turnout Gauge & Certified Election Audit Dashboard

**Feature ID**: `046-realtime-turnout-gauge-audit-dashboard`
**Date**: 2026-10-15
**Jira Key**: VS-111

## 1. Architecture & Component Mapping

### Feature Directory: `src/features/dashboard/`
- **Types & Schemas**: `src/features/dashboard/types/turnout-audit.ts`
  - Validated Zod schemas for metrics, office tallies, certified audit model, export payloads.
- **Pure Math & Formatting Utilities**: `src/features/dashboard/utils/turnout-calculator.ts`
  - `computeTurnoutMetrics({ whitelistCount, participationCount, windowParticipations, endsAt, quorumThreshold })`
  - `computeOfficeTallies(offices, ballotSelections)`
  - `generateAuditHash(payload)`
  - `formatAuditCsv(certifiedAudit)`
- **Server Actions & Data Fetchers**:
  - `src/features/dashboard/actions/get-election-dashboard-data.ts`: Queries event, student roster count, participation count, and if closed, ballot selection tally.
  - `src/features/dashboard/actions/export-certified-tally.ts`: Generates certified report with SHA-256 hash in CSV or JSON.
- **UI Components**:
  - `src/features/dashboard/components/turnout-gauge.tsx`: Brutalist zero-radius SVG/HTML gauge with accessible progressbar, quorum marker, and velocity telemetry.
  - `src/features/dashboard/components/election-audit-panel.tsx`: Office results summary, winner badges, sealed poll countdown/notice, and certify & export action controls.
  - `src/features/dashboard/components/election-dashboard-client.tsx`: Interactive client wrapper supporting real-time refresh, format selection, and certified tally download.
- **Page Route**:
  - `src/app/(dashboard)/events/[slug]/elections/page.tsx`: RSC fetching event metrics, validating organizer ownership via `getSession()`, rendering dashboard client.
- **API Route**:
  - `src/app/api/events/[slug]/turnout/route.ts`: Public/Observer JSON endpoint returning real-time turnout metrics (and sealed status).

## 2. Test Plan

- `tests/unit/dashboard/turnout-calculator.test.ts`:
  - 0 roster entries -> 0.0% turnout, quorum false, no division by zero error.
  - Normal turnout e.g. 750 / 2000 -> 37.5%, quorum status verified.
  - 100% turnout boundary.
  - Winner determination with clear winners and ties.
  - Audit hash determinism and CSV RFC 4180 escaping.
- `tests/unit/dashboard/turnout-gauge.test.tsx`:
  - Renders gauge with ARIA progressbar roles and labels.
  - Shows quorum reached vs pending badge.
  - Light mode and dark mode styles without naked classes.
  - Brutalist zero-radius styling (`rounded-none`).
- `tests/unit/dashboard/election-audit-panel.test.tsx`:
  - Sealed state when `now < endsAt` displays sealed banner and hides candidate counts.
  - Unsealed state when `now >= endsAt` displays office winners and candidate vote counts.
  - Click on "Certify & Export Official Results" invokes export action.
- `tests/unit/dashboard/export-certified-tally.test.ts`:
  - Blocks unauthorized users and requests before poll closure.
  - Generates valid SHA-256 hash and CSV format with all required columns.
- `tests/unit/dashboard/election-dashboard-page.test.tsx`:
  - Server component redirects unauthenticated users.
  - Fetches and passes metrics to client dashboard.

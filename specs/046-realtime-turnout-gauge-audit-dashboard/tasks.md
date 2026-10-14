# Implementation Tasks: Real-Time Turnout Gauge & Certified Election Audit Dashboard

**Feature ID**: `046-realtime-turnout-gauge-audit-dashboard`
**Date**: 2026-10-15
**Jira Key**: VS-111

- [x] **Task 1: Core Types, Contracts & Calculation Engine**
  - Implement `src/features/dashboard/types/turnout-audit.ts` with strict Zod schemas and DTOs.
  - Implement `src/features/dashboard/utils/turnout-calculator.ts` (turnout percentage, quorum evaluation, office tally aggregation, winner calculation, SHA-256 audit digest, and RFC 4180 CSV generation).
  - Add comprehensive unit tests in `tests/unit/dashboard/turnout-calculator.test.ts`.
  - Conventional Commit: `feat(dashboard): [VS-111] implement turnout calculator and audit hash utilities`

- [x] **Task 2: Server Actions & Query Endpoints**
  - Implement `src/features/dashboard/actions/get-election-dashboard-data.ts` fetching turnout metrics and conditional sealed/unsealed ballot tallies.
  - Implement `src/features/dashboard/actions/export-certified-tally.ts` with authorization, closure verification, and certified CSV/JSON generation.
  - Implement public turnout API route at `src/app/api/events/[slug]/turnout/route.ts`.
  - Add unit tests in `tests/unit/dashboard/export-certified-tally.test.ts` and `tests/unit/dashboard/turnout-route.test.ts`.
  - Conventional Commit: `feat(dashboard): [VS-111] add election dashboard actions and turnout API route`

- [x] **Task 3: Turnout Gauge & Election Audit Panel Components**
  - Implement `src/features/dashboard/components/turnout-gauge.tsx` with brutalist zero-radius styling, progressbar ARIA semantics, and dual-theme WCAG AA colors.
  - Implement `src/features/dashboard/components/election-audit-panel.tsx` with sealed state countdown banner and unsealed office results breakdown.
  - Implement `src/features/dashboard/components/election-dashboard-client.tsx` connecting the gauge, audit panel, and export workflow.
  - Add unit tests in `tests/unit/dashboard/turnout-gauge.test.tsx` and `tests/unit/dashboard/election-audit-panel.test.tsx`.
  - Conventional Commit: `feat(dashboard): [VS-111] build brutalist turnout gauge and election audit panel`

- [x] **Task 4: Page Route Assembly & Barrel Exports**
  - Implement `src/app/(dashboard)/events/[slug]/elections/page.tsx` with RSC session verification and data loading.
  - Export public feature API from `src/features/dashboard/index.ts`.
  - Add page unit tests in `tests/unit/dashboard/election-dashboard-page.test.tsx`.
  - Conventional Commit: `feat(dashboard): [VS-111] assemble election audit dashboard page`

- [x] **Task 5: Quality Gate & Code Review Audit**
  - Run `npm run typecheck`, `npm run lint`, and `npm run test:unit`.
  - Run code review standards and spec audits.
  - Verify zero-radius compliance and accessibility contrast.
  - Conventional Commit: `chore(dashboard): [VS-111] verify dashboard test suite and quality gates`

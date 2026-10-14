# Quickstart & Verification Guide: Real-Time Turnout Gauge & Certified Election Audit Dashboard

**Feature ID**: `046-realtime-turnout-gauge-audit-dashboard`
**Date**: 2026-10-15
**Jira Key**: VS-111

## 1. Overview & Setup

This guide details how to verify the Turnout Gauge and Certified Election Audit Dashboard manually and automatically.

### Prerequisites
- Node.js 20+
- Dependencies installed in worktree (`node_modules` linked)
- Database schema up to date with `StudentRosterEntry`, `VoterParticipation`, and `BallotSelection`.

---

## 2. Verification Scenarios

### Scenario A: Live Turnout Gauge (Active Election)
1. Ensure an election event exists with `startsAt` in the past and `endsAt` in the future.
2. Ensure `StudentRosterEntry` has 2,000 records and `VoterParticipation` has 750 records.
3. Navigate to `/events/[slug]/elections` as the authenticated event organizer.
4. **Verify**:
   - Turnout gauge displays **37.5%**.
   - Total count indicates `750 / 2,000 Voters`.
   - Quorum badge indicates `"Quorum Pending (50% Required)"` or `"Quorum Met"`.
   - Candidate tallies section displays: `"Results sealed until polls close on [Date]"`.

### Scenario B: Official Audit & Certified Export (Closed Election)
1. Ensure the election event has `endsAt` in the past.
2. Navigate to `/events/[slug]/elections`.
3. **Verify**:
   - The sealed banner disappears.
   - Official Audit Panel displays each position (e.g. "President", "Vice President").
   - Each position displays candidates, vote tallies, percentage, and winning candidate badge.
   - Click `"Certify & Export Official Results"`.
   - **Verify**: A certified CSV file is downloaded containing the cryptographic SHA-256 audit hash and office-by-office breakdown.

---

## 3. Automated Test Suite Execution

Run the complete dashboard test suite with Vitest:

```bash
npm run typecheck
npm run lint
npm run test:unit tests/unit/dashboard/
```

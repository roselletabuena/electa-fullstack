# Feature Specification: Real-Time Turnout Gauge & Certified Election Audit Dashboard

**Feature ID**: `046-realtime-turnout-gauge-audit-dashboard`
**Status**: Ready
**Created**: 2026-10-15
**Jira Issue**: [VS-111](https://the-three-devsketeers.atlassian.net/browse/VS-111)

---

## Overview

In institutional and student council elections, election commissioners and organizers need real-time operational visibility into voter participation to verify voter quorum without prematurely revealing candidate standings (which could introduce voter bias or compromise election fairness). Once polls close (`endsAt` has passed), commissioners must inspect official tallies, certify the election results, and export tamper-evident audit reports with certified winners per office and an immutable audit hash.

This feature delivers the **Real-Time Turnout Gauge & Certified Election Audit Dashboard** along with server-side aggregation and certified audit export capabilities.

---

## Actors

- **Election Commissioner / Organizer**: Authenticated manager of the event who monitors real-time turnout, checks quorum status, triggers results certification upon closure, and downloads certified audit reports.
- **Voter / Public Observer**: Read-only observer who sees turnout progress without accessing sealed candidate tallies before closure.

---

## Functional Requirements

1. **Live Turnout & Quorum Calculation**:
   - Turnout Percentage is strictly computed as `(voterParticipationCount / totalWhitelistedVoters) * 100`.
   - Denominator is the total count of `StudentRosterEntry` for the event.
   - Numerator is the total count of `VoterParticipation` for the event.
   - Graceful boundary handling: If total roster is 0, turnout is 0.0% with an informational badge (`"Roster empty"`). If participation equals roster, turnout is 100.0%.
   - Quorum status calculation: Displays whether the current turnout meets quorum threshold (default 50% or configurable, clearly indicating Met / Pending).
   - Voting velocity: Calculates recent participation velocity (e.g. participations per hour / active voting pace).

2. **Strict Pre-Closure Results Sealing (Zero Leakage)**:
   - When `now < event.endsAt`, candidate vote counts and rankings remain strictly sealed.
   - UI displays an unmistakable sealed state badge: `"Results sealed until polls close on [Formatted Date/Time]"`.
   - Server-side APIs and Server Actions strictly reject releasing candidate ballot counts if `now < event.endsAt` unless explicitly bypassed by authorized admin after poll end.

3. **Post-Closure Unsealing & Certified Tally Audit**:
   - When `now >= event.endsAt`, election status transitions to closed/completed.
   - Commissioner can view the Election Audit Panel displaying:
     - Office-by-office breakdown (`EventPosition`).
     - Decoupled ballot selections tally (`BallotSelection` aggregates grouped by `officeId` and `candidateId`).
     - Winning candidate(s) per office based on max votes.
     - Final voter turnout and quorum certification status.
     - Action button: `"Certify & Export Official Results"`.

4. **Tamper-Evident Certified Export Generation**:
   - Server Action `exportCertifiedTally` verifies organizer session and poll closure.
   - Generates a certified export report containing:
     - Event details (ID, title, slug, startsAt, endsAt, certifiedAt).
     - Quorum analysis (total roster, participation count, turnout percentage, quorum reached boolean).
     - Certified winners and vote distributions per office.
     - Cryptographic SHA-256 audit digest (`auditHash`) computed from sorted tally payload, event ID, and timestamp.
     - Exportable as CSV and JSON formats.

5. **Design System & Accessibility**:
   - Strict adherence to Electa branding: Light Mode default (`bg-slate-50`), sharp zero-radius geometry (`rounded-none`).
   - WCAG 2.1 AA compliant contrast across both light and dark themes.
   - Outfit heading font, Sora sans body font, JetBrains Mono for metrics and audit hashes.

---

## User Scenarios & Acceptance Criteria

### Scenario 1: Happy Path - Live Turnout Monitoring
- **Given** an ongoing election with 2,000 whitelisted voters and 750 recorded participations
- **When** the commissioner views the live election dashboard
- **Then** the interface displays a 37.5% turnout gauge, total participation count (750 / 2,000), and voting velocity without displaying candidate standings.

### Scenario 2: Validation & Error Handling - Results Sealed Prior to Poll Closure
- **Given** an election where `endsAt` is in the future
- **When** an administrator or visitor requests candidate vote tallies
- **Then** the tally section displays a sealed badge: `"Results sealed until polls close on [Date]."` and candidate counts are not returned.

### Scenario 3: Edge Case - Certified PDF/CSV Export Generation
- **Given** an election that has closed (`endsAt` is in the past)
- **When** the commissioner clicks `"Certify & Export Official Results"`
- **Then** the system generates a tamper-evident audit report with certified winners per office, quorum status, and timestamped SHA-256 audit hash.

### Scenario 4: Edge Case - Zero Registered Voters in Roster
- **Given** an election where no student roster entries have been uploaded (total = 0)
- **When** the commissioner views the turnout gauge
- **Then** the gauge displays 0.0% turnout with an explanatory notice (`"No whitelisted voters registered"`), avoiding division by zero.

---

## Invariants & Rules

1. `turnoutPercentage` MUST be bounded within `[0.00, 100.00]`.
2. Candidate vote tallies MUST NOT be exposed to client responses before `event.endsAt`.
3. Certified export MUST include a deterministic SHA-256 hash of the canonical election result payload.
4. All UI containers, buttons, and gauges MUST use `rounded-none`.
5. Color contrast MUST meet minimum 4.5:1 on text and 3:1 on large text/graphical indicators.

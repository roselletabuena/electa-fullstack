# Feature Specification: Core Voting Engine, Omnichannel Auth & Anti-Fraud

**Feature ID**: `015-core-voting-engine`  
**Jira Key**: [VS-20](https://the-three-devsketeers.atlassian.net/browse/VS-20)  
**Parent Epic**: [VS-18](https://the-three-devsketeers.atlassian.net/browse/VS-18) (Electa: Next-Gen Pageant & Event Monetization Platform)  
**Status**: Ready for Review / Planning  
**Created**: 2026-10-01  
**Authors**: Electa Engineering Team

---

## Overview

In competitive pageants, talent contests, and public events, the voting engine is the mission-critical core of the platform. Voting integrity, voter accessibility, and high-throughput reliability are paramount. If voters encounter login barriers, if malicious bots can spam votes, or if database race conditions cause double-counting during peak voting rushes (e.g., live television broadcasts or finale minutes), community trust collapses and monetization fails.

This feature establishes the production-grade **Core Voting Engine, Omnichannel Authentication & Anti-Fraud Suite** for Electa. It unites multi-provider authentication (Google OAuth, Apple Sign-In, Email Magic Links, Phone OTP via SMS/WhatsApp, Facebook OAuth), strict anti-bot deterrence (Cloudflare Turnstile verification), fraud prevention (client device fingerprinting and IP velocity rate limiting), and transactional voting guarantees (zero race conditions, idempotent submission, and strict single-vote-per-24h window enforcement) across both free daily allowances and paid vote boosts.

---

## Actors

- **Voter / Supporter**: Public user casting free daily votes or purchasing paid vote boosts for contestants.
- **Organizer**: Event manager configuring voting rules, operational windows, daily quota, and viewing audit logs.
- **Platform Operator / Administrator**: Oversees platform integrity, reviews fraud flags, velocity anomalies, and security metrics.

---

## Clarifications

### Session 2026-10-01

- Q: How should the voting engine handle free vote submissions that fail or omit Cloudflare Turnstile bot verification? → A: Immediately reject failed or missing Turnstile submissions with an error message and security log event.

---

## User Scenarios & Acceptance Criteria

### User Story 1 - Omnichannel Voter Authentication (Priority: P1) 🎯 MVP

**As a** voter visiting a pageant competition,  
**I want** to authenticate seamlessly using my preferred identity provider (Google, Apple, Email Magic Link, Phone OTP via SMS/WhatsApp, or Facebook),  
**So that** I can register my vote in seconds without password friction or cumbersome registration forms.

**Why this priority**: Voter turnout hinges on frictionless onboarding. Forcing complex sign-up processes drops conversion by up to 60%. Multiple social and passwordless channels ensure every demographic can participate instantly.

**Independent Test**: Trigger vote modal unauthenticated, select each authentication channel (Google, Apple, Email Magic Link, Phone OTP, Facebook), complete authentication, and verify that a verified session with voter identity is established.

**Acceptance Criteria (Gherkin)**:

1. **Given** an unauthenticated visitor clicks "Cast Free Vote" or selects a vote tier, **When** the authentication modal is presented, **Then** options for Google OAuth, Apple Sign-In, Email Magic Link, Phone OTP (SMS/WhatsApp), and Facebook OAuth are displayed with clear visual branding.
2. **Given** a voter selects Email Magic Link, **When** they submit a valid email address, **Then** a cryptographically signed single-use verification token is dispatched, allowing immediate one-click login upon opening the link.
3. **Given** a voter selects Phone OTP, **When** they provide a valid E.164 phone number, **Then** an OTP code is dispatched via SMS/WhatsApp, and verifying the correct 6-digit code establishes an authenticated voter session.
4. **Given** an existing voter signs in with a different provider that shares the verified primary email address, **When** authentication succeeds, **Then** the account is linked to the unified voter identity without creating duplicate voter profiles or resetting cooldown histories.

---

### User Story 2 - Cloudflare Turnstile Bot Deterrence (Priority: P1) 🎯 MVP

**As a** platform operator,  
**I want** every free vote submission to undergo Cloudflare Turnstile bot verification,  
**So that** automated headless browser scripts, ballot-stuffing bots, and credential-stuffing crawlers are blocked before reaching the database.

**Why this priority**: Free voting tiers are the primary target for automated scripts attempting to manipulate leaderboard outcomes. Transparent bot mitigation protects database capacity and leaderboard sanctity.

**Independent Test**: Submit a vote payload with a valid Turnstile token and verify success; submit without a token or with an invalid/replay token and verify that the vote is rejected with a 400/403 security challenge error.

**Acceptance Criteria (Gherkin)**:

1. **Given** an authenticated voter on the voting interface, **When** the free vote button is pressed, **Then** a Cloudflare Turnstile token is generated invisibly (or via interactive challenge if suspicious) and included in the submission payload.
2. **Given** a server action receives a free vote request, **When** the Turnstile token is verified against the Cloudflare siteverify endpoint, **Then** verification must succeed before any database query or quota evaluation executes.
3. **Given** an attacker attempts to replay a previously used Turnstile token or sends an expired token, **When** validated by the server, **Then** the transaction is immediately rejected with error code `BOT_DETECTION_FAILED` and logged to security telemetry.

---

### User Story 3 - Device Fingerprinting & IP Velocity Fraud Detection (Priority: P1) 🎯 MVP

**As a** platform operator,  
**I want** device fingerprinting and IP velocity checks applied to all voting transactions,  
**So that** malicious actors attempting to circumvent the 24-hour limit using disposable accounts or proxy networks are throttled and flagged.

**Why this priority**: Multi-account syndicates use script-generated voter accounts from identical devices or subnets. Layered defense-in-depth ensures quota limits cannot be bypassed by simply switching accounts.

**Independent Test**: Simulate multiple voter accounts submitting votes from the same device fingerprint or IP address in rapid succession; confirm that IP velocity rate limits trigger and excessive votes are held or blocked.

**Acceptance Criteria (Gherkin)**:

1. **Given** a vote submission, **When** client telemetry is gathered, **Then** a client device fingerprint (hash of hardware/browser attributes) and client IP address are sent with the request payload.
2. **Given** more than 10 free vote attempts originating from the same IP address within a 60-second window, **When** subsequent vote attempts arrive, **Then** the system triggers velocity rate limiting and responds with `RATE_LIMIT_EXCEEDED`.
3. **Given** multiple distinct voter accounts submitting free votes from the exact same device fingerprint within a single event's 24-hour window, **When** the count exceeds the threshold (configurable, default 3 accounts per device), **Then** the system flags the vote for operator audit and prevents quota bypass.

---

### User Story 4 - Atomic High-Concurrency Voting Transactions (Priority: P1) 🎯 MVP

**As a** platform operator,  
**I want** voting operations executed in strict atomic database transactions,  
**So that** high-concurrency voting rushes (e.g. finale countdowns) guarantee zero double-counting, zero negative quotas, and zero race conditions.

**Why this priority**: During live events, thousands of voters click simultaneously. Any non-atomic quota check leads to double-voting exploits and corrupt tallies.

**Independent Test**: Fire 20 concurrent requests for the same voter in parallel with only 1 remaining free vote; verify that exactly 1 vote succeeds, 19 fail with quota exhausted, and the contestant tally increases by exactly 1.

**Acceptance Criteria (Gherkin)**:

1. **Given** an active event with 1 free vote allowed per 24 hours, **When** a voter triggers concurrent requests simultaneously, **Then** the interactive Prisma transaction locks or isolates the voter's event quota check, ensuring only 1 vote succeeds.
2. **Given** a successful vote transaction, **When** committed, **Then** the `Vote` ledger record is created, the `Contestant.voteCount` is incremented, and the voter's cooldown window is updated within a single atomic commit.
3. **Given** an unexpected database failure midway through the vote process, **When** an exception occurs, **Then** the entire transaction rolls back completely, leaving tallies and quotas untainted.

---

### User Story 5 - Multi-Tier Paid Vote Boost Support (Priority: P2)

**As a** pageant supporter,  
**I want** to purchase paid vote packages (boosts) with varying vote weights,  
**So that** I can contribute additional weighted votes to my chosen contestant beyond the free daily quota.

**Why this priority**: Paid vote boosts provide event monetization and revenue sharing for organizers, while maintaining distinct ledger tracking from free votes.

**Independent Test**: Submit a paid boost vote with vote weight $> 1$, verify that the `Vote` record is created with `voteType = BOOST` and `voteWeight = N`, and contestant tally increments by $N$.

**Acceptance Criteria (Gherkin)**:

1. **Given** an authenticated voter selecting a paid boost tier (e.g., 10 votes, 50 votes), **When** payment is confirmed, **Then** the vote engine records a `Vote` entry with `voteType = BOOST` and the corresponding `voteWeight`.
2. **Given** a paid boost vote, **When** quota rules are checked, **Then** paid boosts are exempt from the daily free vote limit, but still subject to active event window checks and contestant active status checks.

---

## Edge Cases & Error Handling

- **Event Closure During Flight**: If an event reaches `endsAt` while a vote transaction is processing, the transaction must check the current timestamp against `endsAt` within the transaction and abort with `EVENT_NOT_ACTIVE`.
- **Clock Drift**: All cooldown and window calculations strictly use the database/server `NOW()` timestamp, ignoring client local clocks.
- **VPN / Proxy Subnets**: IP velocity checks evaluate both `x-forwarded-for` and Cloudflare `cf-connecting-ip` headers, preventing spoofed headers.
- **Provider Outage**: If one OAuth provider is unreachable (e.g., Facebook API downtime), fallback to Email Magic Link or Phone OTP remains readily available.
- **Idempotency Key**: Each vote request accepts a client-generated UUID `idempotencyKey` to prevent duplicate ledger inserts on network retries.

---

## Functional Requirements

- **FR-001**: System MUST support voter authentication via Google OAuth, Apple Sign-In, Email Magic Links, Phone OTP (SMS/WhatsApp), and Facebook OAuth.
- **FR-002**: System MUST enforce an account linking strategy that associates identical verified emails across authentication providers to a single voter identity.
- **FR-003**: System MUST require and verify a valid Cloudflare Turnstile token for all free vote submissions before processing business logic.
- **FR-004**: System MUST collect client device fingerprint hash and IP address metadata on vote submissions.
- **FR-005**: System MUST enforce IP velocity rate limiting (maximum 10 submissions per minute per IP).
- **FR-006**: System MUST enforce maximum voter account threshold per device fingerprint (default: 3 accounts per device per 24 hours per event).
- **FR-007**: System MUST execute vote recording and tally increments inside an atomic database transaction with zero race conditions.
- **FR-008**: System MUST support both `FREE` (weight = 1) and `BOOST` (weight $\ge 1$) vote types in the vote ledger.
- **FR-009**: System MUST support client idempotency keys on vote submissions to safely deduplicate retried network requests.
- **FR-010**: System MUST expose typed `ApiResponse<T>` envelopes for Route Handlers and Server Actions per Electa Constitution §II.

---

## Success Criteria

1. **Zero Double-Counting**: In a simulated burst of 50 concurrent requests for a single voter quota, exactly 1 vote is recorded and 49 are safely rejected.
2. **Bot Block Rate**: 100% of vote requests lacking a valid Cloudflare Turnstile token are rejected at the edge/controller layer before hitting database transactions.
3. **Authentication Speed**: Voters can initiate and complete authentication via social or magic link in under 15 seconds.
4. **Transaction Latency**: Vote recording transaction commits within $\le 250\text{ms}$ under normal load.
5. **Full Test Coverage**: Automated unit and integration tests verify all 5 acceptance stories with zero regressions across the existing test suite.

---

## Dependencies & Assumptions

- **Dependencies**:
  - AWS Cognito User Pool with identity provider federation (Google, Apple, Facebook, SMS) and custom token adapter.
  - Cloudflare Turnstile secret key configured via `src/env.ts`.
  - PostgreSQL database with Prisma ORM singleton (`src/lib/db.ts`).
  - Redis / In-memory velocity cache for IP and device throttling.
- **Assumptions**:
  - Event organizers can configure daily free vote limits between 1 and 5 votes (default: 1 vote).
  - Turnstile verification operates in `managed` mode for interactive challenge when bot score is suspicious.

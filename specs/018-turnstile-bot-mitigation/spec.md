# Feature Specification: Cloudflare Turnstile & Free-Tier Velocity Bot Mitigation

**Feature Branch**: `feature/VS-29-cloudflare-turnstile-bot-mitigation`

**Created**: 2026-10-02

**Status**: Draft

**Input**: User description: "VS-29: Cloudflare Turnstile & Free-Tier Velocity Bot Mitigation. Zero-cost invisible bot mitigation and velocity throttling for vote endpoints."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Invisible Bot Verification Challenge (Priority: P1)

As a legitimate voter, I want my vote submission protected by invisible bot verification so that I can cast my ballot instantly without solving tedious CAPTCHAs while knowing that automated ballot-stuffers are prevented from rigging the election.

**Why this priority**: Core security invariant that protects the electoral integrity of every pageant and contest on the platform.

**Independent Test**: Can be tested by submitting a vote with and without a valid verification token and observing that only verified requests increment the vote tallies.

**Acceptance Scenarios**:

1. **Given** a human voter on the public event page, **When** they click "Cast Free Vote" with a valid invisible verification token, **Then** their vote is recorded and credited to their selected candidate.
2. **Given** an automated script sending direct HTTP requests, **When** it posts a vote payload without a valid token or with a tampered token, **Then** the server rejects the request with HTTP 403 Forbidden and no votes are recorded.

---

### User Story 2 - IP-Based Velocity Throttling (Priority: P2)

As an event organizer, I want free-tier voting attempts throttled by IP rate limits so that coordinated bot networks or aggressive script loops are blocked from exhausting system resources.

**Why this priority**: Prevents DDoS-style vote flooding and enforces fair daily quota distribution across shared networks.

**Independent Test**: Can be tested by rapidly submitting more than 10 vote requests within 60 seconds from the same IP and verifying that the 11th request receives HTTP 429.

**Acceptance Scenarios**:

1. **Given** a voter or automated client submitting votes, **When** they exceed 10 vote attempts within a 60-second sliding window from the same IP address, **Then** subsequent requests return an HTTP 429 Too Many Requests response with a clear retry-after wait message.

---

### User Story 3 - Resilient Fail-Closed Degradation (Priority: P3)

As a platform administrator, I want token verification to fail closed on network timeout or security anomalies so that temporary verification service disruptions do not open an attack vector for ballot stuffing.

**Why this priority**: Ensures system security remains intact even under adversarial network conditions.

**Independent Test**: Can be tested by simulating a verification service timeout and confirming the vote is safely rejected without data corruption.

**Acceptance Scenarios**:

1. **Given** a verification service outage or network timeout (>5000ms), **When** a vote submission is evaluated, **Then** the request is safely denied with a user-friendly retry message without corrupting quotas or vote tallies.

---

### Edge Cases

- **What happens when a legitimate voter is behind a university or corporate CGNAT shared IP?** The rate limit allows up to 10 free votes per minute, with individual user daily quotas preventing single-user exhaustion.
- **How does the system handle expired or already-consumed verification tokens?** Tokens are single-use; replayed tokens fail verification on the verification server and are rejected.

---

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST verify incoming vote submissions against a valid verification token before writing to the database.
- **FR-002**: System MUST enforce a sliding-window rate limit of maximum 10 vote attempts per 60 seconds per client IP.
- **FR-003**: System MUST provide an event-scoped vote endpoint (`/api/events/[slug]/vote`) supporting standard typed API envelopes.
- **FR-004**: System MUST fail closed and deny vote recording if token validation times out or fails.
- **FR-005**: System MUST provide a development/test bypass mechanism for automated test suites.

### Key Entities _(include if feature involves data)_

- **VoteSubmission**: Represents a voter's ballot intent containing event reference, candidate identifier, verification token, and client network metadata.
- **RateLimitBucket**: Represents the sliding timestamp log associated with a client IP address to track request velocity.

---

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 100% of automated vote submissions without valid clearance tokens are rejected before touching persistent database records.
- **SC-002**: Legitimate human voters experience zero noticeable delay (<100ms verification overhead).
- **SC-003**: System handles burst traffic of 1,000 requests per second with automatic rate-limit throttling.
- **SC-004**: Zero false positives reported by legitimate voters adhering to the rate limits.

---

## Assumptions

- Free-tier voting is protected by daily quotas per authenticated user in addition to IP velocity limits.
- The verification widget operates in invisible mode unless suspicious behavioral patterns trigger an interactive challenge.
- Cloudflare Turnstile API keys are configured via environment secrets (`CLOUDFLARE_TURNSTILE_SECRET_KEY`).

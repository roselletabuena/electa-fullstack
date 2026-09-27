# Feature Specification: Organizer Voting Rules & Daily Free Vote Quota Configuration

**Feature Branch**: `005-organizer-voting-rules`  
**Created**: 2026-09-27  
**Status**: Draft  
**Input**: User description: "https://the-three-devsketeers.atlassian.net/browse/VS-30 - Allow event organizers to configure the daily free vote quota per voter (1 to 5 votes per 24-hour cycle), toggle free daily voting on/off, and audit all voting rule adjustments."

---

## Overview

Event organizers require precise control over voting mechanics and monetization strategies throughout various phases of a pageant or competition (e.g., preliminary rounds vs. grand finals). This feature introduces comprehensive voting rules management in the organizer settings portal. Organizers can enable or disable free daily voting and adjust the daily free vote quota allocated per voter within a 24-hour cycle (ranging between 1 and 5 votes, default: 1). All voting rule changes are strictly validated and recorded in immutable audit logs to preserve competition transparency and governance integrity.

---

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Organizer Configures Daily Free Vote Quota (Priority: P1) 🎯 MVP

An authenticated event organizer navigates to the "Voting Rules" tab in the event settings dashboard to adjust the daily free vote quota allocated to each voter. The organizer selects a quota between 1 and 5 votes per 24-hour cycle (default is 1 vote) and optionally provides an administrative reason for the adjustment. Upon saving, the system validates the quota range, persists the new quota rule, generates an immutable audit record, and immediately applies the new limit to all subsequent voter validation checks.

**Why this priority**: Controlling the free vote allocation per voter is the core operational lever for audience engagement and fair competition pacing.

**Independent Test**: Log in as an authorized organizer, navigate to `/events/[slug]/settings?tab=voting-rules`, select a daily quota value (e.g., 3 votes), submit "Save Changes", and verify that the updated quota persists across reloads, logs an audit entry, and allows voters up to 3 free votes in a 24-hour window.

**Acceptance Scenarios**:

1. **Given** an authenticated event organizer on the Voting Rules settings tab (`?tab=voting-rules`), **When** they select a daily free vote quota $N$ between 1 and 5 (inclusive) and click "Save Changes", **Then** the event's daily free vote quota is updated in the database, a success notification appears, an entry is recorded in the event audit log, and subsequent vote submissions respect the new quota limit.
2. **Given** an organizer attempts to submit a quota value less than 1 or greater than 5, **When** the form validation runs, **Then** submission is prevented, an inline validation error displays ("Daily free vote limit must be between 1 and 5"), and the previously saved configuration is preserved without change.
3. **Given** an organizer submits a valid quota adjustment along with an optional administrative reason note, **When** the change is saved, **Then** the audit log captures the previous quota, the new quota, the organizer identifier, and the reason text.

---

### User Story 2 - Toggle Free Daily Voting On/Off (Priority: P2)

An organizer transitioning their competition into a paid-only or climax phase (such as Grand Coronation Finals) wants to disable free daily votes so that voters can only participate using paid boost votes. The organizer toggles the "Enable Free Daily Voting" switch to OFF in the Voting Rules tab. Upon saving, the public event voting interface immediately hides or disables free voting actions and prompts voters with paid vote options only.

**Why this priority**: Organizers need dynamic phase-based flexibility to switch from community buzz/free engagement to monetization and finale revenue mode.

**Independent Test**: Navigate to the Voting Rules tab, toggle "Enable Free Daily Voting" to OFF, click "Save Changes", and visit the public event page as a voter to verify that free vote buttons are disabled and only paid voting options are presented.

**Acceptance Scenarios**:

1. **Given** free daily voting is currently enabled on an active event, **When** an authorized organizer toggles "Enable Free Daily Voting" to OFF and clicks "Save Changes", **Then** the event setting updates, an audit entry is generated, and the public event view disables/hides free vote actions while presenting paid boost options.
2. **Given** free daily voting is disabled, **When** an organizer toggles "Enable Free Daily Voting" back to ON and saves, **Then** free voting is restored for voters subject to the configured daily quota.
3. **Given** an organizer changes the toggle state, **When** the form has unsaved modifications, **Then** the save button enables and provides visual feedback indicating pending changes.

---

### User Story 3 - Audit Trail & Governance for Voting Adjustments (Priority: P3)

An organizer or auditor wants to review the history of voting rule modifications to resolve disputes or verify when voting parameters were adjusted during the event lifecycle. Each modification records the actor, exact timestamp, prior state, new state, and optional reason.

**Why this priority**: Transparent governance and tamper-evident audit trails ensure contestant and public trust in competition fairness.

**Independent Test**: Make several changes to voting rules (toggling status, adjusting quota), then inspect the audit log records to verify that every transition is logged with complete before-and-after snapshots and actor details.

**Acceptance Scenarios**:

1. **Given** an authorized organizer updates any voting rule setting, **When** the transaction commits, **Then** an immutable audit entry is written containing action identifier `UPDATE_VOTING_RULES`, timestamp, organizer ID, previous state, new state, and reason.
2. **Given** a failed update request (e.g., network error or authorization failure), **When** the transaction fails, **Then** no partial or corrupted audit log entry is written.

---

## Edge Cases

- **Quota Adjusted Mid-Day for an Active Voter**: When a voter has already cast 1 free vote today, and the organizer increases the quota from 1 to 3, the voter is immediately eligible to cast 2 additional free votes during the current 24-hour cycle.
- **Quota Lowered Below Already-Cast Free Votes**: When a voter has already cast 3 free votes today under a 3-vote limit, and the organizer lowers the limit to 1, the voter cannot cast further free votes today (system respects the new cap without deducting or invalidating past votes).
- **Free Voting Disabled While Voter Has Unspent Free Votes**: When free voting is toggled OFF, any remaining unused daily free votes cannot be cast until free voting is re-enabled.
- **Concurrent Rule Updates**: When multiple organizers or browser sessions submit rule changes simultaneously, atomic updates ensure only valid sequential states are saved and each transition is logged in order.
- **Non-Numeric or Out-of-Bounds Input**: Entering negative numbers, decimals, non-digits, or numbers > 5 is caught by client and server schema validation, preventing persistence of invalid states.

---

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST provide an interactive "Voting Rules" configuration form within the organizer event settings tab (`/events/[slug]/settings?tab=voting-rules`).
- **FR-002**: System MUST allow organizers to configure the `dailyFreeVoteLimit` within the range of 1 to 5 (inclusive, integer values).
- **FR-003**: System MUST set the default `dailyFreeVoteLimit` to 1 for newly created events or when unconfigured.
- **FR-004**: System MUST allow organizers to toggle `isFreeVotingEnabled` between ON (`true`) and OFF (`false`).
- **FR-005**: System MUST validate that `dailyFreeVoteLimit` is strictly an integer between 1 and 5 before accepting any update.
- **FR-006**: System MUST provide an optional "Reason for change" input field (maximum 500 characters) for audit trail context.
- **FR-007**: System MUST record an immutable `EventAuditLog` entry upon every successful voting rule modification detailing `action`, `changedBy`, `previousVal`, `newVal`, and optional `reason`.
- **FR-008**: System MUST enforce server-side ownership authorization on the update action, rejecting unauthorized attempts with HTTP 403 Forbidden.
- **FR-009**: System MUST disable or hide free vote submission on public event interfaces when `isFreeVotingEnabled` is `false`, directing voters exclusively to paid boost options.
- **FR-010**: System MUST enforce the active `dailyFreeVoteLimit` on the server during vote submission validations across the rolling 24-hour cycle per voter.
- **FR-011**: System MUST provide clear, accessible feedback (success toasts and inline field validation messages) upon form interactions.
- **FR-012**: System MUST retain existing configuration and prevent destructive overwrite if form submission fails validation.

### Key Entities

- **Voting Rules Configuration**: Attributes defining voting policy for an event, including `isFreeVotingEnabled` (boolean) and `dailyFreeVoteLimit` (integer between 1 and 5).
- **Event Audit Log**: Immutable record tracking changes to voting rules, containing event ID, action name (`UPDATE_VOTING_RULES`), author ID, timestamp, before/after rule state snapshots, and optional rationale.
- **Voter Daily Free Allowance**: The calculated number of free votes a voter has utilized within the active 24-hour operational window against the event's configured quota.

---

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Organizers can update voting rules and receive visual confirmation in under 300 milliseconds under standard network conditions.
- **SC-002**: 100% of voting rule updates produce a corresponding `EventAuditLog` record with complete state snapshots.
- **SC-003**: 100% of out-of-range quota inputs (< 1 or > 5 or non-integers) are rejected before database persistence with zero invalid records stored.
- **SC-004**: When free voting is toggled OFF, 100% of subsequent free vote attempts on the event are prevented, routing voters directly to paid boost options.

---

## Assumptions

- Free daily voting cycles operate on a rolling 24-hour window per voter identity or device session.
- Paid boost voting mechanics are independent of the daily free quota and remain accessible even when free daily voting is toggled OFF.
- The organizer managing voting rules is the authenticated owner of the event and has been verified by the event ownership guard.

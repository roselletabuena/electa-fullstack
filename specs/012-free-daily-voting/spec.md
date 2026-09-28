# Feature Specification: Cast Free Daily Votes & 24-Hour Cooldown Engine

**Feature Branch**: `012-free-daily-voting`  
**Created**: 2026-09-28  
**Status**: Ready for Planning  
**Jira Key**: VS-28  
**Input**: User description: "https://the-three-devsketeers.atlassian.net/browse/VS-28 - Allow authenticated voters to cast free daily votes (up to the event's configured daily quota of 1 to 5 votes) with live balance tracking and 24-hour cooldown feedback."

---

## Overview

In competitive pageants and community voting events, daily free votes drive organic community engagement, voter retention, and fairness by ensuring every supporter can participate regardless of their ability to purchase paid vote boosts. This feature introduces the voter-facing free voting engine and cooldown management system.

Authenticated voters can cast their daily allocated free votes (1 to 5 votes per 24-hour window, as configured by the event organizer) for their preferred candidates. The interface provides real-time visibility into remaining vote balances, optimistic vote updates, and when the daily quota is exhausted, displays an active 24-hour countdown timer indicating when the voter's next free vote becomes available.

---

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Authenticated Supporter Casts Free Daily Vote (Priority: P1) 🎯 MVP

An authenticated voter visiting an active competition page explores the contestants in a division or category. The voter identifies their candidate of choice and sees an active "Cast Free Vote" action button displaying their remaining daily free allowance (e.g., "Cast Free Vote (2/3 left)"). When the voter clicks the button, the system atomically records the free vote, increments the candidate's public tally, decrements the voter's remaining daily quota, and provides immediate visual feedback.

**Why this priority**: Casting free daily votes is the fundamental engagement mechanic for the entire platform. Without it, voters cannot participate in active events without purchasing boosts.

**Independent Test**: Log in with an authenticated user account, open an active event with free voting enabled and daily quota set to 3, click "Cast Free Vote" on Contestant #1, verify that the contestant's vote tally increments by 1, and the remaining balance updates to "2/3 left".

**Acceptance Scenarios**:

1. **Given** an authenticated voter viewing a contestant card in an active event with free voting enabled, **and Given** the voter has unused free votes in their daily quota (e.g., 1 of 3 used), **When** the voter clicks "Cast Free Vote", **Then** the vote is atomically recorded in the vote ledger, the contestant's total vote tally increases by 1, and the voter's remaining daily allowance updates (e.g., "1/3 left").
2. **Given** an unauthenticated visitor clicks "Cast Free Vote", **When** the action is triggered, **Then** the system prompts the visitor to sign in or create an account before completing their vote.
3. **Given** a voter submits a free vote on a candidate, **When** the transaction confirms, **Then** an immediate success indicator confirms the vote was recorded.

---

### User Story 2 - Quota Exhaustion & 24-Hour Cooldown Feedback (Priority: P2)

When an authenticated voter has cast all free daily votes permitted by the event's daily quota within the current 24-hour cycle, all free voting action buttons across the event transition to a disabled cooldown state. The UI displays an informative badge and a live countdown timer indicating the precise time remaining until their next free vote cycle begins (e.g., "Daily votes used — Next vote in 14h 22m 10s"). The voter is also presented with the option to purchase paid vote boosts if they wish to continue supporting candidates immediately.

**Why this priority**: Clear cooldown feedback prevents confusion, stops duplicate vote attempts, and motivates voters to return daily or explore paid vote packages.

**Independent Test**: Cast all $N$ allowed free votes for an active event, observe that free vote buttons disable across all contestants in that event, verify that the live countdown timer displays and ticks downward every second, and confirm that clicking a boost button opens the paid vote tier options.

**Acceptance Scenarios**:

1. **Given** an authenticated voter has cast all $N$ allocated free votes within the active 24-hour cycle, **When** they view any contestant in the event, **Then** the free vote button is disabled and displays a live countdown timer formatted as `HH:MM:SS` or `Xh Ym remaining`.
2. **Given** a voter is in the cooldown period, **When** they attempt to trigger a free vote action (e.g., via stale client state or direct action), **Then** the system strictly rejects the vote and returns a user-friendly cooldown notice with the remaining reset duration.
3. **Given** a voter in cooldown views the contestant card, **When** they view the available voting options, **Then** the UI clearly differentiates the exhausted free option from active paid boost alternatives.

---

### User Story 3 - Automatic Rolling Cooldown Expiration & Daily Allowance Restoration (Priority: P3)

When the 24-hour cooldown period elapses for a voter, the system automatically restores the voter's full daily free vote allowance without requiring manual account resets or page reloads.

**Why this priority**: Seamless cycle restoration ensures uninterrupted daily voter retention loops across multi-day and multi-week competitions.

**Independent Test**: Simulate or observe the expiration of a 24-hour window from the oldest vote in the quota; verify that the countdown reaches 00:00:00, the "Cast Free Vote" button re-enables, and the allowance displays full quota (e.g., "3/3 left").

**Acceptance Scenarios**:

1. **Given** an authenticated voter whose 24-hour cooldown window elapses while viewing the page, **When** the countdown reaches zero, **Then** the free voting action button automatically transitions from disabled back to active with full daily allowance restored.
2. **Given** a voter returns to the platform after more than 24 hours since their previous voting cycle, **When** they load the active event page, **Then** their full daily free quota is available immediately.

---

## Edge Cases

- **Multiple Votes within Quota**: When an event allows $N > 1$ free votes per day, each vote can be cast for the same contestant or distributed among different contestants in the same event.
- **Rolling Window vs Fixed Midnight Reset**: Free vote quotas operate on a rolling 24-hour window calculated from each recorded vote timestamp, ensuring voters cannot double-dip across arbitrary timezone boundaries.
- **Event Operational Window Closed**: If an event status is `DRAFT`, `ENDED`, or outside its operational `startsAt`/`endsAt` window, all free vote actions are disabled regardless of the voter's daily quota.
- **Free Voting Disabled by Organizer**: If the organizer has toggled `isFreeVotingEnabled` to `false`, free vote buttons are completely hidden or disabled with a notice that only boost votes are accepted for this event phase.
- **Concurrent Vote Requests**: Rapid successive clicks or concurrent requests from multiple tabs using the same account are locked atomically, preventing any voter from casting more than $N$ free votes in the 24-hour cycle.
- **Network Disconnection / Intermittent Failure**: If a vote request encounters a network drop, the client displays a non-destructive retry notification without deducting the voter's allowance or double-counting.

---

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST allow authenticated voters to cast free daily votes on contestants in an active event up to the event's configured `dailyFreeVoteLimit` (1 to 5 votes).
- **FR-002**: System MUST enforce that free voting is only permitted when the event is in an `ACTIVE` status and `isFreeVotingEnabled` is `true`.
- **FR-003**: System MUST calculate remaining free daily allowance based on the number of free votes recorded for the voter in that specific event within the trailing 24 hours.
- **FR-004**: System MUST allow voters with a daily quota $> 1$ to distribute their free votes across different contestants or cast multiple free votes for a single contestant.
- **FR-005**: System MUST atomically record each free vote transaction with voter identifier, event identifier, contestant identifier, category attribution, and vote timestamp.
- **FR-006**: System MUST increment the target contestant's total vote tally by exactly 1 per free vote cast.
- **FR-007**: System MUST display the voter's current remaining free vote allowance directly on the contestant voting interface (e.g., "Cast Free Vote (2/5 left)").
- **FR-008**: System MUST disable the free vote action when the voter's 24-hour allowance is exhausted ($0$ remaining).
- **FR-009**: System MUST display a live countdown timer showing remaining hours, minutes, and seconds until the earliest vote in the current 24-hour window resets.
- **FR-010**: System MUST automatically re-enable the free vote action once the cooldown expires.
- **FR-011**: System MUST require authentication before casting a free vote and prompt unauthenticated users with a login/signup dialog when they attempt to vote.
- **FR-012**: System MUST prevent race conditions using atomic transaction isolation and rate limiting to guarantee no voter exceeds their daily limit under any concurrency scenario.

### Key Entities

- **Free Vote Record**: Represents an individual free vote cast by an authenticated user for a specific contestant in an event, recording timestamps for rolling 24-hour calculation.
- **Voter Quota State**: The computed status of a voter for a given event, including total allowed daily votes ($N$), votes used in the trailing 24 hours, remaining balance ($N - \text{used}$), and timestamp of earliest expiring vote.
- **Contestant Vote Aggregation**: The verified total vote tally for each contestant, reflecting both free daily votes and paid boost votes.

---

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Voters can cast an available free vote and observe UI confirmation within 500 milliseconds under standard network conditions.
- **SC-002**: 100% of free vote requests exceeding the event's configured 24-hour quota are rejected with zero over-allocation anomalies.
- **SC-003**: 100% of verified free votes are atomically reflected in the contestant's total vote tally.
- **SC-004**: When in cooldown, the live countdown timer remains accurate within 1 second of server reset time.

---

## Assumptions

- Users must be authenticated with a verified account to cast free votes, deterring unauthenticated bot manipulation.
- Rolling 24-hour cooldown is computed per voter account and per event (casting votes in Event A does not consume free vote allowance in Event B).
- Organizers configure `dailyFreeVoteLimit` (1–5) and `isFreeVotingEnabled` via the Event Settings Portal (covered in VS-30 / Spec 005).
- Paid boost packages operate independently of free daily voting quotas and do not consume free vote allowances.

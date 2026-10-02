# Feature Specification: Real-Time Live Leaderboard & Stealth Mystery Freeze

**Feature Branch**: `feature/VS-22-realtime-leaderboard-mystery-freeze`  
**Jira Key**: `VS-22`  
**Created**: 2026-10-02  
**Status**: Draft

**Input**: User story: "VS-22: Real-Time Live Leaderboard & Stealth Mystery Freeze. Real-time live ranking updates with dynamic podium animations and the ability to freeze public rankings before the grand finals so that suspense is maintained while voting continues."

---

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Live Real-Time Leaderboard & Top-3 Podium (Priority: P1) 🎯 MVP

As a pageant fan and voter, I want to watch the real-time leaderboard update instantly with dynamic rankings and podium animations so that I can see my favorite candidate's standing and know exactly how many votes they need to take the lead.

**Why this priority**: Core engagement and viral gamification driver for live competition events.

**Independent Test**: Can be tested by opening the public leaderboard page, submitting a vote from a separate client, and verifying that the vote total, rank order, and vote gap indicator ("Needs X votes to take 1st!") update smoothly without a manual page refresh.

**Acceptance Scenarios**:

1. **Given** a published active event, **When** a user navigates to the event leaderboard (`/events/[slug]/leaderboard`), **Then** they see ranked candidate cards with the Top 3 highlighted in Gold (#1), Silver (#2), and Bronze (#3) zero-radius podium cards.
2. **Given** a candidate in 2nd or 3rd place, **When** the podium card renders, **Then** a dynamic gap badge displays the exact vote difference required to surpass the higher rank (e.g., "Needs 12 votes to take 1st!").
3. **Given** a voter casting a free or boosted vote, **When** the vote is committed to the database, **Then** the leaderboard broadcasts the updated tallies via Supabase Realtime / SSE and recalculates ranks live on connected screens.

---

### User Story 2 - Stealth Mystery Freeze Window (Priority: P2)

As an event organizer, I want the ability to schedule or manually trigger a "Mystery Freeze" window before the grand coronation, so that the public leaderboard hides live rankings to build suspense while the back-end voting engine continues to accept and tally votes in secret.

**Why this priority**: Crucial pageant operational requirement to prevent outcome spoilers before live stage announcements while driving high-intensity last-minute voting.

**Independent Test**: Can be tested by setting an event's freeze window or manually toggling `isLeaderboardFrozen = true` in settings, verifying that public visitors see a "Mystery Freeze Active — Rankings Hidden for Stage Announcement" banner with hidden vote tallies, while submitting a vote continues to succeed and increment persistent tallies.

**Acceptance Scenarios**:

1. **Given** an event with `isLeaderboardFrozen = true` or current time within `freezeStartsAt` to `endsAt`, **When** a public voter views `/events/[slug]/leaderboard`, **Then** live vote counts and rank positions are replaced with randomized/alphabetical candidate tiles and a branded "Mystery Freeze in Effect" alert banner.
2. **Given** an active mystery freeze, **When** an authorized organizer views their dashboard overview, **Then** they can view the true un-frozen live standings and real-time tally behind organizer session authentication.
3. **Given** an active mystery freeze, **When** a voter casts a vote via `/api/events/[slug]/vote`, **Then** the vote is accepted, verified, and saved to the database without disclosing updated ranks in the public response.

---

### User Story 3 - Multi-Division & Award Category Tab Filtering (Priority: P3)

As a voter or pageant judge, I want to filter the leaderboard by division (e.g., Female, Male, Teens) and specialized award tracks (e.g., _Best in Swimsuit_, _People's Choice_), so that I can see the standings for specific competition categories.

**Why this priority**: Pageants feature multiple sub-competitions with independent awards and leaderboards.

**Independent Test**: Can be tested by switching division/category pills on the leaderboard and verifying that candidates and podium ranks update to reflect category-specific tallies.

**Acceptance Scenarios**:

1. **Given** an event with multiple divisions or award categories, **When** a user clicks an award category pill (e.g., "People's Choice"), **Then** the URL updates with `?category=<id>` (via `nuqs`) and the podium renders rankings scoped to that award track.

---

## Edge Cases

- **What happens when two or more candidates have an exact tie in vote count?** Candidates with identical vote counts share the same rank number (e.g., T-1st) and are sub-ordered deterministically by earliest vote timestamp or contestant number.
- **What happens when an event ends (`endsAt` passed)?** If `showResultsOnClose = true`, the final verified tallies and winners are revealed publicly, lifting the mystery freeze state.
- **What happens if a real-time connection drops?** The client falls back to periodic polling (every 15 seconds) or reconnects automatically with exponential backoff.

---

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST provide a dedicated public leaderboard page at `/events/[slug]/leaderboard` and route handler `/api/events/[slug]/leaderboard`.
- **FR-002**: System MUST calculate rank positions, percentage shares, and vote gap metrics to the next rank and 1st place rank.
- **FR-003**: System MUST support Top 3 podium highlighting with gold, silver, and bronze badge accents matching Electa zero-radius Brutalist-Refined styling.
- **FR-004**: System MUST support organizer-controlled mystery freeze via `isLeaderboardFrozen` boolean flag and optional `freezeStartsAt` schedule in Event settings.
- **FR-005**: System MUST withhold rank numbers and precise vote counts from public API responses when mystery freeze is active, while allowing authenticated organizers to view full tallies.
- **FR-006**: System MUST allow filtering rankings by division ID and award category ID with URL state persistence.

### Key Entities

- **LeaderboardEntry**: Represents a ranked candidate with ID, contestant number, name, avatar, division, vote count, rank position, and gap-to-leader.
- **LeaderboardState**: Represents the overall leaderboard payload including freeze status (`isFrozen`), total votes cast, last updated timestamp, and category filter metadata.
- **FreezeConfiguration**: Settings on the Event entity governing automated schedule (`freezeStartsAt`) and manual override (`isLeaderboardFrozen`).

---

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Leaderboard updates appear on client screens within <500ms of vote commitment via Realtime / SSE.
- **SC-002**: 100% of public responses during Mystery Freeze redact exact vote counts and rank positions to prevent data leaks.
- **SC-003**: Podium and candidate list fully conform to Electa Light Opal design system, zero-radius geometry, and WCAG 2.1 AA contrast.
- **SC-004**: Switching categories updates the view instantaneously with zero client-side layout shifts.

---

## Assumptions

- Free daily votes and boosted paid votes are aggregated into the candidate's total vote weight.
- Organizers can toggle the freeze state directly from their event dashboard settings.

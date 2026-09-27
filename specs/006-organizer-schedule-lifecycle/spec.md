# Feature Specification: Organizer Event Operational Schedule & Publication Lifecycle Controls

**Feature Branch**: `006-organizer-schedule-lifecycle`  
**Created**: 2026-09-27  
**Status**: Draft  
**Input**: User description: "https://the-three-devsketeers.atlassian.net/browse/VS-34 - Enable organizers to configure voting start/end timestamps, manage publication status (Draft / Published / Archived), and manage the draft review passphrase."

---

## Overview

Event organizers require precise control over the operational timeline and public availability of their voting events. This feature implements the "Schedule & Timeline" settings within the organizer dashboard, enabling organizers to configure the exact voting operational window (`startsAt` and `endsAt` in local Philippine Time `Asia/Manila`), transition publication states (`DRAFT`, `PUBLISHED`, `ARCHIVED`), and set or update a secure draft review passphrase for private pre-launch stakeholder previews. All schedule adjustments and lifecycle transitions are validated strictly, recorded into tamper-evident audit logs, and synchronized across public countdown banners and voting state guards.

---

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Organizer Configures Voting Schedule Window (Priority: P1) 🎯 MVP

An authenticated event organizer navigates to the "Schedule & Timeline" tab in the event settings dashboard to define the operational voting period. The organizer inputs the voting start date/time (`startsAt`) and end date/time (`endsAt`) in Philippine Standard Time (`Asia/Manila`). Upon submitting "Save Changes", the system validates that the end time is strictly after the start time, persists the operational window, writes an audit log entry, and immediately updates the public event countdown timer and voting window status.

**Why this priority**: Defining when voting opens and closes is foundational for running any scheduled competition.

**Independent Test**: Log in as an authorized organizer, navigate to `/events/[slug]/settings?tab=schedule`, adjust `startsAt` and `endsAt`, save changes, and verify that the new dates persist, generate an audit record, and reflect immediately on the event's public countdown banner.

**Acceptance Scenarios**:

1. **Given** an authenticated organizer on the Schedule & Timeline tab (`?tab=schedule`), **When** they configure `startsAt` and `endsAt` (where `endsAt` is strictly greater than `startsAt`) in `Asia/Manila` time and click "Save Changes", **Then** the operational window is saved, a success notification appears, an `EventAuditLog` entry is recorded, and the public countdown banner adjusts.
2. **Given** an organizer enters an `endsAt` timestamp that is equal to or earlier than `startsAt`, **When** form validation executes, **Then** submission is blocked and an inline validation error is displayed ("Voting end date must be after start date").
3. **Given** an organizer saves schedule modifications with an optional administrative reason note, **When** changes persist, **Then** the audit log records previous timestamps, new timestamps, the actor ID, and the reason text.

---

### User Story 2 - Organizer Manages Publication Lifecycle States (Priority: P1)

An organizer needs to transition an event across its lifecycle phases: from `DRAFT` (private preparation) to `PUBLISHED` (live for public view and scheduled voting) or `ARCHIVED` (concluded competition with read-only historical results). When an organizer toggles the status or selects a new publication state, a confirmation modal explains the consequences before committing the transition.

**Why this priority**: Organizers need explicit governance over when an event is exposed to the public or frozen after completion.

**Independent Test**: Navigate to the Schedule & Timeline settings, transition an event from `DRAFT` to `PUBLISHED` via the confirmation modal, and confirm that unauthorized public voters can access the event without a draft passphrase. Transition to `ARCHIVED` and confirm voting is closed.

**Acceptance Scenarios**:

1. **Given** an event in `DRAFT` status, **When** the organizer transitions status to `PUBLISHED` and confirms in the prompt, **Then** the event status updates to `PUBLISHED`, an audit log entry is recorded, and the event becomes accessible to the public without requiring a preview passphrase.
2. **Given** an event in `PUBLISHED` status, **When** the organizer selects `ARCHIVED` and confirms the action, **Then** the event is marked `ARCHIVED`, voting is locked, and results remain visible in read-only mode according to event results settings.
3. **Given** an organizer attempts to publish an event without valid start and end dates, **When** submission is initiated, **Then** the system prompts the organizer to complete the required operational schedule first.

---

### User Story 3 - Organizer Configures Draft Preview Passphrase (Priority: P2)

An organizer preparing an unlaunched event (`DRAFT` status) wants external stakeholders (sponsors, judges, contestants) to review the event page without making it public. The organizer sets a draft review passphrase in the Schedule & Timeline tab. When stakeholders visit the event URL, they are prompted for the passphrase to unlock a preview session. The organizer can update or clear the passphrase at any time.

**Why this priority**: Pre-launch quality assurance and confidential stakeholder review are critical workflows prior to public announcement.

**Independent Test**: Set a draft preview passphrase in the settings, visit the event URL in an incognito browser window, submit the passphrase to unlock the draft preview banner, and verify that the draft content is visible.

**Acceptance Scenarios**:

1. **Given** an event in `DRAFT` status, **When** the organizer enters a new passphrase (minimum 4 characters) and saves, **Then** the passphrase hash is persisted securely, an audit entry is created, and visitors must provide the passphrase to preview the draft event.
2. **Given** an organizer removes or clears the draft passphrase, **When** saved, **Then** the draft event can only be accessed by authenticated organizers.
3. **Given** an event is in `PUBLISHED` or `ARCHIVED` status, **When** viewing the draft passphrase controls, **Then** the system displays informational status indicating that the passphrase only applies while the event is in `DRAFT` mode.

---

### User Story 4 - Audit Trail for Schedule & Lifecycle Adjustments (Priority: P3)

An organizer or administrator reviews the chronological audit logs to verify who modified operational dates, publication status, or draft security settings, and when those changes occurred.

**Why this priority**: Transparent governance and dispute resolution require full visibility into event lifecycle history.

**Independent Test**: Execute schedule updates and status transitions, then query the audit log table to confirm that every action is captured with exact before-and-after snapshots.

**Acceptance Scenarios**:

1. **Given** an organizer updates schedule dates or publication status, **When** the transaction completes, **Then** an `EventAuditLog` entry is recorded with action type (`UPDATE_SCHEDULE_LIFECYCLE` or `UPDATE_PUBLICATION_STATUS`), timestamp, author ID, previous state, new state, and reason.
2. **Given** an unauthorized user attempts to alter lifecycle or schedule settings, **When** the request is processed, **Then** the request is rejected with HTTP 403 Forbidden and no audit record is committed.

---

## Edge Cases

- **Voting Window Already Passed**: If an organizer sets a historical operational window (both `startsAt` and `endsAt` in the past) on a published event, the system correctly reflects the event as ended/closed and disables active voting.
- **Modifying Operational Window During Live Voting**: If an organizer extends `endsAt` while voting is currently active, the public countdown timer updates dynamically without disrupting in-flight votes.
- **Unpublishing a Live Event**: If an organizer reverts a `PUBLISHED` event back to `DRAFT`, any active public voter sessions are redirected to the draft access gate on their next action or refresh.
- **Passphrase Complexity & Security**: Passphrases are hashed securely (using bcrypt/Argon2) before storage and never logged or exposed in plain text.
- **Timezone Normalization**: Input dates in `Asia/Manila` (UTC+8) are converted accurately to standard ISO-8601 UTC timestamps on the server and rendered back in local Philippine time in the organizer UI.

---

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST provide a dedicated "Schedule & Timeline" form on the organizer settings dashboard (`/events/[slug]/settings?tab=schedule`).
- **FR-002**: System MUST allow organizers to configure `startsAt` and `endsAt` timestamps formatted in Philippine Time (`Asia/Manila`, UTC+8).
- **FR-003**: System MUST enforce that `endsAt` is strictly later than `startsAt` across client and server validation schemas.
- **FR-004**: System MUST allow organizers to update the event's `publicationStatus` between `DRAFT`, `PUBLISHED`, and `ARCHIVED`.
- **FR-005**: System MUST require explicit confirmation via a modal dialog before applying lifecycle transitions (`DRAFT` → `PUBLISHED`, `PUBLISHED` → `ARCHIVED`, or `PUBLISHED` → `DRAFT`).
- **FR-006**: System MUST allow organizers to set, update, or remove a draft review passphrase (minimum 4 characters when set).
- **FR-007**: System MUST securely hash draft passphrases before storage and never expose hashes or plain text in client payloads.
- **FR-008**: System MUST provide an optional "Reason for change" field (maximum 500 characters) for audit trail records.
- **FR-009**: System MUST record an immutable `EventAuditLog` entry for every operational schedule, publication status, or draft passphrase update.
- **FR-010**: System MUST enforce server-side event ownership verification, returning HTTP 403 Forbidden for unauthorized requests.
- **FR-011**: System MUST immediately reflect schedule and status changes on the public countdown banner, event status badge, and voting action guards.
- **FR-012**: System MUST preserve existing data and provide clear, accessible inline validation errors if form submission fails.

### Key Entities

- **Event Operational Schedule**: Attributes governing the voting window, including `startsAt` (UTC timestamp), `endsAt` (UTC timestamp), and calculated operational phase (`UPCOMING`, `OPEN`, `CLOSED`).
- **Publication Lifecycle**: Status enum comprising `DRAFT`, `PUBLISHED`, and `ARCHIVED`.
- **Draft Review Security**: Configuration for draft preview access, including `draftPassphraseHash` (nullable secure hash).
- **Event Audit Log**: Immutable record detailing the event ID, action (`UPDATE_SCHEDULE_LIFECYCLE`), user ID, timestamp, before/after values, and optional rationale.

---

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Organizers can update operational schedule and publication settings and receive visual confirmation within 400 milliseconds under standard network conditions.
- **SC-002**: 100% of schedule submissions with `endsAt <= startsAt` are rejected before persistence with zero corrupted date ranges stored.
- **SC-003**: 100% of schedule and lifecycle changes generate a corresponding `EventAuditLog` record with complete state snapshots.
- **SC-004**: Transitioning an event to `PUBLISHED` immediately permits public voter access without requiring draft credentials across 100% of tested clients.

---

## Assumptions

- Schedule inputs in the organizer dashboard default to Philippine Time (`Asia/Manila`, UTC+8) and are converted to ISO UTC for database storage.
- The organizer managing schedule and lifecycle settings is authenticated and verified as the event owner.
- Draft preview authentication utilizes a secure signed cookie/session token upon valid passphrase entry.

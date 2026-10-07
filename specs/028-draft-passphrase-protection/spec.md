# Feature Specification: Draft Event Passphrase Protection & Access Control

**Feature Branch**: `feature/VS-80-draft-passphrase-protection`

**Created**: 2026-10-08

**Status**: Draft

**Input**: User description: "https://the-three-devsketeers.atlassian.net/browse/VS-80"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Verified Ownership Enforcement for Draft Previews (Priority: P1)

An organizer with an unlaunched draft event wants to keep their contest configuration and contestant roster confidential. When visiting the event URL, only the authentic event organizer (the verified owner) should automatically bypass the draft passphrase modal to preview and configure the contest. Any other visitor—including authenticated users who belong to other accounts or do not own this specific event—must be treated as a standard guest and required to provide the valid Draft Review Passphrase before accessing any draft event details.

**Why this priority**: Prevents a severe authorization bypass where any logged-in user in the system could inspect private, unlaunched draft events and competitor rosters without the organizer's permission.

**Independent Test**: Log in as User B (non-owner), navigate to a draft event created by User A that has a draft passphrase set, and verify that User B is presented with the passphrase entry prompt rather than direct event access.

**Acceptance Scenarios**:

1. **Given** an event in `Draft` status owned by Organizer A, **When** Organizer A visits the event preview page while logged in, **Then** Organizer A is granted direct organizer preview access without being prompted for a passphrase.
2. **Given** an event in `Draft` status owned by Organizer A with a draft passphrase configured, **When** User B (an authenticated user who is not Organizer A) visits the event page, **Then** User B is presented with the draft passphrase verification gate.
3. **Given** an event in `Draft` status with no draft passphrase configured, **When** any non-owner user (authenticated or anonymous) visits the event page, **Then** access is refused with an informative message indicating the draft is private and unconfigured for preview.

---

### User Story 2 - Public Event API Protection for Unpublished Events (Priority: P1)

When external consumers or automated tools query the public event information endpoints, the system must not disclose draft contest details, draft settings, or contestant profiles unless the requester provides proof of valid preview authorization or ownership credentials.

**Why this priority**: Closing front-end modal gates is ineffective if the underlying data endpoint returns all contestant information, biographies, and sensitive setup data to any unauthenticated caller.

**Independent Test**: Issue a direct network request to fetch event details for an unlaunched draft event without session or preview cookies, and verify the endpoint responds with an unauthorized/not found error without returning contestant data.

**Acceptance Scenarios**:

1. **Given** an event in `Draft` status, **When** an unauthenticated visitor or non-owner without a valid preview credential requests the event data via the event endpoint, **Then** the system rejects the request (returning 404 Not Found or 401 Unauthorized) and discloses no contestant or event information.
2. **Given** an event in `Draft` status, **When** the verified event owner requests the event data while authenticated, **Then** the system returns full draft event details.
3. **Given** an event in `Draft` status, **When** a guest reviewer presenting a valid, unexpired preview credential requests the event data, **Then** the system returns the sanitized draft event details for review.

---

### User Story 3 - Instant Invalidation on Passphrase Rotation & Removal (Priority: P2)

An organizer who previously shared a draft review passphrase with external reviewers (such as sponsors or judges) wants to revoke or update that access. When the organizer rotates the passphrase to a new phrase or clears the passphrase entirely, all previously issued preview sessions and tokens must immediately become invalid, forcing reviewers to submit the updated passphrase (or locking them out if cleared).

**Why this priority**: Guarantees access revocation operates in real time so stale cookies cannot provide indefinite unauthorized access after permissions change.

**Independent Test**: Unlock draft preview access with passphrase "Alpha123", verify access is granted, change the passphrase in settings to "Beta456", reload the preview page, and confirm the existing session is rejected and the user is re-prompted for the new passphrase.

**Acceptance Scenarios**:

1. **Given** an active preview session unlocked with Passphrase A, **When** the organizer updates the draft review passphrase to Passphrase B, **Then** the previous preview session is immediately rejected on subsequent visits and the user must provide Passphrase B.
2. **Given** an active preview session unlocked with Passphrase A, **When** the organizer removes or clears the draft passphrase, **Then** any existing preview session is immediately invalidated, and only the verified organizer can access the draft.
3. **Given** an event that transitions from `Draft` to `Published`, **When** any visitor accesses the event, **Then** access is granted publicly regardless of prior draft preview tokens.

---

### User Story 4 - Organizer Guidance for Preview Testing (Priority: P3)

An organizer configuring draft security settings needs clear in-context guidance explaining how draft access works. Because organizers automatically bypass the passphrase prompt due to their active owner session, the settings interface must explicitly inform them of this behavior and advise them to use an incognito/private browser window or a separate device to test the external guest reviewer experience.

**Why this priority**: Eliminates organizer confusion and false-positive bug reports where organizers test their own draft page in the same browser and mistakenly believe the passphrase lock is broken.

**Independent Test**: Open the Schedule & Publication Lifecycle settings on a draft event with a passphrase set, and verify an informational note is visible explaining that the owner session bypasses the passphrase prompt and directing them to test with incognito mode.

**Acceptance Scenarios**:

1. **Given** an organizer views the Draft Review Passphrase settings for a draft event, **When** a passphrase is set or being configured, **Then** the UI displays clear helper guidance explaining that their active organizer session automatically unlocks preview mode.
2. **Given** the organizer guidance note, **When** reading the testing instructions, **Then** the text explicitly suggests opening an incognito browser window or sharing the link with an external reviewer to verify the passphrase prompt.

---

### Edge Cases

- **Session Expired During Draft Review**: If a guest reviewer's preview session expires while browsing the draft event, their next interaction or navigation prompts them with the passphrase dialog without crashing the application.
- **Simultaneous Status and Passphrase Modification**: When an organizer changes both the publication status (e.g., from `Draft` to `Published`) and the passphrase in a single submission, the publication status takes precedence and public access is granted immediately.
- **Passphrase with Leading or Trailing Whitespace**: Passphrase inputs during setup and verification are sanitized consistently so unintended spaces do not lock out reviewers.
- **Non-existent Event Query**: Requesting draft verification or preview access for an event slug that does not exist returns a standard 404 response without leaking information about draft existence.
- **Multi-Tab Organizer Session Logout**: If an organizer logs out in another tab and refreshes a draft event page without a preview token, they are immediately redirected to the passphrase gate or login prompt.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST restrict automatic draft preview bypass strictly to the verified event organizer who owns the event (`session.userId === event.organizerId`).
- **FR-002**: System MUST treat authenticated non-owner users (logged-in users whose identity does not match the event's organizer ID) as guest visitors subject to the Draft Review Passphrase gate.
- **FR-003**: System MUST require a valid Draft Review Passphrase for any guest or unauthenticated visitor attempting to access a draft event page (`/events/[slug]`).
- **FR-004**: System MUST deny access to draft event pages for non-owners when no Draft Review Passphrase is configured, displaying an unconfigured/private draft notice.
- **FR-005**: System MUST enforce authorization checks on the event details endpoint (`GET /api/events/[slug]`), returning HTTP 404 Not Found or HTTP 401 Unauthorized for draft events unless the caller is either the verified event owner or possesses a valid preview authorization token.
- **FR-006**: System MUST bind the draft preview authorization token to the active passphrase state (such as incorporating a cryptographic signature of the passphrase hash version or digest) so that changing or removing the passphrase instantly invalidates all previously issued preview tokens.
- **FR-007**: System MUST immediately reject preview authorization tokens when the event passphrase has been cleared, rotated, or when the event is no longer in draft status.
- **FR-008**: System MUST securely transmit and store draft preview tokens in HTTP-only, secure cookies with strict domain and path scoping.
- **FR-009**: System MUST display an informational guidance callout in the organizer's Schedule & Publication Lifecycle settings explaining that active organizer sessions bypass the passphrase gate, with instructions to test guest access in an incognito window.
- **FR-010**: System MUST never leak plain text passphrases, raw hash digests, or private organizer identifiers in public or client-accessible payloads.
- **FR-011**: System MUST record an audit log entry whenever a draft passphrase is created, modified, or removed by the organizer.

### Key Entities

- **Event Draft Security Configuration**: Attributes governing draft preview permissions for an event, including `publicationStatus` (`DRAFT`, `PUBLISHED`, `ARCHIVED`), `organizerId` (unique owner identifier), and `draftPassphraseHash` (cryptographically salted hash of the active passphrase).
- **Preview Authorization Token**: A signed, time-bounded credential issued to guest reviewers upon successful passphrase submission, encapsulating the event identifier, expiration timestamp, and passphrase state digest.
- **Draft Preview Session**: The client-side state and cookie indicating whether the current visitor has unlocked guest preview privileges for a specific draft event.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 100% of non-owner access attempts to draft event pages with configured passphrases are intercepted by the passphrase challenge before displaying any event details or contestant rosters.
- **SC-002**: 100% of unauthenticated or unauthorized direct requests to the public event data endpoint for draft events are blocked without leaking contest data or candidate profiles.
- **SC-003**: Rotating or clearing the draft review passphrase invalidates 100% of existing guest preview sessions immediately on the next client request.
- **SC-004**: Verified event organizers experience zero interruptions or redundant passphrase prompts when previewing their own draft events.
- **SC-005**: 100% of organizers accessing the draft passphrase configuration interface are presented with clear in-context instructions detailing session bypass behavior and incognito testing recommendations.

## Assumptions

- Organizers access the administrative dashboard while authenticated through the standard session mechanism, which provides a verified user identifier matching the event's recorded owner.
- Guest review tokens are issued with a default validity window (e.g., 24 hours) or until invalidated earlier by passphrase rotation or publication.
- Published events do not enforce passphrase verification and remain freely accessible to the public regardless of any residual draft passphrase settings.
- The minimum length for an active draft review passphrase remains 4 characters, in compliance with existing lifecycle validation rules.

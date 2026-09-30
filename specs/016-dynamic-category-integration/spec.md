# Feature Specification: Dynamic Category Integration in Contestant Form & Public Roster Filter Bar

**Feature Branch**: `015-dynamic-category-integration`  
**Created**: 2026-10-01  
**Status**: Ready for Planning  
**Input**: Jira Issue [VS-38](https://the-three-devsketeers.atlassian.net/browse/VS-38) — "Dynamic Category Integration in Contestant Form & Public Roster Filter Bar" under Epic [VS-35](https://the-three-devsketeers.atlassian.net/browse/VS-35) ("Organizer Competition Categories & Award Tracks Management").

---

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Dynamic Divisions & Award Tracks in Contestant Form Modal (Priority: P1 🎯 MVP)

An event organizer registers a new contestant or edits an existing profile via `ContestantFormModal` on `/events/[slug]/contestants`. Instead of being restricted to hardcoded division choices (Female, Male, LGBTQ+, Teen), the division `<select>` dropdown dynamically populates with the event's configured competition divisions (e.g., "Kids", "Teens", "Adults", or "Miss", "Mister"). Award categories configured for the event are rendered as interactive checkboxes with active voting badges. When submitted, candidate profiles are accurately bound to the chosen division and award tracks.

**Why this priority**: Core integration requirement. Without dynamic taxonomy in the contestant form, organizers cannot assign contestants to custom divisions or award categories created in Settings.

**Independent Test**:

1. Create an event with custom divisions "Kids", "Teens", "Adults" and award "People's Choice" in Settings.
2. Navigate to `/events/[slug]/contestants` and click "Register Candidate".
3. Verify the division dropdown options match "Kids", "Teens", and "Adults".
4. Select "Kids", check "People's Choice", save, and verify candidate persistence with division linkage.

**Acceptance Scenarios**:

1. **Given** an organizer opens the `ContestantFormModal` for an event with custom divisions (e.g., "Kids", "Teens", "Adults"), **When** viewing the division select dropdown, **Then** only the active divisions configured for this event are presented as selectable options.
2. **Given** an event with custom award categories, **When** viewing the awards section in the modal, **Then** all event award categories are listed as checkboxes with clear labels and descriptions.
3. **Given** an event with NO custom divisions configured (empty taxonomy), **When** opening `ContestantFormModal`, **Then** the dropdown gracefully falls back to standard divisions (Female, Male, LGBTQ+, Teen).
4. **Given** an organizer editing an existing contestant assigned to a custom division, **When** the modal opens, **Then** the contestant's assigned division and award categories are pre-selected accurately.

---

### User Story 2 - Dynamic Division & Award Pills on Public Roster Filter Bar (Priority: P1 🎯 MVP)

A voter or public visitor navigates to `/events/[slug]` to browse candidates. The `CategoryFilterBar` dynamically displays division pill buttons reflecting the event's custom divisions (e.g., "All Candidates", "Kids", "Teens", "Adults") and award track filter chips. Clicking any pill immediately filters the candidate roster with zero page reload (< 50ms latency) and synchronizes with URL search parameters (`?division=...&category=...`).

**Why this priority**: Directly impacts voter experience and fulfills the primary Jira acceptance criteria for public event roster navigation.

**Independent Test**:

1. Visit the public event page `/events/[slug]` for an event with custom divisions "Kids", "Teens", "Adults".
2. Verify the `CategoryFilterBar` renders pill tabs: "All Candidates", "Kids", "Teens", "Adults".
3. Click "Kids" and verify only candidates in the "Kids" division are displayed.
4. Verify the URL reflects `?division=Kids`.

**Acceptance Scenarios**:

1. **Given** an event with custom divisions "Kids", "Teens", and "Adults", **When** a voter visits the public event roster page `/events/[slug]`, **Then** `CategoryFilterBar` renders division pills matching "All Candidates", "Kids", "Teens", and "Adults".
2. **Given** a voter clicks a division pill (e.g., "Kids"), **When** the click event fires, **Then** the roster filters candidate cards immediately to show only matching candidates, and the active pill reflects selected styling.
3. **Given** an event with active award categories, **When** a voter clicks an award track pill (or "All Awards"), **Then** candidates are filtered to those nominated in that specific award category.
4. **Given** a direct URL navigation with search params (e.g., `/events/[slug]?division=Kids`), **When** the page loads, **Then** the "Kids" pill is selected by default and only matching candidates are shown.

---

### User Story 3 - Organizer Contestant Table Custom Division Display (Priority: P2)

An organizer reviewing candidates at `/events/[slug]/contestants` sees each candidate's assigned custom division name in the division column badge and table rows, ensuring consistency across management and public roster views.

**Why this priority**: Provides complete dashboard visibility into custom division assignments and prevents display discrepancies between dashboard and public page.

**Independent Test**:
Assign a candidate to custom division "Kids", navigate to `/events/[slug]/contestants`, and verify the division badge in the table displays "Kids".

**Acceptance Scenarios**:

1. **Given** candidates assigned to custom divisions, **When** viewing `OrganizerContestantTable`, **Then** each row displays the human-readable custom division name.
2. **Given** an organizer deleting or editing candidates, **When** mutations execute, **Then** division associations remain intact.

---

### Edge Cases

- **Division Name vs ID Matching**: Candidate filtering in `ContestantRoster` must support matching by both division ID (e.g., `divisionId`) and division name (case-insensitive) for robust forward and backward compatibility.
- **Events with Zero Custom Divisions**: When an event has not configured any custom divisions or award categories, the system must seamlessly fall back to default divisions ("Female", "Male", "LGBTQ+", "Teen") without crashing or rendering empty pill lists.
- **Special Characters in Division Names**: Divisions named with spaces, slashes, or special characters (e.g., "Under-18 / Junior", "LGBTQ+") must properly URL-encode in search params (`?division=Under-18%20%2F%20Junior`) and parse cleanly.
- **Contestant with No Assigned Division**: Contestants without an assigned division must still appear under "All Candidates" and not break filtering logic.

---

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: `ContestantFormModal` MUST accept an optional `divisions` prop (`DivisionDto[]` or `DynamicDivisionItem[]`) alongside existing `categories` (`AwardCategoryDto[]`).
- **FR-002**: `ContestantFormModal` MUST render custom division options when `divisions` prop contains items, falling back to standard enum divisions (`FEMALE`, `MALE`, `LGBTQ`, `TEEN`) if `divisions` is empty or undefined.
- **FR-003**: `ContestantFormModal` MUST bind the selected division and division ID (`divisionId`) upon submission, passing them to the `onSubmit` handler.
- **FR-004**: `OrganizerContestantTable` MUST receive `divisions` from its parent page (`/events/[slug]/contestants`) and pass them to `ContestantFormModal`.
- **FR-005**: `/events/[slug]/contestants/page.tsx` MUST fetch event divisions (`db.division.findMany`) in parallel with contestants and categories, providing them to `OrganizerContestantTable`.
- **FR-006**: `CategoryFilterBar` MUST dynamically render pills for all custom divisions provided in the `divisions` prop, with a leading "All Candidates" pill.
- **FR-007**: `CategoryFilterBar` MUST fall back to `DEFAULT_FALLBACK_DIVISIONS` only when no custom divisions and no distinct candidate divisions are available.
- **FR-008**: `ContestantRoster` MUST filter candidate cards by matching selected division against `c.divisionId`, `c.divisionRef?.name`, `c.divisionName`, or `c.division` (case-insensitive).
- **FR-009**: Candidate filter operations MUST execute client-side with response latency < 50ms.
- **FR-010**: All interactive elements (division pills, award chips, select options, modal controls) MUST conform to WCAG 2.1 AA accessibility guidelines, including keyboard navigation (`Tab`, `Space`, `Enter`) and proper ARIA roles/labels.

### Key Entities

- **Division**: Event-specific competition tier (`id`, `eventId`, `name`, `description`, `displayOrder`).
- **AwardCategory**: Event-specific award track (`id`, `eventId`, `name`, `description`, `isVotingOpen`, `displayOrder`).
- **Contestant**: Candidate profile (`id`, `eventId`, `name`, `division`, `divisionId`, `divisionRef`, `categories`).
- **CategoryFilterDivision**: Filter pill descriptor (`label: string`, `value: string`).

---

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **100% Jira Acceptance Criteria Coverage**: Both scenarios in Jira issue VS-38 (custom division dropdown in modal, dynamic division pills on public roster) are fully met and verified by automated unit tests.
- **Sub-50ms Filter Response**: Switching division pills or award tracks filters candidate grid in < 50ms with zero network roundtrips.
- **Zero Breaking Changes**: Existing events and contestants with legacy enum divisions (`FEMALE`, `MALE`, `LGBTQ`, `TEEN`) continue to function and filter seamlessly.
- **100% Test Pass Rate**: All unit tests in `tests/unit/contestants/` pass with zero regressions.

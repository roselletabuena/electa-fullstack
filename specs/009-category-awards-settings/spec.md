# Feature Specification: Organizer Dashboard "Categories & Awards" Settings Management UI

**Feature Branch**: `009-category-awards-settings`

**Created**: 2026-09-27

**Status**: Ready for Planning

**Input**: User description: "https://the-three-devsketeers.atlassian.net/browse/VS-37 - Organizer Dashboard 'Categories & Awards' Settings Management UI. Provide authenticated event organizers with an intuitive 'Categories & Awards' settings tab at /events/[slug]/settings?tab=categories featuring 1-click taxonomy presets, inline tag badge management, and voting availability toggles to customize competition divisions and award tracks effortlessly."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Add & Configure Custom Divisions and Award Tracks (Priority: P1) 🎯 MVP

An authenticated event organizer navigates to the "Categories & Awards" settings tab at `/events/[slug]/settings?tab=categories` to configure the event's competition divisions (e.g., "Miss", "Mister", "Teen") and award categories (e.g., "People's Choice", "Best in Evening Gown"). The organizer enters new names, optional descriptions, and display orders, receiving instant optimistic feedback and persistent database synchronization.

**Why this priority**: Core user journey that allows organizers to establish custom competition structure directly from the dashboard UI.

**Independent Test**: Log in as an event owner, navigate to `/events/[slug]/settings?tab=categories`, type a new division name "Miss Universe Teen" and an award track "People's Choice", click Add, and verify they appear immediately as interactive badge cards with active counts.

**Acceptance Scenarios**:

1. **Given** an authenticated event organizer on `/events/[slug]/settings?tab=categories`, **When** the organizer inputs a division name "Junior Category" and clicks "Add Division", **Then** the division is saved via `POST /api/events/[slug]/divisions` and rendered immediately in the active divisions list.
2. **Given** an organizer on the categories tab, **When** they add an award track "Best Talent" with voting enabled, **Then** the award track is saved via `POST /api/events/[slug]/award-categories` and displayed with its active voting badge.
3. **Given** an invalid input (e.g., empty string or exceeding 100 characters), **When** the organizer submits, **Then** inline field validation displays a clear error and prevents API submission.

---

### User Story 2 - Apply 1-Click Competition Taxonomy Presets (Priority: P2)

An organizer setting up a new competition selects from a curated list of 1-click presets (e.g., "Beauty Pageant", "Singing Competition", "Dance Championship", "Hackathon / Academic") to auto-populate standard divisions and award tracks with a single click, saving setup time.

**Why this priority**: Eliminates repetitive manual entry for common competition formats and provides standard templates.

**Independent Test**: On an event with empty taxonomy, select the "Beauty Pageant" preset button, and verify that standard divisions (Female, Male, LGBTQ+, Teen) and awards (People's Choice, Best Evening Gown, Best Swimsuit) populate into the manager.

**Acceptance Scenarios**:

1. **Given** an event with zero divisions or awards, **When** the organizer clicks the "Beauty Pageant" preset card, **Then** the standard divisions and award tracks are pre-populated into the builder.
2. **Given** pre-populated preset items, **When** the organizer modifies or deletes individual items before confirming, **Then** the changes are respected and persisted cleanly.

---

### User Story 3 - Granular Voting Toggle & Display Ordering (Priority: P3)

An organizer manages active award tracks by toggling public voting availability on/off per award (e.g., opening public voting for "People's Choice" while keeping "Best Gown" closed for judges only) and rearranging display order.

**Why this priority**: Enables organizers to control voting access per award track independently throughout different competition phases.

**Independent Test**: Toggle the voting status switch on "Best in Evening Gown" to OFF, reload the page, and verify the status persists as "Voting Closed" (grey badge).

**Acceptance Scenarios**:

1. **Given** an existing award category, **When** the organizer flips its voting switch, **Then** a `PATCH` request updates `isVotingOpen` in real-time with toast confirmation.
2. **Given** multiple divisions, **When** the organizer adjusts display order indices, **Then** the items reorder deterministically.

---

### User Story 4 - Referential Integrity & Safe Deletion Dialog (Priority: P4)

An organizer attempts to delete a division or award category. If active contestants are assigned to that item, the system prevents accidental data destruction by displaying a warning confirmation modal explaining the dependency.

**Why this priority**: Safeguards against accidental loss of candidate assignments and voting integrity.

**Independent Test**: Attempt to delete a division that has 3 assigned contestants, confirming a modal blocks hard deletion with a warning message.

**Acceptance Scenarios**:

1. **Given** an unassigned division (0 contestants), **When** the organizer clicks the delete icon, **Then** the division is deleted immediately with an undo toast.
2. **Given** a division with 1 or more registered contestants, **When** the organizer clicks delete, **Then** the system displays a warning dialog: "Cannot delete division with registered contestants. Reassign contestants first."

---

### User Story 5 - Dynamic Public Roster Division Filtering (Priority: P2)

Public event viewers and voters see only the specific competition divisions configured by the organizer in Settings when browsing the official candidate roster at `/events/[slug]`, rather than static unconfigured division presets.

**Why this priority**: Ensures competition branding and customized divisions (or removed divisions) are accurately reflected in the public voting UI.

**Independent Test**: Remove "LGBTQ+" and "Teen" divisions in the Organizer Settings, visit `/events/[slug]`, and verify the candidate roster division filter only displays "All Candidates", "Female", and "Male".

**Acceptance Scenarios**:

1. **Given** an event with customized divisions in Settings, **When** a user visits the public event page `/events/[slug]`, **Then** the division filter pills dynamically render only the event's configured divisions.
2. **Given** an event where a division was deleted in Settings, **When** the public page is viewed, **Then** that deleted division does not appear as a filter tab.

---

### Edge Cases

- **Duplicate Name Warnings**: Real-time client-side warning if an organizer tries to add a division/category name that already exists in the list (case-insensitive).
- **Network / API Failures**: Optimistic updates roll back gracefully with a toast error notification if an API request fails.
- **Empty State Guidance**: When no divisions or categories exist, display helpful empty state cards with preset recommendations.
- **Dynamic Division Fallback**: If an event has no divisions configured yet, the public roster displays "All Candidates" or auto-derives from active contestant division names.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST add `"categories"` as an active tab option in `SETTINGS_TABS` at `/events/[slug]/settings?tab=categories`.
- **FR-002**: System MUST render an interactive Categories & Awards settings manager (`CategoryAwardsSettingsForm`) inside the settings container.
- **FR-003**: System MUST fetch and display existing event divisions and award categories using `GET /api/events/[slug]/categories`.
- **FR-004**: System MUST allow adding new divisions via `POST /api/events/[slug]/divisions` with instant UI update.
- **FR-005**: System MUST allow adding new award categories via `POST /api/events/[slug]/award-categories` with instant UI update.
- **FR-006**: System MUST provide 1-click preset templates (Beauty Pageant, Talent Contest, Dance Championship, Academic/Hackathon) that batch-create standard taxonomy.
- **FR-007**: System MUST provide an interactive switch on each award category card to toggle `isVotingOpen` in real-time via `PATCH`.
- **FR-008**: System MUST provide inline editing of item names and display orders.
- **FR-009**: System MUST display confirmation modal when attempting to delete an item linked to active contestants, preventing accidental data corruption.
- **FR-010**: System MUST enforce WCAG 2.1 AA accessibility standards for all buttons, inputs, switches, and modal dialogs.
- **FR-011**: System MUST dynamically populate the public candidate roster division filter (`CategoryFilterBar`) from the event's configured `Division` taxonomy records instead of static enum constants.

### Key Entities

- **Division**: Custom competition bracket (`id`, `name`, `description`, `displayOrder`, `contestantCount`).
- **AwardCategory**: Custom award track (`id`, `name`, `description`, `isVotingOpen`, `displayOrder`, `contestantCount`).
- **TaxonomyPreset**: Client-side template definition containing preset division names and award category names.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Organizers can configure an entire competition's taxonomy (4 divisions, 5 award tracks) in under 30 seconds using presets.
- **SC-002**: Inline mutations (toggle voting, add item) provide optimistic feedback in < 50ms.
- **SC-003**: 100% of deletion attempts on items with active contestants show clear blocker dialogs without data loss.
- **SC-004**: Zero accessibility regressions (100% keyboard navigable with visible focus rings and ARIA labels).
- **SC-005**: Public candidate roster division filter dynamically matches the active competition divisions configured in Organizer Settings.

## Assumptions

- Backend REST API endpoints implemented in Feature 008 (`/api/events/[slug]/divisions`, `/api/events/[slug]/award-categories`, `/api/events/[slug]/categories`) are available and operational.
- Authenticated organizer session is validated by the existing settings layout and route guards.

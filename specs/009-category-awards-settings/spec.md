# Feature Specification: Organizer Dashboard "Categories & Awards" Settings Management UI

**Feature Branch**: `009-category-awards-settings`

**Created**: 2026-09-27

**Status**: Ready for Planning

**Input**: User description: "https://the-three-devsketeers.atlassian.net/browse/VS-37 - Organizer Dashboard 'Categories & Awards' Settings Management UI. Provide authenticated event organizers with an intuitive 'Categories & Awards' settings tab at /events/[slug]/settings?tab=categories featuring 1-click taxonomy presets, inline tag badge management, and voting availability toggles to customize competition divisions and award tracks effortlessly."

## Clarifications

### Session 2026-10-17

- Q: How should the edit interface for existing Divisions and Award Categories be presented to organizers? → A: Inline Card Editing — Clicking Edit transforms the item's card directly into an in-place form with Save and Cancel buttons, maintaining immediate layout context without modal overlays.
- Q: When renaming a division or award category that already has assigned contestants, how should the system proceed? → A: Save immediately with toast notification — No extra confirmation modal; contestant foreign key relationships remain intact and update seamlessly.
- Q: How should the interface handle other actions if an item is already being edited inline? → A: Disallow other Edit/Add actions — Disable other edit/add buttons while an item is in edit mode, requiring explicit Save or Cancel.

### Spec Revision Note (Bugfix Alignment - VS-118)

- **Date**: 2026-10-21
- **Change**: Standardized nomenclature from "Award Tracks" / "Voting Tracks" to "Award Categories" across all dashboard settings components. Harmonized status indicators from "Open/Closed" to "VOTING OPEN" and "JUDGED ONLY" badges. Enforced sequential 1-based displayOrder generation during preset hydration and manual creation, and applied Electa's brutalist zero-radius geometry (`rounded-none`, ADR-002).
- **Rationale**: Aligned with ADR-002 (Strict Zero-Radius Brutalist-Refined Geometry), ADR-003 (Opal Light Mode default), and Jira ticket VS-118 (FE: Standardize Award Categories Nomenclature, Status Badges & Ordering Across Creation Wizard and Settings).

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Add & Configure Custom Divisions and Award Categories (Priority: P1) 🎯 MVP

An authenticated event organizer navigates to the "Categories & Awards" settings tab at `/events/[slug]/settings?tab=categories` to configure the event's competition divisions (e.g., "Miss", "Mister", "Teen") and award categories (e.g., "People's Choice", "Best in Evening Gown"). The organizer enters new names, optional descriptions, and display orders, receiving instant optimistic feedback and persistent database synchronization.

**Why this priority**: Core user journey that allows organizers to establish custom competition structure directly from the dashboard UI.

**Independent Test**: Log in as an event owner, navigate to `/events/[slug]/settings?tab=categories`, type a new division name "Miss Universe Teen" and an award track "People's Choice", click Add, and verify they appear immediately as interactive badge cards with active counts.

**Acceptance Scenarios**:

1. **Given** an authenticated event organizer on `/events/[slug]/settings?tab=categories`, **When** the organizer inputs a division name "Junior Category" and clicks "Add Division", **Then** the division is saved via `POST /api/events/[slug]/divisions` and rendered immediately in the active divisions list.
2. **Given** an organizer on the categories tab, **When** they add an award track "Best Talent" with voting enabled, **Then** the award track is saved via `POST /api/events/[slug]/award-categories` and displayed with its active voting badge.
3. **Given** an invalid input (e.g., empty string or exceeding 100 characters), **When** the organizer submits, **Then** inline field validation displays a clear error and prevents API submission.

---

### User Story 2 - Edit & Update Competition Divisions and Award Categories (Priority: P1)

An authenticated event organizer navigates to the "Categories & Awards" settings tab at `/events/[slug]/settings?tab=categories` and edits the details (name, description, and display order) of existing competition divisions and award categories without deleting and recreating them. Taxonomy presets are removed from this dashboard since initial taxonomy setup is established during the Event Creation Wizard.

**Why this priority**: Organizers frequently need to fix typos, rename brackets (e.g. changing "Miss" to "Female Division"), update descriptions, or reorder categories after initial event creation without breaking contestant associations or losing existing votes.

**Independent Test**: Click the "Edit" action button on an existing division card, modify its name from "Female Category" to "Women's Division" and update its display order, click "Save Changes", and verify that the card updates immediately in the UI and persists on page reload while retaining all assigned contestants.

**Acceptance Scenarios**:

1. **Given** an existing division card in the Divisions list, **When** the organizer clicks the "Edit" button, **Then** an edit form or dialog opens pre-populated with the division's current name, description, and display order.
2. **Given** an organizer submitting valid updated division details, **When** they click "Save", **Then** a `PATCH /api/events/[slug]/divisions/[divisionId]` request is sent, the UI updates optimistically with a success toast notification, and assigned contestants remain intact.
3. **Given** an organizer attempting to rename a division to an existing division name on the same event, **When** they submit, **Then** an inline conflict error message is displayed ("A division with this name already exists for this event") and submission is prevented.
4. **Given** an existing award category card in the Award Categories list, **When** the organizer clicks "Edit", **Then** the editor opens with current name, description, display order, and voting status toggle.
5. **Given** an organizer updating an award category's name or description, **When** they submit, **Then** a `PATCH /api/events/[slug]/award-categories/[categoryId]` request updates the category and all existing votes and contestant associations are preserved.
6. **Given** an organizer opening an edit form and deciding not to make changes, **When** they click "Cancel", **Then** the card reverts to its read-only view with no network request or state corruption.

---

### User Story 3 - Granular Voting Toggle & Display Ordering (Priority: P3)

An organizer manages active award categories by toggling public voting availability on/off per award (e.g., opening public voting for "People's Choice" with "VOTING OPEN" badge while keeping "Best Gown" as "JUDGED ONLY") and rearranging display order.

**Why this priority**: Enables organizers to control voting access per award category independently throughout different competition phases.

**Independent Test**: Toggle the voting status switch on "Best in Evening Gown" to OFF, reload the page, and verify the status persists as "JUDGED ONLY" (high-contrast grey badge).

**Acceptance Scenarios**:

1. **Given** an existing award category, **When** the organizer flips its voting switch, **Then** a `PATCH` request updates `isVotingOpen` in real-time with toast confirmation and updates the badge to "VOTING OPEN" or "JUDGED ONLY".
2. **Given** multiple divisions or award categories, **When** the organizer adjusts display order indices, **Then** the items maintain unique sequential ordering without index collisions.

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
- **Empty State Guidance**: When no divisions or categories exist, display clear empty state cards with quick "Add First Division" and "Add First Award Category" action triggers.
- **Dynamic Division Fallback**: If an event has no divisions configured yet, the public roster displays "All Candidates" or auto-derives from active contestant division names.
- **Concurrent Edit Guard**: While an item is being edited inline, other Edit and Add action triggers are disabled until the active edit is saved or cancelled, preventing form state conflicts.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST add `"categories"` as an active tab option in `SETTINGS_TABS` at `/events/[slug]/settings?tab=categories`.
- **FR-002**: System MUST render an interactive Categories & Awards settings manager (`CategoryAwardsSettingsForm`) inside the settings container.
- **FR-003**: System MUST fetch and display existing event divisions and award categories using `GET /api/events/[slug]/categories`.
- **FR-004**: System MUST allow adding new divisions via `POST /api/events/[slug]/divisions` with instant UI update.
- **FR-005**: System MUST allow adding new award categories via `POST /api/events/[slug]/award-categories` with instant UI update.
- **FR-006**: System MUST provide inline card editing for existing Divisions (name, description, display order) via `PATCH /api/events/[slug]/divisions/[divisionId]`.
- **FR-007**: System MUST provide an interactive switch on each award category card to toggle `isVotingOpen` in real-time via `PATCH`.
- **FR-008**: System MUST provide inline card editing for existing Award Categories (name, description, display order, isVotingOpen) via `PATCH /api/events/[slug]/award-categories/[categoryId]`.
- **FR-009**: System MUST display confirmation modal when attempting to delete an item linked to active contestants, preventing accidental data corruption.
- **FR-010**: System MUST enforce WCAG 2.1 AA accessibility standards for all buttons, inputs, switches, and modal dialogs.
- **FR-011**: System MUST dynamically populate the public candidate roster division filter (`CategoryFilterBar`) from the event's configured `Division` taxonomy records instead of static enum constants.

### Key Entities

- **Division**: Custom competition bracket (`id`, `name`, `description`, `displayOrder`, `contestantCount`).
- **AwardCategory**: Custom award category (`id`, `name`, `description`, `isVotingOpen`, `displayOrder`, `contestantCount`).

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Organizers can edit any division or award category in under 3 clicks with immediate visual feedback and persistent database updates.
- **SC-002**: Inline mutations (toggle voting, add item, save edit) provide optimistic feedback in < 50ms.
- **SC-003**: 100% of deletion attempts on items with active contestants show clear blocker dialogs without data loss.
- **SC-004**: Zero accessibility regressions (100% keyboard navigable with visible focus rings and ARIA labels).
- **SC-005**: Public candidate roster division filter dynamically matches the active competition divisions configured in Organizer Settings.

## Assumptions

- Backend REST API endpoints implemented in Feature 008 (`/api/events/[slug]/divisions`, `/api/events/[slug]/award-categories`, `/api/events/[slug]/categories`) are available and operational.
- Authenticated organizer session is validated by the existing settings layout and route guards.

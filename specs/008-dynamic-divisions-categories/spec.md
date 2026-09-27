# Feature Specification: Dynamic Divisions & Award Categories Data Model and API

**Feature Branch**: `008-dynamic-divisions-categories`

**Created**: 2026-09-27

**Status**: Ready for Planning

**Input**: User description: "https://the-three-devsketeers.atlassian.net/browse/VS-36 - Dynamic Divisions & Award Categories Data Model and API. Allow event organizers to dynamically create, configure, and retrieve event-specific competition divisions and award categories, replacing static global enums with database-backed custom taxonomy."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Create & Configure Custom Competition Divisions (Priority: P1)

An event organizer creates and manages custom competition divisions tailored to their specific event format (e.g., "Miss", "Mister", "Little Miss", "Grand Seniors") instead of being restricted to fixed hardcoded choices. The organizer can assign custom names, optional descriptions, and display sorting order for each division within their event.

**Why this priority**: Core prerequisite for dynamic taxonomy. Without custom divisions, events cannot categorize contestants outside hardcoded categories.

**Independent Test**: Can be tested independently by submitting division creation requests for an event, verifying that custom divisions are persisted with unique names per event and sequential display orders.

**Acceptance Scenarios**:

1. **Given** an authenticated event organizer managing an active event, **When** they create a new division with name "Miss Universe Teen" and display order 1, **Then** the division is successfully created and returned with its assigned identifier and attributes.
2. **Given** an existing division named "Miss Universe Teen" on an event, **When** the organizer attempts to create another division with the same name "Miss Universe Teen" for the same event, **Then** the system rejects the request with a duplicate conflict error.
3. **Given** an event on another organizer's account, **When** the organizer creates a division named "Miss Universe Teen", **Then** the division is created successfully, confirming division name uniqueness is scoped strictly per event.

---

### User Story 2 - Create & Configure Custom Award Categories (Priority: P2)

An event organizer defines custom award categories (e.g., "People's Choice Award", "Best in Evening Gown", "Best National Costume", "Darling of the Press") and specifies whether public voting is currently open or closed for each category, along with display order.

**Why this priority**: Essential for award track categorization and granular voting control per award.

**Independent Test**: Can be tested independently by creating multiple award categories on an event with varying voting status and display orders, then querying them to confirm proper retrieval and sequencing.

**Acceptance Scenarios**:

1. **Given** an authenticated event organizer, **When** they create an award category named "Best in Evening Gown" with description "Judged on stage presence and gown elegance" and voting enabled, **Then** the category is saved and returned with its active status and display order.
2. **Given** an existing award category named "Best in Evening Gown" on an event, **When** the organizer attempts to create a duplicate category with the same name on the same event, **Then** the request is rejected with a conflict error.
3. **Given** an invalid category payload (e.g., empty name or exceeding maximum character length), **When** submitted, **Then** the system rejects the creation and provides descriptive validation error messages.

---

### User Story 3 - Unified Retrieval of Event Taxonomy (Priority: P3)

An event organizer, judge, or public client retrieves all configured divisions and award categories for an event in a single structured query to populate dropdowns, management panels, and public voting filters.

**Why this priority**: Provides the canonical read interface for all downstream consumers (contestant registration, ballot forms, scoring filters).

**Independent Test**: Can be tested by querying the event taxonomy endpoint for an event with configured divisions and categories, verifying that both collections are returned ordered by their display sequence.

**Acceptance Scenarios**:

1. **Given** an event with 3 divisions and 4 award categories, **When** an authorized client requests the event categories and taxonomy, **Then** the response returns both divisions and award categories with IDs, labels, descriptions, voting statuses, and display orders.
2. **Given** an event with no custom divisions or categories created yet, **When** queried, **Then** the response returns empty lists without error.
3. **Given** an unauthorized user attempting to modify divisions or categories of an event they do not own, **When** an update/delete request is issued, **Then** the system denies access.

---

### User Story 4 - Division and Category Lifecycle Management (Priority: P4)

An organizer updates the name, description, voting status, or display order of an existing division or category, or deletes a division/category that has no linked contestants or votes.

**Why this priority**: Allows organizers to adjust competition structures before or during event staging while maintaining referential integrity.

**Independent Test**: Can be tested by updating division details and attempting deletion of unused vs. referenced divisions.

**Acceptance Scenarios**:

1. **Given** an existing division, **When** the organizer updates its name and display order, **Then** the updated attributes are reflected in subsequent queries.
2. **Given** a division currently assigned to active contestants, **When** the organizer attempts to delete the division, **Then** the system rejects the deletion with a clear dependency constraint error.

---

### Edge Cases

- **Special Characters and Emoji in Names**: Names containing accented characters, hyphens, and standard punctuation must be supported up to the maximum character limit (e.g., 100 characters).
- **Whitespace Trimming**: Leading and trailing whitespaces in division/category names must be automatically trimmed before checking uniqueness.
- **Display Order Collisions**: When two items are given the same display order, the system must deterministically order them (e.g., secondary sort by creation time or name).
- **Cascading Event Deletion**: When an event is deleted by its organizer, all associated custom divisions and award categories must cascade and be deleted cleanly.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST allow event organizers to create, read, update, and delete custom competition divisions per event.
- **FR-002**: System MUST enforce event-scoped uniqueness on division names (case-insensitive and whitespace-trimmed).
- **FR-003**: System MUST allow event organizers to create, read, update, and delete custom award categories per event.
- **FR-004**: System MUST enforce event-scoped uniqueness on award category names (case-insensitive and whitespace-trimmed).
- **FR-005**: System MUST provide a unified retrieval mechanism that returns all divisions and award categories associated with a given event, sorted by display order.
- **FR-006**: System MUST validate input payloads for divisions and categories, rejecting empty names or names exceeding 100 characters with descriptive error messages.
- **FR-007**: System MUST support configuring a display order integer on both divisions and award categories for explicit UI ordering.
- **FR-008**: System MUST allow toggling the public voting availability status (`isVotingOpen`) individually on each award category.
- **FR-009**: System MUST restrict division and award category modification/deletion operations exclusively to the authenticated organizer who owns the event.
- **FR-010**: System MUST prevent deletion of divisions or award categories that are actively linked to contestants or recorded votes unless explicitly unlinked.

### Key Entities

- **Division**: Represents a specific competition bracket/tier within an event (e.g., "Miss", "Mister", "Teen"). Contains `id`, `eventId`, `name`, `description`, `displayOrder`, and timestamps.
- **AwardCategory**: Represents a specific title or award track within an event (e.g., "People's Choice", "Best Gown"). Contains `id`, `eventId`, `name`, `description`, `isVotingOpen`, `displayOrder`, and timestamps.
- **Event**: The parent entity scoping the divisions and award categories.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Organizers can configure up to 50 custom divisions and award categories per event with sub-second retrieval response times (< 200ms).
- **SC-002**: 100% of duplicate division or category name creation attempts within the same event are rejected with clear conflict feedback.
- **SC-003**: 100% of unauthorized modification attempts across distinct organizer boundaries are blocked.
- **SC-004**: Taxonomy queries return consistent, deterministic ordering matching the organizer-defined display sequence.

## Assumptions

- Each event belongs to a single organizer account validated via the existing authentication and authorization layer.
- Existing contestant records with legacy static enums will be supported or migrated to reference dynamic division entities.
- Public read access to event divisions and award categories is permitted for published events to render ballots and leaderboards.

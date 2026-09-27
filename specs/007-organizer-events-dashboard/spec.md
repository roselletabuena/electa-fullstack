# Feature Specification: Organizer Multi-Event Overview Dashboard & Management Portal

**Feature Branch**: `007-organizer-events-dashboard`

**Created**: 2026-09-27

**Status**: Ready for Planning

**Input**: User description: "https://the-three-devsketeers.atlassian.net/browse/VS-39 - Provide authenticated event organizers with a centralized, multi-event overview dashboard at /dashboard to monitor high-level metrics across all owned competitions, filter and search through events, access management actions, and create new events."

## Clarifications

### Session 2026-09-27

- **Q: What should be the canonical URL route for the Organizer Events Overview Hub?**
  - **A:** The canonical route is `/dashboard`, with `/events` acting as a server-side redirect to `/dashboard`.
- **Q: How should an event be classified as 'Live / Active' in the metrics and filters?**
  - **A:** Strict window matching: `publicationStatus === 'PUBLISHED'` AND `startsAt <= now() <= endsAt`.
- **Q: What should happen when the organizer clicks '+ Create New Event'?**
  - **A:** Navigate directly to a dedicated creation page (`/events/new` or `/dashboard/events/new`).
- **Q: How should the event cards grid handle large portfolios (12+ events)?**
  - **A:** Client-side pagination displaying 12 event cards per page with Previous / Next controls and current page indicator.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Multi-Event Overview & Aggregate Metrics (Priority: P1)

An authenticated event organizer navigates to `/dashboard` to review their active and past competitions. The system retrieves all events owned by their authenticated account, aggregates total event counts, active voting events, registered contestants, and cast votes, and presents them in clean metric cards alongside an interactive event grid.

**Why this priority**: Serves as the primary landing page and command center for organizers managing one or more competitions.

**Independent Test**: Can be independently tested by logging in as an organizer with multiple events in various statuses and loading `/dashboard`, confirming aggregate statistics and owned event cards render accurately.

**Acceptance Scenarios**:

1. **Given** an authenticated organizer owning 2 "PUBLISHED" events (with active voting dates) and 1 "DRAFT" event, **When** they navigate to `/dashboard`, **Then** the page displays summary cards for Total Events (3), Live Events (2), Total Candidates (sum of active contestants across owned events), and Total Votes Cast (sum of votes across owned events).
2. **Given** an authenticated organizer with events, **When** they load the dashboard, **Then** only events matching their organizer ID are rendered, guaranteeing strict multi-tenant isolation.
3. **Given** an unauthenticated visitor, **When** they attempt to load `/dashboard` or `/events`, **Then** the system intercepts the request and redirects them to `/login?redirect=%2Fdashboard`.

---

### User Story 2 - Real-Time Search & Lifecycle Status Filtering (Priority: P2)

An organizer with multiple events uses the dashboard search bar and status pill filters to quickly locate specific competitions. The active filters synchronize with URL search parameters to enable bookmarking and refreshing without loss of search context.

**Why this priority**: Enables fast navigation and discovery as an organizer's portfolio of events grows.

**Independent Test**: Can be tested by applying status filters (`All`, `Live`, `Drafts`, `Past`) and entering keywords in the search bar, verifying that the visible cards dynamically match the criteria and update the URL query string.

**Acceptance Scenarios**:

1. **Given** an organizer with mixed-status events, **When** they click the "Live" filter tab, **Then** the URL updates to include `?status=PUBLISHED` and only events with active published windows are visible in the grid.
2. **Given** the events grid, **When** the organizer enters a search string into the search input, **Then** the grid reactively filters to events where the title, description, or slug contains the query string (case-insensitive).
3. **Given** a direct URL load with `?status=DRAFT&q=talent`, **When** the dashboard renders, **Then** the filter pills and search input initialize with those parameters and filter the grid accordingly.

---

### User Story 3 - Quick Action Routing & Public Link Sharing (Priority: P3)

Each event card in the dashboard grid displays quick action triggers, allowing the organizer to jump directly into contestant rosters, event settings tabs, or copy the public voting link directly to their clipboard with user feedback.

**Why this priority**: Minimizes clicks and friction for routine event operations.

**Independent Test**: Can be tested by clicking the "Candidates", "Settings", and "Share Link" action buttons on any card, confirming proper routing and clipboard copy feedback.

**Acceptance Scenarios**:

1. **Given** an event card for slug `muph-2026`, **When** the organizer clicks the "Candidates" action button, **Then** the browser navigates to `/events/muph-2026/contestants`.
2. **Given** an event card for slug `muph-2026`, **When** the organizer clicks the "Settings" button, **Then** the browser navigates to `/events/muph-2026/settings`.
3. **Given** an event card, **When** the organizer clicks the "Share Link" button, **Then** the canonical public event URL is copied to their clipboard and a confirmation toast notification appears.

---

### User Story 4 - Empty State & First-Time Organizer Onboarding (Priority: P4)

A newly registered organizer who has not yet created an event visits `/dashboard`. The system presents an engaging empty state with onboarding guidance and a prominent call-to-action to create their first event.

**Why this priority**: Prevents a confusing blank screen for new users and guides them toward immediate event creation.

**Independent Test**: Can be tested by logging in as a user with zero events and verifying the empty state UI and "Create Your First Event" button.

**Acceptance Scenarios**:

1. **Given** an authenticated user with 0 owned events, **When** they visit `/dashboard`, **Then** the metric cards display `0` values and the main viewport displays an onboarding illustration, explanatory copy, and a primary "Create Your First Event" button routing to `/events/new`.

---

### Edge Cases

- **Large Portfolios (12+ Events)**: Displays 12 cards per page with clean Previous/Next pagination controls.
- **Empty Search Results**: When an active search query matches zero events, display a clear "No matching events found" message with a button to reset search filters.
- **Database / Network Failure**: If aggregating event stats fails, render a resilient error state with a retry option without crashing the dashboard shell.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST require authenticated session to access `/dashboard` and `/events`, redirecting unauthenticated users to `/login?redirect=%2Fdashboard`. `/events` MUST redirect to `/dashboard`.
- **FR-002**: System MUST retrieve and display only the events where `organizerId` matches the authenticated user's ID.
- **FR-003**: System MUST compute and display aggregate counts: Total Events, Live Events (`PUBLISHED` and within `startsAt..endsAt` window), Total Candidates across owned events, and Total Votes cast across owned events.
- **FR-004**: System MUST render event cards showing: Banner image, Publication status badge (Live Voting, Draft, Completed), Title, Description preview, End date/time, Contestant count, and Total votes count.
- **FR-005**: System MUST support client-side filtering by status (`ALL`, `PUBLISHED`, `DRAFT`, `ARCHIVED`) and keyword search matching title, description, or slug.
- **FR-006**: System MUST synchronize filter and search state with URL query parameters (`?status=...&q=...`) using `nuqs`.
- **FR-007**: Event cards MUST provide direct navigation links to `/events/[slug]/contestants` and `/events/[slug]/settings`.
- **FR-008**: Event cards MUST provide a 1-click "Share Link" button that writes the full public event URL to the clipboard and triggers visual feedback.
- **FR-009**: System MUST display an onboarding empty state when an organizer has zero events.
- **FR-010**: System MUST paginate event card lists with 12 items per page when total filtered events exceed 12.

### Key Entities

- **Event**: Represents an organized voting competition, containing `id`, `slug`, `title`, `description`, `bannerUrl`, `startsAt`, `endsAt`, `publicationStatus`, `organizerId`.
- **Contestant**: Candidate participating in an event, linked via `eventId`.
- **Vote**: Cast voting transaction record, linked via `contestantId` and event context.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Organizers can view their full portfolio of events and aggregate metrics in under 1 second on standard broadband.
- **SC-002**: Search and filter interactions execute reactively with zero perceived latency (< 50ms).
- **SC-003**: 100% of event cards correctly route to their respective contestant rosters and settings panels without path mismatch errors.
- **SC-004**: Multi-tenant data isolation is 100% verified — zero unauthorized event leaks across distinct organizer accounts.

## Assumptions

- User authentication is managed via NextAuth / Auth.js session cookies already established in the application.
- Events and contestant statistics are queried from the existing PostgreSQL Prisma database instance.
- The dashboard is accessible at `/dashboard` with `/events` redirecting to `/dashboard`.

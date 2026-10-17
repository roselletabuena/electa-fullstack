# Feature Specification: Disable Non-Pageant Archetypes in Event Creation Wizard

**Feature ID**: `047-disable-non-pageant-archetypes`  
**Jira Key**: `VS-117`  
**Epic Link**: `VS-82` (Multi-Archetype Election Engine Epic)  
**Status**: Ready for Implementation  
**Created**: 2026-10-17  

---

## 📖 Executive Summary & Overview

Electa's Event Creation Wizard currently presents four distinct event archetypes (`PAGEANT`, `STUDENT_COUNCIL`, `HACKATHON`, `CUSTOM`). Because Electa is not yet releasing non-pageant workflows to production organizers, allowing users to select and create events with non-pageant archetypes leads to unconfigured, unsupported, or incomplete event setups.

Rather than hiding the cards completely (which causes jarring layout shifts and loses product roadmap visibility), the cards for **Student Council Election**, **Hackathon / Competition**, and **Custom Contest** remain visible in the grid but are disabled from selection, styled with subdued opacity (`opacity-60`), non-interactivity (`cursor-not-allowed`, `pointer-events-none` on click/key action), and badged with a prominent, high-contrast **"COMING SOON"** pill badge compliant with WCAG 2.1 AA in both light and dark themes.

Furthermore, a server-side boundary validation guardrail enforces that any manipulated form submission or direct API request attempting to persist an event with a non-pageant archetype is rejected with a `400 BAD_REQUEST` validation error.

---

## 👥 Actors & User Roles

- **Event Organizer**: Authenticated user creating an event via the Event Creation Wizard (`/events/new`). Needs clear guidance that Pageant is the only active archetype, while seeing upcoming capabilities without broken flows.
- **System / API Client**: Route handlers and Server Actions receiving event creation payloads. Must strictly validate and guard the boundary against unsupported archetypes.

---

## 🎯 Acceptance Criteria (Gherkin Scenarios)

### Scenario 1: Happy Path - Pageant Selection
- **Given** an authenticated event organizer on Step 2 ("Event Format & Categories") of the Event Creation Wizard
- **When** they view the archetype selection grid
- **Then** "Beauty Pageant" is selectable and active with the "Selected" checkmark indicator
- **And** the organizer can freely proceed through the wizard to create their pageant event.

### Scenario 2: Disabled Archetypes with "Coming Soon" Badge
- **Given** an organizer viewing the archetype options in Step 2
- **When** looking at "Student Council Election", "Hackathon / Competition", and "Custom Contest"
- **Then** each card displays a prominent "COMING SOON" pill badge
- **And** each card has disabled styling (`opacity-60`, `cursor-not-allowed`)
- **And** clicking any of these cards does NOT select them or change the selected archetype
- **And** pressing `Enter` or `Space` on any of these cards does NOT trigger selection.

### Scenario 3: Backend Boundary Guardrail
- **Given** a direct API request (`POST /api/events`) or a manipulated form submission payload with `archetype: "STUDENT_COUNCIL"`, `"HACKATHON"`, or `"CUSTOM"`
- **When** the event creation action or endpoint executes
- **Then** the request is rejected with a `400 BAD_REQUEST` validation error
- **And** the error message indicates that this archetype is coming soon and currently disabled.

### Scenario 4: Keyboard Navigation & Screen Reader Accessibility
- **Given** an organizer navigating the archetype selector via keyboard or screen reader
- **When** the cursor encounters a disabled archetype card
- **Then** the element has `aria-disabled="true"`
- **And** the element has clear accessible labeling indicating it is "Coming Soon"
- **And** the badge meets WCAG 2.1 AA contrast requirements in both light and dark themes.

---

## 🛡️ Invariants & Non-Functional Requirements

1. **Zero-Radius Geometry**: All container cards, badges, and pill tags must use sharp 0px corners (`rounded-none`, `--radius: 0px`).
2. **Dual-Theme Contrast Parity**: The "COMING SOON" badge must have >= 4.5:1 contrast in both light mode (Opal slate-50 background) and dark mode (`#0d1424` card background).
3. **No Unintentional Breaking Changes**: Archetype definitions in `EVENT_ARCHETYPES` remain intact for database schema compatibility, while UI and creation boundaries isolate availability via `isComingSoon` configuration.
4. **Strict Type Safety (§I)**: TypeScript 5 strict mode, zero `any`, zero non-null assertions (`!`).

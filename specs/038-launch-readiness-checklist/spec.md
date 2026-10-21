# Feature Specification: Post-Creation Embedded Launch Readiness Checklist Widget

**Feature ID**: `038-launch-readiness-checklist`  
**Jira Key**: [VS-106](https://the-three-devsketeers.atlassian.net/browse/VS-106)  
**Parent Epic**: [VS-102: Event Creation Experience & Organizer Onboarding Overhaul](https://the-three-devsketeers.atlassian.net/browse/VS-102)  
**Status**: In Progress  
**Created**: 2026-10-13

---

## 🎯 Executive Summary

Immediately after creating a new competition from `/events/new`, organizers currently experience an abrupt redirection into the General settings tab (`/events/[slug]/settings`) without any structured onboarding orientation or visible launch checklist. Organizers are left wondering what mandatory steps remain (e.g. setting up divisions, adding contestants, and configuring voting rules) prior to publishing.

Rather than interrupting the user journey with disruptive modal popups, this feature implements an **embedded, non-intrusive launch readiness checklist widget** (`LaunchReadinessChecklist`) placed directly at the top of the event settings dashboard.

The widget strictly adheres to:

1. **Electa Zero-Radius Geometry**: Sharp brutalist container (`rounded-none`, `border border-slate-300 dark:border-slate-800 bg-white dark:bg-[#0d1424]`).
2. **Brand Typography**: Headings in `Outfit` (`font-heading`), body copy in `Sora` (`font-sans`), metrics & URLs in `JetBrains Mono` (`font-mono`).
3. **Dual-Theme WCAG 2.1 AA Contrast**: High-contrast states in both Light Mode (Opal `#F8FAFC`) and Dark Mode (Obsidian `#090D16` / `#0d1424`), with accessible status badges, progress bars, and interactive buttons.
4. **Dynamic Readiness Computation**: Accurately tracks completion across 4 essential milestones:
   - Milestone 1: `✓ Event Profile Created` (Completed on creation)
   - Milestone 2: `○ Set Up Divisions` (Links directly to Categories/Divisions tab: `/events/[slug]/settings?tab=categories`)
   - Milestone 3: `○ Add Contestants` (Links directly to Contestants management: `/events/[slug]/contestants`)
   - Milestone 4: `○ Configure Voting Rules` (Links directly to Voting Rules tab: `/events/[slug]/settings?tab=voting-rules`)
5. **In-Flow Collapsible Strip with Persistence**: Allows organizers to toggle between expanded 4-card mode and a sleek ~46px summary strip (`electa_collapsed_readiness_${eventId}`), ensuring settings tabs and forms remain 100% visible above the fold while highlighting the immediate next milestone. _(Note: Redundant copy preview button removed; handled centrally by `OrganizerDashboardHeader`)._
6. **Publication Auto-Transition**: In `DRAFT` status, displays the actionable setup checklist. When the competition transitions to `PUBLISHED`, the widget seamlessly transforms into a compact `"Ready & Live"` indicator with permanent dismissal capability.

---

## 👥 Actors & User Roles

- **New Competition Organizer**: Creates an event and lands on the dashboard needing immediate orientation on remaining setup prerequisites.
- **Experienced Organizer**: Navigates between settings tabs and contestants, tracking progress towards 100% launch readiness.
- **Published Event Organizer**: Reviews an active competition where the checklist has collapsed into a live indicator or been dismissed.
- **Screen Reader / Keyboard User**: Interacts with the checklist using accessible ARIA roles (`role="region"`, `aria-label="Launch Readiness Checklist"`, `aria-valuenow`, `aria-valuemin="0"`, `aria-valuemax="100"`).

---

## 📋 Functional Requirements

1. **FR-1 Embedded Non-Intrusive Widget Layout**:
   - Embedded at the top of the Event Settings page (`src/app/(dashboard)/events/[slug]/settings/page.tsx`), right above the tab navigation container.
   - Strictly zero-radius (`rounded-none`) surface with dual-theme border styling:
     - Light Mode: `border border-slate-300 bg-white shadow-xs`
     - Dark Mode: `dark:border-slate-800 dark:bg-[#0d1424]`
   - No popups, modal overlays, or blocking backdrops interrupting user interaction.

2. **FR-2 Readiness Milestone Computation**:
   - Tracks 4 explicit milestones:
     - `eventProfileCreated`: Always `true` once the event is instantiated.
     - `divisionsConfigured`: `true` if `divisionsCount > 0` (or division array non-empty).
     - `contestantsAdded`: `true` if `contestantsCount > 0` (or contestant array non-empty).
     - `votingRulesConfigured`: `true` if voting rules have been customized/audited (or explicit configuration saved).
   - Computes total completed milestones out of 4 (e.g. `1/4 Completed`, `25%`) and displays an accessible progress indicator.

3. **FR-3 Deep Linking to Setup Destinations**:
   - Each incomplete milestone displays a clear call-to-action button or link with sharp styling:
     - Milestone 2: Link to `/events/${slug}/settings?tab=categories` (Set Up Divisions)
     - Milestone 3: Link to `/events/${slug}/contestants` (Add Contestants)
     - Milestone 4: Link to `/events/${slug}/settings?tab=voting-rules` (Configure Voting Rules)
   - Completed milestones display a bold green completion badge (`✓ Completed`) with high-contrast text (`text-emerald-700 dark:text-emerald-300`).

4. **FR-4 In-Flow Collapsible Strip & Persistence**:
   - Provides a "Minimize" / "Expand" toggle (`aria-expanded`, chevron indicator).
   - When collapsed, reduces height to ~46px, displaying the readiness percentage and surfacing the immediate next milestone action inline without obstructing dashboard settings forms.
   - Persists collapsed state across browser reloads using `localStorage` key `electa_collapsed_readiness_${eventId}`.
   - Note: Redundant preview link action removed from checklist as event preview and copy actions are centrally accessible in `OrganizerDashboardHeader`.

5. **FR-5 Published Status State & Dismissal**:
   - When `publicationStatus === "PUBLISHED"`, the full checklist transitions into a compact banner:
     - Displays `Ready & Live` badge (`bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800`).
     - Includes a `"Dismiss"` button allowing permanent hiding across sessions via `localStorage` key `electa_dismissed_readiness_${eventId}`.
   - If dismissed, the component renders nothing (`null`).

---

## 🧪 Acceptance Criteria (Gherkin Scenarios)

### Scenario 1: Post-Creation Redirection Without Modals (Happy Path)

- **Given** an organizer successfully creates a new event from `/events/new`,
- **When** the server action completes and redirects to `/events/[slug]/settings`,
- **Then** the settings dashboard opens directly with the General tab active,
- **and Then** no blocking modal dialog or intrusive overlay is displayed,
- **and Then** the `LaunchReadinessChecklist` is embedded directly into the layout above the settings tabs.

### Scenario 2: Persistent Launch Readiness Checklist (Validation & Error Handling)

- **Given** an event is in `DRAFT` status with no divisions or contestants registered,
- **When** the organizer views their event settings page,
- **Then** a prominent zero-radius checklist card is embedded at the top displaying:
  1. `✓ Event Profile Created` (Completed)
  2. `○ Set Up Divisions` (Direct link to `/events/[slug]/settings?tab=categories`)
  3. `○ Add Contestants` (Direct link to `/events/[slug]/contestants`)
  4. `○ Configure Voting Rules` (Direct link to `/events/[slug]/settings?tab=voting-rules`),
- **and Then** a `"Minimize"` / `"Expand"` action allows toggling between the 4 milestone cards and a compact ~46px summary strip with localStorage persistence.

### Scenario 3: Auto-Dismissal on Event Publication (Edge Case)

- **Given** all required setup tasks are completed and the organizer publishes the competition,
- **When** the event status transitions to `PUBLISHED`,
- **Then** the checklist automatically transitions into a compact `"Ready & Live"` indicator with a `"Dismiss"` button,
- **and When** the organizer clicks `"Dismiss"`,
- **Then** the widget is dismissed permanently and no longer renders on subsequent page visits.

# Feature Specification: Trending Events Grid & Lifecycle Status Filters

**Feature ID**: `033-trending-events-grid-filters`  
**Jira Key**: [VS-92](https://the-three-devsketeers.atlassian.net/browse/VS-92)  
**Parent Epic**: [VS-90: [Epic] Electa Public Landing Page & Event Discovery Portal](https://the-three-devsketeers.atlassian.net/browse/VS-90)  
**Execution Order**: Milestone 1.4 (Landing Page Event Discovery & Filtering)  
**Status**: Ready for Implementation  
**Created**: 2026-10-12

---

## 🎯 Executive Summary & Overview

Public visitors landing on Electa need an intuitive, instantaneous way to discover and explore active, upcoming, and past competitions without page reloads or complex forms. The **Trending Events Grid & Lifecycle Status Filters** feature introduces a high-density, responsive discovery grid positioned directly beneath the landing page hero section.

The discovery experience enables visitors to filter published events by lifecycle state (`ALL EVENTS`, `LIVE VOTING`, `UPCOMING`, `CONCLUDED`), view dynamic countdown timers (`⏳ 2D 11H LEFT` or opening countdowns), inspect regional metadata and contestant counts, and take contextual actions (`VIEW EVENT →`, `PREVIEW EVENT →`, `VIEW FINAL TALLIES →`).

The interface enforces Electa's brutalist-refined zero-radius geometry (`rounded-none`), default Light Mode (Opal theme) with full Dark Mode parity, WCAG 2.1 AA accessibility contrast, and snappy URL/client-state filtering via `nuqs` and TanStack Query.

---

## 👥 Personas & Target Audiences

1. **Active Voter / Supporter**: Visits to vote in an ongoing pageant or election; needs to quickly spot live events with remaining voting windows and jump straight to the event voting booth.
2. **Curious Public Explorer**: Browses past campus events or upcoming pageants; switches between "Upcoming" and "Concluded" tabs to inspect contestants and final tally results.
3. **Event Organizer / Auditor**: Confirms their published event is visible with accurate dates, contestant counts, and lifecycle badges in the public portal.
4. **Screen Reader & Keyboard User**: Uses Tab and Arrow keys to switch filter tabs, navigates event cards with descriptive labels and clear focus indicators, encountering zero trap states.

---

## 📋 Functional Requirements

### 1. Lifecycle Filter Tabs Bar

- **Tab Options**:
  - `ALL EVENTS`: Displays all published competitions across all operational states.
  - `LIVE VOTING`: Filters to events currently in active voting window (`Active`).
  - `UPCOMING`: Filters to scheduled events waiting for their voting window to open (`Scheduled`).
  - `CONCLUDED`: Filters to ended events with finalized tallies (`Closed`).
- **Instantaneous Client/URL Synchronization**:
  - Filter state synchronized to URL parameter `?status=all|active|scheduled|closed` via `nuqs`.
  - Switching tabs updates the card grid instantaneously with zero page reloads.
  - Each tab displays an optional item count badge (e.g. `LIVE VOTING (1)`).
- **Styling & Geometry**:
  - Zero-radius brutalist pill geometry (`rounded-none`).
  - **Active Tab**: High-contrast solid accent (Light: `bg-slate-900 text-white font-extrabold`, Dark: `dark:bg-slate-100 dark:text-slate-900 font-extrabold`).
  - **Inactive Tab**: Clean border and readable neutral text (Light: `bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 hover:text-slate-900`, Dark: `dark:bg-white/5 dark:text-slate-300 dark:border-white/10 dark:hover:bg-white/10 dark:hover:text-white`).

### 2. Event Card Presentation

Each card in the trending grid displays:

1. **High-Res Poster Banner**:
   - Aspect ratio: `aspect-16/9` responsive container with subtle hover zoom effect (`group-hover:scale-105 transition-transform`).
   - Image fallback/skeleton while loading.
   - Text protection scrim: explicit dark gradient scrim (`bg-linear-to-t from-slate-950 via-slate-950/40 to-transparent`) protecting overlays against bright banner imagery.
2. **Lifecycle Countdown Pill**:
   - Positioned in top overlay or badge row.
   - For `Active`: Dynamic countdown pill with pulsing green indicator: `⏳ 2D 11H LEFT` (or formatted days/hours remaining).
   - For `Scheduled`: Amber countdown pill: `OPENS IN 3D 12H` or scheduled start date.
   - For `Closed`: Neutral lock pill: `CONCLUDED` or `FINAL TALLIES`.
3. **Event Metadata**:
   - **Title**: Bold Outfit font (`font-heading font-extrabold text-lg text-slate-900 dark:text-white line-clamp-1`).
   - **Region / Location**: Geographic badge or pin indicator (`MapPin` icon + e.g. `"Baguio City, Northern Luzon"`).
   - **Contestant Count**: Compact user badge (`Users` icon + e.g. `"4 Contestants"`).
   - **Brief Description**: 2-line clamped summary of the pageant/election.
4. **Contextual Action Button**:
   - Sharp zero-radius primary button (`rounded-none`).
   - Label reflects lifecycle state:
     - Active: `VIEW EVENT →`
     - Scheduled: `PREVIEW EVENT →`
     - Closed: `VIEW FINAL TALLIES →`
   - Links directly to `/events/[slug]`.

### 3. Grid Layout & Responsiveness

- Grid structure: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6`.
- Empty state: When a filter yields 0 events, renders a clean, accessible empty state card:
  - Header: `"No events found in this category"`
  - Description: `"There are currently no [status] events. Try selecting 'All Events' to explore all competitions."`
  - Action: `"Reset Filter"` button returning to `ALL EVENTS`.
- Skeleton loading state: Renders 3 pulse-animated placeholder cards while data is loading.

---

## 🧪 User Scenarios & Acceptance Criteria (Gherkin)

### Scenario 1: Lifecycle Status Filtering

- **Given** a list of published events with different operational statuses (`Active`, `Scheduled`, `Closed`),
- **When** the visitor clicks a filter tab (`ALL EVENTS`, `LIVE VOTING`, `UPCOMING`, `CONCLUDED`),
- **Then** the grid must update instantaneously showing only events matching the selected status,
- **And** the active tab must be highlighted with high-contrast zero-radius styling (`rounded-none`, contrast >= 4.5:1),
- **And** the URL search parameter `?status=` reflects the selected filter for shareable filtering.

### Scenario 2: Event Card Presentation & Dynamic Countdowns

- **Given** an event card is rendered in the grid,
- **When** the visitor inspects the card,
- **Then** it must display a high-res poster banner with dark overlay scrim,
- **And** it must display a status/countdown pill reflecting time until closing (for active) or opening (for scheduled),
- **And** it must display the event title, region/location badge, and contestant count,
- **And** the primary action button must reflect event status:
  - `VIEW EVENT →` for Live Voting events,
  - `PREVIEW EVENT →` for Upcoming scheduled events,
  - `VIEW FINAL TALLIES →` for Concluded closed events.

### Scenario 3: Empty Filter Handling & Reset

- **Given** no published events exist under a selected filter category,
- **When** the visitor switches to that tab,
- **Then** an accessible empty state message is shown without layout breakage,
- **And** clicking `"Reset Filters"` restores the `ALL EVENTS` selection and displays all available events.

---

## 🔒 Edge Cases & Constraints

1. **Draft and Archived Events Filtered Out**: Draft and archived events must never leak into the public landing grid. Only `PUBLISHED` events are displayed.
2. **Missing Location or Contestants**: Fallback safely to sensible defaults (e.g. `"Philippines"` or `"0 Contestants"`) if metadata fields are omitted.
3. **Time Boundary Transition**: If an event reaches its end date while the user has the page open, the card transitions its derived operational state gracefully without crashing.
4. **Accessibility (WCAG 2.1 AA)**:
   - Filter tab list uses proper `role="tablist"` or button group with `aria-selected` / `aria-pressed`.
   - Card links are fully keyboard navigable (`Tab` focus rings with 3:1 contrast `outline-sky-600`).
   - Image alt attributes clearly identify event titles.

---

## 🚫 Out of Scope

- Direct vote casting inside the card (voting occurs inside `/events/[slug]`).
- Full-text search inside this specific component (handled by the preceding `GlobalSearchBar` VS-88).
- Event creation or organizer editing controls (managed in organizer dashboard).

---

## 🏆 Success Criteria

- Filter tab clicks update the event list instantaneously (< 50ms client response).
- 100% adherence to zero-radius geometry (`rounded-none`) across all cards, pills, buttons, and badges.
- Full WCAG 2.1 AA contrast compliance in both Opal Light Mode and Dark Mode.
- All 3 lifecycle states (Active, Scheduled, Closed) present customized, actionable CTA buttons.

# Feature Specification: Archetype-Tailored Event Wizard & Taxonomy Configuration UI

**Feature ID**: `041-archetype-tailored-event-wizard`  
**Ticket**: [VS-84](https://the-three-devsketeers.atlassian.net/browse/VS-84)  
**Parent Epic**: [VS-82](https://the-three-devsketeers.atlassian.net/browse/VS-82) (`Multi-Archetype Election Engine: School Elections, Hackathons & Beyond`)  
**Status**: Draft  
**Created**: 2026-10-13  

---

## 1. Overview & Business Value

Electa was originally designed primarily around beauty pageant assumptions (e.g. photo aspect ratios, talent divisions, paid voting take rates, single-winner categories). When organizers want to host Student Council Elections, Hackathons, or Custom Contests, they encounter confusing, irrelevant inputs and pageant-specific terminology.

Following the backend schema and taxonomy service established in VS-83, this feature introduces the frontend experience:
1. **Archetype Selection (`archetype-selector.tsx`)**: High-contrast, zero-radius selector for `PAGEANT`, `STUDENT_COUNCIL`, `HACKATHON`, and `CUSTOM` with clear descriptions and archetype-specific terminology previews.
2. **Dynamic Multi-Step Event Creation Wizard (`event-creation-wizard.tsx`)**: An interactive wizard adapting its fields, terminology, and validation dynamically based on the chosen archetype. Pageant-specific monetization and photo inputs disappear when student council or hackathons are selected, and positions/tracks configuration appears seamlessly.
3. **In-Wizard Taxonomy Editor (`taxonomy-editor.tsx`)**: Enables organizers to configure offices/positions (with seat limits `maxSelectionsPerVoter`), hackathon tracks, or pageant divisions directly within the creation flow and the Settings dashboard tab.
4. **Form State Preservation**: Guarantees that common fields (`title`, `slug`, `startsAt`, `endsAt`, `bannerUrl`, `description`) persist seamlessly when toggling between archetypes and navigating steps.
5. **Validation & Guardrails**: Enforces dynamic Zod sub-schemas (e.g., at least one submission track for hackathons, valid seat limits for offices).

---

## 2. Actors & User Stories

### User Story
> **As an** event organizer,  
> **I want to** configure my event through an archetype-tailored setup wizard and taxonomy management interface,  
> **so that** I am only prompted for settings relevant to my event format (offices for student elections, tracks for hackathons, divisions for pageants).

### Actors
- **School Election Organizer**: Needs to set up Student Council positions (e.g. President, Vice President, Senators) with maximum seat limits per position, without seeing ticket sales or pageant take rate settings.
- **Hackathon Director**: Needs to set up Tracks and Challenge Categories with community voting rules, ensuring at least one track is defined before launch.
- **Pageant Director**: Needs divisions (Teen, Female, Male) and award categories with voting toggles.
- **Voter / Attendee**: Benefits downstream from clean ballot presentation aligned to the event archetype.

---

## 3. Gherkin Acceptance Scenarios

### Scenario 1: Happy Path - Dynamic Form Adaptation
- **Given** an organizer on Step 2 of the Event Creation wizard
- **When** the organizer switches the archetype toggle from `PAGEANT` to `STUDENT_COUNCIL`
- **Then** pageant-specific monetization fields disappear, and the Taxonomy panel shifts to configure Positions (e.g. President, Vice President) with seat limits.

### Scenario 2: Validation & Error Handling - Incomplete Archetype Taxonomy
- **Given** an organizer configuring a `HACKATHON` event
- **When** they attempt to proceed without defining at least one submission track
- **Then** the form displays an inline error: `"At least one challenge track or category is required for hackathons."`

### Scenario 3: Edge Case / Viewport Adaptation & Form Persistence
- **Given** an organizer on a mobile viewport (375px width) filling out general event details
- **When** they toggle between archetypes
- **Then** common fields (`title`, `slug`, `startsAt`, `endsAt`, `bannerUrl`) remain preserved without form reset or horizontal overflow.

### Scenario 4: Settings Dashboard Tab Adaptation
- **Given** an organizer viewing the Settings page of an existing `STUDENT_COUNCIL` or `HACKATHON` event
- **When** navigating to the Categories & Awards tab
- **Then** the UI displays the archetype-tailored taxonomy editor (e.g. Positions & Offices with seat limits, or Tracks) instead of pageant-only divisions.

---

## 4. Technical Scope & Architecture

| Layer | Target Files / Deliverables | Description |
| :--- | :--- | :--- |
| **Components** | `src/features/events/components/archetype-selector.tsx` | Visual cards/radio group for selecting archetype with terminology pill badges |
| **Components** | `src/features/events/components/taxonomy-editor.tsx` | Dynamic taxonomy manager supporting Positions, Tracks, and Divisions |
| **Components** | `src/features/events/components/event-creation-wizard.tsx` | Multi-step wizard integrating general event info, archetype selection, and taxonomy setup |
| **Components** | `src/features/events/components/CreateEventForm.tsx` | Updated or wrapped by the wizard to support archetype selection |
| **Dashboard** | `src/features/events/components/dashboard/CategoryAwardsSettingsForm.tsx` | Archetype-aware settings tab supporting positions and tracks management |
| **Actions** | `src/features/events/actions/create-event.ts` | Server Action accepting archetype and optional initial taxonomy items |
| **Service** | `src/features/events/services/create-event.ts` | Transactional creation of Event with archetype and initial positions/divisions |
| **Validations** | `src/lib/validations/event.ts`<br>`src/lib/validations/archetype-wizard.ts` | Zod schemas validating archetype and conditional taxonomy rules |

---

## 5. Architectural & Design Constraints

1. **Brutalist-Refined Zero-Radius**: Strict zero-radius geometry (`rounded-none`, `--radius: 0px`) across all cards, buttons, tabs, dialogs, and inputs.
2. **Light Mode Default**: Opal Slate-50 (`#F8FAFC`) default background with WCAG 2.1 AA dual-theme contrast in both light and dark modes.
3. **Mobile Responsiveness**: Touch targets minimum 44px, zero horizontal overflow down to 320px viewport width.
4. **Strict TypeScript 5**: No `any`, no non-null assertions `!`, all props and form outputs strictly typed.
5. **Single Source of Truth**: State managed cleanly through React Hook Form with Zod validation.

# Feature Specification: Organizer Dashboard Theme Selector & Real-Time Appearance Preview UI

**Feature ID**: `050-organizer-dashboard-theme-selector`  
**Ticket**: [VS-122](https://the-three-devsketeers.atlassian.net/browse/VS-122)  
**Parent Epic**: [VS-119](https://the-three-devsketeers.atlassian.net/browse/VS-119) (`[Epic] Dynamic Event Theming Engine & Visual Appearance System`)  
**Status**: Ready for Implementation  
**Created**: 2026-10-24  

---

## 1. Clarifications & Resolved Decisions

### Session 2026-10-24
- **Q1: Where in the organizer dashboard does the theme selection UI reside?**  
  → **A**: Inside the "General & Branding" tab (`/dashboard/events/[slug]/settings?tab=general` and `/events/[slug]/settings?tab=general`) embedded directly within `GeneralBrandingForm.tsx`.
- **Q2: Which themes are currently supported by the registry?**  
  → **A**: Two themes from `THEME_REGISTRY`:
    1. `ELECTA_DEFAULT`: "Electa Opal (Default)" — Clean Opal slate design system with sharp brutalist-refined zero-radius geometry (`#F8FAFC`, `#0284C7`, Outfit + Sora typography).
    2. `PAGEANT_EDITORIAL`: "Pageant Editorial Haute-Couture" — Obsidian surfaces (`#0B0C10`, `#12141C`), champagne gold accents (`#CBB279`), Cormorant Garamond serif typography.
- **Q3: What elements should each Theme Selector Card display?**  
  → **A**:
    - Theme Display Name and Description.
    - Active / Selected indicator (badge or checkmark).
    - Color swatches displaying the key tokens (Base, Surface, Primary Accent, Secondary Accent, and Text colors).
    - Font family badges (Heading & Body font names).
    - Strict zero-radius brutalist styling (`rounded-none`, `--radius: 0px`).
- **Q4: How does the real-time live appearance preview work?**  
  → **A**: An embedded preview container dynamically displays a miniature public page hero and contestant preview reflecting the actively selected theme tokens and CSS variables, instantly updating before saving without page reloads.
- **Q5: How are theme changes persisted and audited?**  
  → **A**: Submitting the form calls `updateEventBrandingAction(event.slug, data)`. The Server Action validates the payload with `updateEventBrandingSchema`, authorizes ownership via `requireEventOwnership(slug)`, executes an atomic transaction in Prisma updating `event.theme` and logging an `eventAuditLog` entry, and revalidates `/events/[slug]/settings` and `/events/[slug]`.
- **Q6: How does form reset / dirty state interact with theme selection?**  
  → **A**: Selecting a theme different from `event.theme` marks the form as dirty (`isDirty = true`) and triggers the "Unsaved changes" indicator. Clicking "Discard Changes" restores the theme to `event.theme` and clears dirty state.

---

## 2. Overview & Business Value

With the implementation of the Dynamic Theme Resolution Engine (`VS-120`) and the Haute-Couture Pageant Editorial Theme (`VS-121`), Electa supports multiple visual identities for competition events. However, organizers previously lacked a visual interface to preview and switch themes in the dashboard.

This feature introduces a first-class **Theme Selector & Real-Time Appearance Preview UI** in `GeneralBrandingForm.tsx`:
1. **Interactive Theme Selection**: Selectable cards for `ELECTA_DEFAULT` and `PAGEANT_EDITORIAL` showing color swatches and typography pairings.
2. **Real-Time Live Appearance Preview**: A miniature public page preview component rendered with the selected theme's tokens, giving instant visual feedback before persisting.
3. **Seamless State & Server Action Integration**: Full integration with React Hook Form, Zod validation, and atomic audit logging via Server Actions.
4. **Zero-Radius Brutalist Design System**: Strict adherence to Electa's `--radius: 0px` design rules and WCAG 2.1 AA dual-theme contrast standards.

---

## 3. User Scenarios & Acceptance Criteria

### User Story 1 - Interactive Theme Selection Cards (Priority: P1) 🎯 MVP

An event organizer on `/events/[slug]/settings?tab=general` sees the "Visual Theme & Appearance" section containing cards for each available theme in `THEME_REGISTRY`.

**Acceptance Scenarios**:
1. **Given** an organizer on the General Settings tab,  
   **When** the form loads,  
   **Then** all available themes in `THEME_REGISTRY` are displayed as selectable cards, with the event's current theme pre-selected.
2. **Given** the Theme Selector Cards,  
   **When** rendered in light or dark dashboard mode,  
   **Then** each card renders color swatches (Base, Surface, Accent Primary, Text Primary) and typography badges with sharp 0px corners (`rounded-none`).

---

### User Story 2 - Instant Real-Time Appearance Preview (Priority: P1)

An organizer clicks on a theme card to evaluate its look. The embedded live preview immediately updates to reflect the chosen theme's palette and typography.

**Acceptance Scenarios**:
1. **Given** an organizer viewing the branding form with `ELECTA_DEFAULT` selected,  
   **When** they click the "Pageant Editorial Haute-Couture" card,  
   **Then** the embedded preview card immediately updates to show the obsidian/champagne color scheme and Cormorant Garamond typography.
2. **Given** an organizer with unsaved theme changes,  
   **When** they click "Discard Changes",  
   **Then** the form and live preview revert to the event's saved theme and dirty state is cleared.

---

### User Story 3 - Persisting Theme Changes via Server Action (Priority: P1)

An organizer selects a new theme and submits the form. The theme is validated and persisted in the database.

**Acceptance Scenarios**:
1. **Given** an organizer who has selected a new theme,  
   **When** they click "Save Changes",  
   **Then** `updateEventBrandingAction` updates `event.theme`, writes an audit log entry in `eventAuditLog`, revalidates paths, and displays a success message.
2. **Given** an invalid or corrupted theme value submitted to `updateEventBrandingAction`,  
   **When** validation executes,  
   **Then** the request is rejected with a validation error and the database remains unmodified.

---

### User Story 4 - Authorization Protection (Priority: P1)

A non-owner or unauthenticated user attempting to invoke `updateEventBrandingAction` is blocked.

**Acceptance Scenarios**:
1. **Given** an unauthenticated user invoking `updateEventBrandingAction`,  
   **When** the action executes,  
   **Then** it returns `{ success: false, error: "You must be signed in to perform this action." }`.
2. **Given** an authenticated user who is not the event organizer invoking `updateEventBrandingAction`,  
   **When** the action executes,  
   **Then** it returns `{ success: false, error: "Forbidden: You do not have ownership of this event." }`.

---

## 4. Edge Cases & Invariants

1. **Missing / Null Theme on Event**: If an existing event has a null or undefined `theme` field, the UI and server action default cleanly to `ELECTA_DEFAULT`.
2. **Unsaved State Navigation**: When an organizer changes the theme without saving, `isDirty` is true and the "Unsaved changes" badge is visible.
3. **Contrast Parity**: In both light and dark dashboard modes, all text, swatches, and borders maintain WCAG 2.1 AA compliance (>= 4.5:1 for text, >= 3:1 for graphical controls).
4. **Zero-Radius Invariant**: No `rounded-md`, `rounded-lg`, or `rounded-xl` classes are permitted on theme cards, swatches, buttons, or preview containers.

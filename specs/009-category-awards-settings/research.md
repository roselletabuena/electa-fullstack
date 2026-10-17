# Research: Organizer Dashboard "Categories & Awards" Settings Management UI

**Feature Branch**: `009-category-awards-settings`
**Status**: Completed

---

## 1. Technical Decisions & Findings

### Decision 1: Server State Management & API Synchronization

- **Decision**: Use `@tanstack/react-query` (`useQuery`, `useMutation`, `useQueryClient`) for fetching unified taxonomy (`GET /api/events/[slug]/categories`), creating items (`POST /api/events/[slug]/divisions`, `POST /api/events/[slug]/award-categories`), updating items (`PATCH`), and deleting items (`DELETE`).
- **Rationale**:
  - Aligns directly with **Electa Constitution Principle III** (_Server state must be managed solely by TanStack Query; never mirror server data into client global stores_).
  - Enables instant optimistic updates for voting toggle switches and badge creations with automatic rollback on network failure.
  - Simplifies cache invalidation across the entire settings slice (`['events', slug, 'taxonomy']`).
- **Alternatives Considered**:
  - _Local useState only_: Requires tedious manual tracking of sync states, error handling, and manual re-fetching.
  - _Server Actions only_: Lacks client-side cache invalidation granularity and smooth optimistic toggle animations for fast micro-interactions.

---

### Decision 2: In-Place Inline Card Editing & Concurrency Guard Architecture

- **Decision**: Provide in-place inline editing directly within `DivisionsSection` and `AwardCategoriesSection`. Clicking the "Edit" action button transforms the specific card into an editable form pre-populated with current values (`name`, `description`, `displayOrder`, plus `isVotingOpen` for award categories). While an item is in active edit mode, other Edit and Add action buttons are disabled (Concurrent Edit Guard) until the active edit is saved or cancelled.
- **Rationale**:
  - Initial taxonomy setup is already established during event creation in the Event Creation Wizard, making preset templates redundant in the settings dashboard.
  - Inline card editing keeps spatial context intact without modal backdrops or layout shifts.
  - Disabling other action buttons during active editing prevents competing form states and dirty data loss.
  - Foreign key relations remain intact upon rename, immediately updating all contestant displays without extra confirmation modals.
- **Alternatives Considered**:
  - _Presets in settings tab_: Redundant since organizers already select/configure archetypes and taxonomy in the wizard.
  - _Modal dialogs for editing_: Unnecessary overlay layers and focus traps for editing simple 2-to-3 field records.
  - _Multi-item concurrent editing_: High risk of conflicting form states, uncoordinated network requests, and complex dirty-checking.

---

### Decision 3: Component Decomposition & Design System

- **Decision**: Decompose the settings UI into modular, accessible components under `src/features/events/components/dashboard/`:
  - `CategoryAwardsSettingsForm.tsx` (Main tab container with header, error banner, and action toolbar)
  - `TaxonomyPresetsCard.tsx` (1-click template selection pills with preset previews)
  - `DivisionsSection.tsx` (Division badge list, inline creation form, order reordering, delete action)
  - `AwardCategoriesSection.tsx` (Award track cards, voting availability switch, inline creation form, delete action)
  - `TaxonomyDeleteDialog.tsx` (Accessible Radix dialog warning when contestantCount > 0 or confirming safe deletion)
- **Rationale**:
  - Follows Constitution Principle V (_Feature Colocation & Modular Architecture_).
  - Maximizes testability with isolated Vitest unit tests for individual sub-components.
- **Alternatives Considered**:
  - _Monolithic single-file form_: Unmaintainable (~800 lines) and difficult to unit test in isolation.

---

### Decision 4: Referential Integrity & Safe Deletion Modal

- **Decision**: When an organizer clicks delete on a division or award category:
  - If `item.contestantCount > 0`: Display a non-destructive blocker modal explaining: _"Cannot delete '[Name]' because X contestants are assigned to it. Please reassign or remove contestants first."_ (Action button disabled/cancel only).
  - If `item.contestantCount === 0` (or unassigned): Display a destructive confirmation modal (_"Are you sure you want to delete '[Name]'?"_) before calling `DELETE`.
- **Rationale**:
  - Prevents accidental data corruption and conforms with backend 409 Conflict safety guards implemented in Feature 008.
- **Alternatives Considered**:
  - _Direct deletion without confirmation_: High risk of accidental misclicks by organizers.

---

### Decision 5: Tab Navigation & Query Parameter Integration

- **Decision**:
  - Update `SETTINGS_TABS` in `src/features/events/types/index.ts` to `["general", "schedule", "voting-rules", "categories"] as const`.
  - Add `{ id: "categories", label: "Categories & Awards", icon: Layers, description: "Divisions & award tracks" }` to `SettingsTabNav.tsx`.
  - Mount `<CategoryAwardsSettingsForm event={event} />` in `SettingsTabsContainer.tsx` when `activeTab === "categories"`.
- **Rationale**:
  - Seamlessly integrates into existing `nuqs`-powered shallow URL routing (`/events/[slug]/settings?tab=categories`).
- **Alternatives Considered**:
  - _Sub-routes (`/settings/categories`)_: Inconsistent with existing tab architecture across General Branding, Schedule, and Voting Rules.

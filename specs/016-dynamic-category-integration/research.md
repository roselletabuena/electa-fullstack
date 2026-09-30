# Research & Architecture Decisions: Dynamic Category Integration in Contestant Form & Public Roster Filter Bar

**Feature**: `015-dynamic-category-integration`  
**Jira**: [VS-38](https://the-three-devsketeers.atlassian.net/browse/VS-38) | **Epic**: [VS-35](https://the-three-devsketeers.atlassian.net/browse/VS-35)  
**Date**: 2026-10-01

---

## Technical Decisions & Rationale

### 1. Prop-Driven Division Injection vs. Client Fetching

- **Decision**: Fetch event divisions server-side in the RSC page (`/events/[slug]/contestants/page.tsx`) via `db.division.findMany` in parallel with contestants and categories, then pass them as props down to `OrganizerContestantTable` → `ContestantFormModal`.
- **Rationale**:
  - Aligns with Constitution §II (Server-First): RSC handles all DB access; client components receive serialized props.
  - Eliminates an extra client-side `useQuery` fetch per modal open, reducing waterfall latency.
  - Keeps `ContestantFormModal` a pure, testable component with no direct server dependencies.
- **Alternatives Considered**:
  - _Client TanStack Query fetch inside modal_: Rejected — introduces a loading state flicker every time the modal opens, violates RSC-first principle.
  - _Global Zustand store for divisions_: Rejected — Constitution §III prohibits mirroring server data into client stores.

---

### 2. Union Type for divisions Prop (DivisionDto | DynamicDivisionItem)

- **Decision**: Accept `DivisionDto[] | DynamicDivisionItem[] | undefined` on both `ContestantFormModal` and `OrganizerContestantTable` rather than forcing a single concrete type.
- **Rationale**:
  - `DivisionDto` is the Prisma-mapped server type (includes `eventId`, `displayOrder`).
  - `DynamicDivisionItem` is a minimal client-friendly interface (`id?`, `name`, `description?`, `displayOrder?`) that tests and older call-sites can use without importing Prisma types.
  - The union keeps both call-sites type-safe without forcing a conversion layer.
- **Alternatives Considered**:
  - _Single `DivisionDto` type everywhere_: Rejected — pollutes pure client components with server-layer Prisma types.
  - _Plain `{ id?: string; name: string }[]`_: Too narrow; loses `displayOrder` needed for correct pill ordering.

---

### 3. Client-Side Filtering Strategy (< 50ms Requirement)

- **Decision**: All division and award category filtering in `ContestantRoster` is performed purely client-side using `Array.filter` on the `initialContestants` prop; results are never re-fetched from the server on filter change.
- **Rationale**:
  - Pageant rosters are bounded datasets (typically < 200 contestants). Client-side `Array.filter` on 200 objects executes in < 1ms — well within the 50ms spec target.
  - URL search param sync (`router.replace`) uses `{ scroll: false }` to avoid scroll jump; it does not trigger a server round-trip because filtering happens in React state.
- **Alternatives Considered**:
  - _Server-side filtering via query params + RSC rerender_: Rejected — introduces ~200–800ms server latency on every pill click, failing the < 50ms spec requirement.
  - _Debounced client fetch with TanStack Query_: Rejected — same network latency problem for a non-paginated dataset.

---

### 4. Multi-Field Division Matching in ContestantRoster

- **Decision**: The filter in `ContestantRoster` matches `selectedDivision` against four contestant fields in order: `c.division`, `c.divisionName`, `c.divisionRef?.name`, `c.divisionId`, plus normalized enum lookups for legacy `FEMALE/MALE/LGBTQ/TEEN` values.
- **Rationale**:
  - Backward compatibility: contestants created before dynamic divisions only have `c.division` (enum string). New contestants created via the updated form also populate `c.divisionId` and `c.divisionRef`.
  - The layered matching prevents regressions for any existing event data without a migration.
- **Edge Case Handled**:
  - Special characters in division names (e.g., "Under-18 / Junior") are URL-encoded by `URLSearchParams` natively — no custom encoding needed.

---

### 5. CategoryFilterBar Fallback Strategy

- **Decision**: `CategoryFilterBar` falls back to `DEFAULT_FALLBACK_DIVISIONS` (Female, Male, LGBTQ+, Teen) only when **both** the `divisions` prop is empty/undefined **and** no distinct division names can be derived from the candidate list itself.
- **Rationale**:
  - Prevents an empty filter bar for events in migration (some contestants migrated, divisions prop not yet wired).
  - `ContestantRoster` derives distinct division names from `initialContestants` as a secondary fallback before reaching the static default, maintaining visual consistency.

---

### 6. WCAG 2.1 AA — Division Select Labelling

- **Decision**: The Division `<select>` element in `ContestantFormModal` must be explicitly linked to its label via matching `id`/`htmlFor` attributes.
- **Rationale**:
  - Without the `<label for="...">` linkage, screen readers announce the combobox without a readable name, failing WCAG 2.1 SC 1.3.1 (Info and Relationships) and SC 4.1.2 (Name, Role, Value).
  - FR-010 mandates WCAG 2.1 AA compliance for all interactive elements including select dropdowns.

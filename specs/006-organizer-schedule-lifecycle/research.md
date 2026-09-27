# Phase 0 Research: Organizer Event Operational Schedule & Publication Lifecycle Controls

**Feature**: [spec.md](./spec.md)  
**Date**: 2026-09-27  
**Status**: Completed

---

## 1. Operational Schedule & Timezone Representation

### Context & Need

Event organizers configure voting operational windows (`startsAt` and `endsAt`). In the Philippines context, events are scheduled in Philippine Standard Time (`Asia/Manila`, UTC+8). The database stores UTC `DateTime` values in PostgreSQL via Prisma.

### Decision

- Client UI collects dates via datetime-local inputs formatted in `Asia/Manila` time.
- Inputs are normalized to ISO-8601 UTC strings prior to submission or handled as ISO strings with explicit timezone offsets.
- Client and server schemas enforce `endsAt > startsAt`.

### Rationale

- ISO-8601 UTC storage provides unambiguous temporal ordering regardless of server host timezone.
- Explicit timezone formatting ensures Philippine organizers see correct local dates and times.
- Zero external heavy date libraries needed; standard JavaScript `Date` and `Intl.DateTimeFormat` or Next.js utilities handle conversion cleanly.

### Alternatives Considered

- **Storing timestamps as epoch milliseconds**: Less readable in database inspections and loses native Prisma `DateTime` filtering capabilities.
- **Storing local string without timezone**: Risks desynchronization if servers or voters are in different timezones.

---

## 2. Publication Lifecycle State Machine & Confirmation Guardrails

### Context & Need

Events progress through three publication states (`EventPublicationStatus` enum):

1. `DRAFT`: Unpublished event in preparation. Only organizers or stakeholders with the draft review passphrase can access the preview.
2. `PUBLISHED`: Publicly accessible event. Countdown banner and voting actions operate according to the operational schedule (`UPCOMING`, `OPEN`, `CLOSED`).
3. `ARCHIVED`: Concluded event. Public access is preserved in read-only mode, and voting actions are permanently disabled.

### Decision

- Organizers can select publication status in the "Schedule & Timeline" settings form.
- High-impact transitions (`DRAFT` → `PUBLISHED`, `PUBLISHED` → `ARCHIVED`, `PUBLISHED` → `DRAFT`) trigger an accessible confirmation dialog (Radix AlertDialog / modal) before submission.
- Validation checks that an event cannot be published without valid `startsAt` and `endsAt` dates.

### Rationale

- Confirmation modals prevent accidental publishing of incomplete draft events or unintended unpublishing of active live voting competitions.
- Clean lifecycle transitions allow smooth event operations from staging to grand finals to archive.

### Alternatives Considered

- **Instant toggle without confirmation**: High risk of accidental publication or unpublishing during live events.

---

## 3. Draft Review Passphrase Security & Storage

### Context & Need

While in `DRAFT` status, organizers want to share a private preview with judges, sponsors, or contestants. Setting a passphrase creates a secure preview gate (`/api/events/[slug]/preview-auth`).

### Decision

- Form allows:
  - Setting a new passphrase (min 4 characters).
  - Updating an existing passphrase.
  - Clearing the passphrase (removing `draftPassphraseHash` to restrict draft access strictly to authenticated organizers).
- Passphrases are hashed on the server using `bcryptjs` (or standard secure hash) before saving to `event.draftPassphraseHash`.
- Plaintext passphrases and raw hashes are never returned in public client DTOs or form initial values (form displays whether a passphrase is currently set).

### Rationale

- Ensures defense-in-depth: guest reviewer passwords are never stored in plain text.
- Clean UX indicates "Passphrase is set" without leaking the secret.

### Alternatives Considered

- **Plaintext passphrase in DB**: Violates Constitution §IV (Secure-by-Design).

---

## 4. Server Action Architecture & Immutable Audit Logging

### Context & Need

All schedule modifications, publication state changes, and passphrase adjustments must be authorized, atomic, and recorded in immutable audit logs.

### Decision

- Create `src/features/events/actions/update-schedule-lifecycle.ts`:
  1. Authorizes event ownership via `requireEventOwnership(slug)`.
  2. Validates input using Zod (`updateScheduleLifecycleSchema`).
  3. Executes atomic Prisma `$transaction`:
     - Updates `startsAt`, `endsAt`, `publicationStatus`, and `draftPassphraseHash` (if changed).
     - Inserts an `EventAuditLog` entry with action `"UPDATE_SCHEDULE_LIFECYCLE"`, `changedBy: session.userId`, `previousVal`, `newVal`, and optional `reason`.
  4. Calls `revalidatePath('/events/[slug]/settings')` and `revalidatePath('/events/[slug]')`.

### Rationale

- Adheres to Constitution §I–§V (Strict Type Safety, Server-First Next.js 16, Prisma source of truth, Ownership Guard, Feature Colocation).
- Atomic transaction ensures audit logs never desynchronize from event state.

---

## 5. UI Form & Settings Tab Integration

### Context & Need

In `src/app/(dashboard)/events/[slug]/settings/page.tsx`, `tab === "schedule"` currently renders a read-only `ScheduleSettingsSummaryCard`.

### Decision

- Create `ScheduleLifecycleForm.tsx` in `src/features/events/components/dashboard/`:
  - Section 1: Voting Operational Window (Date/Time pickers for `startsAt` and `endsAt` with live duration summary).
  - Section 2: Publication Status (Status selector with status badges and lifecycle transition confirmation modals).
  - Section 3: Draft Review Security (Passphrase toggle/input for preview access).
  - Section 4: Audit Reason & Save Action button.
- Integrate `ScheduleLifecycleForm` directly on `tab === "schedule"` in the settings page.

### Rationale

- Provides an interactive, accessible control center matching the design language of `GeneralBrandingForm` and `VotingRulesForm`.

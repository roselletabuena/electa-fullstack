# Phase 0 Research: Organizer Voting Rules & Daily Free Vote Quota Configuration

**Feature**: [spec.md](./spec.md)  
**Date**: 2026-09-27  
**Status**: Completed

---

## 1. Database Schema Representation for Voting Rules

### Context & Need

Event organizers need to configure whether free voting is active (`isFreeVotingEnabled`) and how many free votes a voter receives per 24-hour cycle (`dailyFreeVoteLimit`, integer between 1 and 5).

### Decision

Extend the `Event` model in `prisma/schema.prisma` with two dedicated fields:

```prisma
model Event {
  // ... existing fields
  isFreeVotingEnabled Boolean  @default(true)
  dailyFreeVoteLimit  Int      @default(1)
  // ...
}
```

### Rationale

- Storing `isFreeVotingEnabled` and `dailyFreeVoteLimit` directly on the `Event` model avoids additional table joins and keeps operational settings colocated with other core event flags (`publicationStatus`, `showResultsOnClose`).
- Defaults (`isFreeVotingEnabled: true`, `dailyFreeVoteLimit: 1`) guarantee seamless backward compatibility for existing events without data migration anomalies.
- Prisma schema migrations (`npx prisma migrate dev`) cleanly apply default column constraints to PostgreSQL.

### Alternatives Considered

- **Separate `EventVotingPolicy` table**: Adds relational overhead, foreign key joins, and unnecessary 1:1 table complexity for just two scalar configuration fields.
- **Dynamic JSON configuration column (`settings Json`)**: Sacrifices Prisma type generation, schema-level default enforcement, and strict database column constraints.

---

## 2. Form Architecture & Interactive UI Pattern

### Context & Need

Organizers access the "Voting Rules" tab in the event settings portal (`/events/[slug]/settings?tab=voting-rules`). The UI must provide an intuitive toggle for free daily voting, a selectable quota slider/stepper/dropdown (1–5 votes), an optional audit reason text area, and instant validation feedback.

### Decision

Create `VotingRulesForm.tsx` within `src/features/events/components/dashboard/`:

- Uses `react-hook-form` with `@hookform/resolvers/zod` and `votingRulesFormSchema`.
- UI Components:
  - **Free Voting Toggle**: Radix UI Switch primitive (`@/components/ui/switch`) with descriptive helper text explaining the impact on public pages.
  - **Daily Quota Selector**: Radio group, segmented control, or number stepper bounded strictly between 1 and 5 (disabled when free voting is toggled OFF).
  - **Reason for Change**: Optional `<textarea>` (max 500 characters) for audit trail documentation.
  - **Save Action**: Accessible `<Button>` with loading spinner and disabled state during submission or when form is pristine.

### Rationale

- Consistent with `GeneralBrandingForm` and `ScheduleSettingsForm` in `src/features/events/components/dashboard/`.
- Clear visual gating: when `isFreeVotingEnabled` is switched off, the quota field visually dims/disables to communicate that free votes are inactive.

### Alternatives Considered

- **Plain uncontrolled HTML form**: Lacks instant client-side validation, accessible state bindings, and seamless integration with Zod schemas.

---

## 3. Server Action & Authorization Pattern

### Context & Need

Voting rule modifications must be protected by server-side authorization guards to prevent unauthorized or cross-tenant configuration tampering.

### Decision

Create `src/features/events/actions/update-voting-rules.ts`:

- Enforces `requireEventOwnership(slug)` checking the AWS Cognito authenticated session against `event.organizerId`.
- Validates the incoming payload against `updateVotingRulesSchema`.
- Executes a Prisma transaction to:
  1. Update `Event` record (`isFreeVotingEnabled`, `dailyFreeVoteLimit`).
  2. Create an `EventAuditLog` entry with `action: "UPDATE_VOTING_RULES"`, `previousVal`, `newVal`, and optional `reason`.
- Calls `revalidatePath('/events/[slug]/settings')` and `revalidatePath('/events/[slug]')` upon successful commit.

### Rationale

- Adheres to Constitution §I, §II, §III, §IV: strict Zod validation, authenticated Server Action, Prisma transaction as single source of truth, and zero `any`/non-null assertions.
- Transactional atomicity guarantees that an audit log is always written when the event settings are altered, preventing desynchronized audit histories.

---

## 4. Public Voter Experience & Gating Strategy

### Context & Need

When `isFreeVotingEnabled` is set to `false`, public voters must not see or be able to submit free votes, and should instead be guided directly to paid boost voting options.

### Decision

- Public event components check `event.isFreeVotingEnabled`:
  - When `true`: Free voting button is active, showing the voter's remaining free votes for the current 24-hour cycle based on `event.dailyFreeVoteLimit`.
  - When `false`: Free voting button is replaced or badged with "Free voting closed — Vote with Boost" with a prominent link to paid packages.
- Server-side vote submission endpoint strictly validates `event.isFreeVotingEnabled` before processing any free vote transaction, returning HTTP 403 / validation error if attempted while disabled.

### Rationale

- Protects competition rules both visually on the client and authoritatively on the server.

---

## 5. Audit Logging Structure

### Context & Need

Audit logs must capture complete before-and-after snapshots for dispute resolution.

### Decision

Record the audit entry in `EventAuditLog`:

- `eventId`: target event ID
- `action`: `"UPDATE_VOTING_RULES"`
- `changedBy`: organizer session user ID
- `previousVal`: `{ isFreeVotingEnabled: boolean, dailyFreeVoteLimit: number }`
- `newVal`: `{ isFreeVotingEnabled: boolean, dailyFreeVoteLimit: number }`
- `reason`: string or `null`

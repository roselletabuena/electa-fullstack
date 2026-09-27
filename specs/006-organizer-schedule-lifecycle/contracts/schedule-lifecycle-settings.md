# Interface Contract: Schedule & Lifecycle Settings

**Feature**: [spec.md](../spec.md)  
**Date**: 2026-09-27  
**Status**: Draft

---

## 1. Server Action: `updateScheduleLifecycleAction`

**Path**: `src/features/events/actions/update-schedule-lifecycle.ts`

### Signature

```typescript
export async function updateScheduleLifecycleAction(
  slug: string,
  input: UpdateScheduleLifecycleInput,
): Promise<ActionResponse<Event>>;
```

### Request Input Schema (`UpdateScheduleLifecycleInput`)

| Field                  | Type                                   | Required? | Validation Rules                              | Description                                 |
| :--------------------- | :------------------------------------- | :-------- | :-------------------------------------------- | :------------------------------------------ |
| `startsAt`             | `string`                               | Yes       | ISO-8601 string or valid date string          | Operational start timestamp for voting      |
| `endsAt`               | `string`                               | Yes       | ISO-8601 string; strictly `endsAt > startsAt` | Operational cutoff timestamp for voting     |
| `publicationStatus`    | `"DRAFT" \| "PUBLISHED" \| "ARCHIVED"` | Yes       | Valid enum                                    | Target publication state                    |
| `draftPassphrase`      | `string`                               | No        | Minimum 4 characters when provided (or empty) | New draft preview passphrase                |
| `clearDraftPassphrase` | `boolean`                              | No        | Default `false`                               | When true, removes existing passphrase hash |
| `reason`               | `string`                               | No        | Max 500 characters                            | Optional administrative rationale for audit |

### Response Envelopes

#### Success Response (`200 OK`)

```json
{
  "success": true,
  "data": {
    "id": "evt_12345",
    "slug": "miss-universe-ph-2026",
    "title": "Miss Universe Philippines 2026",
    "startsAt": "2026-10-01T00:00:00.000Z",
    "endsAt": "2026-10-15T23:59:59.000Z",
    "publicationStatus": "PUBLISHED",
    "draftPassphraseHash": null,
    "showResultsOnClose": true,
    "isFreeVotingEnabled": true,
    "dailyFreeVoteLimit": 1,
    "organizerId": "user_org_01",
    "createdAt": "2026-09-01T00:00:00.000Z",
    "updatedAt": "2026-09-27T12:00:00.000Z"
  },
  "message": "Schedule and lifecycle settings updated successfully"
}
```

#### Validation Error Response (`400 Bad Request`)

```json
{
  "success": false,
  "error": "Validation failed. Please check your inputs.",
  "fieldErrors": {
    "endsAt": ["Voting end date must be after start date"]
  }
}
```

#### Authorization Error Response (`401 / 403`)

```json
{
  "success": false,
  "error": "Forbidden: You do not have ownership of this event."
}
```

---

## 2. Event Audit Log Contract

When `updateScheduleLifecycleAction` succeeds, an audit record is created in `EventAuditLog`:

- **`eventId`**: UUID of the event
- **`action`**: `"UPDATE_SCHEDULE_LIFECYCLE"`
- **`changedBy`**: Cognito session user ID
- **`previousVal`**:
  ```json
  {
    "startsAt": "2026-10-01T00:00:00.000Z",
    "endsAt": "2026-10-10T23:59:59.000Z",
    "publicationStatus": "DRAFT",
    "hasDraftPassphrase": false
  }
  ```
- **`newVal`**:
  ```json
  {
    "startsAt": "2026-10-01T00:00:00.000Z",
    "endsAt": "2026-10-15T23:59:59.000Z",
    "publicationStatus": "PUBLISHED",
    "hasDraftPassphrase": false
  }
  ```
- **`reason`**: String note or `null`

---

## 3. UI Component Contract: `ScheduleLifecycleForm`

**Path**: `src/features/events/components/dashboard/ScheduleLifecycleForm.tsx`

### Props Interface

```typescript
export interface ScheduleLifecycleFormProps {
  event: Event;
}
```

### Accessibility & Interaction Contract

- All form controls use proper `<label>` associations with matching `htmlFor` and `id`.
- Date pickers provide localized helper text indicating Philippine Time (`Asia/Manila`, UTC+8).
- Status change buttons/select include `aria-describedby` referencing consequence explanations.
- Lifecycle transition modals trap focus, announce dialog headers with `role="alertdialog"`, and provide clear "Cancel" and "Confirm" actions.
- Inline validation errors are announced with `role="alert"` and styled in accessible destructive tokens.
- Save button displays a loading spinner and is disabled during in-flight submissions.

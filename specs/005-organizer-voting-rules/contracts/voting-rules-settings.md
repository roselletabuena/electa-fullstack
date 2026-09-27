# Interface & Server Action Contract: Voting Rules Settings

**Feature**: [spec.md](../spec.md)  
**Date**: 2026-09-27  
**Status**: Final

---

## 1. Server Action: `updateVotingRulesAction`

**Location**: `src/features/events/actions/update-voting-rules.ts`  
**Execution Context**: Server Action (authenticated, Next.js 16 App Router)

### Input Contract

```typescript
interface UpdateVotingRulesInput {
  slug: string;
  isFreeVotingEnabled: boolean;
  dailyFreeVoteLimit: number; // Integer between 1 and 5
  reason?: string; // Optional, max 500 chars
}
```

### Return Contract

```typescript
interface ActionSuccessResponse {
  success: true;
  message: string;
  data: {
    isFreeVotingEnabled: boolean;
    dailyFreeVoteLimit: number;
    auditLogId: string;
  };
}

interface ActionErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

type UpdateVotingRulesActionResponse = ActionSuccessResponse | ActionErrorResponse;
```

### Authorization & Guard Rules

1. Call `requireEventOwnership(slug)`. If `authorized === false`, return HTTP 403 or error response `{ success: false, message: "Unauthorized to modify voting rules for this event" }`.
2. Validate input payload against `updateVotingRulesInputSchema`. If invalid, return `{ success: false, message: "Validation error", errors: formattedZodErrors }`.
3. Read existing `Event` record to obtain `previousVal: { isFreeVotingEnabled: event.isFreeVotingEnabled, dailyFreeVoteLimit: event.dailyFreeVoteLimit }`.
4. Run atomic Prisma transaction:
   - Update `event` with new `isFreeVotingEnabled` and `dailyFreeVoteLimit`.
   - Create `eventAuditLog` with `action: "UPDATE_VOTING_RULES"`, `changedBy: session.userId`, `previousVal`, `newVal`, `reason`.
5. Trigger cache revalidation: `revalidatePath('/events/[slug]/settings')` and `revalidatePath('/events/[slug]')`.
6. Return success response.

---

## 2. React UI Component Contract: `VotingRulesForm`

**Location**: `src/features/events/components/dashboard/VotingRulesForm.tsx`  
**Component Type**: Client Component (`"use client"`)

### Component Props

```typescript
interface VotingRulesFormProps {
  event: {
    id: string;
    slug: string;
    isFreeVotingEnabled: boolean;
    dailyFreeVoteLimit: number;
    organizerId: string;
  };
}
```

### Behavioral Expectations

- **Initial State**: Populated with `event.isFreeVotingEnabled` (default `true`) and `event.dailyFreeVoteLimit` (default `1`).
- **Toggle Switch**: Switching `isFreeVotingEnabled` dynamically enables/disables the `dailyFreeVoteLimit` selector.
- **Quota Selector**: Constrained to integer values `[1, 2, 3, 4, 5]`.
- **Reason Field**: Optional textarea with character count indicator `X / 500`.
- **Submission**: Invokes `updateVotingRulesAction` with optimistic pending UI, shows Sonner toast on success or error, and leaves previous state intact if validation fails.

# Data Model: Fullscreen Stage Presentation Mode for LED Screens

**Feature**: `021-fullscreen-stage-presentation`  
**Jira Key**: `VS-23`  
**Date**: 2026-10-02

## 1. Client & Server Data Structures

### `StageDisplayMode`

```typescript
export type StageDisplayMode = "LIVE_TALLY" | "WINNER_REVEAL";
```

### `StageCandidate`

```typescript
export interface StageCandidate {
  id: string;
  contestantNumber: number;
  name: string;
  avatarUrl: string | null;
  voteCount: number | null;
  rank: number | null;
  divisionId?: string | null;
  divisionName?: string | null;
  isRevealed?: boolean;
}
```

### `StageDisplayPayload`

```typescript
export interface StageDisplayPayload {
  eventId: string;
  eventTitle: string;
  eventSlug: string;
  isFrozen: boolean;
  totalVotes: number;
  selectedDivisionId: string | null;
  selectedCategoryId: string | null;
  candidates: StageCandidate[];
  divisions: Array<{ id: string; name: string }>;
  categories: Array<{ id: string; name: string }>;
  lastUpdated: string;
}
```

### `RevealSequenceState`

```typescript
export interface RevealSequenceState {
  mode: StageDisplayMode;
  currentStep: number; // 0 = all unrevealed, 1 = lowest podium rank revealed, ..., total = winner revealed
  totalSteps: number;
  isAudioMuted: boolean;
  audioEnabled: boolean;
  isConfettiActive: boolean;
  fullscreenActive: boolean;
}
```

---

## 2. Invariants & Business Logic

1. **Deterministic Reveal Order**:
   - The reveal sequence ranks are sorted ascending by rank (Rank 3 → Rank 2 → Rank 1).
   - At `currentStep = 0`, all ranks in the reveal pool are masked.
   - At `currentStep = 1`, Rank 3 (e.g. 2nd Runner Up) is unveiled.
   - At `currentStep = 2`, Rank 2 (e.g. 1st Runner Up) is unveiled.
   - At `currentStep = 3`, Rank 1 (Title Winner) is unveiled, triggering the climax fanfare and 4K confetti explosion.

2. **Mystery Freeze Protection**:
   - If `isFrozen === true`, public stage views MUST NOT render vote tallies or ranks.
   - Reveal sequence mode is disabled or displays a "Results Sealed Under Mystery Freeze" shield until the event director overrides it.

3. **Strict Zero-Radius UI Invariant**:
   - Every rendered DOM component must use `rounded-none`.

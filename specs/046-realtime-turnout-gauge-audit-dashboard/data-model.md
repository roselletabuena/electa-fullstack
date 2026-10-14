# Data Model: Real-Time Turnout Gauge & Certified Election Audit Dashboard

**Feature**: `046-realtime-turnout-gauge-audit-dashboard`
**Date**: 2026-10-15
**Jira Key**: VS-111

## 1. Entities & Data Structures

### TurnoutMetrics
```typescript
export interface TurnoutMetrics {
  totalWhitelistedVoters: number;
  recordedParticipations: number;
  turnoutPercentage: number; // 0.00 to 100.00 rounded to 1 decimal place
  isQuorumMet: boolean;
  quorumThresholdPercentage: number; // default 50%
  votingVelocityPerHour: number; // participations in previous 60 minutes
  isPollClosed: boolean;
  endsAt: string; // ISO 8601
}
```

### CandidateTally
```typescript
export interface CandidateTally {
  candidateId: string;
  candidateName: string;
  contestantNumber: number;
  avatarUrl: string;
  voteCount: number;
  votePercentage: number;
  isWinner: boolean;
}
```

### OfficeTally
```typescript
export interface OfficeTally {
  officeId: string;
  officeName: string;
  maxSelectionsPerVoter: number;
  totalVotesCast: number;
  candidates: CandidateTally[];
  winners: CandidateTally[];
}
```

### CertifiedElectionAudit
```typescript
export interface CertifiedElectionAudit {
  eventId: string;
  eventTitle: string;
  eventSlug: string;
  startsAt: string;
  endsAt: string;
  certifiedAt: string;
  certifiedBy: string; // Commissioner name/ID
  turnout: TurnoutMetrics;
  offices: OfficeTally[];
  auditHash: string; // SHA-256 hash of canonical audit JSON
}
```

## 2. Invariants & Validation Rules

1. **Turnout Range**: `0.0 <= turnoutPercentage <= 100.0`. When `totalWhitelistedVoters === 0`, `turnoutPercentage = 0.0`.
2. **Quorum Boundary**: `isQuorumMet = turnoutPercentage >= quorumThresholdPercentage`.
3. **Sealed Status**: When `new Date() < new Date(endsAt)`, `offices` in public responses MUST be empty or omit vote counts, and `isPollClosed = false`.
4. **Deterministic Audit Hash**:
   `SHA-256(eventId + endsAt + totalWhitelistedVoters + recordedParticipations + canonicalOfficesSortedJSON)`.

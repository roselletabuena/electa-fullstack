# Data Model: Multi-Office Ballot Interface

**Feature ID**: `044-multi-office-ballot-interface`  
**Ticket**: [VS-109](https://the-three-devsketeers.atlassian.net/browse/VS-109)  

---

## 1. Domain Entities & Database Mapping

### Position (Office)
```typescript
export interface BallotPositionDto {
  id: string;
  name: string;
  description?: string | null;
  minSelectionsPerVoter: number;
  maxSelectionsPerVoter: number;
  displayOrder: number;
  isVotingOpen: boolean;
}
```

### Contestant (Candidate)
```typescript
export interface BallotCandidateDto {
  id: string;
  contestantNumber: number;
  name: string;
  avatarUrl: string;
  bio?: string | null;
  positionId: string;
  positionName?: string;
}
```

### Event Ballot Payload
```typescript
export interface PublicBallotEventDto {
  id: string;
  slug: string;
  title: string;
  description: string;
  bannerUrl: string;
  startsAt: string;
  endsAt: string;
  operationalState: string;
  positions: BallotPositionDto[];
  candidates: BallotCandidateDto[];
}
```

### Form Selections State
```typescript
// positionId -> contestantId[]
export type BallotSelectionsState = Record<string, string[]>;
```

### Submission Result
```typescript
export interface BallotSubmissionReceiptDto {
  ballotId: string;
  eventId: string;
  votesCount: number;
  submittedAt: string;
}
```

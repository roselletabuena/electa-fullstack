# Data Model: Secret-Ballot Decoupling

**Feature ID**: `045-secret-ballot-decoupling-processor`  
**Ticket**: [VS-110](https://the-three-devsketeers.atlassian.net/browse/VS-110)  

---

## 1. Prisma Schema Modifications

### Model: `VoterParticipation`
Tracks participation in an election event without recording any ballot selections or receipt hashes.

```prisma
model VoterParticipation {
  id        String   @id @default(uuid())
  eventId   String
  userId    String
  votedAt   DateTime @default(now())

  event     Event    @relation(fields: [eventId], references: [id], onDelete: Cascade)

  @@unique([eventId, userId])
  @@index([eventId])
  @@index([userId])
}
```

### Model: `BallotSelection`
Stores individual candidate choices anonymously with cryptographic receipt signatures, completely decoupled from voter identity.

```prisma
model BallotSelection {
  id          String   @id @default(uuid())
  eventId     String
  officeId    String
  candidateId String
  receiptHash String
  createdAt   DateTime @default(now())

  event       Event         @relation(fields: [eventId], references: [id], onDelete: Cascade)
  office      EventPosition @relation(fields: [officeId], references: [id], onDelete: Cascade)
  candidate   Contestant    @relation(fields: [candidateId], references: [id], onDelete: Cascade)

  @@index([eventId])
  @@index([officeId])
  @@index([candidateId])
  @@index([receiptHash])
  @@index([eventId, officeId])
}
```

### Updates to `Event`
Add relations to `Event`:
```prisma
model Event {
  // ... existing fields ...
  voterParticipations VoterParticipation[]
  ballotSelections    BallotSelection[]
}
```

### Updates to `EventPosition` & `Contestant`
Add inverse relations:
- `EventPosition.ballotSelections: BallotSelection[]`
- `Contestant.ballotSelections: BallotSelection[]`

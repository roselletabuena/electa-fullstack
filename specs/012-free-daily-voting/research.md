# Technical Research & Architecture Decisions: Free Daily Voting Engine (VS-28)

## 1. Rolling 24-Hour Cooldown Window Calculation

- **Decision**: Compute quota consumption based on a rolling 24-hour window from the database (`Vote` records where `voterId = $voterId AND eventId = $eventId AND voteType = FREE AND createdAt >= NOW() - INTERVAL '24 HOURS'`).
- **Rationale**:
  - Eliminates timezone and arbitrary midnight reset manipulation or exploitation.
  - Aligns with standard mobile gaming and contest engagement mechanics.
  - When $N > 1$, each individual vote record has its own timestamp. When all $N$ votes are exhausted, the next available vote resets at `oldestVoteInWindow.createdAt + 24 hours`.
- **Alternatives Considered**:
  - _Fixed Calendar Day (Midnight UTC/PHT)_: Vulnerable to timezone spoofing and double-dipping around midnight boundaries.
  - _Redis In-Memory Key with TTL_: Introduces cache synchronization latency and risks data loss; PostgreSQL transactional queries against indexed `(eventId, voterId, createdAt)` are sub-5ms with connection pooling.

---

## 2. Concurrency & Over-Voting Protection

- **Decision**: Execute vote validation and insertion inside a Prisma interactive transaction (`prisma.$transaction`) with strict condition checks and row-level locking or atomic constraint validation.
- **Rationale**:
  - Guarantees strict isolation even if a user sends rapid concurrent HTTP requests across multiple tabs or automated scripts.
  - Atomically records the `Vote` ledger entry and increments `Contestant.voteCount` within the same transaction.
- **Alternatives Considered**:
  - _Optimistic Locking with retry loop_: Higher complexity with potential contention spikes during high-traffic voting peaks.

---

## 3. Server State Synchronization & TanStack Query Integration

- **Decision**: Utilize TanStack Query with key `['voting-quota', eventId, voterId]` to cache the voter's quota status, invalidating queries upon mutation.
- **Rationale**:
  - Enforces VoteSphere Constitution §III (Server state strictly managed by TanStack Query).
  - Enables optimistic UI decrement of remaining vote allowance on the client.
- **Alternatives Considered**:
  - _Zustand Global Store_: Violates Constitution §III by mirroring server state into client global stores.

---

## 4. Real-time Countdown Timer Architecture

- **Decision**: Return ISO timestamp `nextResetTime` from the server API when quota is exhausted ($0$ remaining); the client hook `useFreeVoteQuota` computes the interval difference with a 1-second `setInterval` ticker.
- **Rationale**:
  - Eliminates client clock drift and local device timezone offset errors.
  - Automatically transitions the UI state from cooldown to active once `Date.now() >= nextResetTime`.

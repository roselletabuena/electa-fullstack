# Quickstart: Real-Time Live Leaderboard & Stealth Mystery Freeze

**Feature**: `019-realtime-leaderboard-mystery-freeze`  
**Jira Key**: `VS-22`

---

## 1. Local Verification Workflow

### Scenario 1: Fetch Public Live Leaderboard

1. Run local dev server (`npm run dev`).
2. Make a GET request to `/api/events/binibining-pilipinas-2026/leaderboard`.
3. Verify response status `200 OK` with JSON envelope `{ success: true, data: { entries: [...], isFrozen: false } }`.
4. Check that Top 3 entries contain `rank: 1, 2, 3`, `isPodium: true`, and correct `gapToLeader` metrics.

### Scenario 2: Verify Mystery Freeze Redaction

1. Trigger freeze status for an event (e.g. `isLeaderboardFrozen = true`).
2. Request `/api/events/binibining-pilipinas-2026/leaderboard` as an unauthenticated client.
3. Verify response status `200 OK`, `data.isFrozen === true`, `data.entries[*].voteCount === null`, and `data.entries[*].rank === null`.
4. Verify no vote counts or rank numbers leak in the response JSON.

### Scenario 3: Verify Organizer Live Bypass

1. Request `/api/events/binibining-pilipinas-2026/leaderboard` with organizer session cookie / header.
2. Verify response includes exact unredacted vote counts and rank positions despite active mystery freeze.

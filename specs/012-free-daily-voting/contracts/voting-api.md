# API & Server Action Contracts: Free Daily Voting Engine (VS-28)

## 1. Server Action / API Route Contracts

### `POST /api/events/[slug]/vote/free` or `castFreeVoteAction`

**Request Payload:**

```json
{
  "eventId": "uuid-string",
  "contestantId": "uuid-string",
  "awardCategoryId": "uuid-string (optional)"
}
```

**Success Response (HTTP 200 / Server Action Success):**

```json
{
  "data": {
    "success": true,
    "voteId": "vote-uuid",
    "contestantId": "contestant-uuid",
    "newContestantVoteCount": 42,
    "quotaState": {
      "dailyLimit": 3,
      "votesUsedIn24h": 2,
      "remainingVotes": 1,
      "isFreeVotingEnabled": true,
      "isEventActive": true,
      "isInCooldown": false,
      "nextResetTime": null
    }
  },
  "error": null
}
```

**Cooldown / Quota Exceeded Error Response (HTTP 429 / Handled Error):**

```json
{
  "data": null,
  "error": {
    "code": "DAILY_QUOTA_EXHAUSTED",
    "message": "Daily free voting quota exhausted. Next free vote resets at 2026-09-29T14:30:00.000Z",
    "details": {
      "nextResetTime": "2026-09-29T14:30:00.000Z",
      "dailyLimit": 3,
      "votesUsedIn24h": 3
    }
  }
}
```

---

### `GET /api/events/[slug]/vote/quota` or `getVoterQuotaAction`

**Query Parameters:**

- `eventId`: UUID of the event

**Response:**

```json
{
  "data": {
    "dailyLimit": 3,
    "votesUsedIn24h": 3,
    "remainingVotes": 0,
    "isFreeVotingEnabled": true,
    "isEventActive": true,
    "isInCooldown": true,
    "nextResetTime": "2026-09-29T14:30:00.000Z"
  },
  "error": null
}
```

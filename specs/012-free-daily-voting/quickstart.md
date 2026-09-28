# Quickstart & Verification Guide: Free Daily Voting Engine (VS-28)

## 1. Prerequisites

- Node.js 20+
- Active PostgreSQL database with Supabase connection pooler configured in `.env.local`
- Authenticated user session or mocked Cognito session

## 2. Setup & Migration Commands

```bash
# Apply Prisma schema migration for Vote model
npx prisma migrate dev --name add_vote_ledger_model

# Generate updated Prisma client types
npx prisma generate
```

## 3. Automated Test Verification

```bash
# Run unit tests for voting quota calculation & atomic vote ledger
npm run test tests/unit/voting/
```

## 4. End-to-End Verification Scenarios

### Scenario A: Cast Free Vote within Quota

1. Open an active event page (`http://localhost:3000/events/<slug>`) as an authenticated user.
2. Observe the contestant card displaying `"Cast Free Vote (3/3 left)"`.
3. Click `"Cast Free Vote"`.
4. Verify vote count increments by 1 and badge updates to `"Cast Free Vote (2/3 left)"`.

### Scenario B: Exhaust Quota & Verify Cooldown Countdown

1. Cast remaining 2 free votes on contestants in the event.
2. Verify all contestant cards disable the free vote button and display `"Daily free votes used — Next vote in [HH:MM:SS]"`.
3. Verify the timer counts down every second.
4. Verify clicking `"Boost Candidate"` displays paid boost tiers without hindrance.

# Quickstart: Frictionless Voter Authentication Modal (VS-27)

This walkthrough guides you through testing and verifying the frictionless voter authentication modal and stored vote intent resumption.

---

## Prerequisites

1. Ensure the development server is running:
   ```bash
   npm run dev
   ```
2. Open your browser in Incognito mode (to test as an unauthenticated visitor) at `http://localhost:3000/events/miss-universe-philippines-2026`.

---

## Walkthrough Scenarios

### Scenario: Unauthenticated Voter Casts Free Vote via Google Login

1. Navigate to `/events/miss-universe-philippines-2026`.
2. Locate a candidate card (e.g., "Roselle Tabuena") and click the **"Vote"** button.
3. Observe that the **"Sign In to Cast Your Vote"** modal opens instantly over the page with:
   - Zero-radius brutalist Electa borders (`rounded-none`).
   - Candidate context preserved in the modal subtitle.
   - Clean **"Continue with Google"** action button.
4. Click **"Continue with Google"**.
5. The application saves `{ eventId, contestantId, contestantName, voteType: "FREE" }` to `sessionStorage` and initiates the Google authentication flow.
6. Upon completing authentication, you are redirected back to the event page `/events/miss-universe-philippines-2026`.
7. The `usePendingVoteIntent` hook automatically detects the active session, fulfills the queued vote mutation, updates the candidate's live vote tally, and decrements the daily quota banner.

---

## Automated Verification

Run the test suite to verify voter modal and intent resumption:

```bash
npx vitest run tests/unit/voting/vote-intent.test.ts tests/unit/auth/omnichannel-auth-modal.test.tsx tests/unit/features/auth/oauth-initiate.test.ts
```

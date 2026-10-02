# Quickstart & Verification Guide: Frictionless Voter Authentication Modal (VS-27)

## 1. Overview & Objectives

The Frictionless Voter Authentication Modal eliminates drop-off during the voting process by:

- Preserving the voter's intent (`eventId`, `contestantId`, `contestantName`, `awardCategoryId`, `voteType`) during inline authentication or social login redirects.
- Applying Electa's zero-radius brutalist design tokens (`rounded-none`, Opal palette, Outfit/Sora typography).
- Automatically executing the pending vote upon successful authentication without requiring re-selection.

---

## 2. Interactive Verification Scenarios

### Scenario A: Inline Passwordless OTP Verification with Auto-Vote

1. Open your browser and navigate to a public event (e.g., `http://localhost:3000/events/sample-event`).
2. Ensure you are signed out.
3. Click the **"Vote"** button on any contestant card (e.g. "Maria Santos").
4. Observe the `AuthPromptModal` popup with title _"Sign In to Cast Your Vote"_ and subtitle _"Support Maria Santos with your daily free votes..."_.
5. Select **"Email Magic Link / Code"** or **"Phone OTP"**.
6. Submit your email/phone and enter the 6-digit verification code.
7. **Verification Check**:
   - The modal displays green success feedback _"Authenticated successfully!"_.
   - The modal closes automatically.
   - The vote for "Maria Santos" is executed immediately without another click.
   - The contestant vote counter increments and the quota badge updates.

---

### Scenario B: Social OAuth Redirect Intent Resumption

1. From the public event page while signed out, click **"Vote"** on a contestant.
2. Click **"Continue with Google"** (or Apple / Facebook).
3. Inspect `sessionStorage` in DevTools:
   - Key: `votesphere_pending_vote_intent`
   - Content: JSON containing `{ eventId, contestantId, contestantName, voteType: "FREE" }`.
4. Upon returning from the OAuth flow, the `usePendingVoteIntent` hook consumes the intent, casts the vote, and removes the item from `sessionStorage`.

---

### Scenario C: Design System & Contrast Parity Audit

1. **Geometry**: Confirm all modal cards, buttons, tabs, and input fields have strict `rounded-none` (0px sharp corners).
2. **Light Mode Default**:
   - Modal background: Crisp pure white `#FFFFFF` with hairline border `#CBD5E1` (`border-slate-300`).
   - Primary action button: Sky Blue `#0284C7` / Slate-900 `#0F172A`.
3. **Dark Mode**:
   - Modal background: Slate `#0d1424` with `border-slate-800`.
   - Text contrast passes WCAG 2.1 AA (min 4.5:1).

---

## 3. Automated Test Suite Execution

Run the targeted test suites:

```bash
# 1. Typecheck
npm run typecheck

# 2. Lint
npm run lint

# 3. Unit Tests
npm run test:unit tests/unit/voting/ tests/unit/auth/
```

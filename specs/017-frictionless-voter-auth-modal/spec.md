# Feature Specification: Frictionless Voter Authentication Modal

**Feature ID**: `017-frictionless-voter-auth-modal`  
**Jira Issue**: [VS-27](https://the-three-devsketeers.atlassian.net/browse/VS-27)  
**Status**: Ready for Planning  
**Created**: 2026-10-02

---

## Overview

When an unauthenticated voter attempts to cast a vote (free daily vote or paid boost) on a candidate at `/events/[slug]`, redirecting them away destroys conversion rates and loses their contestant selection context.

The **Frictionless Voter Authentication Modal** provides a fast, zero-friction inline login experience via Google OAuth / AWS Cognito that:

1. Retains the voter's active voting intent (contestant ID, event ID, award category ID, and vote quantity/type).
2. Adheres strictly to the Electa / VoteSphere brutalist-refined zero-radius design system (`rounded-none`, Light Mode Opal palette default, dark mode scoped, Outfit/Sora typography).
3. Automatically executes the pending vote action immediately upon returning from Google authentication without forcing the user to re-find their contestant or re-trigger the action.

---

## Actors

- **Unauthenticated Voter**: Public attendee or fan voting for their favorite pageant candidate.
- **Authenticated Voter**: Logged-in user who can seamlessly cast their quota votes.
- **Organizer**: Platform event host benefiting from maximum voter turnout and reduced abandonment.

---

## Functional Requirements

1. **Inline Context Preservation**:
   - The voting trigger captures and persists `{ eventId, contestantId, contestantName, awardCategoryId, voteType: "FREE" | "PAID" }` in client memory (`sessionStorage` / vote intent buffer) before initiating Google OAuth.
2. **Google Identity Authentication**:
   - Google Sign-In via AWS Cognito Hosted UI integration (`/api/auth/cognito/initiate?provider=Google`).
3. **Seamless Post-Auth Resumption**:
   - **Redirect-Based OAuth**: Retains intent in `sessionStorage` and attaches a return query param. Upon return, the event page detects the pending intent, verifies the authenticated session via `usePendingVoteIntent`, executes the vote, and clears the intent buffer.
4. **Brutalist-Refined Electa Design Tokens**:
   - Strict `rounded-none` geometry across modal container, inputs, buttons, and alert banners.
   - Opal Slate-50 / pure white card surfaces with crisp Slate-300 borders in Light Mode.
   - High-contrast text meeting WCAG 2.1 AA (4.5:1 min) in both Light and Dark modes.
   - Brand typography: `font-heading` (Outfit) for modal titles, `font-sans` (Sora) for body copy.

---

## User Scenarios & Acceptance Criteria

### Scenario 1: Google OAuth with Stored Vote Intent Resumption

**Given** an unauthenticated voter clicks "Vote" for candidate "Roselle Tabuena" on `/events/[slug]`  
**When** the frictionless `AuthPromptModal` appears  
**And When** they click "Continue with Google"  
**Then** the vote intent `{ eventId, contestantId, contestantName }` is saved to `sessionStorage`  
**And When** Google OAuth redirects back to the event page with an active session  
**Then** the event page restores the pending intent, automatically casts the vote, updates the vote count and quota banner, and clears the intent from storage.

---

## Edge Cases & Constraints

- **Quota Already Exhausted**: If the voter authenticates and their daily quota is already used for this event, the system displays the quota cooldown notice and prompts for a boost.
- **Cancelled Authentication**: If the user closes the modal without authenticating, the pending intent is cleared with no adverse side effects.
- **Stale Intent**: Pending vote intents older than 15 minutes are discarded to prevent unexpected duplicate votes.

---

## Out of Scope

- Apple Sign-In
- Facebook OAuth
- Passwordless Email Magic Link / 6-digit Code
- Phone OTP via SMS & WhatsApp
- Stripe / QR Ph payment gateway implementation (handled in VS-21)
- Admin / organizer login flow modifications

---

## Dependencies & Assumptions

- Relies on: `useCastFreeVote` & `useFreeVoteQuota` in `src/features/voting/hooks/`
- Relies on: `usePendingVoteIntent` in `src/features/voting/hooks/`
- Relies on: `/api/auth/cognito/initiate` & `/api/auth/callback/cognito`
- Relies on: Zustand `useAuthStore` & `getSession()`

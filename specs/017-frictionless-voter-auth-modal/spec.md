# Feature Specification: Frictionless Voter Authentication Modal

**Feature ID**: `017-frictionless-voter-auth-modal`  
**Jira Issue**: [VS-27](https://the-three-devsketeers.atlassian.net/browse/VS-27)  
**Status**: Draft  
**Created**: 2026-10-02

---

## Overview

When an unauthenticated voter attempts to cast a vote (free daily vote or paid boost) on a candidate at `/events/[slug]`, redirecting them away destroys conversion rates and loses their contestant selection context.

The **Frictionless Voter Authentication Modal** provides a fast, zero-friction inline login experience (OAuth via Google/Apple/Facebook, and Passwordless via Email Magic Link & SMS/WhatsApp OTP) that:

1. Retains the voter's active voting intent (contestant ID, event ID, award category ID, and vote quantity/type).
2. Adheres strictly to the Electa / VoteSphere brutalist-refined zero-radius design system (`rounded-none`, Light Mode Opal palette default, dark mode scoped, Outfit/Sora typography).
3. Automatically executes or confirms the pending vote action immediately upon successful authentication without forcing the user to re-find their contestant or re-trigger the action.

---

## Actors

- **Unauthenticated Voter**: Public attendee or fan voting for their favorite pageant candidate.
- **Authenticated Voter**: Logged-in user who can seamlessly cast their quota votes.
- **Organizer**: Platform event host benefiting from maximum voter turnout and reduced abandonment.

---

## Functional Requirements

1. **Inline Context Preservation**:
   - The voting trigger captures and persists `{ eventId, contestantId, contestantName, awardCategoryId, voteType: "FREE" | "PAID" }` in client memory (`sessionStorage` / Zustand intent store) before opening the authentication modal.
2. **Omnichannel Identity Options**:
   - Google 1-Tap / OAuth
   - Apple Sign-In
   - Facebook OAuth
   - Passwordless Email Magic Link / 6-digit Code
   - Phone OTP via SMS & WhatsApp
3. **Seamless Post-Auth Resumption**:
   - **In-Place (OTP verification)**: On successful verification, the modal closes and automatically triggers the queued vote mutation (`useCastFreeVote`).
   - **Redirect-Based (OAuth)**: Retains intent in `sessionStorage` and attaches a return query param. Upon return, the page detects the pending intent, verifies the authenticated session, executes the vote, and clears the intent.
4. **Brutalist-Refined Electa Design Tokens**:
   - Strict `rounded-none` geometry across modal container, inputs, buttons, and alert banners.
   - Opal Slate-50 / pure white card surfaces with crisp Slate-300 borders in Light Mode.
   - High-contrast text meeting WCAG 2.1 AA (4.5:1 min) in both Light and Dark modes.
   - Brand typography: `font-heading` (Outfit) for modal titles, `font-sans` (Sora) for body copy, `font-mono` (JetBrains Mono) for OTP inputs.

---

## User Scenarios & Acceptance Criteria

### Scenario 1: Inline OTP Authentication & Automatic Vote Execution

**Given** an unauthenticated voter is viewing `/events/miss-universe-ph`  
**And Given** they click the "Vote" button on candidate "Maria Santos"  
**When** the frictionless `AuthPromptModal` appears and the user verifies a 6-digit OTP code  
**Then** the modal announces authentication success, automatically triggers the free vote mutation for "Maria Santos", and updates the quota banner and vote count.

### Scenario 2: Social OAuth Redirect with Stored Vote Intent

**Given** an unauthenticated voter clicks "Vote" for candidate "Ana Reyes"  
**When** they choose "Continue with Google"  
**Then** the vote intent `{ eventId, contestantId, contestantName }` is saved to `sessionStorage`  
**And When** Google OAuth redirects back to the event page with an active session  
**Then** the event page restores the pending intent, displays a confirmation toast/dialog, casts the vote, and clears the storage.

---

## Edge Cases & Constraints

- **Quota Already Exhausted**: If the voter authenticates and their daily quota is already used for this event, the modal gracefully informs them and prompts for a paid boost rather than failing silently.
- **Cancelled Authentication**: If the user closes the modal without authenticating, the pending intent is cleared with no adverse side effects.
- **Expired Turnstile / Stale Session**: Handles token refresh and network timeouts gracefully with user-friendly error banners.

---

## Out of Scope

- Stripe / QR Ph payment gateway implementation (handled in VS-21).
- Admin / organizer login flow modifications.

---

## Dependencies & Assumptions

- Relies on: `useCastFreeVote` & `useFreeVoteQuota` in `src/features/voting/hooks/`
- Relies on: `requestPasswordlessOtpAction` & `verifyPasswordlessOtpAction` in `src/features/auth/actions/`
- Relies on: Zustand `useAuthStore` & `getSession()`

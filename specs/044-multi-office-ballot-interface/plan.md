# Technical Implementation Plan: Multi-Office Ballot Interface

**Feature ID**: `044-multi-office-ballot-interface`  
**Ticket**: [VS-109](https://the-three-devsketeers.atlassian.net/browse/VS-109)  

---

## 1. Architectural Strategy

We will build the multi-office ballot interface as a cohesive vertical slice under `src/features/voting`:

1. **Type & Contract Definitions**:
   - `src/features/voting/types/ballot.ts`: Add `BallotPositionDto`, `BallotCandidateDto`, `PublicBallotEventDto`, `BallotSubmissionReceiptDto`.
2. **Components**:
   - `src/features/voting/components/multi-office-ballot.tsx`: Core form component tracking candidate selections across offices, validating seat caps, and triggering review modal.
   - `src/features/voting/components/ballot-review-modal.tsx`: Dialog showing all selected candidates grouped by office, with "Edit Selections" and "Confirm & Cast Ballot" actions.
   - `src/features/voting/components/ballot-receipt-card.tsx`: Brutalist confirmation receipt with timestamp, receipt token, copy button, and return home link.
   - `src/features/voting/components/voter-auth-guard.tsx`: Displays an institutional login prompt or ineligibility explanation when unauthenticated or ineligible.
3. **Route Page**:
   - `src/app/(public)/events/[slug]/ballot/page.tsx`: RSC fetching event details, positions, contestants, checking user session, verifying voter eligibility via `roster-service.ts`, and checking if ballot is already submitted via `hasVoterSubmittedBallot`.
4. **Unit Tests**:
   - `tests/unit/voting/multi-office-ballot.test.tsx`: Comprehensive Vitest tests verifying seat selection limits, review modal interaction, receipt display, and keyboard navigation.

---

## 2. Test Plan & Gates

- **Unit Tests**:
  - Test initial rendering of positions and candidates.
  - Test single-seat toggle vs multi-seat selection.
  - Test blocking selections when `maxSelectionsPerVoter` is reached and showing warning message.
  - Test opening and closing `BallotReviewModal` via "Review Ballot" and "Edit Selections".
  - Test calling `castBallotAction` on confirm and handling successful submission.
  - Test `BallotReceiptCard` copy button and display format.
- **Verification Commands**:
  - `npm run test:unit tests/unit/voting/multi-office-ballot.test.tsx`
  - `npm run typecheck`
  - `npm run lint`

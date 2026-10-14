# Technical Research & Architecture Decisions: Multi-Office Ballot Interface

**Feature ID**: `044-multi-office-ballot-interface`  
**Ticket**: [VS-109](https://the-three-devsketeers.atlassian.net/browse/VS-109)  

---

## 1. Context & Architectural Requirements

Electa was originally architected for single-contestant pageants. Student council elections require multi-seat, multi-office elections where:
1. An event has multiple `EventPosition` records (e.g. President: 1 seat; Vice President: 1 seat; Senator: 5 seats).
2. Each contestant belongs to a specific position (`positionId`).
3. A ballot contains selections across multiple positions, and is submitted in a single atomic transaction.
4. The voter authentication must verify eligibility against institutional criteria (domain whitelist or student roster CSV).

## 2. Component Design & State Management

### 2.1 State Flow
- **Ballot State**: Managed locally in `MultiOfficeBallot` using a clean Map/Record structure: `Record<string, string[]>` mapping `positionId` to selected `contestantId[]`.
- **Seat Limit Rules**:
  - Selecting an already selected contestant removes them.
  - Selecting an unselected contestant checks if `currentSelections.length < maxSelectionsPerVoter`.
  - If limit is reached, toggle is blocked and a visually distinctive, screen-reader-accessible alert badge is shown.
  - Single-seat offices (`maxSelectionsPerVoter === 1`): If a user clicks another contestant, radio behavior can automatically swap the choice or require deselect. Providing auto-swap for single-seat offices while capping multi-seat offices provides the smoothest UX.
- **Review Modal State**: An overlay modal (`BallotReviewModal`) rendering all chosen candidates organized by position, displaying avatar, contestant number, name, and position name.
- **Submission Action**: Triggers `castBallotAction` server action. Displays loading spinner on the submit button.
- **Receipt State**: Upon successful response, switches view to `BallotReceiptCard` containing the generated `ballotId`, `submittedAt`, and receipt copy button.

## 3. Styling & Accessibility Standards

- **Brutalist-Refined Zero-Radius**:
  - Every button, input, card, modal, and badge uses `rounded-none`.
  - Borders: `border border-slate-300 dark:border-slate-800`.
  - Colors: Light mode primary `#F8FAFC`, dark mode `#0d1424`.
- **WCAG 2.1 AA Compliance**:
  - Focus indicators with `focus-visible:ring-2 focus-visible:ring-sky-500`.
  - Accessible ARIA attributes (`aria-expanded`, `aria-controls`, `aria-describedby`, `role="dialog"`).
  - High contrast badges and indicators.

## 4. Server Action & Service Integration

- `castBallotAction` is already implemented in `src/features/voting/actions/cast-ballot.ts`.
- Server-side validation parses payload via `castBallotSchema`.
- `roster-service.ts` provides `checkVoterEligibility({ eventId, email })` to check whether an authenticated user is on the roster or permitted domain.
- `hasVoterSubmittedBallot(eventId, voterId)` determines if the voter has already voted in this event.

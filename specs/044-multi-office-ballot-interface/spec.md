# Feature Specification: Student Council Voter Authentication & Multi-Office Ballot Interface

**Feature ID**: `044-multi-office-ballot-interface`  
**Ticket**: [VS-109](https://the-three-devsketeers.atlassian.net/browse/VS-109)  
**Parent Epic**: [VS-82](https://the-three-devsketeers.atlassian.net/browse/VS-82) (`Multi-Archetype Election Engine: School Elections, Hackathons & Beyond`)  
**Status**: Specified  
**Created**: 2026-10-14  

---

## 1. Overview & Business Value

School council elections (`STUDENT_COUNCIL`) require students to vote for candidates across multiple distinct offices (e.g., 1 President, 1 Vice President, 1 Secretary, and up to 5 Senators) in a single unified ballot session.

Currently, Electa provides single-contestant fan voting. This feature delivers the **Multi-Office Ballot Interface & Voter Authentication Flow**:
1. Dedicated ballot route `src/app/(public)/events/[slug]/ballot/page.tsx` rendering multi-office elections with server-side roster verification and duplicate submission guards.
2. Institutional voter authentication & eligibility check integrating with `StudentRosterEntry` and `allowedEmailDomains`.
3. Interactive multi-office ballot interface (`MultiOfficeBallot`) with seat quotas, progressive counter badges, disabled selection caps, and accessible keyboard navigation.
4. Pre-submission ballot review modal (`BallotReviewModal`) showing selected candidates grouped by office with "Edit Selections" and "Confirm & Cast Ballot" actions.
5. Post-submission anonymous confirmation receipt card (`BallotReceiptCard`) displaying receipt tokens, vote summary, clipboard copy utility, and return navigation.
6. Strict adherence to Electa brutalist-refined zero-radius branding (`rounded-none`, `#F8FAFC` light background, WCAG 2.1 AA dual-theme contrast).

---

## 2. Clarifications & Invariants

### Invariants
1. **Zero-Radius Geometry**: All buttons, cards, checkboxes, badges, and modals MUST use `rounded-none` and sharp geometry.
2. **Seat Limit Enforcement**: For an office with `maxSelectionsPerVoter: N`, once `N` candidates are checked, unselected candidates in that office cannot be toggled on without unchecking an existing selection. An accessible alert/badge announces the limit.
3. **Review Gate**: Voters cannot cast their final ballot without viewing the confirmation review modal summarizing their selections across all offices.
4. **Duplicate Submission Protection**: Once a ballot is cast for `(eventId, voterId)`, navigating to the ballot page displays the existing ballot receipt or an already-voted notice rather than an empty ballot.
5. **Dual-Theme WCAG 2.1 AA Compliance**: All text and interactive controls maintain minimum 4.5:1 contrast in both light mode and dark mode.

---

## 3. Actors & User Stories

### User Story 1 (Priority: P1 - Multi-Office Ballot Selection & Validation)
> **As an** eligible student voter,  
> **I want to** browse candidates grouped by office and select my preferred candidates up to each office's seat limit,  
> **so that** I can complete my ballot accurately without exceeding candidate limits.

**Acceptance Criteria (Gherkin)**:
```gherkin
Scenario: Enforcing seat selection limits per office
  Given an office "Senator" with maxSelections: 5 and minSelections: 1
  When the voter selects 5 candidates
  Then all other candidate checkboxes for "Senator" are disabled or blocked from selection
  And an accessible badge states "Maximum 5 candidates reached for this office"
```

### User Story 2 (Priority: P1 - Ballot Review & Submission Confirmation)
> **As an** eligible student voter,  
> **I want to** review a summary of my chosen candidates before final submission,  
> **so that** I can verify my selections or edit them before casting my official vote.

**Acceptance Criteria (Gherkin)**:
```gherkin
Scenario: Reviewing ballot selections in modal
  Given a voter with valid candidate selections across multiple offices
  When they click "Review Ballot"
  Then the BallotReviewModal opens displaying selected candidates grouped by office
  And clicking "Edit Selections" closes the modal and preserves user selections
  And clicking "Confirm & Cast Ballot" executes the ballot submission action
```

### User Story 3 (Priority: P1 - Anonymous Confirmation Receipt Display)
> **As a** student voter who has cast their ballot,  
> **I want to** receive an anonymous ballot confirmation receipt token,  
> **so that** I have proof that my vote was officially recorded.

**Acceptance Criteria (Gherkin)**:
```gherkin
Scenario: Confirmation receipt after successful ballot submission
  Given a successfully cast ballot
  When the submission completes
  Then the BallotReceiptCard renders the submission timestamp, ballot receipt ID, and votes count
  And clicking "Copy Receipt ID" copies the token to the clipboard with visual confirmation
```

### User Story 4 (Priority: P2 - Institutional Authentication & Eligibility Guard)
> **As a** student visiting the ballot page,  
> **I want to** be prompted to sign in with my institutional email if unauthenticated or ineligible,  
> **so that** only authorized students from the institution can cast an official ballot.

---

## 4. Technical Scope & Target Files

- `src/features/voting/components/multi-office-ballot.tsx` (Client component managing state, selection limits, and review modal)
- `src/features/voting/components/ballot-review-modal.tsx` (Accessible dialog reviewing grouped selections)
- `src/features/voting/components/ballot-receipt-card.tsx` (Brutalist receipt card with token, timestamps, and copy utility)
- `src/features/voting/components/voter-auth-guard.tsx` (Card prompting sign-in or showing ineligibility reasons)
- `src/app/(public)/events/[slug]/ballot/page.tsx` (RSC ballot page with server-side event, positions, and voter eligibility resolution)
- `src/features/voting/types/ballot.ts` (DTO interfaces and props contracts)
- `tests/unit/voting/multi-office-ballot.test.tsx` (Vitest component tests covering selection limits, review modal, and receipt)

# Quickstart & Verification Guide: Dedicated Judge Portal & Weighted Rubric Scorecard UI

**Feature ID**: `045-judge-portal-rubric-scorecard`  
**Ticket**: [VS-115](https://the-three-devsketeers.atlassian.net/browse/VS-115)  

---

## 1. Automated Verification Commands

Run the test suite, linter, and typechecker:

```bash
# 1. Run all unit tests for the judging portal & rubric scorecard
npx vitest run tests/unit/hackathons/judging-*.test.tsx tests/unit/hackathons/rubric-scorecard-modal.test.tsx

# 2. Run TypeScript strict typecheck
npm run typecheck

# 3. Run ESLint verification
npm run lint

# 4. Run entire unit test suite
npm run test:unit
```

---

## 2. Manual Verification Scenarios

### Scenario A: Judging Progress & Filter Navigation
1. Navigate to `/events/hack-city-2026/judging` as an authorized judge.
2. Verify that the judging progress bar displays `"X/Y Evaluated (Z%)"`.
3. Click `"Pending Review"` filter pill -> verify only unfinalized project cards are shown.
4. Click `"Completed"` filter pill -> verify only finalized project cards are shown.

### Scenario B: Scorecard Evaluation with Live Weighted Recalculation
1. Click `"Evaluate"` on any pending project card.
2. Verify the Rubric Scorecard Modal opens with zero-radius styling.
3. Select score `8` for Criterion 1, `9` for Criterion 2, `7` for Criterion 3, `10` for Criterion 4.
4. Verify the footer composite score dynamically updates to `8.50` with exact weight contribution breakdowns.
5. Focus a criterion rating chip and press `5` -> verify score updates to `5`.
6. Press `0` -> verify score updates to `10`.

### Scenario C: Missing Criterion Validation
1. Clear or leave one criterion unselected.
2. Click `"Submit Final Evaluation"`.
3. Verify the form prevents submission, highlights the missing criterion in red/amber error style, and displays: `"Please assign a score between 1 and 10."`.

### Scenario D: Draft Persistence & Final Submission
1. Enter scores and type a private feedback note in the textarea.
2. Click `"Save Draft"`.
3. Refresh the page or close and re-open the modal -> verify scores and notes are preserved.
4. Click `"Submit Final Evaluation"` -> verify success toast, modal closes, and the project card updates to `"Completed"` status.

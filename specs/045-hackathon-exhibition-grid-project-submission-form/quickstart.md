# Quickstart & Verification Guide: Hackathon Exhibition Grid & Project Submission Form

**Feature ID**: `045-hackathon-exhibition-grid-project-submission-form`  
**Ticket**: [VS-113](https://the-three-devsketeers.atlassian.net/browse/VS-113)  

---

## 1. Quick Verification via Automated Tests

Execute the unit test suite covering components, server actions, and URL filtering:

```bash
npm run test:unit -- tests/unit/hackathons/exhibition-grid.test.tsx
npm run test:unit -- tests/unit/hackathons/submit-project-action.test.ts
```

Run global typecheck and linter:

```bash
npm run typecheck
npm run lint
```

---

## 2. Interactive Walkthrough Scenarios

### Scenario 1: Track Filter Deep Linking
1. Navigate to `http://localhost:3000/events/eth-global-manila-2026/projects`.
2. Notice the "All Tracks" pill is selected by default.
3. Click the `"AI & Agents"` track pill.
4. Confirm URL updates to `?track=AI+%26+Agents` without full page refresh.
5. Only projects tagged with `"AI & Agents"` appear in the exhibition grid.

### Scenario 2: Project Submission
1. Click the "Submit Project" button at top right of the grid.
2. The zero-radius submission dialog opens.
3. Try clicking "Submit" with empty fields. Confirm inline validation errors appear on Title, Description, and Repository URL.
4. Enter valid project info with a GitHub URL (`https://github.com/my-org/my-project`) and track tag.
5. Submit and verify success confirmation and newly rendered project card in the grid.

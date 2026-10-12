# Quickstart & Verification Guide: Accessible Site Footer

**Feature ID**: `031-accessible-site-footer`  
**Jira Key**: [VS-89](https://the-three-devsketeers.atlassian.net/browse/VS-89)

---

## 1. Overview & Setup

This guide provides test and inspection procedures to verify the accessible site footer in both desktop and mobile viewports.

---

## 2. Manual Verification Scenarios

### Scenario A: Desktop Footer Inspection

1. Run local development server: `npm run dev`
2. Open `http://localhost:3000` in Google Chrome or Microsoft Edge.
3. Scroll to the bottom of the page:
   - Confirm official Electa logo symbol (`/electa-logo-dark.svg`) renders crisply on `#0F172A` background.
   - Confirm brand tagline _"Vote. Engage. Celebrate."_ is displayed in bold uppercase sky blue (`#38BDF8`).
   - Confirm 4 multi-column directory sections are displayed side-by-side:
     - **Explore**: Trending Events, Live Voting, Concluded Events, Search
     - **Organizers**: Create Event, Organizer Portal, Pricing, Guidelines
     - **Platform**: About Electa, Security, System Status, API Docs
     - **Legal**: Terms of Service, Privacy Policy, Audit Integrity
   - Hover over each directory link to verify high-contrast transition (`hover:text-white hover:underline`).
   - Confirm copyright text displays `"© 2026 Electa Platform. All Rights Reserved."` in monospace font (`font-mono`).

### Scenario B: Mobile Viewport & Touch Target Inspection

1. Open Chrome DevTools (`F12`) and toggle device toolbar (`Ctrl+Shift+M`).
2. Select **iPhone 14 / SE (375px width)**:
   - Verify multi-column directory gracefully stacks in single column.
   - Verify link elements provide comfortable touch targets (minimum 44px vertical target area).
   - Ensure zero horizontal scrolling or layout shift.

---

## 3. Automated Test Suite Execution

Run the dedicated unit test suite:

```bash
npm run test:unit tests/unit/navigation/site-footer.test.tsx
```

Run full project checks:

```bash
npm run typecheck
npm run lint
npm run test:unit
```

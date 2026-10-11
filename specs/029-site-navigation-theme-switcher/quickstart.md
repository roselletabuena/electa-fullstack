# Quickstart & Verification Guide: Responsive Site Navigation Bar & Theme Switcher

**Feature ID**: `029-site-navigation-theme-switcher`  
**Jira Key**: [VS-87](https://the-three-devsketeers.atlassian.net/browse/VS-87)  

---

## 1. Overview & Setup

This guide provides test and inspection procedures to verify the navigation header and theme switcher in both desktop and mobile viewports.

---

## 2. Manual Verification Scenarios

### Scenario A: Desktop Navigation & Theme Switcher Walkthrough
1. Run local development server: `npm run dev`
2. Open `http://localhost:3000` in Google Chrome or Microsoft Edge.
3. Observe the sticky navigation header at the top of the viewport:
   - Confirm Electa logo mark (`ElectaSymbol`) renders with dark container rects and sky-blue checkmark.
   - Confirm title text `ELECTA` in bold Outfit font and tagline `VOTE · ENGAGE · CELEBRATE`.
   - Confirm `+ CREATE EVENT` button links to `/events/new`.
   - Confirm `SIGN IN` button links to `/login`.
4. Click the Theme Toggle button:
   - The document background should smoothly transition to Obsidian Dark Mode (`#090D16`).
   - The logo container rects should switch to bright slate (`dark:fill-slate-100`).
   - Confirm `localStorage.getItem("electa-theme")` returns `"dark"`.
5. Refresh the page:
   - Verify that Obsidian Dark Mode is preserved without white layout flashing.
6. Click the Theme Toggle again to return to Opal Light Mode (`#F8FAFC`).

### Scenario B: Mobile Viewport & Touch Target Inspection
1. Open Chrome DevTools (`F12`) and toggle device toolbar (`Ctrl+Shift+M`).
2. Select **iPhone 14 / SE (375px width)**:
   - Ensure the header does not trigger horizontal scrolling.
   - Verify the tagline collapses or adjusts gracefully (`hidden sm:block`).
   - Verify buttons remain tap-friendly with touch targets meeting WCAG 2.1 AA standards.

---

## 3. Automated Test Suite Execution

Run the dedicated unit test suite:

```bash
npm run test:unit tests/unit/navigation/
```

Run full typecheck and linting:

```bash
npm run typecheck
npm run lint
```

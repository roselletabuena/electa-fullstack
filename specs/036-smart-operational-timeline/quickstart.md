# Quickstart & Verification Guide: Smart Operational Timeline & Draft Recovery

**Feature ID**: `036-smart-operational-timeline`  
**Jira Key**: [VS-105](https://the-three-devsketeers.atlassian.net/browse/VS-105)  

---

## 1. Automated Verification

Run unit tests and type checks in the worktree:

```bash
npm run test:unit -- tests/unit/events/create-event-form.test.tsx tests/unit/events/timeline-presets.test.ts
npm run typecheck
npm run lint
```

---

## 2. Interactive Walkthrough Scenarios

### Scenario 1: Quick Duration Calculation
1. Open `/events/new` in the browser.
2. Note the "Voting Starts At" date.
3. Click the `+7 Days` chip.
   - Observe "Voting Ends At" immediately shifts to exactly 7 days after "Voting Starts At".
   - The `+7 Days` button has active blue highlight (`bg-sky-600 text-white font-bold`).
4. Click `+14 Days`.
   - "Voting Ends At" shifts to 14 days after "Voting Starts At".
   - `+14 Days` becomes active; `+7 Days` is unselected.

### Scenario 2: Temporal Boundary Warning
1. Set "Voting Starts At" to `2026-11-01T10:00`.
2. Set "Voting Ends At" to `2026-11-01T10:30` (30 minutes duration).
3. Observe the inline alert: `"Event end time must be at least 1 hour after the start time."`
4. Verify the "Create Event" submit button is disabled.

### Scenario 3: Accidental Refresh Recovery
1. Type a title: `Miss Aurora 2026`.
2. Type description: `Annual beauty and talent pageant in Baler, Aurora.`.
3. Refresh the browser page (`Ctrl+R` / `F5`).
4. Observe the page loads with input values recovered.
5. A banner indicates `"Draft Restored: We recovered your previous event details."`
6. Click `"Clear Draft"`.
7. Observe inputs reset to fresh initial values and the alert disappears.

# Quickstart: Archetype-Tailored Event Wizard & Taxonomy UI

**Feature**: `041-archetype-tailored-event-wizard`  
**Ticket**: [VS-84](https://the-three-devsketeers.atlassian.net/browse/VS-84)  
**Date**: 2026-10-13

---

## 1. Quick Verification Commands

Run unit tests covering the wizard components, dynamic validation, and archetype selector:

```bash
npm run test:unit tests/unit/events/
```

Run full typecheck and linting:

```bash
npm run typecheck
npm run lint
```

---

## 2. Interactive Verification Scenarios

### Scenario 1: Student Council Election Setup

1. Navigate to `/events/new`.
2. Fill in Title: `"University Student Council Election 2026"`, Slug: `"usc-2026"`.
3. Proceed to Step 2 (Event Format & Categories).
4. Select `STUDENT_COUNCIL` archetype card.
5. Notice that monetization settings disappear and the Position configuration appears.
6. Verify positions presets (President, Vice President, Senators) or add custom position with max selections = 5.
7. Submit and verify event is created with `archetype: "STUDENT_COUNCIL"` and positions created in DB.

### Scenario 2: Hackathon Track Validation Guardrail

1. Navigate to `/events/new`.
2. Fill general details and select `HACKATHON` archetype.
3. Without adding any tracks, attempt to click "Create Event" / "Proceed".
4. Confirm inline validation error: `"At least one challenge track or category is required for hackathons."`
5. Add track `"AI & Machine Learning"`. Validation passes.

### Scenario 3: Form State Persistence Across Archetype Switches

1. Navigate to `/events/new` on mobile width (375px).
2. Type in Title, Description, and custom Slug.
3. Switch archetype from `PAGEANT` to `STUDENT_COUNCIL` and back to `HACKATHON`.
4. Confirm all general details (Title, Description, Slug, Dates, Banner) remain preserved without form reset.

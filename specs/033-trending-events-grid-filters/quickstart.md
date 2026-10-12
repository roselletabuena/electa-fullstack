# Quickstart & Verification Guide: Trending Events Grid & Lifecycle Status Filters

**Feature ID**: `033-trending-events-grid-filters`  
**Date**: 2026-10-12

---

## 1. Setup & Environment

Ensure dependencies are installed and test environment is ready:

```bash
npm run typecheck
npm run lint
```

---

## 2. Verification Scenarios

### Scenario A: Lifecycle Tab Switching

1. Navigate to the landing page `/`.
2. Locate the **Trending Events & Pageants** section below the hero.
3. Click `LIVE VOTING`:
   - Grid updates instantaneously showing only `Active` events.
   - URL updates to `/?status=active`.
4. Click `UPCOMING`:
   - Shows only `Scheduled` events.
5. Click `CONCLUDED`:
   - Shows only `Closed` events.
6. Click `ALL EVENTS`:
   - Shows all published events.

### Scenario B: Event Card Details & Contextual CTA

1. Inspect an active event card:
   - Notice countdown badge (e.g. `⏳ 2D 11H LEFT`).
   - Notice location badge, contestant count.
   - Action button reads `VIEW EVENT →` and links to `/events/[slug]`.
2. Inspect an upcoming event card:
   - Notice countdown badge (e.g. `OPENS IN 3D`).
   - Action button reads `PREVIEW EVENT →`.
3. Inspect a concluded event card:
   - Notice lock badge (`FINAL TALLIES`).
   - Action button reads `VIEW FINAL TALLIES →`.

---

## 3. Automated Test Execution

Run the targeted unit test suite:

```bash
npm run test:unit tests/unit/events/format-countdown.test.ts
npm run test:unit tests/unit/events/EventLifecycleFilters.test.tsx
npm run test:unit tests/unit/events/TrendingEventCard.test.tsx
npm run test:unit tests/unit/events/TrendingEventsGrid.test.tsx
```

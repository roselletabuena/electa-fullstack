# Implementation Plan: Trending Events Grid & Lifecycle Status Filters

**Feature ID**: `033-trending-events-grid-filters`  
**Jira Key**: [VS-92](https://the-three-devsketeers.atlassian.net/browse/VS-92)  
**Parent Epic**: [VS-90: [Epic] Electa Public Landing Page & Event Discovery Portal](https://the-three-devsketeers.atlassian.net/browse/VS-90)  
**Preceding Dependency**: [VS-88](https://the-three-devsketeers.atlassian.net/browse/VS-88) (Global Search Bar)  
**Downstream Dependent**: [VS-93](https://the-three-devsketeers.atlassian.net/browse/VS-93) (Full Page Assembly)  
**Date**: 2026-10-12

---

## 1. Architectural Boundaries & Component Mapping

```text
src/
├── features/
│   └── events/
│       ├── components/
│       │   └── trending/
│       │       ├── EventLifecycleFilters.tsx     # Zero-radius filter tabs bar with counts & ARIA
│       │       ├── TrendingEventCard.tsx         # Event poster card with countdown pill, stats, CTA
│       │       ├── TrendingEventsGrid.tsx        # Responsive 3-col grid, empty state, loading skeleton
│       │       ├── TrendingEventsSection.tsx     # Client wrapper with nuqs + TanStack Query
│       │       └── index.ts                      # Barrel exports for trending components
│       ├── hooks/
│       │   └── useTrendingEvents.ts              # TanStack Query hook fetching /api/events
│       ├── utils/
│       │   ├── format-countdown.ts               # Formats countdown pill & contextual CTA
│       │   └── filter-events.ts                  # Pure filtering utility by lifecycle status
│       └── index.ts                              # Updated feature barrel export
├── app/
│   ├── page.tsx                                  # Landing page integrating TrendingEventsSection
│   └── api/
│       └── events/
│           └── route.ts                          # Supplies PublicEventDto[]
└── tests/
    └── unit/
        └── events/
            ├── EventLifecycleFilters.test.tsx    # Filter tabs & keyboard navigation tests
            ├── TrendingEventCard.test.tsx        # Card presentation, badges, and CTA tests
            ├── TrendingEventsGrid.test.tsx       # Grid rendering, empty state, and reset tests
            └── format-countdown.test.ts          # Pure countdown calculation tests
```

---

## 2. Electa Design System Compliance

- **Corners**: Strict zero-radius (`rounded-none`, `--radius: 0px`) across tabs, badges, cards, buttons, and scrim overlays.
- **Color Palette**:
  - Light Mode (Opal): `bg-white`, `border-slate-300`, `text-slate-900`, `text-slate-700`.
  - Dark Mode (Obsidian): `dark:bg-[#0d1424]`, `dark:border-slate-800`, `dark:text-white`, `dark:text-slate-300`.
  - Active Tab: `bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-extrabold`.
  - Countdown Pill (Active): `bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30`.
  - Countdown Pill (Scheduled): `bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30`.
  - Countdown Pill (Closed): `bg-slate-500/15 text-slate-700 dark:text-slate-300 border border-slate-500/30`.
- **Typography**: Outfit (`font-heading`) for titles, Sora (`font-sans`) for body/badges, JetBrains Mono (`font-mono`) for tabular counts/deadlines.
- **Tailwind v4**: `bg-linear-to-t`, `aspect-16/9`.

---

## 3. Test Plan

1. **Unit Tests (`tests/unit/events/format-countdown.test.ts`)**:
   - Verify countdown formatting for active events (> 24h, < 24h, < 1h).
   - Verify countdown formatting for scheduled events.
   - Verify CTA labels for `Active`, `Scheduled`, and `Closed`.
2. **Component Tests (`tests/unit/events/EventLifecycleFilters.test.tsx`)**:
   - Verify all 4 tabs render with appropriate labels.
   - Verify clicking tab triggers onChange callback.
   - Verify ARIA selected states.
3. **Card Tests (`tests/unit/events/TrendingEventCard.test.tsx`)**:
   - Verify poster banner, title, location, and contestant count display.
   - Verify CTA links to `/events/[slug]`.
4. **Grid Tests (`tests/unit/events/TrendingEventsGrid.test.tsx`)**:
   - Verify events filter accurately by status.
   - Verify empty state renders when 0 events match, and reset button restores `all`.

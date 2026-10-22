# Implementation Plan: Haute-Couture Pageant Editorial Theme Skin

**Feature ID**: `049-pageant-editorial-theme`  
**Ticket**: [VS-121](https://the-three-devsketeers.atlassian.net/browse/VS-121)  
**Parent Epic**: [VS-119](https://the-three-devsketeers.atlassian.net/browse/VS-119)  
**Date**: 2026-10-23  

---

## 1. Technical Architecture & Boundary Mapping

```text
src/
├── features/
│   ├── events/
│   │   ├── theme/
│   │   │   ├── theme-registry.ts          # Pageant Editorial token registry
│   │   │   ├── EventThemeProvider.tsx     # data-event-theme="pageant-editorial" injection
│   │   │   ├── pageant-theme.css          # Scoped CSS styles under [data-event-theme="pageant-editorial"]
│   │   │   └── index.ts                   # Export barrels
│   │   ├── components/
│   │   │   ├── EventBanner.tsx            # Theme-aware editorial hero masthead
│   │   │   └── EventCountdown.tsx         # Architectural countdown timer with dividers
│   ├── contestants/
│   │   └── components/
│   │       └── ContestantCard.tsx         # 4:5 portrait card, sash tag, Cormorant Garamond typography
│   └── payments/
│       └── components/
│           └── BoostVoteModal.tsx         # Scoped luxury modal styling
```

---

## 2. Implementation Steps & TDD Strategy

### Phase A: Scoped CSS & Theme Engine Integration
1. Create `src/features/events/theme/pageant-theme.css` with scoped classes targeting:
   - `[data-event-theme="pageant-editorial"]`:
     - Container background: `var(--bg-base, #0B0C10)`
     - Headings and serif elements: `font-family: var(--font-heading)`
     - Architectural timer styling: `.timer-block`, `.timer-val`, `.timer-div`
     - Contestant card styling: obsidian surface, champagne sash tag, champagne hover border
     - Action buttons: `.btn-vote-free`, `.btn-boost-outline`
2. Import `pageant-theme.css` in `src/app/globals.css` or `EventThemeProvider.tsx` ensuring zero bloat on unstyled pages.

### Phase B: Component Theming Refinement
1. **`EventCountdown.tsx`**:
   - Introduce architectural countdown styling when rendered under `pageant-editorial`:
     - Champagne numerals (`#CBB279`) in serif font.
     - Hairline vertical dividers between units (`border-r border-white/10` or styled timer dividers).
     - Compact stacked layout on mobile screens (`< 640px`).
2. **`EventBanner.tsx`**:
   - Ensure title adapts to `font-heading` (Cormorant Garamond under pageant theme).
   - Champagne gold highlight accents on eyebrow / subtitle.
   - Contrast-verified state badges.
3. **`ContestantCard.tsx`**:
   - Refine 4:5 portrait layout with sash tag for hometown/division.
   - Candidate number badge in Cormorant Garamond (`#01`).
   - Free Vote button in high-contrast solid white/light background.
   - Boost vote button in champagne outline (`border-[#CBB279] text-[#CBB279]`).
4. **`BoostVoteModal.tsx`**:
   - Apply luxury dark surfaces and champagne borders when opened within `pageant-editorial`.

### Phase C: Unit Tests & Verification
1. Create `tests/unit/events/pageant-theme.test.tsx` verifying:
   - SSR rendering of `EventThemeProvider` with `theme="PAGEANT_EDITORIAL"`.
   - `EventCountdown` rendering architectural timer units with champagne typography.
   - `ContestantCard` rendering 4:5 portrait ratio, sash tag, and buttons under both themes.
   - Parity guarantee: `ELECTA_DEFAULT` renders unmodified Opal styling.
2. Run `npm run typecheck`, `npm run lint`, and `npm run test:unit`.

---

## 3. Constitution & Quality Checklist

- [x] **§I Type Safety**: No `any`, no non-null assertions.
- [x] **§II Server-First**: Tokens injected on server with zero FOUT.
- [x] **§IV Accessibility**: WCAG 2.1 AA dual-theme contrast compliance.
- [x] **Branding**: Opal light mode default strictly preserved for default events.

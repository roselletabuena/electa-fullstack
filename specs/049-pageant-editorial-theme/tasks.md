# Implementation Tasks: Haute-Couture Pageant Editorial Theme Skin

**Feature ID**: `049-pageant-editorial-theme`  
**Ticket**: [VS-121](https://the-three-devsketeers.atlassian.net/browse/VS-121)  
**Parent Epic**: [VS-119](https://the-three-devsketeers.atlassian.net/browse/VS-119)  
**Date**: 2026-10-23

---

## Phase 1: Setup & Contracts

- [x] **Task 1.1**: Verify theme tokens and contract schema
  - Ensure `contracts/pageant-editorial-theme.ts` validates `PAGEANT_EDITORIAL` token definitions.
  - Target files: `specs/049-pageant-editorial-theme/contracts/pageant-editorial-theme.ts`.

---

## Phase 2: Scoped Stylesheet & Design Tokens

- [x] **Task 2.1**: Implement `src/features/events/theme/pageant-theme.css`
  - Define scoped rules under `[data-event-theme="pageant-editorial"]`:
    - Base atmospheric background (`#0B0C10`) and surface container (`#12141C`).
    - Cormorant Garamond serif typography for headings, numerals, and brand elements.
    - Architectural countdown timer styling with vertical dividers and compact mobile layout.
    - Haute-couture contestant card styling with champagne sash tags and 4:5 aspect ratio.
    - High-contrast Free Vote and champagne-outline Boost Vote action buttons.
  - Target files: `src/features/events/theme/pageant-theme.css`.

- [x] **Task 2.2**: Wire scoped stylesheet into application
  - Import `pageant-theme.css` in `src/app/globals.css` to enable SSR-first token activation.
  - Target files: `src/app/globals.css`.

---

## Phase 3: Component Theming Adaptations

- [x] **Task 3.1**: Refine `EventCountdown.tsx`
  - Support architectural countdown layout when in `pageant-editorial`.
  - Large champagne serif numerals (`#CBB279`), uppercase labels, hairline dividers.
  - Responsive stacking on mobile screens (375px).
  - Target files: `src/features/events/components/EventCountdown.tsx`.

- [x] **Task 3.2**: Refine `EventBanner.tsx`
  - Support editorial hero masthead styling when in `pageant-editorial`.
  - Elegant serif title styling, champagne gold eyebrow/subtitles, and high-contrast badges.
  - Target files: `src/features/events/components/EventBanner.tsx`.

- [x] **Task 3.3**: Refine `ContestantCard.tsx`
  - Support pageant editorial card presentation:
    - 4:5 portrait photo ratio.
    - Floating champagne sash tag for hometown/division.
    - Candidate number badge (`#01`) in Cormorant Garamond.
    - Candidate name in Cormorant Garamond.
    - Action buttons with WCAG 2.1 AA contrast: solid white free vote and champagne outline boost vote.
  - Target files: `src/features/contestants/components/ContestantCard.tsx`.

- [x] **Task 3.4**: Refine `BoostVoteModal.tsx`
  - Scope modal interior when opened within `[data-event-theme="pageant-editorial"]` with obsidian surfaces and champagne accents.
  - Target files: `src/features/payments/components/BoostVoteModal.tsx`.

- [x] **Task 3.5**: Modal Backdrop Opacity & Pageant Modal Theming
  - Enhance modal backdrop overlays across `ContestantProfileModal`, `BoostVoteModal`, `OmnichannelAuthModal`, `VoteStoryModal`, and `ballot-review-modal` with high-opacity dark backdrops (`bg-black/85`–`bg-black/90` or `backdrop-blur-md`) to eliminate background bleed-through.
  - Scope `ContestantProfileModal` with obsidian cards and champagne accents.
  - Target files: `src/features/contestants/components/ContestantProfileModal.tsx`, `src/features/payments/components/BoostVoteModal.tsx`.

- [x] **Task 3.6**: Voting Rules & Free Vote Cooldown Banner Theming
  - Adapt `EventVotingRulesBanner` and `FreeVoteCooldownBanner` to obsidian and champagne luxury palette.
  - Consolidate quota messages to avoid duplicate countdown banners.
  - Target files: `src/features/events/components/EventVotingRulesBanner.tsx`, `src/features/voting/components/FreeVoteCooldownBanner.tsx`.

---

## Phase 4: Unit Testing & Verification Gates

- [x] **Task 4.1**: Create comprehensive unit tests
  - Test `EventThemeProvider` rendering with `PAGEANT_EDITORIAL` theme.
  - Test `EventCountdown` architectural timer rendering and mobile responsiveness.
  - Test `ContestantCard` rendering 4:5 portrait and action buttons under both themes.
  - Verify default theme guarantee: `ELECTA_DEFAULT` preserves 100% Opal slate styling and zero-radius geometry.
  - Target files: `tests/unit/events/pageant-theme.test.tsx`.

- [x] **Task 4.2**: Verify WCAG 2.1 AA Color Contrast
  - Run contrast checks on all dark background and text combinations using `check-contrast.mjs`.

- [x] **Task 4.3**: Execute quality gates
  - Run `npm run typecheck`.
  - Run `npm run lint`.
  - Run `npm run test:unit`.

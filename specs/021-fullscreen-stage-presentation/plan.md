# Implementation Plan: Fullscreen Stage Presentation Mode for LED Screens

**Feature ID**: `021-fullscreen-stage-presentation`  
**Jira Key**: `VS-23`  
**Date**: 2026-10-02

## 1. Architecture & Component Mapping

```
src/
├── app/(public)/events/[slug]/stage-display/
│   └── page.tsx                     ← Server Component (RSC) route fetching event, divisions, and candidates
└── features/stage-display/
    ├── types/
    │   └── index.ts                 ← StageDisplayPayload, StageCandidate, RevealState
    ├── utils/
    │   ├── sound-synthesizer.ts     ← Web Audio API tension drone, chime, and victory fanfare
    │   └── confetti-cannon.ts       ← 60fps HTML5 Canvas particle & confetti explosion engine
    ├── hooks/
    │   └── useStageHotkeys.ts       ← Keyboard shortcuts (F, Space, Arrows, R, M) & fullscreen API
    ├── components/
    │   ├── StageDisplayView.tsx     ← Root 16:9 stage container with luxury dark theme
    │   ├── StageLiveTally.tsx       ← Stage-optimized live podium and ranking grid
    │   ├── StageWinnerReveal.tsx    ← Dramatic step-by-step winner reveal sequence
    │   └── StageOperatorDock.tsx    ← Floating backstage operator HUD with mode & audio controls
    └── index.ts                     ← Barrel export
```

## 2. Electa Brutalist-Refined Design Rules Enforcement

- **Strict Zero-Radius (`rounded-none`)**: Every badge, card, button, and indicator uses 0px corners.
- **Stage Luxury Dark Palette**:
  - Backdrop: Obsidian `#050811` with radial stage spotlights.
  - Gold Accent: Amber-500 `#F59E0B` / Amber-400 `#FBBF24` for 1st Place / Title Winner.
  - Silver Accent: Slate-300 `#CBD5E1` / Slate-200 `#E2E8F0` for 1st Runner Up.
  - Bronze Accent: Orange-500 `#F97316` / Amber-700 `#B45309` for 2nd Runner Up.
  - Card Surfaces: Deep charcoal `#0d1424` with hairline borders `#1e293b`.
- **Typography Hierarchy**:
  - Numbers & Ranks: `font-heading font-black` (Outfit) with `tabular-nums`.
  - Contestant Names: `font-sans font-bold` (Sora).
  - Badges & Tallies: `font-mono uppercase tracking-widest` (JetBrains Mono).

## 3. Test Plan

- Unit tests under `tests/unit/stage-display/`:
  - `sound-synthesizer.test.ts`: Verify Web Audio node creation, parameters, and mute guards without throwing in test environments.
  - `reveal-sequence.test.ts`: Test step progression, boundary validation (cannot step past total), and reverse-rank sorting.
  - `stage-display-view.test.tsx`: Render tests for mode switching, hotkeys, and dark luxury zero-radius styling.

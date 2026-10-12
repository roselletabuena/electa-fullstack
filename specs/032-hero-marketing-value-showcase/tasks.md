# Implementation Tasks: Hero Marketing Value Showcase & Platform Highlights Card

**Feature ID**: `032-hero-marketing-value-showcase`  
**Parent Ticket**: [VS-91](https://the-three-devsketeers.atlassian.net/browse/VS-91)  
**Parent Epic**: [VS-90](https://the-three-devsketeers.atlassian.net/browse/VS-90)  
**Branch**: `feature/VS-91-hero-marketing-value-showcase`

---

## Phase 1: Setup & Contracts

**Purpose**: Define types, Zod schemas, and standard marketing content configuration.

- [ ] T001 Define marketing feature types and Zod schemas in `src/features/marketing/types/index.ts`
- [ ] T002 Define standard marketing value pillars, highlights metrics, and trust copy in `src/features/marketing/utils/marketing-config.ts`
- [ ] T003 Export types and utilities in `src/features/marketing/utils/index.ts` and `src/features/marketing/index.ts`

---

## Phase 2: Component Implementation

**Purpose**: Implement the zero-radius `HeroMarketingCard`, `FeatureTile`, and `HighlightsRibbon` components following Electa branding and WCAG 2.1 AA standards.

- [ ] T004 Implement `FeatureTile` in `src/features/marketing/components/FeatureTile.tsx` with high-contrast icon container, zero-radius geometry, and readable typography
- [ ] T005 Implement `HighlightsRibbon` in `src/features/marketing/components/HighlightsRibbon.tsx` with tabular monospace metrics and hairline borders
- [ ] T006 Implement `HeroMarketingCard` in `src/features/marketing/components/HeroMarketingCard.tsx` with credential badge, headline, 4 tiles, ribbon, and assurance footnote
- [ ] T007 Export components in `src/features/marketing/components/index.ts` and `src/features/marketing/index.ts`
- [ ] T008 Integrate `HeroMarketingCard` into `src/app/page.tsx` hero section

---

## Phase 3: Unit Testing & Verification

**Purpose**: Validate component rendering, copy exactness, zero-radius geometry, and accessibility.

- [ ] T009 Implement comprehensive unit tests in `tests/unit/marketing/HeroMarketingCard.test.tsx` verifying badge, headline, all 4 tiles, all 4 metrics, and assurance footnote
- [ ] T010 Execute unit test suite with Vitest (`npm run test:unit`)
- [ ] T011 Run typecheck (`npm run typecheck`) and linter (`npm run lint`)

---

## Phase 4: Quality Gate & Completion

**Purpose**: Verify constitutional compliance, sync Jira status, and commit changes.

- [ ] T012 Run constitutional check and graphify auto-sync
- [ ] T013 Create atomic commits adhering to Conventional Commits standards
- [ ] T014 Transition Jira issue VS-91 to Done with implementation summary comment

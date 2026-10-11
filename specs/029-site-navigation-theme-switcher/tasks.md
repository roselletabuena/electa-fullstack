# Implementation Tasks: Responsive Site Navigation Bar & Theme Switcher

**Feature ID**: `029-site-navigation-theme-switcher`  
**Parent Ticket**: [VS-87](https://the-three-devsketeers.atlassian.net/browse/VS-87)  
**Parent Epic**: [VS-90](https://the-three-devsketeers.atlassian.net/browse/VS-90)  
**Branch**: `feat/VS-87-site-navigation-theme-switcher`  

---

## Phase 1: Setup & Contracts

**Purpose**: Define the types, contracts, and navigation configuration.

- [x] T001 Define navigation types and Zod schemas in `src/features/navigation/types/index.ts`
- [x] T002 Define navigation configuration and defaults in `src/features/navigation/utils/nav-config.ts`
- [x] T003 Create barrel exports in `src/features/navigation/index.ts`

---

## Phase 2: Foundational Components & Enhancements

**Purpose**: Core UI primitives and updated ThemeToggle supporting icon-only layout.

- [x] T004 Enhance `ThemeToggle` in `src/components/shared/theme-toggle.tsx` with `variant="icon"` and `showLabel={false}` support
- [x] T005 Implement `BrandMark` in `src/features/navigation/components/brand-mark.tsx` rendering `ElectaSymbol`, "ELECTA" wordmark, and tagline
- [x] T006 Implement unit tests for `BrandMark` and `ThemeToggle` in `tests/unit/navigation/brand-mark.test.tsx`

---

## Phase 3: SiteHeader Component & Responsive Layout

**Purpose**: Assemble the sticky responsive navigation header matching `mockup-realistic.html`.

- [x] T007 Implement `SiteHeader` in `src/features/navigation/components/site-header.tsx` with sticky container, brand mark, action links, and theme toggle
- [x] T008 Implement unit tests for `SiteHeader` in `tests/unit/navigation/site-header.test.tsx` verifying links, zero-radius, and accessibility
- [x] T009 Create API Route Handler in `src/app/api/navigation/route.ts` returning typed `ApiResponse<SiteHeaderConfig>`
- [x] T010 Implement API route unit tests in `tests/unit/navigation/navigation-route.test.ts`

---

## Phase 4: Landing Page Integration

**Purpose**: Embed `SiteHeader` into `src/app/page.tsx`.

- [x] T011 Integrate `SiteHeader` into `src/app/page.tsx` as the persistent top header
- [x] T012 Verify landing page renders header seamlessly in both light and dark mode

---

## Phase 5: Verification & Quality Gates

**Purpose**: Execute all verification gates and constitutional audits.

- [x] T013 Run unit test suite: `npm run test:unit tests/unit/navigation/`
- [x] T014 Run full project tests: `npm run test:unit`
- [x] T015 Run typecheck and linting: `npm run typecheck` and `npm run lint`
- [ ] T016 Commit changes using Conventional Commits (`feat`, `test`)

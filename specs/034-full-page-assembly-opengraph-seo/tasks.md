# Implementation Tasks: Full Page Assembly, Accessible Footer & OpenGraph SEO

- [x] **Task 1: Iconography Upgrade & Emoticon Elimination** `refactor(ui): replace emoticons with Lucide SVG icons in marketing tiles and countdown pills`
- [x] **Task 2: Streamlined Accessible Footer Variant** `feat(navigation): add streamlined footer variant matching mockup`
- [x] **Task 3: Full Page Assembly & Mockup Clutter Pruning** `feat(landing-page): assemble root page matching mockup-realistic with pruned badges and headers`
- [x] **Task 4: OpenGraph & Social SEO Metadata** `feat(seo): add OpenGraph and Twitter card metadata with dynamic social preview`
- [x] **Task 5: Quality Gate & Test Verification** `test(assembly): add comprehensive page assembly and SEO verification tests`

## Phase 1: Convergence

- [ ] T006 Add `metadataBase` to root metadata using `env.NEXT_PUBLIC_APP_URL` from `@/env` (never raw `process.env`, Constitution IV; fallback `https://electa.ph`) so relative OG/canonical URLs resolve per FR-3 (missing)
- [ ] T007 Replace emoticon characters in marketing config `assuranceFootnote` with plain text and drop the `.replace(/^.../)` strip hacks in `HeroMarketingCard.tsx` and `TrendingEventCard.tsx` per FR-2 / Scenario 1 (partial)
- [ ] T008 Remove legacy emoji `case` keys in `FeatureTile.tsx` `renderTileIcon` so only named Lucide keys are supported per FR-2 (partial)
- [ ] T009 Review/justify or relocate unrequested `.scrollbar-themed` CSS in `globals.css` and search dropdown / trending divider styling tweaks not covered by spec, plan, or tasks (unrequested)

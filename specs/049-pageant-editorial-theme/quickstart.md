# Quickstart & Verification Guide: Haute-Couture Pageant Editorial Theme

**Feature ID**: `049-pageant-editorial-theme`  
**Ticket**: [VS-121](https://the-three-devsketeers.atlassian.net/browse/VS-121)  
**Parent Epic**: [VS-119](https://the-three-devsketeers.atlassian.net/browse/VS-119)  
**Date**: 2026-10-23  

---

## 1. Automated Verification Commands

Run targeted quality gates directly inside the worktree:

```bash
# 1. Typecheck TypeScript 5 strict mode
npm run typecheck

# 2. Run unit tests covering pageant theme & public components
npx vitest run tests/unit/events/pageant-theme.test.tsx

# 3. Verify WCAG 2.1 AA Color Contrast
node .agents/skills/accessibility-colors/scripts/check-contrast.mjs "#F9F9FB" "#0B0C10"
node .agents/skills/accessibility-colors/scripts/check-contrast.mjs "#CBB279" "#0B0C10"
node .agents/skills/accessibility-colors/scripts/check-contrast.mjs "#9BA3B4" "#0B0C10"

# 4. Run full agent verification gate
npm run lint
npm run test:unit
```

---

## 2. Interactive Walkthrough Scenarios

### Scenario A: Verifying Pageant Editorial Themed Event Page
1. Ensure the event mock or database record has `theme: "PAGEANT_EDITORIAL"`.
2. Visit `/events/[slug]`.
3. Inspect root container in DOM:
   - Contains attribute: `data-event-theme="pageant-editorial"`.
   - Injects `--bg-base: #0B0C10`, `--accent-primary: #CBB279`, `--font-heading: 'Cormorant Garamond', Georgia, serif`.
4. Observe `EventBanner`:
   - Deep obsidian background with champagne accents.
5. Observe `EventCountdown`:
   - Architectural digit block with vertical dividers and champagne numerals.
6. Observe `ContestantCard`:
   - 4:5 portrait ratio, obsidian surface, champagne sash badge, Cormorant Garamond title and candidate number.
   - High-contrast Free Vote button and champagne-outline Boost Vote button.

### Scenario B: Verifying Electa Default Theme Guarantee
1. Visit an event with `theme: "ELECTA_DEFAULT"` or `null`.
2. Inspect root container in DOM:
   - Contains attribute: `data-event-theme="electa-default"`.
3. Verify Opal Slate-50 background (`#F8FAFC`), Slate-900 typography, Sky Blue `#0284C7` accent, and sharp zero-radius geometry (`rounded-none`).
4. Confirm zero visual or layout regressions.

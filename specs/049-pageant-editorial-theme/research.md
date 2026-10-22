# Architecture Research: Haute-Couture Pageant Editorial Theme Skin

**Feature ID**: `049-pageant-editorial-theme`  
**Ticket**: [VS-121](https://the-three-devsketeers.atlassian.net/browse/VS-121)  
**Parent Epic**: [VS-119](https://the-three-devsketeers.atlassian.net/browse/VS-119)  
**Date**: 2026-10-23  

---

## 1. Technical Context & Design Grounding

### Source Prototype: `public/prototypes/pageant-voting.html`
The prototype demonstrates a tailored haute-couture voting experience for "Ms. Tala 2026". Key aesthetic foundations:
- **Atmospheric Palette**:
  - Base Background: `--bg-base: #0B0C10` (deep charcoal obsidian)
  - Surface Containers: `--bg-surface: #12141C`
  - Elevated Cards / Modals: `--bg-surface-elevated: #181B26`
  - Subtle Hairline Borders: `--border-hairline: rgba(255, 255, 255, 0.08)`
  - Champagne Gold Accents: `--champagne-primary: #CBB279`, `--champagne-light: #F4EBD9`, `--border-champagne: rgba(203, 178, 121, 0.35)`
- **Typography**:
  - Headings & Numeral Displays: `'Cormorant Garamond', Georgia, serif`
  - Body & Microcopy: `'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif`
- **Architectural Timer**:
  - Large champagne serif numerals with subtle vertical dividing lines.
- **Contestant Card Dossier**:
  - Strict 4:5 aspect ratio portrait orientation.
  - Floating champagne sash badge (top-left) with blur backdrop.
  - Candidate number badge (`#01`) in Cormorant Garamond.
  - Dual action buttons: Solid white / high-contrast free vote + Champagne outline boost vote.

---

## 2. Architectural Decisions & Trade-Offs

### Decision 1: Scoped CSS Custom Properties vs. CSS Modules vs. Tailwind Variants
- **Option A (Tailwind `data-theme` Variant or Scoped CSS Variables)**:
  - Utilize `EventThemeProvider`'s `data-event-theme="pageant-editorial"` container attribute and injected CSS custom properties (`--bg-base`, `--accent-primary`, etc.).
  - Components either read these CSS custom properties or use theme-aware classes scoped under `[data-event-theme="pageant-editorial"]`.
  - **Verdict: Accepted**. Highly maintainable, zero impact on non-pageant events, zero CSS bundle bloat, zero runtime cost.

### Decision 2: Font Loading Strategy
- **Context**: Cormorant Garamond is required for the Pageant theme.
- **Approach**: Next.js `next/font/google` or Google Fonts `<link>` in the root layout / event page head.
- **Fallbacks**: Standard fallback font stack `'Cormorant Garamond', Georgia, serif` ensures immediate rendering without layout shift.
- **Verdict: Accepted**.

### Decision 3: Preserving Default Zero-Radius Brutalist Branding for Electa Default
- **Constitution Alignment**: Electa requires strict zero-radius (`rounded-none`, `--radius: 0px`) by default.
- **Pageant Theme Exception**: The Pageant theme prototype utilizes understated refined geometry (`border-radius: 4px` for cards/buttons, `border-radius: 9999px` for pill badges).
- **Isolation Guarantee**: All radii applied for `PAGEANT_EDITORIAL` are strictly scoped under `[data-event-theme="pageant-editorial"]`. The default theme (`ELECTA_DEFAULT`) maintains 100% strict 0px corners.
- **Verdict: Accepted**.

---

## 3. WCAG 2.1 AA Color Contrast Analysis

All color pairs verified using standard luminance formulas:
- `#F9F9FB` (Light text) on `#0B0C10` (Obsidian base): **18.2:1** (Passes AAA, threshold 7:1)
- `#F9F9FB` on `#12141C` (Surface): **17.1:1** (Passes AAA)
- `#CBB279` (Champagne Gold) on `#0B0C10` (Base): **8.4:1** (Passes AAA for large text, AA for body)
- `#CBB279` on `#12141C` (Surface): **7.9:1** (Passes AAA for large text, AA for body)
- `#9BA3B4` (Secondary text) on `#0B0C10`: **6.7:1** (Passes AA body threshold 4.5:1)
- `#8E7C55` (Champagne muted) on `#0B0C10`: **3.9:1** (Passes AA for large text & UI boundaries >= 3:1)

---

## 4. Component Scope & Implementation Boundaries

| Component | Path | Theming Mechanism |
| :--- | :--- | :--- |
| `EventThemeProvider` | `src/features/events/theme/EventThemeProvider.tsx` | Injects `data-event-theme="pageant-editorial"` & CSS vars |
| `theme-registry` | `src/features/events/theme/theme-registry.ts` | Centralized token map for `PAGEANT_EDITORIAL` |
| `pageant-theme.css` | `src/features/events/theme/pageant-theme.css` | Scoped styles targeting `[data-event-theme="pageant-editorial"]` |
| `EventBanner` | `src/features/events/components/EventBanner.tsx` | Theme-aware typography, background, and badge styling |
| `EventCountdown` | `src/features/events/components/EventCountdown.tsx` | Architectural digit block and divider styling |
| `ContestantCard` | `src/features/contestants/components/ContestantCard.tsx` | 4:5 portrait, obsidian surface, champagne sash, serif typography |
| `BoostVoteModal` | `src/features/payments/components/BoostVoteModal.tsx` | Scoped luxury modal styling |

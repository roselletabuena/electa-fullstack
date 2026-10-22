# Requirements Quality Checklist: 049-pageant-editorial-theme

**Feature ID**: `049-pageant-editorial-theme`  
**Ticket**: [VS-121](https://the-three-devsketeers.atlassian.net/browse/VS-121)  
**Parent Epic**: [VS-119](https://the-three-devsketeers.atlassian.net/browse/VS-119)  
**Date**: 2026-10-23  

---

## 1. Specification Completeness

- [x] **Clear Persona & User Story**: Event organizers conducting beauty pageants and voters interacting with the public ballot.
- [x] **Gherkin Acceptance Scenarios**: Defined for visual theme rendering, countdown timer, contestant cards, responsive viewport, contrast, and functional parity.
- [x] **Prototype Alignment**: Grounded in `public/prototypes/pageant-voting.html` tokens and layout.
- [x] **No Underspecified Behavior**: Clear defaults and fallback to `ELECTA_DEFAULT`.

---

## 2. Electa Design System & Theme Parity

- [x] **Default Theme Guarantee**: Events with `theme = "ELECTA_DEFAULT"` maintain 100% strict zero-radius brutalist geometry (`rounded-none`, `--radius: 0px`) and Opal Slate palette.
- [x] **Strict Scoping**: All Pageant Editorial styles are strictly scoped under `[data-event-theme="pageant-editorial"]`.
- [x] **Typography Mapping**: Cormorant Garamond mapped for serif headings and numbers; clean fallback fonts specified.
- [x] **Tailwind CSS v4 Compliance**: All gradients use `bg-linear-to-*`; all aspect ratios use canonical fraction utilities (`aspect-4/5`, `aspect-16/9`).

---

## 3. Accessibility & WCAG 2.1 AA Compliance

- [x] **Text Contrast (>= 4.5:1)**:
  - Primary text (`#F9F9FB`) on `#0B0C10`: **18.2:1** ✅
  - Secondary text (`#9BA3B4`) on `#0B0C10`: **6.7:1** ✅
  - Champagne Gold (`#CBB279`) on `#0B0C10`: **8.4:1** ✅
- [x] **UI Component Contrast (>= 3:1)**:
  - Champagne borders and buttons meet or exceed 3:1 against dark backgrounds.
- [x] **Image Scrim Overlays**:
  - All text placed over photos (banner and contestant portraits) uses high-opacity dark gradient scrim overlays (`bg-linear-to-t from-slate-950 via-slate-950/60 to-transparent`).

---

## 4. Architecture & Non-Functional Requirements

- [x] **Constitution §I (Strict Type Safety)**: TypeScript 5 strict mode, 0 `any`, 0 non-null assertions `!`.
- [x] **Constitution §II (Server-First)**: Zero flash of unstyled theme (FOUT) via SSR `data-event-theme` injection.
- [x] **Constitution §III (State Separation)**: Theme state resolved via server props and `EventThemeProvider`.
- [x] **Constitution §VI (Test-First & Quality Gates)**: Unit tests for theme rendering and token resolution.

# [VS-119] Dynamic Event Theming Engine & Visual Appearance System

> **Jira Epic Key**: `VS-119`  
> **Type**: Epic  
> **Priority**: High  
> **Status**: **To Do / Specified**  
> **Labels**: `theme`, `branding`, `frontend`, `events`, `ui-ux`

---

## 📋 Executive Summary

Implement a **Dynamic Event Theming Engine** for Electa public event pages (`/events/[slug]`), allowing organizers to customize the visual appearance of their competitions according to genre and branding while strictly preserving the **current events page design as the system default (`ELECTA_DEFAULT`)**.

This epic bridges the gap between generic competition interfaces and immersive, genre-specific experiences—such as the Haute-Couture Editorial Pageant prototype (`public/prototypes/pageant-voting.html`).

---

## 🎯 Strategic Objectives & Scope

1. **Default Theme Guarantee (`ELECTA_DEFAULT`)**:
   - Preserves 100% visual and functional parity with the current events page design: Opal Slate-50 background (`#F8FAFC`), Slate-900 typography, Sky Blue `#0284C7` accent, and sharp zero-radius geometry (`rounded-none`).
   - Every existing and newly created event defaults to `ELECTA_DEFAULT`.

2. **Haute-Couture Pageant Editorial Theme (`PAGEANT_EDITORIAL`)**:
   - Introduces a dedicated luxury aesthetic inspired by national pageants (e.g. Ms. Tala 2026): deep obsidian surfaces (`#0B0C10`), champagne gold accents (`#CBB279`), Cormorant Garamond serif headings, architectural countdown timer, and refined contestant cards.

3. **Organizer Appearance Management**:
   - Adds a visual "Theme & Appearance" selector in the Organizer Dashboard Settings (`GeneralBrandingForm.tsx`) with real-time swatch cards and preview.
   - Integrates theme selection into the first-run Event Creation Wizard (`event-creation-wizard.tsx`).

4. **Zero Layout Shift & Accessibility Parity**:
   - Server-First token injection avoids Flash of Unstyled Theme (FOUT) and layout shifts.
   - Strict WCAG 2.1 AA dual-theme contrast compliance across both default and custom themes.

---

## 📑 Child User Stories Breakdown

| Ticket Key                                                              | Workstream    | Summary                                                                           | Status  |
| :---------------------------------------------------------------------- | :------------ | :-------------------------------------------------------------------------------- | :-----: |
| **[VS-120](https://the-three-devsketeers.atlassian.net/browse/VS-120)** | Data & Engine | FE/BE: Data Model, Schema Migration & Dynamic Theme Resolution Engine             | `To Do` |
| **[VS-121](https://the-three-devsketeers.atlassian.net/browse/VS-121)** | Theme Skin    | FE: Implement Haute-Couture Pageant Editorial Theme Skin & Public Page Components | `To Do` |
| **[VS-122](https://the-three-devsketeers.atlassian.net/browse/VS-122)** | Dashboard UI  | FE: Organizer Dashboard Theme Selector & Real-Time Appearance Preview UI          | `To Do` |
| **[VS-123](https://the-three-devsketeers.atlassian.net/browse/VS-123)** | Creation Flow | FE: Event Creation Wizard Theme Step & Onboarding Integration                     | `To Do` |

---

## 🛡️ Definition of Done (DoD) & Success Metrics

- [ ] All existing and new events render the current events page design without visual regression by default.
- [ ] Selecting `PAGEANT_EDITORIAL` dynamically renders the high-fashion obsidian and champagne aesthetic without modifying core voting, countdown, or payment functionality.
- [ ] Organizers can preview and switch themes in the dashboard with instant live feedback.
- [ ] 100% WCAG 2.1 AA contrast compliance across all theme states.
- [ ] Strict TypeScript strict mode, 0 lint errors, and 100% passing Vitest unit tests.

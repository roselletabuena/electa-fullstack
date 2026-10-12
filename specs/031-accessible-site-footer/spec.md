# Feature Specification: Accessible Site Footer with Brand Tagline, Copyright & Directory Links

**Feature ID**: `031-accessible-site-footer`  
**Jira Key**: [VS-89](https://the-three-devsketeers.atlassian.net/browse/VS-89)  
**Parent Epic**: [VS-86: [UI Components] Core Global Shell: Navigation Bar, Search Bar, and Footer](https://the-three-devsketeers.atlassian.net/browse/VS-86)  
**Execution Order**: Milestone 1.3 (Foundational Global Shell)  
**Status**: Draft  
**Created**: 2026-10-12

---

## 🎯 Executive Summary & Overview

The Electa platform requires a unified, persistent, and accessible global footer that anchors the bottom of every public and auxiliary page. Serving as the foundation of institutional trust, platform navigation, and legal transparency, the footer showcases the official Electa emblem (`electa-logo-dark.svg`), the brand tagline _"Vote. Engage. Celebrate."_, a multi-column navigation directory (Explore, Organizers, Platform, Legal), and system copyright and version metadata.

The component adheres to strict zero-radius geometry (`rounded-none`), full WCAG 2.1 AA accessibility on an anchor slate background (`#0F172A`), high-contrast link states, responsive layout stacking for mobile devices, and defaults to a React Server Component (RSC) with zero client JavaScript runtime overhead.

---

## 👥 Personas & Actors

1. **Public Visitor & Voter**: Browses active and concluded contests, explores pageants, reviews platform integrity policies, and navigates easily to terms or privacy policies.
2. **Pageant Organizer & Administrator**: Quickly accesses organizer guidelines, portal links, event creation shortcuts, and platform status.
3. **Screen Reader & Keyboard User**: Traverses footer landmark navigation with semantic tags (`<footer>`, `<nav aria-label="...">`), high-contrast focus rings, no keyboard traps, and clear link labels.

---

## 📋 Functional Requirements

1. **Semantic Landmark & Grounded Container**:
   - Renders a semantic `<footer>` element with `role="contentinfo"` and distinct visual separation via a hairline border (`border-t border-slate-800`).
   - Grounded container styled with `#0F172A` (deep obsidian slate) ensuring high institutional gravity and contrast.

2. **Official Brand Identity & Tagline**:
   - Displays the official Electa brand mark using `electa-logo-dark.svg` (or `ElectaSymbol` with light fills) linking to home (`/`).
   - Renders the bold geometric brand title `ELECTA` in Outfit typography (`font-heading font-black text-xl tracking-tight text-white`).
   - Renders the official brand tagline _"Vote. Engage. Celebrate."_ (`text-xs font-bold tracking-widest uppercase text-sky-400 select-none`).
   - Accompanied by a concise platform descriptor highlighting Electa's high-stakes civic and pageant voting capabilities.

3. **Multi-Column Directory Structure**:
   Organizes navigation links into 4 distinct functional columns on desktop viewports (`lg:` / `≥ 1024px`):
   - **Explore**: Trending Events (`/events?filter=trending`), Live Voting (`/events?filter=live`), Concluded Events (`/events?filter=concluded`), Search (`/events?search=true` or `/search`).
   - **Organizers**: Create Event (`/events/new`), Organizer Portal (`/dashboard`), Pricing (`/pricing`), Guidelines (`/guidelines`).
   - **Platform**: About Electa (`/about`), Security (`/security`), System Status (`/status`), API Docs (`/docs/api`).
   - **Legal**: Terms of Service (`/terms`), Privacy Policy (`/privacy`), Audit Integrity (`/audit`).

4. **Interactive States & Accessible Touch Targets**:
   - Link text styled with Sora font (`font-sans text-sm text-slate-300 transition-colors`).
   - Link hover states show sharp contrast transitions (`hover:text-white hover:underline focus-visible:outline-2 focus-visible:outline-sky-400`).
   - Mobile touch targets meet minimum 44px vertical spacing to prevent mis-taps.

5. **Copyright, Metadata & Integrity Notice**:
   - Copyright notice: `"© 2026 Electa Platform. All Rights Reserved."` styled in tabular numbers (`font-mono text-xs text-slate-400`).
   - Status badge / platform integrity indicator: `"SYSTEM OPERATIONAL · AUDIT VERIFIED"` with subtle green indicator.

6. **Responsive Layout Stacking**:
   - Desktop (`≥ 1024px`): 5-column grid (brand column + 4 directory columns) with horizontal alignment.
   - Tablet (`768px - 1023px`): 2-to-3 column grid with comfortable breathing room.
   - Mobile (`< 768px`): Clean vertical single-column stack with generous touch target padding (minimum 44px).

7. **Zero-Radius Design Geometry**:
   - Strict zero-radius (`rounded-none`, `--radius: 0px`) across any container, badge, or button within the footer.

---

## 🧪 User Scenarios & Acceptance Criteria (Gherkin)

### Scenario 1: Brand Identity & Tagline Presence

- **Given** any page is rendered on the platform,
- **When** the user scrolls to the bottom of the page,
- **Then** the footer displays the official Electa logo symbol (`electa-logo-dark.svg` on dark background),
- **And** the official brand tagline _"Vote. Engage. Celebrate."_ is prominently featured,
- **And** copyright text displays `"© 2026 Electa Platform. All Rights Reserved."`.

### Scenario 2: Structured Multi-Column Directory

- **Given** the user views the footer on desktop (viewport width ≥ 1024px),
- **When** browsing navigation options,
- **Then** links are organized into logical columns:
  - **Explore**: Trending Events, Live Voting, Concluded Events, Search
  - **Organizers**: Create Event, Organizer Portal, Pricing, Guidelines
  - **Platform**: About Electa, Security, System Status, API Docs
  - **Legal**: Terms of Service, Privacy Policy, Audit Integrity
- **And** all link hover states show sharp contrast transitions with underline or accent color shifts.

### Scenario 3: Responsive Stacking & Accessible Contrast

- **Given** a mobile viewport (< 768px),
- **When** viewing the footer,
- **Then** the multi-column layout neatly collapses into an accordion or single-column stack,
- **And** all secondary text adheres to WCAG 2.1 AA standards (minimum 4.5:1 contrast against `#0F172A` background),
- **And** touch targets meet minimum 44px spacing.

---

## 🛡️ Edge Cases & Constraints

1. **RSC Zero Client Overhead**: `SiteFooter` must default to React Server Component. It must not require `"use client"` or hydration scripts for rendering links and static branding.
2. **Offline / External Links**: External documentation links (if any) include `rel="noopener noreferrer"`.
3. **High Contrast Compliance**: All text on `#0F172A` background must exceed 4.5:1 contrast ratio:
   - Headings (`text-white` or `text-slate-100`): 16.5:1 contrast (PASS AAA).
   - Links (`text-slate-300` / `#CBD5E1`): 12.0:1 contrast (PASS AAA).
   - Secondary / Copyright (`text-slate-400` / `#94A3B8`): 6.96:1 contrast (PASS AA).
   - Accent Tagline (`text-sky-400` / `#38BDF8`): 8.4:1 contrast (PASS AAA).

---

## 🎯 Success Criteria

1. 100% of links in the 4 directory groups render with semantic `<a>` tags and valid `href` paths.
2. Footer renders cleanly with 0 TypeScript errors, 0 ESLint warnings, and 100% passing Vitest unit tests.
3. Mobile layout at 375px viewport displays zero horizontal overflow and satisfies 44px touch targets.

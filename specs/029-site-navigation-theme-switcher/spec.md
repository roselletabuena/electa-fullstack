# Feature Specification: Responsive Site Navigation Bar with Electa Brand Mark & Theme Switcher

**Feature ID**: `029-site-navigation-theme-switcher`  
**Jira Key**: [VS-87](https://the-three-devsketeers.atlassian.net/browse/VS-87)  
**Parent Epic**: [VS-90: Electa Public Landing Page & Event Discovery Portal](https://the-three-devsketeers.atlassian.net/browse/VS-90)  
**Execution Order**: Milestone 1.1 (Foundational Global Shell)  
**Status**: Draft  
**Created**: 2026-10-11  

---

## 🎯 Executive Summary & Overview

The Electa platform requires a unified, persistent, and accessible top navigation header that acts as the foundational shell for public visitors, event voters, and pageant organizers. This component anchors the visual identity of Electa across light and dark modes, showcases the Brutalist-Refined Zero-Radius design language, provides instant access to primary calls-to-action (`+ CREATE EVENT` and `SIGN IN`), and delivers a seamless, zero-flash theme switching mechanism between Opal Light Mode and Obsidian Dark Mode.

---

## 👥 Personas & Actors

1. **Public Visitor / Event Voter**: Discovers active pageants, explores leaderboards, toggles between light and dark visual presentation according to ambient lighting, and signs into their voter account.
2. **Pageant Organizer / Creator**: Quickly jumps to event setup via the primary `+ CREATE EVENT` entry point from anywhere on the public site.
3. **Screen Reader & Keyboard User**: Traverses the header effortlessly with clear ARIA labels, zero keyboard traps, visible focus indicators, and WCAG 2.1 AA contrast.

---

## 📋 Functional Requirements

1. **Sticky Top Shell**: Persistent header fixed at the top of the viewport (`top: 0`, `z-index: 50`) with an hairline border separator (`border-b border-slate-300 dark:border-slate-800`).
2. **Brand Identity Mark**:
   - Renders the Electa logo mark (`ElectaSymbol` SVG / `public/electa-logo.svg`).
   - Renders the bold geometric brand title `ELECTA` (`font-heading font-black tracking-tight`).
   - Renders the official uppercase sub-tagline `VOTE · ENGAGE · CELEBRATE` (`text-[9px] tracking-widest text-slate-500 dark:text-slate-400`).
   - Links directly to the homepage (`/` or `./`).
3. **Theme Switcher (`ThemeToggle`)**:
   - Single-click toggle between Opal Light Mode (`#F8FAFC`) and Obsidian Dark Mode (`#090D16`).
   - Instant visual update without layout shifting or page reloads.
   - Synchronizes state to `localStorage` key `electa-theme`.
   - Keyboard accessible (`Tab`, `Space`, `Enter`) with descriptive `aria-label`.
4. **Primary Action Controls**:
   - `+ CREATE EVENT`: Direct link to `/events/new`, styled in brutalist ghost/portal button style (`border border-slate-300 dark:border-slate-700 font-extrabold uppercase`).
   - `SIGN IN`: Direct link to `/login`, styled in high-contrast solid action button style (`.btn-primary`).
5. **Responsive Viewport Adaptation**:
   - Desktop (`≥ 1024px`): Full logo, title, tagline, theme switcher, `+ CREATE EVENT`, and `SIGN IN` buttons visible with comfortable spacing.
   - Tablet (`768px - 1023px`): Preserves core branding and primary action buttons.
   - Mobile (`< 768px`): Tagline collapses or conceals gracefully, primary buttons adapt with compact padding or icons so content never overflows horizontal screen boundaries.
6. **Zero-Radius Design Geometry**:
   - All buttons, badges, links, and container edges enforce `rounded-none` (`--radius: 0px`).

---

## 🧪 User Scenarios & Acceptance Criteria (Gherkin)

### Scenario 1: Brand Mark and Navigation Header Rendering (Happy Path - Desktop)
- **Given** a visitor navigates to the Electa homepage on a desktop browser (viewport width ≥ 1024px),
- **When** the page header hydrates,
- **Then** the header must display the Electa emblem, the wordmark "ELECTA", and the tagline "VOTE · ENGAGE · CELEBRATE",
- **And** the `+ CREATE EVENT` link pointing to `/events/new` and `SIGN IN` link pointing to `/login` must be rendered with strict zero-radius corners (`rounded-none`),
- **And** the theme toggle button must be visible with an accessible label.

### Scenario 2: Instant Theme Toggling Without Layout Flash
- **Given** the user is viewing the site in default Opal Light Mode,
- **When** the user activates the theme toggle button,
- **Then** the `html` root class must switch from `light` to `dark`,
- **And** the `localStorage` key `electa-theme` must be set to `dark`,
- **And** all header surfaces, borders, and typography must adapt to Obsidian Dark tokens without layout displacement.

### Scenario 3: Responsive Viewport Adaptation on Mobile Devices
- **Given** a user accesses the site on a mobile device (viewport width < 640px),
- **When** the navigation header is rendered,
- **Then** the header must not cause horizontal scrolling (`overflow-x: hidden`),
- **And** the brand title "ELECTA" and logo must remain visible,
- **And** the action buttons (`+ CREATE EVENT` and `SIGN IN`) must remain accessible with minimum touch target sizing (≥ 44px height or padding).

### Scenario 4: Keyboard Navigation and Accessibility Parity
- **Given** a user navigates exclusively using the `Tab` key,
- **When** tabbing through the header interactive elements,
- **Then** focus must sequentially move through the Brand link, Theme Toggle, `+ Create Event` link, and `Sign In` button,
- **And** every focused element must display a distinct high-contrast outline indicator (`outline-2 outline-sky-600 dark:outline-sky-400`),
- **And** pressing `Enter` or `Space` on the theme toggle must switch the active theme.

---

## 🚫 Out of Scope

- Search input and query auto-complete (Reserved for Milestone 1.2: `VS-88`).
- Profile avatar menu or authenticated user dropdown (Reserved for Milestone 1.5 / User dashboard integration).
- Full landing page hero banner assembly (Reserved for Milestone 1.3: `VS-91`).

---

## 🛡️ Non-Functional Requirements & Governance

1. **Accessibility**: Full compliance with WCAG 2.1 AA (text contrast ratio ≥ 4.5:1, UI component border contrast ≥ 3:1).
2. **Performance**: Zero Cumulative Layout Shift (CLS = 0.00) during header mount; header bundle impact < 15KB.
3. **Cross-Browser**: Compatible with Chrome, Safari, Firefox, and Edge on iOS, Android, macOS, and Windows.

# Technical Research & Stack Constraints: Launch Readiness Checklist

**Feature ID**: `038-launch-readiness-checklist`  
**Jira Key**: [VS-106](https://the-three-devsketeers.atlassian.net/browse/VS-106)  

---

## 🔬 Architectural Decisions & Technology Choices

### 1. Embedded vs Modal Onboarding Pattern
- **Decision**: Embed the widget directly into `/events/[slug]/settings/page.tsx` as a non-intrusive container above `<SettingsTabsContainer />`.
- **Rationale**: Research into UX best practices indicates that blocking onboarding modals cause higher drop-off rates and frustration for users returning to update settings. An embedded, inline banner provides persistent orientation without hijacking navigation.
- **Alternatives Considered**:
  - *Floating drawer/dialog*: Requires backdrop management, causes focus trapping, obstructs form inputs.
  - *Full onboarding wizard page*: Prevents organizers from navigating freely to sections they want to customize first.

### 2. State Resolution & Server vs Client Execution
- **Decision**: Hydrate the readiness status on the server in `EventSettingsPage` (RSC) and pass typed snapshot props (`LaunchReadinessSnapshot`) down to `LaunchReadinessChecklist` (`"use client"`).
- **Rationale**:
  - `EventSettingsPage` already executes server-side with database access (`db.event`).
  - Querying aggregate counts (`db.division.count`, `db.contestant.count`, `db.eventAuditLog.count`) on the server avoids client waterfall requests, eliminates layout shifting (CLS), and provides immediate server-rendered markup.
  - The client component manages interactive client concerns: clipboard API integration (`navigator.clipboard`), sonner toast notifications, local storage dismissal state, and smooth collapsible progress transitions.

### 3. Readiness Milestones Data Model
- **Milestone 1: Event Profile**:
  - Condition: Event created in database with valid title, banner, and operational dates. Always `true`.
- **Milestone 2: Divisions**:
  - Condition: `db.division.count({ where: { eventId } }) > 0`.
  - Link: `/events/${slug}/settings?tab=categories`.
- **Milestone 3: Contestants**:
  - Condition: `db.contestant.count({ where: { eventId } }) > 0`.
  - Link: `/events/${slug}/contestants`.
- **Milestone 4: Voting Rules**:
  - Condition: `db.eventAuditLog.count({ where: { eventId, action: "UPDATE_VOTING_RULES" } }) > 0` OR custom voting rules configured.
  - Link: `/events/${slug}/settings?tab=voting-rules`.

### 4. Branding & Design System Conformance
- **Zero-Radius Geometry**: Strictly apply `rounded-none` to card, progress bar, links, buttons, and icons.
- **Typography Tokens**:
  - `font-heading` (`Outfit`, `font-extrabold`) for milestone headings and progress counter.
  - `font-sans` (`Sora`) for instructions and subtext.
  - `font-mono` (`JetBrains Mono`) for percentage calculations and URL references.
- **Color Tokens & Contrast**:
  - Light mode: Pure white card `#FFFFFF` on Opal slate-50 `#F8FAFC`, border `#CBD5E1` (`border-slate-300`), text `#0F172A` (`text-slate-900`), secondary `#334155` (`text-slate-700`).
  - Dark mode: Obsidian `#0d1424` card, border `#1E293B` (`border-slate-800`), text `#F8FAFC` (`dark:text-slate-100`).
  - Accent / Progress: Sky `#0284C7` / `#0369A1` / Emerald `#059669` for completion states.

### 5. Toast Feedback & Clipboard Integration
- Use `@/components/ui/sonner` (`toast.success`) conforming to Electa's zero-radius brutalist sonner styling.
- Provide a robust fallback copying strategy using temporary textarea for environments without clipboard permissions.

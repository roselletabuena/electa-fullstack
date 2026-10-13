# Technical Research & Architecture Notes: Smart Operational Timeline & Draft Recovery

**Feature ID**: `036-smart-operational-timeline`  
**Jira Key**: [VS-105](https://the-three-devsketeers.atlassian.net/browse/VS-105)  
**Parent Epic**: [VS-102](https://the-three-devsketeers.atlassian.net/browse/VS-102)  

---

## 1. Technical Scope & Stack Constraints

- **Language & Environment**: Next.js 16 App Router (Client Component `"use client"` within form boundary), React 19, TypeScript 5 Strict.
- **Form State Library**: `react-hook-form` with uncontrolled/controlled synchronizations via `setValue` and `useWatch`.
- **Styling**: Tailwind CSS v4, strictly enforcing Zero-Radius (`rounded-none`), Dual-Theme Parity, WCAG 2.1 AA colors.
- **Storage Target**: Browser `window.sessionStorage` (`electa:create_event_draft`).

---

## 2. Quick Duration Arithmetic Architecture

### Datetime-Local Formatting Requirements
HTML `<input type="datetime-local">` requires strings in the exact format:
```text
YYYY-MM-DDTHH:mm
```

When calculating presets:
- Duration Presets supported:
  - `7` days: `7 * 24 * 60 * 60 * 1000` ms
  - `14` days: `14 * 24 * 60 * 60 * 1000` ms
  - `30` days: `30 * 24 * 60 * 60 * 1000` ms
- Calculation strategy:
  Given `startsAt` value (e.g. `2026-10-14T10:00`):
  `endsAtDate = new Date(startDate.getTime() + days * 86_400_000)`
  Formatted with zero-padded months, days, hours, and minutes.
- Active Preset Matching:
  A duration chip is marked active if:
  `Math.round((endDate.getTime() - startDate.getTime()) / 86_400_000) === preset.days`
  and the difference in minutes is 0 modulo 24 hours.

---

## 3. Storage Architecture: `sessionStorage` vs `localStorage`

### Decision: `sessionStorage`
- **Scope**: Tab-specific session lifecycle.
- **Rationale**:
  1. Prevents stale cross-tab collisions or multi-window state overwriting when an organizer edits different events in parallel tabs.
  2. Cleared naturally when the browser session terminates, minimizing zombie draft accumulation.
  3. Survives page refreshes (`F5`), browser tab back/forward navigations, and accidental closes within restored sessions.

### Safe Browser Storage Guard
```typescript
function getSafeSessionStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}
```
All reading and writing must be wrapped in `try/catch` to gracefully degrade if `sessionStorage` is disabled (e.g. private browsing storage quota restrictions).

---

## 4. UI / UX Design Specifications

### Preset Chips
- Unselected:
  ```css
  bg-white text-slate-700 border border-slate-300 hover:bg-slate-50
  dark:bg-white/5 dark:text-slate-300 dark:border-white/10 dark:hover:bg-white/10
  text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-none transition-colors
  ```
- Selected / Active:
  ```css
  bg-sky-600 text-white font-bold border border-sky-600
  dark:bg-sky-500 dark:text-slate-950 dark:border-sky-500
  text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-none
  ```

### Restored Draft Alert
- Container:
  ```css
  rounded-none border border-sky-300 bg-sky-50 p-4 text-xs text-sky-900
  dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300
  ```
- Clear Draft Button:
  ```css
  rounded-none border border-sky-400 bg-white px-2.5 py-1 text-xs font-extrabold uppercase tracking-wider text-sky-900
  hover:bg-sky-100 dark:border-sky-500/50 dark:bg-slate-900 dark:text-sky-200 dark:hover:bg-slate-800
  ```

---

## 5. Security & Boundary Isolation

- Draft values stored in client `sessionStorage` contain only organizer event metadata (`title`, `slug`, `description`, `bannerUrl`, `startsAt`, `endsAt`). No passwords or secrets are stored.
- Restored values are validated through standard Zod schemas upon submission.

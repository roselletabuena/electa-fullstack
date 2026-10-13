# Research & Technical Decisions: Archetype-Tailored Event Wizard & Taxonomy UI

**Feature ID**: `041-archetype-tailored-event-wizard`  
**Ticket**: [VS-84](https://the-three-devsketeers.atlassian.net/browse/VS-84)  
**Date**: 2026-10-13  

---

## 1. Technical Stack & Dependencies

- **Frontend Framework**: Next.js 16 (App Router), React 19 Server/Client Components.
- **Form Management**: `react-hook-form` with `@hookform/resolvers/zod`.
- **Validation**: Zod 3.24+ schemas validating dynamic archetype-conditional properties.
- **UI Components & Icons**: Lucide React, Shadcn UI / Radix Primitives.
- **State Management**: Local multi-step form state + `sessionStorage` draft persistence (aligned with existing `event-draft-storage.ts`).
- **Data Fetching / Mutations**: TanStack Query (`useQuery`, `useMutation`), Server Actions (`createEventAction`).
- **Styling**: Tailwind CSS v4, brutalist-refined zero-radius (`rounded-none`), Opal slate design system.

---

## 2. Architectural Analysis & Decisions

### Decision 1: Wizard Flow Architecture vs. Monolithic Form
- **Option A**: Keep single massive scrolling page with conditional panels.
  - *Cons*: Overwhelming for users setting up student elections or hackathons with positions/tracks.
- **Option B**: Stepped Wizard with Clean Separation (`event-creation-wizard.tsx`).
  - **Step 1: Event Identity & Schedule**: Title, URL slug, dates, banner, description (with live slug verification and duration presets).
  - **Step 2: Archetype & Structure**: Archetype selector (`PAGEANT`, `STUDENT_COUNCIL`, `HACKATHON`, `CUSTOM`) + dynamic taxonomy editor (Offices/Positions with seat limits for Student Council, Tracks for Hackathon, Divisions for Pageant).
  - **Step 3: Review & Finalize**: Summary of archetype settings, launch readiness preview, and creation submit.
  - *Decision*: **Option B**. Allows progressive disclosure and dynamic validation per step.

### Decision 2: Taxonomy Configuration in Wizard (Draft vs. Immediate DB Write)
- During event creation, the event does not exist in the database yet until the form is submitted.
- *Decision*: In-memory draft taxonomy items (positions, tracks, divisions) managed in React Hook Form state. When the event is created via `createEventAction`, the service creates the `Event` and transactionally inserts the initial positions/divisions/tracks within the same atomic Prisma transaction.
- In the Settings dashboard (`/events/[slug]/settings?tab=categories`), the taxonomy editor connects directly to live API routes / queries using TanStack Query mutations (`createEventPosition`, `updateEventPosition`, etc.).

### Decision 3: Terminology and Preset Mapping
| Archetype | Grouping Term | Item Term | Selection Rule | Default Presets |
| :--- | :--- | :--- | :--- | :--- |
| `PAGEANT` | Division | Contestant | 1 per voter per category | Male, Female, LGBTQ+, Teen |
| `STUDENT_COUNCIL` | Position / Office | Candidate | Configurable (1 to 50 seats) | President (1), VP (1), Secretary (1), Treasurer (1), Councilors (5) |
| `HACKATHON` | Track | Team / Project | 1 per voter | Web & Cloud, AI & Data, Social Impact |
| `CUSTOM` | Category / Group | Nominee | Configurable | General Group A, Group B |

---

## 3. Accessibility & Responsiveness Strategy

- **WCAG 2.1 AA Compliance**:
  - Contrast ratios exceeding 4.5:1 for body copy and 3:1 for large headings/borders in both light (`#F8FAFC`) and dark (`#020617`) modes.
  - Interactive radio selector tiles have distinct selected borders (`border-sky-600 bg-sky-50/50 dark:border-sky-500 dark:bg-sky-500/10`) and unselected states (`border-slate-300 dark:border-slate-800`).
  - Screen reader attributes: `role="radiogroup"`, `aria-checked`, `aria-describedby` for terminology and archetype descriptions.
  - Minimum 44px touch targets on buttons, steppers, and pill controls.
- **Responsive Viewports**:
  - Multi-column grid on desktop (`sm:grid-cols-2`, `lg:grid-cols-4` for archetypes), collapsing to single column on mobile (`grid-cols-1`) down to 320px with zero horizontal scroll.

# Technical Research & Design Decisions: Hackathon Exhibition Grid & Project Submission Form

**Feature ID**: `045-hackathon-exhibition-grid-project-submission-form`  
**Ticket**: [VS-113](https://the-three-devsketeers.atlassian.net/browse/VS-113)  

---

## 1. Context & Architectural Analysis

### Existing Capabilities
1. **Backend Service & Route Handlers**:
   - `src/features/hackathons/services/submission-service.ts` provides `createProjectSubmission` and `getProjectSubmissions(eventIdOrSlug, filter)`.
   - `src/app/api/events/[slug]/submissions/route.ts` provides `GET` and `POST` endpoints.
   - `src/lib/validations/hackathon-submission.ts` provides `createProjectSubmissionSchema` and regex matchers for GitHub/GitLab and video platforms.
2. **Brutalist Design Tokens & Tailwind v4**:
   - Zero-radius architecture (`rounded-none`, `--radius: 0px`).
   - Opal light mode baseline (`#F8FAFC`, `text-slate-900`) with dark mode overrides (`dark:bg-[#0d1424]`, `dark:text-slate-100`).
   - Tailwind v4 gradient syntax (`bg-linear-to-*`).
3. **URL State Synchronization**:
   - `nuqs` is configured globally in `src/app/layout.tsx` (`NuqsAdapter`).
   - Allows shallow routing for track filters without full page re-renders, enabling deep linking to specific tracks (`?track=ai-agents`).

---

## 2. Key Design Decisions

### Decision 1: Server Actions for Form Submissions vs Direct Client Fetch
- **Context**: Electa Constitution §II dictates: "Direct UI form submissions MUST use Server Actions".
- **Decision**: Implement `submitProjectSubmissionAction` in `src/features/hackathons/actions/submit-project.ts`.
- **Rationale**: Keeps form handling server-first, executes input validation with Zod, checks user session via `getSession()`, and triggers `revalidatePath` to keep the exhibition grid updated.

### Decision 2: URL State Management via `nuqs`
- **Context**: Visitors frequently share or bookmark track-specific views (e.g. `?track=AI+%26+Agents`).
- **Decision**: Use `useQueryState("track", parseAsString.withDefault("all").withOptions({ shallow: true }))`.
- **Rationale**: Instant filter responsiveness, no duplicate network roundtrips, browser back/forward history support.

### Decision 3: Zero-Radius Brutalist Aesthetics
- **Context**: Electa design rules mandate strict zero-radius (`rounded-none`), Outfit headings, Sora sans, and JetBrains mono.
- **Decision**: All project cards, badges, dialogs, inputs, and buttons use sharp 0px corners, high-contrast borders (`border-slate-300 dark:border-slate-800`), and clear status indicators.

### Decision 4: Accessible Contrast & Screen Reader Support
- **Context**: WCAG 2.1 AA dual-theme parity rule.
- **Decision**: External links (GitHub, live demo, video) include explicit accessible text or `aria-label`, visible focus rings, and contrast compliant text colors (`text-slate-900` / `dark:text-slate-100`).

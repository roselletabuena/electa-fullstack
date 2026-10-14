# Feature Specification: Hackathon Exhibition Grid & Project Submission Form

**Feature ID**: `045-hackathon-exhibition-grid-project-submission-form`  
**Ticket**: [VS-113](https://the-three-devsketeers.atlassian.net/browse/VS-113)  
**Parent Epic**: [VS-82](https://the-three-devsketeers.atlassian.net/browse/VS-82) (`Multi-Archetype Election Engine: School Elections, Hackathons & Beyond`)  
**Status**: Draft  
**Created**: 2026-10-14  

---

## 1. Overview & Business Value

Electa empowers modern hackathons with multi-track innovation showcases, team project registration, judge scoring, and community awards. While the submission service and schema were established in BE: 3.1 (VS-112), hackathon participants and demo day visitors need an interactive, accessible, and brutalist-refined frontend experience to:
1. Submit team projects through an intuitive, validated multi-field form with real-time feedback.
2. Explore submitted projects in a track-filterable exhibition grid with URL state synchronization via `nuqs`.
3. Inspect project cards featuring live demo links, repository badges, tech stacks, team member rosters, and media links.

This feature fulfills the frontend requirements of Sprint 3 Hackathon milestone (FE: 3.2), setting the foundation for judge rubric scoring (FE: 3.4) and People's Choice voting (FE: 3.5).

---

## 2. Actors & User Stories

### User Story
> **As a** hackathon participant and demo day visitor,  
> **I want to** submit our project through an intuitive form and browse all submitted projects in a track-filterable exhibition grid,  
> **so that** our work is presented cleanly to judges and community members can explore hackathon innovations.

### Key Personas
- **Hackathon Participant / Team Lead**: Authenticated user submitting or managing their team's project deliverables (title, tagline, description, GitHub/GitLab repo, live demo, video presentation, team members, track tags).
- **Demo Day Visitor / Community Member**: Explores project submissions, filters by track (e.g. AI & Agents, DeFi, Developer Tooling), views project overviews, and follows external links.
- **Judge**: Previews project submissions and navigates to live demos or source repositories ahead of scoring rubric evaluation.

---

## 3. Gherkin Acceptance Scenarios

### Scenario 1: Happy Path - Project Card Rendering with Links
- **Given** an approved hackathon submission with a GitHub repo and live demo URL
- **When** the exhibition grid renders the project card
- **Then** the card displays project title, tagline, track badge, and accessible external links to the repository and demo with `rel="noopener noreferrer"`.

### Scenario 2: Validation & Error Handling - Incomplete Submission Form
- **Given** a team lead submitting their project
- **When** required fields (title, description, repository URL, at least one track tag) are left blank or invalid
- **Then** the form triggers inline validation errors and prevents submission without reloading the page.

### Scenario 3: Edge Case - Track Filter Navigation via URL
- **Given** a visitor selecting the `"AI & Agents"` track filter pill
- **When** the filter is clicked
- **Then** the URL updates with `?track=AI+%26+Agents` using `nuqs` and the grid filters projects instantaneously without a full page reload.

### Scenario 4: Empty Filter State
- **Given** an exhibition grid with projects in "AI & Agents" and "Web3"
- **When** a visitor filters by an empty track or searches for a term with no matches
- **Then** the grid displays an accessible empty state with a "Clear Filter" action button.

### Scenario 5: Submission Success & Dialog Dismissal
- **Given** an authenticated participant filling out the submission dialog
- **When** valid information is submitted and the server action succeeds
- **Then** the dialog displays a success confirmation, refreshes the exhibition list, and dismisses smoothly.

---

## 4. Technical Scope & Architecture

- **Layer**: Frontend UI Components, Server Action, and Route Page
- **Target Files / Directories**:
  - `src/features/hackathons/components/project-card.tsx`: Zero-radius brutalist card rendering project details, track chips, external links, and team members.
  - `src/features/hackathons/components/submission-form.tsx`: Zero-radius accessible dialog and form component validated via `createProjectSubmissionSchema`.
  - `src/features/hackathons/components/exhibition-grid.tsx`: Interactive responsive grid with `nuqs` URL filter pills and quick-launch modal triggers.
  - `src/features/hackathons/actions/submit-project.ts`: Secure Server Action invoking `createProjectSubmission` with session authentication.
  - `src/app/(public)/events/[slug]/projects/page.tsx`: RSC page fetching event metadata and initial submissions.
- **Architectural & Design Constraints**:
  - Default Light Mode (`#F8FAFC`), strict zero-radius (`rounded-none`).
  - Track filters powered by `nuqs` URL search params.
  - Interactive project cards with external link chips and media embeds.
  - WCAG 2.1 AA dual-theme color contrast compliance.
  - Server-first architecture with `<Suspense>` boundary wrapping client components.

---

## 5. Quality Gate & Definition of Done

- Strict TypeScript 5 (no `any`, no non-null assertions `!`).
- Component unit tests pass in Vitest (`npm run test:unit`).
- WCAG 2.1 AA color contrast verified in Light and Dark modes.
- Zero-radius styling strictly enforced (`rounded-none`).
- Passes typecheck (`npm run typecheck`) and linter (`npm run lint`).

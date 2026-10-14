# Feature Specification: Demo Day Attendee People's Choice Voting & Stage Leaderboard

**Feature ID**: `046-peoples-choice-voting-stage-leaderboard`  
**Ticket**: [VS-116](https://the-three-devsketeers.atlassian.net/browse/VS-116)  
**Parent Epic**: [VS-82](https://the-three-devsketeers.atlassian.net/browse/VS-82) (`Multi-Archetype Election Engine: School Elections, Hackathons & Beyond`)  
**Status**: Ready for Implementation  
**Created**: 2026-10-15  

---

## 1. Overview & Business Value

Hackathon Demo Days combine official judge scoring with attendee excitement through "People's Choice" awards. During live project exhibitions and pitch rounds, event attendees want a rapid 1-tap voting interaction to cast their single allotted free vote for their favorite hackathon project. Simultaneously, event organizers and stage directors require a high-impact, fullscreen Stage Display view suitable for auditorium projectors, LED walls (1080p up to 4K), and livestream broadcasts.

This feature delivers:
1. **Attendee People's Choice 1-Tap Vote Button (`peoples-choice-vote-button.tsx`)**:
   - Integrated into hackathon project cards (`project-card.tsx`) and exhibition views.
   - Enforces a strict quota of exactly 1 free vote per attendee session for each hackathon event.
   - Immediate responsive UI feedback shifting from `"Vote People's Choice"` to active `"Voted"` state.
   - Accessible toast notification if a voter attempts to vote again on another card (`"You have already cast your People's Choice vote for this hackathon."`).
2. **Dedicated Fullscreen Stage Leaderboard (`stage-leaderboard.tsx` & `/events/[slug]/stage/page.tsx`)**:
   - Projector-optimized layout supporting standard 16:9 displays up to 4K resolution.
   - Default Light Mode (`#F8FAFC`) with crisp white cards (`#FFFFFF`), hairline slate borders (`#CBD5E1`), and strict zero-radius brutalist geometry (`rounded-none`). Dual-theme parity with cinematic dark mode (`#0d1424`).
   - Real-time polling/SSE data synchronization reflecting live rankings, vote counts, percentage shares, and podium spots without full-page reloads or layout jitter.
   - Fullscreen keyboard shortcut toggle (`F` key) and unobtrusive operator controls.
   - Track filter pills for filtering standings by specific tracks or viewing overall leaderboards.

---

## 2. Actors & User Stories

### Primary Actors
- **Demo Day Attendee / Hackathon Fan**: Visits the public hackathon project exhibition, reviews projects, and casts their single People's Choice vote with 1 tap.
- **Event Organizer / Stage Producer**: Navigates to `/events/[slug]/stage` on a presentation laptop connected to auditorium projectors or LED backdrops to display live crowd favorites.

### User Story
> **As a** Demo Day attendee and hackathon fan,  
> **I want to** cast a single People's Choice vote for my favorite hackathon project and view a live projector stage leaderboard,  
> **so that** the audience can celebrate the crowd-favorite team during the awards ceremony.

---

## 3. Gherkin Acceptance Scenarios

### Scenario 1: Happy Path - Attendee Casts People's Choice Vote
- **Given** an attendee on the public hackathon project page
- **When** they click `"Vote People's Choice"` on an eligible project card
- **Then** the vote is confirmed via server action,
- **And** the button shifts to an active state `"Voted"` with high-contrast accent styling,
- **And** remaining vote credits for the hackathon event decrement to 0,
- **And** an accessible toast notification confirms: `"Vote recorded! You voted for [Project Title]."`.

### Scenario 2: Validation & Error Handling - Duplicate Vote Blocked
- **Given** an attendee who has already cast their People's Choice vote in the current event
- **When** they attempt to click vote on another project card
- **Then** the action is prevented,
- **And** an accessible toast alert displays: `"You have already cast your People's Choice vote for this hackathon."`,
- **And** no duplicate vote records or counts are created.

### Scenario 3: Edge Case - Fullscreen Projector Stage Display
- **Given** an organizer projecting `/events/[slug]/stage` onto an auditorium screen
- **When** attendee votes arrive in real time
- **Then** the stage leaderboard updates project rankings and vote counts smoothly without page refresh or layout jitter,
- **And** pressing the `F` key or clicking the fullscreen button enters native HTML5 fullscreen mode.

### Scenario 4: Archetype Guard - Non-Hackathon Events
- **Given** a public event whose archetype is not `HACKATHON` (e.g. `PAGEANT` or `STUDENT_COUNCIL`)
- **When** visiting `/events/[slug]/stage`
- **Then** an informative brutalist notice informs the user that the Stage Leaderboard is only available for Hackathon events,
- **And** provides an accessible link back to the main event overview.

---

## 4. Architectural & UI Constraints

1. **Design System & Zero-Radius Geometry**:
   - Strict 0px border radius (`rounded-none`, `--radius: 0px`).
   - Default theme is Light Mode: Opal Slate-50 `#F8FAFC`, cards `#FFFFFF`, borders `#CBD5E1`.
   - Dual-theme parity with `dark:` classes (`dark:bg-[#0d1424]`, `dark:border-slate-800`).
2. **Brand Typography**:
   - Headings: **Outfit** (`font-heading`, `font-extrabold` / `font-black`).
   - Body & UI: **Sora** (`font-sans`).
   - Numbers & Metrics: **JetBrains Mono** (`font-mono`, tabular numbers).
3. **Accessibility (WCAG 2.1 AA)**:
   - Minimum 4.5:1 text color contrast on buttons, labels, and badges.
   - Distinct unselected vs active pill states with explicit borders and visible hover rings.
   - Accessible live regions (`aria-live="polite"`) for real-time rank updates.
4. **Security & Session Concurrency**:
   - Rate-limited to 1 free vote per attendee session using `ProjectVote` with atomic unique constraint `@@unique([eventId, voterId])`.
   - Authenticated user ID or verified attendee session cookie.

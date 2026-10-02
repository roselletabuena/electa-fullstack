# Feature Specification: Fullscreen Stage Presentation Mode for LED Screens

**Feature Branch**: `feature/VS-23-fullscreen-stage-presentation`  
**Jira Key**: `VS-23`  
**Created**: 2026-10-02  
**Status**: Draft

**Input**: User Story: "VS-23: Fullscreen Stage Presentation Mode for LED Screens. As a pageant director, I want a dedicated fullscreen presentation view formatted for stage LED walls (16:9 / 4K) to show live tallies and dramatic rank reveals during rehearsals and coronation night, so that live audience production value is maximized."

---

## 1. Executive Summary & Value Proposition

During live pageant finals and rehearsals, directors broadcast live tallies and winner announcements directly onto ultra-wide stage LED walls and high-lumen 4K projectors. Standard web dashboards include navigation headers, sidebars, dense tables, and low-contrast controls unsuitable for stage distance viewing.

The **Fullscreen Stage Presentation Mode** provides an immersive, distraction-free, 16:9 stage display at `/events/:slug/stage-display` featuring:

1. **Stage-Optimized Luxury Dark Theme**: Deep cinematic blacks (`#050811`), glowing electric accents (Amber Gold `#F59E0B`, Neon Cyan `#06B6D4`, Platinum Silver), oversized typography, and zero-radius high-contrast brutalist cards engineered for 100+ feet readability.
2. **Dynamic Live Tallies**: Real-time ranking displays with smooth score counters and division/category filtering.
3. **Dramatic Winner Reveal Sequences**: Staged coronation reveal modes (e.g., 3rd Runner-Up → 2nd Runner-Up → 1st Runner-Up → Queen/Winner) with suspenseful drumroll/fanfare audio effects (Web Audio API synthesis), spotlight pulse animations, and celebratory particle/confetti explosions.
4. **Director Controls**: Discreet operator HUD with keyboard hotkeys (`F` for fullscreen, `Space` / `ArrowRight` to advance reveal step, `R` to reset, `M` to mute sound) and hidden control dock for live rehearsals and coronation night.

---

## 2. User Scenarios & Acceptance Criteria

### User Story 1 - Dedicated Big-Screen Route & 16:9/4K Dark Luxury View (Priority: P1) 🎯 MVP

As a pageant stage director,  
I want to navigate to `/events/:slug/stage-display` and enter a distraction-free 16:9 fullscreen view with high-contrast luxury styling,  
So that the audience and production crew see vibrant, crystal-clear standings on stadium LED screens.

**Independent Test**: Navigate to `/events/[slug]/stage-display`, verify full viewport utilization with no standard navigation headers or footers, dark luxury palette (`#050811` background, gold/slate accents), and test responsive scaling on 1080p, 1440p, and 4K viewports.

**Acceptance Scenarios**:

1. **Given** a valid event slug, **When** visiting `/events/:slug/stage-display`, **Then** the page renders a fullscreen viewport layout without global app navigation or footer chrome.
2. **Given** the stage display, **When** viewed on 16:9 displays (1920x1080 up to 3840x2160 4K), **Then** all contestant cards, ranks, names, and vote tallies scale proportionally using responsive typography and high-contrast WCAG 2.1 AA compliant color pairings.
3. **Given** an operator pressing the `F` key or clicking the stage HUD button, **Then** the browser enters native HTML5 Fullscreen mode seamlessly.

---

### User Story 2 - Real-Time Live Tally & Stage Leaderboard Mode (Priority: P1) 🎯 MVP

As a stage technician and audience viewer,  
I want live vote tallies and rankings to update in real time on the LED wall,  
So that the audience experiences the live suspense of changing positions before final freeze or announcement.

**Acceptance Scenarios**:

1. **Given** the stage presentation in "Live Tally" mode, **When** new votes are cast, **Then** the podium and leaderboard cards update dynamically with animated counter increments.
2. **Given** an event with multiple divisions (e.g. Miss, Teen, Mister) or award categories, **When** the director selects a division/category via the operator dock or query param `?divisionId=...&categoryId=...`, **Then** the stage view seamlessly transitions to display only candidates in that category.
3. **Given** an active Mystery Freeze window on the event, **When** the stage view is loaded in public mode, **Then** it shows the dramatic "Mystery Freeze Active — Standings Concealed" visual state without leaking secret ranks.

---

### User Story 3 - Dramatic Winner Reveal Sequence & Effects (Priority: P2)

As a pageant director,  
I want to trigger step-by-step winner reveal sequences with audio cues and particle effects,  
So that coronation announcements build maximum suspense and celebrate winners with high production value.

**Acceptance Scenarios**:

1. **Given** the stage display in "Reveal Sequence" mode for Top N (e.g., Top 5 or Top 3), **When** initiated, **Then** contestant identities are masked with high-suspense glowing placeholders.
2. **Given** the director presses `Space` or clicks "Next Reveal", **Then** the sequence reveals ranks in reverse order (e.g., 2nd Runner Up → 1st Runner Up → Title Winner) with spotlight card expansion.
3. **Given** a rank or final winner is unveiled, **When** the card flips/animates into view, **Then** an integrated audio synthesizer triggers dramatic sound effects (chime/drumroll/fanfare) and a celebratory 4K confetti particle burst covers the screen.
4. **Given** operator controls, **When** toggling the mute button or pressing `M`, **Then** all sound triggers can be silenced immediately.

---

## 3. Edge Cases & Safeguards

1. **Audio Autoplay Restrictions**: Browsers block audio playback prior to user interaction. The stage display HUD must display an initial "Click to Enable Audio & Enter Stage Mode" overlay prompt so that audio context starts cleanly.
2. **Aspect Ratio Flexibility**: While designed for standard 16:9 LED backdrops (1920x1080 and 3840x2160), the layout must use letterboxing/pillarboxing with CSS `aspect-video` or fluid viewport units to avoid distortion on ultrawide or non-standard aspect ratios.
3. **Offline / Network Glitch Resilience**: If WebSocket or realtime connection is temporarily interrupted during live production, the stage display must display a subtle indicator in the operator dock without interrupting the visual screen presentation or throwing unhandled errors.
4. **Zero-Radius Branding Compliance**: In accordance with the Electa design system, all cards, badges, modal docks, and countdown timers must have strict 0px radius (`rounded-none`).

---

## 4. Dependencies & Assumptions

- Relies on event and contestant data from Prisma singleton (`src/lib/db.ts`) with mock data fallback (`getMockEventBySlug`).
- Integrates with rank calculation logic (`calculateLeaderboardRanks`) from `@/features/leaderboard/utils/rank-calculator`.
- Uses Web Audio API for zero-latency, offline-capable sound effects without external audio assets.
- Uses HTML5 Canvas for high-performance 60fps confetti and particle bursts.
- Uses `framer-motion` for smooth layout transitions and spotlight reveals.

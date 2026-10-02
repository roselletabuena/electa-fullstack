# Feature Specification: Viral Social Sharing "I Voted" Story Generator

**Feature Branch**: `feature/VS-25-viral-social-story-generator`  
**Jira Key**: `VS-25`  
**Created**: 2026-10-02  
**Status**: In Progress

**Input**: User Story: "VS-25: Viral Social Sharing 'I Voted' Story Generator. As a voter, I want a downloadable 9:16 Instagram/TikTok/Facebook Story card immediately after voting, so that I can campaign for my favorite candidate on my personal social channels."

---

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Instant Post-Vote Story Generator Modal (Priority: P1) 🎯 MVP

As an active voter, I want an automatic post-vote celebration modal offering a 9:16 high-resolution story card with my candidate's photo, number, event title, and dynamic voting QR code, so that I can immediately share my support on Instagram, TikTok, and Facebook.

**Why this priority**: Core viral growth loop converting every single vote into an organic social media campaign that recruits new voters.

**Independent Test**: Can be tested by casting a vote on any candidate, verifying the post-vote modal pops up with a live 9:16 story preview, candidate portrait, official ballot badge, and dynamic QR code.

**Acceptance Scenarios**:

1. **Given** a voter successfully submits a free or boosted vote, **When** the voting transaction succeeds, **Then** a "You Voted!" celebration modal appears with a 9:16 story preview.
2. **Given** the 9:16 story preview, **When** it renders, **Then** it incorporates:
   - Candidate high-resolution photo with high-contrast scrim overlay
   - Official contestant badge: `Contestant #[Number] • [Candidate Name]`
   - Event title & category nomination tag
   - Scannable dynamic QR code leading to candidate's direct voting URL
   - Electa / VoteSphere branding watermark
3. **Given** a user clicking "Download Story", **When** triggered, **Then** a crystal-clear 1080x1920 PNG file downloads immediately with the filename `[event-slug]-candidate-[number]-story.png`.
4. **Given** a device supporting the Web Share API (mobile Safari / Chrome), **When** clicking "Share Story", **Then** the native OS share sheet opens with the generated image file and pre-filled campaign caption.
5. **Given** a user clicking "Copy Voting Link", **When** clicked, **Then** the candidate's direct voting link is copied to the clipboard with an interactive toast notification.

---

### User Story 2 - Customizable Story Themes (Priority: P2)

As a voter or pageant fan, I want to switch between different aesthetic 9:16 story card styles (e.g. "Luxury Dark Opal", "Vibrant Gold Coronation", "Modern Minimalist"), so that the card matches my personal social aesthetic.

**Acceptance Scenarios**:

1. **Given** the Story Generator modal is open, **When** selecting a theme pill (e.g. _Coronation Gold_, _Midnight Luxury_, _Clean Opal_), **Then** the canvas updates its palette, font accents, and gradient scrims without re-generating from scratch.

---

## Edge Cases

- **What happens if the candidate avatar fails to load over CORS?** The generator falls back to a clean procedural geometric gradient badge with candidate initials and official number, ensuring image download never crashes.
- **What happens if the browser does not support `navigator.share` or file sharing?** The system gracefully falls back to direct image download + clipboard copy without errors.
- **What happens on low-memory mobile devices?** The canvas renders offscreen at exact 1080x1920 resolution, converts to a blob URL, and frees memory upon modal dismissal.

---

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST provide a reusable client-side 9:16 Canvas/SVG Story Generator engine that outputs 1080x1920 high-resolution PNGs.
- **FR-002**: System MUST generate scannable dynamic QR codes encoding the candidate's canonical voting URL (`https://.../events/[slug]?contestantId=[id]`).
- **FR-003**: System MUST provide a post-vote celebration modal integrated directly into the voting workflow.
- **FR-004**: System MUST support native 1-tap sharing via `navigator.share()` with file payload and fallback to PNG file download.
- **FR-005**: System MUST provide a 1-tap "Copy Voting Link" with copy feedback state.
- **FR-006**: All components MUST follow Electa Brutalist-Refined zero-radius geometry, Outfit / Sora typography, and WCAG 2.1 AA dual-theme contrast.

---

## Success Criteria _(mandatory)_

- **SC-001**: 9:16 Story Card generation completes within <300ms from modal open.
- **SC-002**: Downloaded PNG is crisp 1080x1920px (standard Instagram/TikTok/Facebook Story aspect ratio).
- **SC-003**: 100% of generated QR codes scan cleanly to the candidate's voting URL.
- **SC-004**: Zero CORS crashes when rendering candidate avatar images.

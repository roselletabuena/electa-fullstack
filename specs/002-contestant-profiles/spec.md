# Feature Specification: Contestant Profiles & Multi-Media Showcase

**Feature Branch**: `002-contestant-profiles`  
**Jira Key**: `VS-19` (Parent Epic: `VS-20`)  
**Created**: 2026-09-26  
**Status**: Ready for Review  
**Input**: User description: "As a voter or contestant, I want rich candidate profiles with high-resolution photo galleries, bio/advocacy statements, social media links, and category tagging (Male, Female, LGBTQ+, Teen), so that I can showcase my candidacy and learn about candidates. Acceptance criteria: Photo Gallery: Support up to 10 high-resolution photos per candidate with client-side aspect cropping and CDN optimization. Candidate Bio: Bio fields for candidate number, hometown, advocacy statement, height, and verified social links (IG, TikTok, FB). Multi-Category Tagging: Contestants can be grouped by division (e.g. Male vs Female) or award categories (e.g. People's Choice, Best in Swimsuit, Best in Evening Gown). Embedded Media: Embedded video reel / TikTok / YouTube Shorts player support."

## Clarifications

### Session 2026-09-26

- Q: Who is authorized to create and edit contestant profiles and media assets in this release? → A: Organizer-Managed Curation: Only authenticated event organizers can add, update, crop media, and publish contestant profiles to ensure official roster uniformity and security.
- Q: How should the relationship between contestant divisions and award categories be structured in the data model and UI? → A: Single Division + Multiple Awards: Exactly 1 primary division per contestant (e.g., Female, Male, LGBTQ+, Teen); 0 to N award categories per contestant (e.g., People's Choice, Best in Swimsuit). Candidate numbers are strictly unique per division within an event.
- Q: What aspect ratio standard should be enforced for contestant photo gallery cropping and roster cards? → A: 4:5 Portrait Standard: Client-side cropper defaults to 4:5 vertical framing; cover photo and gallery thumbnails render in uniform 4:5 aspect ratio to maintain luxury visual elegance and prevent layout shifting.
- Q: Which external platforms should be supported for embedded candidate video reels and media showcase? → A: YouTube (Shorts & Videos), TikTok, Instagram Reels, and Facebook Videos/Reels: System supports URL parsing, embed generation, and responsive framing across all four major video platforms.
- Q: How should contestant withdrawal, disqualification, or temporary hiding be handled during an active contest? → A: Soft Status Lifecycle: Contestants maintain lifecycle statuses (`ACTIVE`, `HIDDEN`, `WITHDRAWN`). On public event views, candidates with status `HIDDEN` or `WITHDRAWN` are hidden from the public roster and voting pages. In organizer contestant management, organizers can view all contestants (including `HIDDEN` and `WITHDRAWN`) with their status badges to adjust profile data, monitor vote tallies, and toggle statuses, while preserving transaction history and audit trails for financial reconciliation.

---

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Voter Candidate Discovery, Media Reel & Detail Inspection (Priority: P1)

As a public visitor or voter, I want to explore contestant profiles with high-resolution photo galleries, bio/advocacy statements, embedded short-form video reels, and verified social links so that I can learn about each candidate and decide whom to support.

**Why this priority**: Core user engagement driver for public audiences and voting conversion. Voters need an immersive visual and informational presentation of candidates to build emotional connection and cast informed votes.

**Independent Test**: Can be tested by navigating to an event's contestant roster and individual candidate modal/page, browsing the photo gallery carousel, playing embedded video reels (YouTube Shorts, TikTok, Instagram Reel), and verifying bio attributes (candidate number, hometown, advocacy, height, social links).

**Acceptance Scenarios**:

1. **Given** an event has registered contestants with media and bio details, **When** a voter views a contestant profile, **Then** the system displays the candidate's number, full name, hometown, height, official advocacy statement, and verified social media links.
2. **Given** a contestant has uploaded multiple photos (up to 10), **When** a voter opens the candidate's gallery, **Then** the voter can swipe or click through an optimized carousel with full-screen zoom capability and responsive aspect-ratio preservation.
3. **Given** a contestant has configured an embedded video link (e.g., YouTube Shorts, TikTok, or video reel), **When** the voter navigates to the video tab/section, **Then** the short-form video player loads and plays seamlessly with standard playback and volume controls.
4. **Given** a candidate has social links configured (Instagram, TikTok, Facebook), **When** a voter clicks a social handle link, **Then** the profile opens in a secure new browser tab with appropriate verification indicators.

---

### User Story 2 - Multi-Category & Division Filtering and Roster Exploration (Priority: P2)

As a pageant voter or event audience member, I want to filter and switch between contestant divisions (e.g., Male, Female, LGBTQ+, Teen) and specialized award categories (e.g., _People's Choice_, _Best in Swimsuit_, _Best in Evening Gown_) so that I can view relevant candidates for specific awards and voting tracks.

**Why this priority**: Crucial for multi-division and multi-award contests (e.g., university pageants with Mister & Miss divisions or multiple sponsor titles). Ensures voters can easily discover candidates across different competitive brackets.

**Independent Test**: Can be tested on the event page by toggling division tabs and award category selectors, verifying that the candidate grid immediately filters and highlights contestants assigned to the active category.

**Acceptance Scenarios**:

1. **Given** an event with multiple divisions (e.g., Female, Male), **When** a voter selects the "Male" division tab, **Then** only male contestants are presented in the roster in ascending candidate number order.
2. **Given** an event with specialized award categories (e.g., _Best in Swimsuit_), **When** a voter filters by that award category, **Then** all contestants eligible for or participating in that award track are displayed.
3. **Given** a candidate is tagged in multiple award categories, **When** switching across different eligible categories, **Then** the candidate appears consistently in each matching category view with their active category badge.

---

### User Story 3 - Organizer Contestant Management & Media Ingestion (Priority: P3)

As an event organizer, I want a dedicated management interface to add, edit, reorder, and publish contestant profiles, upload and crop up to 10 high-resolution photos, manage video embeds, and assign category tags so that I can maintain the official contestant roster.

**Why this priority**: Essential for platform operations and contest administration. Organizers require an intuitive self-service portal to curate contestant profiles before and during the event operational window.

**Independent Test**: Can be tested in the organizer dashboard by creating/editing a candidate profile, uploading and cropping photos, inputting bio information, attaching embed URLs, assigning categories, and verifying that changes reflect accurately on the public event page.

**Acceptance Scenarios**:

1. **Given** an organizer is on the contestant management panel, **When** they add a new candidate with candidate number, name, hometown, height, advocacy statement, and division, **Then** the contestant is saved and added to the roster.
2. **Given** an organizer uploads images for a candidate, **When** uploading up to 10 photos, **Then** the system provides client-side aspect ratio cropping (portrait 3:4 / 4:5 optimization), generates responsive thumbnails, and allows drag-and-drop reordering for the primary cover photo.
3. **Given** an organizer pastes a valid video URL (TikTok, YouTube Shorts, or Vimeo), **When** saving the profile, **Then** the system validates the URL format, extracts the embed identifier, and generates an embeddable preview.
4. **Given** an organizer assigns one or more category tags to a contestant, **When** saving the profile, **Then** the contestant's association with each category is recorded and instantly reflected across public filter views.

---

### Edge Cases

- **Broken or Removed Video Embeds**: If a candidate's third-party video URL becomes unavailable, deleted, or region-restricted, the player displays an unobtrusive fallback placeholder ("Video currently unavailable") without crashing the profile modal.
- **Extreme Image Resolutions & Large Files**: If an organizer attempts to upload photos larger than 10MB or in unaccepted formats (e.g. RAW/TIFF), client-side validation rejects the file with a clear instructional error before upload, while accepted JPEG/PNG/WebP images are compressed and optimized.
- **Maximum Photo Limit Exceeded**: If an organizer attempts to upload an 11th photo, the upload trigger is disabled, and an informative alert is shown indicating the 10-photo limit.
- **Candidate Number Collisions**: Within the same division and event, duplicate candidate numbers (e.g., two "Candidate #1" in the Female division) are prevented with a real-time validation error.
- **Missing Optional Bio Fields**: If a contestant does not supply height, advocacy statement, or certain social links, the UI gracefully omits empty fields without leaving awkward whitespace or broken layout alignment.
- **Sanitization of Social Handles and URLs**: Social profile handles input with or without `@` or full URLs (e.g., `@maria_clara`, `instagram.com/maria_clara`) are normalized and sanitized to prevent XSS and broken links.

---

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST allow event organizers to create, update, reorder, and set lifecycle statuses (`ACTIVE`, `HIDDEN`, `WITHDRAWN`) for contestant profiles linked to an event.
- **FR-002**: System MUST capture and display contestant bio fields including candidate number, full name, hometown/province, height (in cm / ft-in), official advocacy/biography statement (up to 1,000 characters), and division (e.g., Male, Female, LGBTQ+, Teen).
- **FR-003**: System MUST support verified social media links for Instagram, TikTok, and Facebook, validating and normalizing user-supplied handles and URLs.
- **FR-004**: System MUST support photo galleries of up to 10 high-resolution images per contestant, with client-side aspect cropping defaulting to 4:5 vertical portrait framing, cover photo selection, and image reordering.
- **FR-005**: System MUST serve gallery images through CDN-optimized delivery with responsive sizing, WebP/modern image compression, and progressive loading placeholders.
- **FR-006**: System MUST support short-form embedded media players for YouTube Shorts/Videos, TikTok links, Instagram Reels, and Facebook Videos/Reels, parsing valid URLs and rendering responsive embedded players.
- **FR-007**: System MUST support multi-category and award tagging, requiring contestants to be assigned to exactly one primary division and zero or more specialized award categories (e.g., _People's Choice_, _Best in Swimsuit_, _Best in Evening Gown_).
- **FR-008**: Public event pages MUST provide responsive category and division filter tabs that dynamically update the displayed contestant grid without full page reload.
- **FR-009**: System MUST enforce candidate number uniqueness per division within an individual event.
- **FR-010**: System MUST enforce authorization checks ensuring only authenticated event organizers can create, modify, or delete contestant profiles and media assets for their assigned events.
- **FR-011**: Contestant profiles MUST render a dedicated full-view modal or page view featuring full-resolution photo lightbox, video reel tab, complete bio dossier, and quick-action voting trigger.
- **FR-012**: System MUST exclude contestants marked as `HIDDEN` or `WITHDRAWN` from public roster views and public voting. In the organizer contestant management panel, contestants of all statuses (including `HIDDEN` and `WITHDRAWN`) MUST remain visible with their current status badge, enabling organizers to view, edit, and adjust statuses while preserving historical transaction and audit records for financial reconciliation.

---

### Key Entities

- **Contestant**: Core participant entity containing candidate number, name, division, hometown, height, advocacy statement, social links, status (`ACTIVE`, `HIDDEN`, `WITHDRAWN`), primary cover image, and foreign key link to the parent Event.
- **Contestant Media**: Associated gallery items containing image/video URL, media type (`PHOTO` or `VIDEO_EMBED`), display order index (1 to 10), and aspect ratio metadata (4:5 standard).
- **Award Category**: Contest grouping or specialized title (e.g., _People's Choice_, _Best in Swimsuit_) associated with an event.
- **Contestant Category Assignment**: Many-to-many relationship mapping contestants to eligible award categories.

---

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Voters can open and view any contestant profile and interact with the 10-photo gallery with initial image render latency under 1.0 second on standard mobile 4G connections.
- **SC-002**: 100% of uploaded gallery images are automatically cropped, compressed, and served in optimized modern web formats (WebP/AVIF) without visual distortion or aspect stretching.
- **SC-003**: Toggling between division and award category filters updates the contestant roster instantaneously (< 100ms UI response) with smooth transitional animations.
- **SC-004**: Embedded video links (YouTube Shorts / TikTok) render and initialize playback within 1.5 seconds of user tab selection.
- **SC-005**: 100% of contestant creation and update submissions undergo schema and integrity validation, preventing duplicate candidate numbers, malformed URLs, and invalid media counts.

---

## Assumptions

- Image assets will be stored in Supabase Storage buckets or S3-compatible cloud storage with public CDN caching.
- Video embedding relies on official provider iframe/oEmbed mechanisms (YouTube Shorts iframe, TikTok oEmbed) rather than direct video file hosting for v1.
- Social media verification badges represent organizer-confirmed official links, entered by the organizer during roster curation.
- Contestant voting tallies will connect with the voting engine (Spec 003) and real-time leaderboard (Spec 005) while maintaining independent profile presentation.

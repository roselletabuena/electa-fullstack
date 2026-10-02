# Research & Architecture Decisions: Fullscreen Stage Presentation Mode for LED Screens

**Feature**: `021-fullscreen-stage-presentation`  
**Jira Key**: `VS-23`  
**Date**: 2026-10-02

## 1. Stack Context (Pre-established — do not change)

| Concern      | Decision                                                                                                |
| ------------ | ------------------------------------------------------------------------------------------------------- |
| Framework    | Next.js 16 App Router — default to RSC, `"use client"` only when needed                                 |
| Language     | TypeScript 5 strict mode — no `any`, no `!`                                                             |
| Database     | PostgreSQL via Supabase, Prisma ORM (`src/lib/db.ts` singleton)                                         |
| Auth         | AWS Cognito via `getSession()` from `src/lib/auth/get-session.ts`                                       |
| Server State | TanStack Query — never mirror server data in Zustand                                                    |
| Client State | Stage display local state (mode, reveal step, mute) in React state / ref                                |
| URL State    | `nuqs` for division/category filters and display mode                                                   |
| Styling      | Tailwind CSS 4 `@theme` tokens in `src/app/globals.css`                                                 |
| Branding/UI  | Dark luxury theme for stage LED backdrop, strict zero-radius (`rounded-none`), Outfit & Sora typography |
| Animation    | `framer-motion` for reveal transitions, HTML5 Canvas for confetti                                       |
| Audio        | Web Audio API synthesizer for fanfare, drumrolls, and reveal chimes                                     |

---

## 2. Technical Decisions & Rationale

### Decision 1: Dedicated Route Isolation (`/events/:slug/stage-display`)

- **Decision**: Implement a standalone Next.js App Router route at `src/app/(public)/events/[slug]/stage-display/page.tsx` that bypasses default global layout banners, headers, and footers.
- **Rationale**: Stage displays must be 100% immersive with zero distraction. Dedicated routing ensures LED technicians can bookmark or launch fullscreen mode directly without inspecting UI shells.
- **Alternatives Considered**: A modal or query param on `/leaderboard` (`?view=stage`). Rejected because accidental navigation or URL resets would reveal unwanted site chrome on live television/LED walls.

### Decision 2: Dark Luxury Aesthetics for LED Backdrops

- **Decision**: Deep obsidian black background (`#040711`), rich metallic gold borders (`border-amber-500/40`), neon cyan accents (`#06b6d4`), and glowing stage spotlights.
- **Rationale**: High-lumen LED walls wash out low-contrast UI. Pure black preserves contrast and prevents eye strain in darkened auditoriums, while gold accents match coronation pageant prestige.
- **Contrast Compliance**: Headings use `#FFFFFF` on `#040711` (20.5:1 ratio) and gold accents use `#F59E0B` on dark cards (8.2:1 ratio), comfortably exceeding WCAG 2.1 AA requirements.

### Decision 3: Zero-Asset Web Audio API Synthesizer

- **Decision**: Use browser-native `AudioContext` with custom oscillators, filters, and gain envelopes to generate:
  1. _Suspense Drumroll / Tension Drone_: Low-frequency sawtooth oscillator with frequency modulation.
  2. _Reveal Chime / Gong_: Dual sine wave overtone chime with exponential decay.
  3. _Victory Fanfare_: Harmonized brass triad sweep (C-E-G-C) for crowning moments.
- **Rationale**: Eliminates reliance on external `.mp3` or `.wav` files that could fail to load, suffer from network latency, or breach copyright licensing. Completely offline, instant, and reliable.

### Decision 4: High-Performance Canvas Confetti & Particles

- **Decision**: Custom lightweight 2D canvas particle emitter that renders 150-250 golden and holographic confetti ribbons on reveal trigger.
- **Rationale**: Pure DOM node animations with hundreds of elements can drop frames on high-resolution 4K displays. An HTML5 canvas element executes at a solid 60fps with zero DOM garbage collection thrashing.

### Decision 5: Operator Control Dock & Hotkey Navigation

- **Decision**: Provide an unobtrusive bottom-floating operator dock with keyboard shortcuts:
  - `F`: Toggle HTML5 Fullscreen.
  - `Space` / `ArrowRight`: Advance next reveal step.
  - `ArrowLeft`: Step backward in reveal sequence.
  - `R`: Reset reveal sequence.
  - `M`: Toggle audio mute.
  - Auto-hide cursor and dock after 4 seconds of mouse inactivity.
- **Rationale**: Rehearsals and live broadcasts require rapid, hands-free operation from backstage laptops or presentation clickers.

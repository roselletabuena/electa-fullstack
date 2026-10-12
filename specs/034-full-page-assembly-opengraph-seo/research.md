# Research & Architecture Decisions: Full Page Assembly & OpenGraph SEO

**Feature**: `034-full-page-assembly-opengraph-seo`  
**Date**: 2026-10-13

## Stack Context (Pre-established — do not change)

| Concern       | Decision                                                                                              |
| ------------- | ----------------------------------------------------------------------------------------------------- |
| Framework     | Next.js 16 App Router — default to RSC, `"use client"` only when needed                               |
| Language      | TypeScript 5 strict mode — no `any`, no `!`                                                           |
| Database      | PostgreSQL via Supabase, Prisma ORM (`src/lib/db.ts` singleton)                                       |
| Auth          | AWS Cognito via `getSession()` from `src/lib/auth/get-session.ts`                                     |
| Server State  | TanStack Query — never mirror server data in Zustand                                                  |
| Client State  | Zustand `auth-store` for session only                                                                 |
| URL State     | nuqs for search params, pagination, filters                                                           |
| Forms         | React Hook Form + Zod (`zodResolver`)                                                                 |
| API Responses | `ApiResponse<T>` envelope from `src/lib/api/response.ts`                                              |
| Env Vars      | All via `src/env.ts` — never `process.env` directly                                                   |
| Styling       | Tailwind CSS 4 `@theme` tokens in `src/app/globals.css`                                               |
| Branding/UI   | Default to Light Mode (Opal `#F8FAFC`), strict zero-radius (`rounded-none`), Outfit & Sora typography |

---

## Technical Decisions & Rationale

### 1. Next.js 16 App Router Metadata Architecture

- **Decision**: Define static and dynamic metadata using standard Next.js `Metadata` export in `src/app/page.tsx` and `src/app/layout.tsx`.
- **Rationale**: Server-side metadata rendering guarantees search engine crawlers and social bot user-agents receive complete OpenGraph (`og:*`) and Twitter (`twitter:*`) tags without executing client JavaScript.
- **Image Generation**: Provide dynamic 1200x630 OpenGraph card generation via `src/app/opengraph-image.tsx` leveraging `@vercel/og` / Next.js ImageResponse runtime.

### 2. Streamlined Footer Architecture (`variant="streamlined"`)

- **Decision**: Extend `SiteFooterProps` to support `variant: "default" | "streamlined"`. When set to `"streamlined"`, render the clean brand mark, tagline, and copyright bar matching `public/mockup-realistic.html`. When omitted or `"default"`, retain the comprehensive directory grid for deeper page layouts.
- **Rationale**: Matches the user's explicit requirement ("based on the mock up remove uncessary badge, links, and texts") while maintaining 100% test compatibility with existing navigation tests.

### 3. Pure Lucide SVG Iconography (Zero Emoticons)

- **Decision**: Map all platform feature indicators, timers, and badges to `lucide-react` SVG components (`ShieldCheck`, `Zap`, `Wallet`, `Rocket`, `Radio`, `CalendarClock`, `Lock`, `Check`).
- **Rationale**: Eliminates cross-platform font rendering discrepancies, emoji accessibility issues on screen readers, and satisfies user constraint ("don't use emoticons always use icons").

# Research & Architecture Decisions: Frictionless Voter Authentication Modal

**Feature**: `017-frictionless-voter-auth-modal`  
**Date**: 2026-10-02

## Stack Context (Pre-established)

| Concern       | Decision                                                                                              |
| ------------- | ----------------------------------------------------------------------------------------------------- |
| Framework     | Next.js 16 App Router — default to RSC, `"use client"` only when needed                               |
| Language      | TypeScript 5 strict mode — no `any`, no `!`                                                           |
| Database      | PostgreSQL via Supabase, Prisma ORM (`src/lib/db.ts` singleton)                                       |
| Auth          | Omnichannel Passwordless + Cognito OAuth via `getSession()`                                           |
| Client State  | Zustand `auth-store` + `sessionStorage` for OAuth return resumption                                   |
| Forms         | React Hook Form + Zod (`zodResolver`)                                                                 |
| API Responses | `ApiResponse<T>` envelope from `src/lib/api/response.ts`                                              |
| Styling       | Tailwind CSS 4 `@theme` tokens in `src/app/globals.css`                                               |
| Branding/UI   | Default to Light Mode (Opal `#F8FAFC`), strict zero-radius (`rounded-none`), Outfit & Sora typography |

---

## Technical Decisions & Rationale

### 1. Intent Preservation Mechanism

- **In-Memory Callback**: For OTP/Magic-link flows where the browser does not unload, pass an `onSuccess` callback to `AuthPromptModal` / `OmnichannelAuthModal` that immediately calls `castVote()` with the cached parameters.
- **`sessionStorage` Intent Buffer**: For OAuth redirects (Google/Apple/Facebook), serialize `{ eventId, contestantId, contestantName, awardCategoryId, timestamp }` to `sessionStorage` key `votesphere_pending_vote_intent`. When the event page mounts with an active session, a hook (`usePendingVoteIntent`) reads and processes the intent.

### 2. Electa Design System Compliance

- Current `OmnichannelAuthModal` has `rounded-3xl`, `rounded-2xl`, `rounded-xl` and indigo-specific accent colors that diverge from the Electa brutalist-refined design system (`rounded-none`, slate-900 / sky-600 accents, Opal light background default, high-contrast borders).
- Refactor `OmnichannelAuthModal` and `AuthPromptModal` to use `rounded-none`, strict brand typography (`font-heading`, `font-sans`, `font-mono`), `.btn-primary` and `.card-style` tokens.

## 📌 Jira Ticket & Epic Links

- **Parent Epic**: [VS-XX: Epic Name](https://the-three-devsketeers.atlassian.net/browse/VS-XX)
- **Associated Stories**:
  - [VS-XX](https://the-three-devsketeers.atlassian.net/browse/VS-XX): `Story Title`

---

## 🎯 Executive Summary

<!-- Concise summary of the objective, user story, or problem solved by this pull request. -->

---

## 🧱 Key Architectural & Code Changes

### 1. Feature / Domain Slices

- **Module / Slice**: `src/features/<slice>/`
- **Key Changes**:
  -

### 2. Services, Components & Primitives

-

---

## 🧪 Testing & Verification Report

- [ ] **TypeScript Strict Typecheck**: `npm run typecheck` (0 errors)
- [ ] **Unit & Integration Tests**: `npm run test:unit`
- [ ] **ESLint & Prettier**: `npm run lint`
- [ ] **Environment Validation**: Verified zero raw `process.env` bypasses (§IV)

```text
<!-- Paste terminal test output or agent:verify summary here -->
```

---

## 🏛️ Electa Constitution Compliance Checklist

- [ ] **§I: Strict Type Safety & Boundary Validation**: Strict mode enforced; zero `any` or non-null assertions; Zod validation at all boundaries.
- [ ] **§II: Server-First & Boundary Isolation**: React Server Components by default; async Next.js APIs awaited; standard `ApiResponse<T>`.
- [ ] **§III: Strict State Separation**: Prisma singleton for DB; TanStack Query for server state; Zustand for auth; nuqs for URL params.
- [ ] **§IV: Secure-by-Design & Auth Integrity**: Session verification via `getSession()`; secrets accessed exclusively via `@/env`.
- [ ] **§V: Feature Colocation & Modular Architecture**: Vertical slice architecture under `src/features/`; named exports; Radix UI primitives.
- [ ] **§VI: Atomic Conventional Commits & Quality Gates**: Bisectable single-purpose Conventional Commits; test-first quality gates passing.

---

## 📸 Visual Evidence / UI Preview

<!-- Add screenshots, screen recordings, or "N/A - Non-UI change" -->

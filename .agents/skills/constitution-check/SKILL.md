---
name: "constitution-check"
description: "Automated audit of code changes against the VoteSphere Constitution (`.specify/memory/constitution.md`). Checks all 6 principles across §I–§VI. Run before committing or as a PostToolUse hook."
metadata:
  author: "VoteSphere Engineering Team"
  version: "1.0.0"
---

# VoteSphere Constitution Check

Enforces every principle in `.specify/memory/constitution.md` on the current changeset. This is your automated code quality gate that runs the same checks a senior engineer would in a PR review — but instantly, every time.

## User Input

```text
$ARGUMENTS
```

Optional: a specific file path or glob. If empty, checks staged changes (`git diff --staged`) if any exist, falling back to `git diff HEAD` if nothing is staged, falling back to scanning all `src/` files.

---

## Execution Steps

### Step 1 — Determine scope

Priority order:

1. If `$ARGUMENTS` is a file path → check that file only
2. If `git diff --staged` has output → check only staged files
3. If `git diff HEAD` has output → check changed files vs HEAD
4. Fallback → check all `.ts` and `.tsx` files in `src/`

Skip: `src/generated/`, `node_modules/`, `.next/`, `*.d.ts` declaration files.

---

### Step 2 — Load the Constitution

Read `.specify/memory/constitution.md`. Extract the 6 principles (§I–§VI). These are the ground truth — if the constitution has been amended, its current content supersedes these defaults.

---

### Step 3 — Run all checks

Run each check in sequence. Collect results with `✅ PASS`, `⚠️ WARN`, or `🔴 VIOLATION` for each.

---

#### §I — Strict Type Safety & Boundary Validation

| Check ID | Rule                                                                          | Severity     |
| -------- | ----------------------------------------------------------------------------- | ------------ |
| `§I-1`   | No `: any` in type positions                                                  | 🔴 VIOLATION |
| `§I-2`   | No `as any` type assertions                                                   | 🔴 VIOLATION |
| `§I-3`   | No `<any>` generic arguments                                                  | 🔴 VIOLATION |
| `§I-4`   | No non-null assertions `!.` (e.g., `user!.id`)                                | 🔴 VIOLATION |
| `§I-5`   | Route Handlers and Server Actions parsing `req.json()` must validate with Zod | ⚠️ WARN      |

**Detection patterns**:

- Grep for `\bany\b` in type positions (`: any`, `as any`, `Promise<any>`, `Array<any>`, `<any>`)
- Grep for `[a-zA-Z]!\.` for non-null assertions
- For Route Handlers (`route.ts` files): check if `req.json()` is followed by a Zod `.parse()` or `.safeParse()` call

**Report format for violations**:

```
🔴 §I-1 — Forbidden `any` type
   File: src/features/events/hooks/use-event.ts
   Line: 42    const data: any = response.json();
   Fix:  Narrow to `unknown` and assert type, or define an interface:
         const data: unknown = response.json();
         const event = EventSchema.parse(data);
```

---

#### §II — Server-First & Boundary Isolation

| Check ID | Rule                                                                                                                | Severity     |
| -------- | ------------------------------------------------------------------------------------------------------------------- | ------------ |
| `§II-1`  | `"use client"` must NOT appear in `src/app/api/` files                                                              | 🔴 VIOLATION |
| `§II-2`  | `"use client"` must NOT appear in `src/app/` layout or page files that only use RSC patterns                        | ⚠️ WARN      |
| `§II-3`  | `useSearchParams()` or `useRouter()` usage must be inside a component that is or has a parent `<Suspense>` boundary | ⚠️ WARN      |
| `§II-4`  | Async Next.js APIs (`cookies()`, `headers()`, dynamic `params`, `searchParams`) must be `await`-ed                  | 🔴 VIOLATION |
| `§II-5`  | Route Handlers must return `apiSuccess()` or `apiError()` — not raw `Response` or `NextResponse.json()` directly    | ⚠️ WARN      |

**Detection patterns**:

- Grep for `"use client"` in `src/app/api/**`
- Grep for `useSearchParams\(` and check if the file has `<Suspense` in scope or the parent component has it
- Grep for `cookies\(\)`, `headers\(\)` without `await` prefix in async functions
- Grep for `NextResponse.json\(` or `new Response\(` in route handlers (should use helpers instead)

---

#### §III — Strict State Separation

| Check ID | Rule                                                                                          | Severity     |
| -------- | --------------------------------------------------------------------------------------------- | ------------ |
| `§III-1` | TanStack Query `data` must NOT be passed to `set()` of a Zustand store                        | 🔴 VIOLATION |
| `§III-2` | `useQuery` / `useMutation` hooks must NOT be called inside Zustand store files (`*-store.ts`) | 🔴 VIOLATION |
| `§III-3` | `useSearchParams` / `usePathname` URL state must use `nuqs`, not `useState`                   | ⚠️ WARN      |

**Detection patterns**:

- Grep `*-store.ts` files for `useQuery`, `useMutation`, `useInfiniteQuery`
- In files that call both `useQuery` and a Zustand `useStore`, check if the query `data` flows into `store.set*()` call
- Grep for `const [searchParam, setSearchParam] = useState` in files that manage URL-synced state (look for `router.push` or `router.replace` in the same file)

---

#### §IV — Secure-by-Design & Auth Integrity

| Check ID | Rule                                                                       | Severity     |
| -------- | -------------------------------------------------------------------------- | ------------ |
| `§IV-1`  | Raw `process.env.*` access outside `src/env.ts`                            | 🔴 VIOLATION |
| `§IV-2`  | Route Handlers in `src/app/api/` that mutate data must call `getSession()` | 🔴 VIOLATION |
| `§IV-3`  | Server Actions must call `getSession()` before any DB operation            | 🔴 VIOLATION |

**Detection patterns**:

- **§IV-1**: Delegate to `env-validator` logic — grep for `process\.env\.[A-Z_]+` outside `src/env.ts`
- **§IV-2**: For `POST`, `PUT`, `PATCH`, `DELETE` route handlers — check that `getSession()` is called before any `db.*` call
- **§IV-3**: For files in `src/features/*/actions/` — check that `getSession()` appears before `db.*`

---

#### §V — Feature Colocation & Modular Architecture

| Check ID | Rule                                                                                                 | Severity     |
| -------- | ---------------------------------------------------------------------------------------------------- | ------------ |
| `§V-1`   | `export default` in non-`page.tsx` and non-`layout.tsx` files                                        | 🔴 VIOLATION |
| `§V-2`   | Feature-specific components in `src/components/shared/` instead of `src/features/<name>/components/` | ⚠️ WARN      |
| `§V-3`   | Cross-feature imports (e.g., `src/features/auth` importing from `src/features/events`)               | ⚠️ WARN      |

**Detection patterns**:

- Grep for `^export default` in files that are not `page.tsx` or `layout.tsx`
- Check import paths: if a file in `src/features/X/` imports from `src/features/Y/`, flag it
- For new components added to `src/components/shared/`, check if they are only used by one feature (would be better colocated)

---

#### §VI — Test-First & Zero-Regression Quality Gates

| Check ID | Rule                                                                                                                             | Severity |
| -------- | -------------------------------------------------------------------------------------------------------------------------------- | -------- |
| `§VI-1`  | New files in `src/features/<name>/hooks/` or `src/features/<name>/utils/` must have a corresponding test in `tests/unit/<name>/` | ⚠️ WARN  |
| `§VI-2`  | New Route Handlers with business logic must have a corresponding test                                                            | ⚠️ WARN  |
| `§VI-3`  | Files containing `// TODO: test` or `// FIXME:` should not be committed without acknowledgment                                   | ⚠️ WARN  |

**Detection patterns**:

- For each new `.ts` file added in `src/features/*/hooks/` or `src/features/*/utils/`, check if `tests/unit/<feature-name>/` has any `.test.ts` file
- For new `route.ts` files with more than a stub body, check for corresponding test
- Grep for `// TODO:` and `// FIXME:` in staged/changed files

---

#### §VII — Brand & Design System Integrity

| Check ID  | Rule                                                                                                  | Severity     |
| --------- | ----------------------------------------------------------------------------------------------------- | ------------ |
| `§VII-1`  | Page/component must NOT default to dark backgrounds without `dark:` scoping (e.g. `bg-slate-900`, `bg-black`) | 🔴 VIOLATION |
| `§VII-2`  | Naked `text-white` or light gray text on base backgrounds without `dark:` scoping                     | 🔴 VIOLATION |
| `§VII-3`  | Strict Zero-Radius violation: use of `rounded-md`, `rounded-lg`, `rounded-xl`, `rounded-2xl`          | ⚠️ WARN      |
| `§VII-4`  | Legacy Tailwind gradient syntax `bg-gradient-to-*` instead of Tailwind v4 `bg-linear-to-*`           | ⚠️ WARN      |

**Detection patterns**:
- Grep for `className=.*(bg-slate-900|bg-black|bg-zinc-950)` without preceding light background or `dark:` scoping
- Grep for `className=.*(rounded-md|rounded-lg|rounded-xl|rounded-2xl)`
- Grep for `bg-gradient-to-`


---

### Step 4 — Print the full report

Format the report grouped by section:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 CONSTITUTION CHECK — VoteSphere v1.0.0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

§I  Type Safety         ✅ PASS  (5/5 checks)
§II Server-First        🔴 1 VIOLATION  ⚠️ 1 WARN
§III State Separation   ✅ PASS  (3/3 checks)
§IV Auth Integrity      ✅ PASS  (3/3 checks)
§V  Architecture        ⚠️ 1 WARN
§VI Test Coverage       ⚠️ 2 WARNS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VIOLATIONS (must fix before committing):

🔴 §II-1 — "use client" in Route Handler
   File: src/app/api/events/route.ts
   Line: 1    "use client"
   Fix:  Remove "use client". Route Handlers always run on the server.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WARNINGS (review recommended):

⚠️ §II-3 — useSearchParams without Suspense boundary
   File: src/features/events/components/EventFilter.tsx
   Line: 14    const searchParams = useSearchParams();
   Fix:  Wrap <EventFilter /> in <Suspense fallback={<FilterSkeleton />}>
         in the parent page or layout.

⚠️ §V-2 — Component may belong in feature slice
   File: src/components/shared/EventCard.tsx
   Note: This component is only used by src/features/events/. Consider
         moving it to src/features/events/components/EventCard.tsx.

⚠️ §VI-1 — Missing unit tests
   File: src/features/events/utils/derive-event-state.ts (new)
   Note: No test found in tests/unit/events/. Add at least one test
         covering the state derivation logic.

⚠️ §VI-1 — Missing unit tests
   File: src/features/events/hooks/use-event-countdown.ts (new)
   Note: No test found in tests/unit/events/.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RESULT: 🔴 NOT READY — 1 violation must be fixed before committing.
```

**If all checks pass**:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RESULT: ✅ CONSTITUTION COMPLIANT
        All principles satisfied. Ready for /skill:code-review → commit.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### Step 5 — On violations: halt with guidance

If any `🔴 VIOLATION` exists:

- Do NOT proceed to commit guidance
- Output: "Fix all 🔴 violations above, then re-run `/skill:constitution-check`."

If only `⚠️ WARN` (no violations):

- Output: "All principles satisfied. Warnings are recommendations — review them, then proceed with `/skill:code-review`."

---

## Done When

- [ ] Scope determined (staged / diff / full scan)
- [ ] All §I–§VI checks executed
- [ ] Violations and warnings reported with file + line + fix
- [ ] Overall `RESULT` verdict printed
- [ ] User directed to fix violations or proceed to code-review

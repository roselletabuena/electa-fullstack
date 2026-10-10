---
name: "env-validator"
description: "Detects raw process.env usage that bypasses src/env.ts. Run manually or fires automatically as a PostToolUse hook on every .ts/.tsx file write. Enforces Electa Constitution §IV."
metadata:
  author: "Electa Engineering Team"
  version: "1.0.0"
---

# Environment Variable Validator

Enforces **Electa Constitution §IV**: _"Environment secrets MUST NEVER be accessed via `process.env` directly; access MUST go through `src/env.ts`."_

This skill can be invoked manually or runs automatically via the `PostToolUse` hook in `.agents/hooks.json` on every `.ts` / `.tsx` file write.

## User Input

```text
$ARGUMENTS
```

Optional: a specific file path to check. If empty, checks the entire `src/` directory.

---

## Execution Steps

### Step 1 — Determine scope

- If `$ARGUMENTS` is a file path → scan that file only.
- If `$ARGUMENTS` is empty → scan all `.ts` and `.tsx` files under `src/`.
- Skip files under `src/generated/` and `node_modules/`.

---

### Step 2 — Scan for raw `process.env` usage

Search for the pattern `process\.env\.[A-Z_]+` (case-sensitive) in all scoped files.

For each match, record:

- File path (relative to project root)
- Line number
- Full line content
- The variable name extracted (e.g., `SUPABASE_URL` from `process.env.SUPABASE_URL`)

**Exception — allowed patterns** (skip these, they are intentional):

- Lines inside `src/env.ts` itself — this is where env vars are registered
- Lines containing `// env-validator-ignore` — explicit escape hatch
- Lines inside `.specify/` or `.agents/` directories

---

### Step 3 — Cross-check against `src/env.ts`

Read `src/env.ts` and extract all registered variable keys from both the `server` and `client` schema objects passed to `createEnv`.

For each raw `process.env.VAR_NAME` found in Step 2:

- **If `VAR_NAME` exists in `src/env.ts`** → mark as ✅ (already registered, just accessed wrong)
- **If `VAR_NAME` does NOT exist in `src/env.ts`** → mark as 🔴 (unregistered and accessed wrong)

---

### Step 4 — Build and print report

**If no raw `process.env` usage found**:

```
✅ env clean — no raw process.env usage detected outside src/env.ts
```

**If issues found**, print a structured report:

```
🔴 ENV VALIDATOR — Constitution §IV Violations Found

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔴 UNREGISTERED — process.env.MY_SECRET_KEY
   File:  src/features/events/actions/create-event.ts
   Line:  23
   Code:  const key = process.env.MY_SECRET_KEY;

   Fix 1: Register it in src/env.ts (server schema, no NEXT_PUBLIC_ prefix):
          server: {
            MY_SECRET_KEY: z.string().min(1),
          }

   Fix 2: Then access it as:
          import { env } from "@/env";
          const key = env.MY_SECRET_KEY;

   Fix 3: Document it in .env.example:
          MY_SECRET_KEY=          # Description of where to find this value

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️  WRONG ACCESS — process.env.NEXT_PUBLIC_SUPABASE_URL
   File:  src/components/shared/EventCard.tsx
   Line:  8
   Code:  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

   This key IS registered in src/env.ts but is being accessed via process.env directly.
   Fix: import { env } from "@/env"; then use env.NEXT_PUBLIC_SUPABASE_URL

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Summary: 1 unregistered 🔴 | 1 wrong access ⚠️ | 0 clean ✅
```

---

### Step 5 — Guide on NEXT_PUBLIC_ prefix

For any unregistered variable, determine whether it needs `NEXT_PUBLIC_` prefix:

- **Needs `NEXT_PUBLIC_`** if it is accessed in a `"use client"` component or a file without server-only imports
- **Does NOT need `NEXT_PUBLIC_`** if it is accessed only in Route Handlers, Server Components, or Server Actions

Output this determination alongside each fix recommendation.

---

## Done When

- [ ] Scope determined (single file or full `src/`)
- [ ] All `process.env.*` patterns found and line numbers recorded
- [ ] Each match cross-checked against `src/env.ts` schema
- [ ] Structured report printed with exact fix instructions
- [ ] Clean bill (`✅ env clean`) printed if no violations found

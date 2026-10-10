---
name: "db-migrate"
description: "Safe, audited Prisma schema migration workflow. Detects destructive changes, validates conventions, runs migration + client regeneration + typecheck. Always run this after editing prisma/schema.prisma."
metadata:
  author: "Electa Engineering Team"
  version: "1.0.0"
---

# Safe Prisma Migration Workflow

This skill orchestrates the full Prisma migration lifecycle safely. It validates your schema changes, warns on destructive operations, runs the migration, regenerates the client, and confirms TypeScript still compiles.

**Always run this skill after editing `prisma/schema.prisma`.** Never run `prisma migrate dev` raw — always go through this skill.

## User Input

```text
$ARGUMENTS
```

Optional migration name in `kebab-case` (e.g., `add-vote-model`). If empty, the skill auto-generates a name from the diff.

---

## Execution Steps

### Step 1 — Verify working directory

Confirm the workspace root contains `prisma/schema.prisma` and `package.json`. If either is missing, **ERROR**: "Run this skill from the vote-sphere project root."

---

### Step 2 — Capture the schema diff

Run:

```bash
git diff HEAD -- prisma/schema.prisma
```

If the diff is empty (no changes to schema), **STOP** and output:

```
ℹ️  No changes detected in prisma/schema.prisma.
   Nothing to migrate. Edit the schema first.
```

Parse the diff and extract:

- **Added lines** (`+` prefix): new models, fields, enums, indexes, relations
- **Removed lines** (`-` prefix): dropped models, fields, enums, relations

---

### Step 3 — Pre-flight validation

Run the following checks in order. Collect all warnings and errors before reporting.

#### 3a. Destructive change detection

Flag any removed lines that indicate:

| Pattern                                    | Severity    | Message                                                                                               |
| ------------------------------------------ | ----------- | ----------------------------------------------------------------------------------------------------- |
| `- model <Name>`                           | 🔴 BREAKING | "Model `<Name>` is being DROPPED. All data will be permanently deleted."                              |
| `- <fieldName>` inside a model             | 🔴 BREAKING | "Field `<fieldName>` on model `<Model>` is being DROPPED. Existing data in this column will be lost." |
| `- enum <Name>`                            | 🔴 BREAKING | "Enum `<Name>` is being DROPPED."                                                                     |
| Field type change (e.g., `String` → `Int`) | ⚠️ WARNING  | "Field `<fieldName>` type changed from `<old>` to `<new>`. Verify data compatibility."                |

**If any 🔴 BREAKING changes are found**: Print a summary table and ask:

```
⚠️  DESTRUCTIVE CHANGES DETECTED

┌─────────────────────────────────────────────────────────┐
│  🔴 BREAKING: Model `Vote` will be DROPPED              │
│  🔴 BREAKING: Field `Event.legacyCode` will be DROPPED  │
└─────────────────────────────────────────────────────────┘

This will permanently delete data in production.
Type "yes I understand" to proceed, or "no" to cancel:
```

Wait for user confirmation. If "no" or anything other than "yes I understand" → **HALT**.

#### 3b. Convention checks (Electa AGENTS.md)

| Check                        | Rule                                                                                                               |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| New foreign key fields       | Must have a corresponding `@@index([<fieldName>])`                                                                 |
| New `String` fields          | If semantically unconstrained length, recommend `@db.VarChar(n)` or note it                                        |
| New model names              | Must be `PascalCase`                                                                                               |
| New field names              | Must be `camelCase`                                                                                                |
| New enum names               | Must be `PascalCase`                                                                                               |
| New enum values              | Must be `SCREAMING_SNAKE_CASE`                                                                                     |
| Every new model              | Should have `createdAt DateTime @default(now())` and `updatedAt DateTime @updatedAt` unless it's a pure join table |
| Relations without `onDelete` | Warn: "Specify `onDelete` behavior for relation on `<Model>.<field>`"                                              |

Report all convention issues as ⚠️ WARNINGS (non-blocking).

#### 3c. Generate migration name

If `$ARGUMENTS` is provided, use it as the migration name.

If not, auto-generate from the diff:

- Added model → `add-<model-name-kebab>`
- Added field → `add-<field>-to-<model>`
- Removed model → `drop-<model-name-kebab>`
- Multiple changes → `update-schema-<date-yyyymmdd>`

Set `MIGRATION_NAME` to the final name.

---

### Step 4 — Run migration

Execute:

```bash
npx prisma migrate dev --name <MIGRATION_NAME>
```

Run from the project root. Capture stdout and stderr.

**If the command fails**:

- Print the full error output
- Suggest common fixes:
  - "If you see 'drift detected', run: `npx prisma migrate resolve --applied <migration-name>`"
  - "If you see a constraint violation, your existing data conflicts with the new schema. Drop the local DB and re-seed, or resolve manually."
- **HALT** — do not proceed to Step 5.

**If the command succeeds**: note the generated migration file path from the output.

---

### Step 5 — Regenerate Prisma client

Execute:

```bash
npx prisma generate
```

Capture output. If it fails, print the error and **HALT**.

On success, confirm: `✅ Prisma client regenerated at src/generated/client`

---

### Step 6 — TypeScript compilation check

Execute:

```bash
npx tsc --noEmit
```

**If TypeScript errors are found**:

- Print each error with file, line, and message
- Identify which errors are directly related to the schema change (look for errors in `src/generated/` or files using the changed model)
- Output:
  ```
  🔴 TypeScript errors found after migration. Fix these before committing:

  src/features/events/types/event.ts:12:5
    Property 'voteCount' does not exist on type 'Contestant'
  ```
- **Do not block** — report errors but continue to Step 7 so the user sees the full picture.

**If no errors**: `✅ TypeScript compiles cleanly`

---

### Step 7 — Update data-model.md (if active feature)

1. Read `.specify/feature.json` to get the current `feature_directory`.
2. If it exists and the file `<feature_directory>/data-model.md` exists, append a "Schema Changes" section:

```markdown
## Schema Changes — <MIGRATION_NAME>

**Migration**: `prisma/migrations/<timestamp>_<MIGRATION_NAME>/migration.sql`
**Date**: <TODAY_DATE>

### Added

<!-- List new models, fields, enums from the diff -->

### Removed

<!-- List dropped models, fields, enums — or "None" -->

### Modified

<!-- List type changes, renamed fields — or "None" -->
```

If `data-model.md` doesn't exist yet, skip this step silently.

---

## Completion Report

```
✅ Migration Complete: <MIGRATION_NAME>

📋 Changes summary:
   [list the added/removed/modified items from the diff]

⚠️  Warnings (non-blocking):
   [list convention warnings, or "None"]

📁 Migration file:
   prisma/migrations/<timestamp>_<MIGRATION_NAME>/migration.sql

🔧 Client regenerated:
   src/generated/client/

🔷 TypeScript: [✅ Clean | 🔴 <N> errors — see above]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
▶ Next steps:
  - If TS errors: fix them, then re-run `npx tsc --noEmit`
  - Stage the migration: git add prisma/migrations/ prisma/schema.prisma src/generated/
  - Commit: /skill:atomic-commit  →  chore(db): <migration-name>
```

---

## Done When

- [ ] Schema diff captured and analyzed
- [ ] Destructive changes confirmed by user (if any)
- [ ] Convention warnings reported
- [ ] `npx prisma migrate dev --name <name>` ran successfully
- [ ] `npx prisma generate` ran successfully
- [ ] `npx tsc --noEmit` ran and results reported
- [ ] `data-model.md` updated if active feature exists
- [ ] Completion report printed with next-step commit guidance

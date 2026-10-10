# [VS-28] Rebrand Platform from Electa to Electa

> **Jira Ticket Key**: `VS-28`  
> **Parent Epic**: `VS-20` ([EPIC-VS-20: Electa: Next-Gen Pageant & Event Monetization Platform](file:///c:/Users/Roselle%20Tabuena/workspace/vote-sphere-workspace/vote-sphere/docs/epics/EPIC-pageant-voting-and-monetization.md))  
> **Type**: Task  
> **Priority**: High (P1)  
> **Status**: **Done**  
> **Assignee**: Roselle Tabuena  
> **Target Release**: Phase 2 Launch

---

## 📋 Summary

Execute complete platform-wide brand transition from the working title "Electa" to the official luxury production brand name **Electa** (`electa.ph`).

---

## 🎯 Scope of Changes

1. **Frontend & Metadata**:
   - Updated root layout metadata title and OpenGraph tags to `Electa | Universal Contest & Voting Engine` in [src/app/layout.tsx](file:///c:/Users/Roselle%20Tabuena/workspace/vote-sphere-workspace/vote-sphere/src/app/layout.tsx).
   - Updated landing page header in [src/app/page.tsx](file:///c:/Users/Roselle%20Tabuena/workspace/vote-sphere-workspace/vote-sphere/src/app/page.tsx).
   - Updated dynamic event metadata in [src/app/(public)/events/[slug]/page.tsx](file:///c:/Users/Roselle%20Tabuena/workspace/vote-sphere-workspace/vote-sphere/src/app/%28public%29/events/%5Bslug%5D/page.tsx).
   - Updated event domain badges to `electa.ph` in [src/features/events/components/EventBanner.tsx](file:///c:/Users/Roselle%20Tabuena/workspace/vote-sphere-workspace/vote-sphere/src/features/events/components/EventBanner.tsx).
   - Migrated theme storage key to `electa-theme` with backward compatibility in [src/components/shared/theme-provider.tsx](file:///c:/Users/Roselle%20Tabuena/workspace/vote-sphere-workspace/vote-sphere/src/components/shared/theme-provider.tsx).

2. **Backend & Auth Configuration**:
   - Updated session mock organizer email to `organizer@electa.ph` and cookie support in [src/lib/auth/get-session.ts](file:///c:/Users/Roselle%20Tabuena/workspace/vote-sphere-workspace/vote-sphere/src/lib/auth/get-session.ts).
   - Updated database draft passphrase hash in [prisma/seed.ts](file:///c:/Users/Roselle%20Tabuena/workspace/vote-sphere-workspace/vote-sphere/prisma/seed.ts).
   - Updated Supabase project ID to `electa` in [supabase/config.toml](file:///c:/Users/Roselle%20Tabuena/workspace/vote-sphere-workspace/vote-sphere/supabase/config.toml).
   - Updated package name to `electa` in [package.json](file:///c:/Users/Roselle%20Tabuena/workspace/vote-sphere-workspace/vote-sphere/package.json).

3. **Brand Documentation & Specifications**:
   - Created comprehensive Brand Naming & Identity Dossier in [docs/BRAND_NAMING_DOSSIER.md](file:///c:/Users/Roselle%20Tabuena/workspace/vote-sphere-workspace/vote-sphere/docs/BRAND_NAMING_DOSSIER.md).
   - Updated agent guidelines in [AGENTS.md](file:///c:/Users/Roselle%20Tabuena/workspace/vote-sphere-workspace/vote-sphere/AGENTS.md).
   - Updated onboarding guide in [docs/ONBOARDING.md](file:///c:/Users/Roselle%20Tabuena/workspace/vote-sphere-workspace/vote-sphere/docs/ONBOARDING.md).
   - Updated pageant epic in [docs/epics/EPIC-pageant-voting-and-monetization.md](file:///c:/Users/Roselle%20Tabuena/workspace/vote-sphere-workspace/vote-sphere/docs/epics/EPIC-pageant-voting-and-monetization.md).
   - Updated specification plans in [specs/001-event-operational-window/plan.md](file:///c:/Users/Roselle%20Tabuena/workspace/vote-sphere-workspace/vote-sphere/specs/001-event-operational-window/plan.md).

---

## 🧪 Verification & Quality Checks

- `npm run typecheck`: **PASSED** (0 errors)
- `npm run test:unit`: **PASSED** (20/20 tests passing)
- `npm run lint`: **PASSED** (0 lint issues)

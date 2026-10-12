# Requirements Quality Checklist: Global Header & Footer Shell

- [x] Mike Cohn stories and Gherkin criteria exist in Jira (VS-100, VS-101) and spec.md
- [x] Stage display exclusion specified and testable (FR-4, Scenario 3)
- [x] No duplicate header/footer mounting (FR-5)
- [x] Zero-radius geometry (`rounded-none`) required (FR-6)
- [x] Light/dark parity and WCAG 2.1 AA required (FR-6)
- [x] RSC-first: no `"use client"` introduced (Constitution II)
- [x] Named exports for components; default exports only for `layout.tsx`/`page.tsx` (Constitution V)
- [x] No `any`, no raw `process.env` (Constitution I, IV)
- [x] Unit tests specified under `tests/unit/` (Constitution VI)
- [x] Out-of-scope routes documented (`(auth)`)

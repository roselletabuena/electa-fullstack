# ADR-003: Default Opal Slate-50 Light Mode with Strict Dual-Theme Parity

- **Status**: Accepted
- **Date**: 2026-10-12
- **Deciders**: Electa Engineering & Accessibility Systems Team
- **Technical Area**: Theme Architecture, Accessibility (WCAG 2.1 AA), CSS Design Tokens

---

## 1. Context & Problem Statement

AI coding agents and developer templates disproportionately default to dark-mode backgrounds (`bg-slate-900`, `bg-black`, `bg-zinc-950`). However, Electa's core user personas—student voters, university administrators, faculty election commissioners, and pageant attendees—use the application on smartphones, tablets, and laptops in brightly lit classrooms, auditoriums, and daylight environments. Forced dark-mode interfaces cause specular reflection, glare, and poor readability in high ambient lighting.

Additionally, developers frequently introduce **theme leakage anti-patterns**:

- Hardcoding naked dark-mode classes (e.g. `text-white`, `text-slate-100`, `text-slate-200`) on base page elements, rendering text completely invisible on light backgrounds (1.05:1 contrast).
- Using low-contrast grays (`text-slate-300`, `text-slate-400`) on light backgrounds, which fail the WCAG 2.1 AA minimum contrast threshold (ratio < 2.5:1 vs. required 4.5:1).

---

## 2. Decision Drivers

- **Inclusive Accessibility**: Full compliance with **WCAG 2.1 AA** standards across all election workflows (voter registration, ballot casting, live tally, coronation reveals).
- **Daylight Readability**: Flawless legibility in bright school and institutional environments.
- **Architectural Dual-Theme Parity**: Both light and dark modes must be first-class citizens; neither mode may degrade into illegible or unstyled states.
- **Automated Guardrail Enforcement**: Proactively prevent coding agents from committing naked dark classes or low-contrast grays.

---

## 3. Considered Options

1. **Option 1: Dark Mode Default**:
   - _Cons_: Severe daylight glare; breaks institutional accessibility requirements; leads to unreadable printed audit receipts.
2. **Option 2: Single-Theme Light Mode (No Dark Mode)**:
   - _Cons_: Ignores low-light stage projection use cases (e.g. stage display tally screens in auditoriums).
3. **Option 3 (Chosen): Default Opal Slate-50 Light Mode with Strict Dual-Theme Parity**:
   - Light mode is the default base theme.
   - Dark mode is scoped strictly under `dark:` variant classes.
   - Dual-theme token pairs (e.g. `text-slate-900 dark:text-white`, `text-slate-700 dark:text-slate-300`).

---

## 4. Decision & Architectural Architecture

Electa adopts the **Opal Light Theme** as the system default, with strictly scoped dark-mode variants.

```mermaid
flowchart TD
    A[Default Base: Opal Light Theme] --> B[--background: #F8FAFC]
    A --> C[--foreground: #0F172A]
    A --> D[--accent: #0284C7 Sky Blue]
    A --> E[--card: #FFFFFF]

    F[Opt-in / System Dark Mode] --> G[Scoped via dark: variant]
    G --> H[dark:bg-[#090D16]]
    G --> I[dark:text-slate-100]
    G --> J[dark:border-slate-800]
```

### Approved Color Token Matrix

| Role                     | Light Mode Token (`#F8FAFC` base)          | Dark Mode Token (`#090D16` base)                           | Contrast (Light) | Contrast (Dark) | Status |
| :----------------------- | :----------------------------------------- | :--------------------------------------------------------- | :--------------: | :-------------: | :----: |
| **Primary Headings**     | `text-slate-900` / `text-foreground`       | `dark:text-white`                                          |    **17.1:1**    |   **19.8:1**    | ✅ AAA |
| **Body & UI Text**       | `text-slate-700`                           | `dark:text-slate-200`                                      |    **10.1:1**    |   **14.5:1**    | ✅ AAA |
| **Secondary / Muted**    | `text-slate-600` / `text-muted-foreground` | `dark:text-slate-400`                                      |    **5.7:1**     |    **6.4:1**    | ✅ AA  |
| **Active Pill Filter**   | `bg-amber-500 text-slate-950 font-bold`    | `dark:bg-amber-400 dark:text-slate-950`                    |    **9.3:1**     |   **10.8:1**    | ✅ AAA |
| **Inactive Pill Filter** | `bg-white text-slate-700 border-slate-300` | `dark:bg-white/5 dark:text-slate-300 dark:border-white/10` |    **10.3:1**    |    **8.2:1**    | ✅ AAA |

### Specific Architectural Rules

1. **Light Mode First**:
   - `src/app/globals.css` defines base CSS custom properties for Opal light mode.
   - Never place raw dark background classes (`bg-slate-900`, `bg-black`) on body or root container elements.
2. **Never Naked Dark-Mode Classes**:
   - ❌ `text-white` or `text-slate-100` on un-contained elements.
   - ✅ Always pair: `text-slate-900 dark:text-white` or semantic token `text-foreground`.
3. **No Low-Contrast Grays on Light Surfaces**:
   - ❌ `text-slate-300` or `text-slate-400` on white or light gray background.
   - ✅ Use `text-slate-700` (AAA) or `text-slate-600` (AA).
4. **Scrim Overlays for Media**:
   - Any text rendered over dynamic background images must feature an explicit high-opacity dark gradient scrim (`bg-linear-to-t from-slate-950 via-slate-950/40 to-transparent`).

---

## 5. Consequences

### Positive Impacts

- **Guaranteed Universal Readability**: Flawless visual clarity in daytime campus and office lighting.
- **Strict Accessibility Compliance**: Meets Philippine and international accessibility mandates (WCAG 2.1 Level AA/AAA).
- **Deterministic UI Review**: Automated tools can mathematically verify color ratios before production merge.

### Negative Impacts & Mitigations

- **More CSS Classes per Element**:
  - _Mitigation_: Centralized in `.btn-primary`, `.card-style`, and shared UI primitives in `src/components/ui/`.

---

## 6. Compliance, Enforcement & Verification

- **Automated Guardrail Hook**: `.agents/scripts/check-accessibility-contrast.mjs` runs on every `.tsx` write via `.agents/hooks.json`.
- **Rule Documentation**: `.agents/rules/accessibility-colors.md` & `.agents/rules/branding-and-design-system.md`.
- **Quality Gate**: Verified by Vitest test suite `tests/unit/tooling/contrast-guard.test.ts`.

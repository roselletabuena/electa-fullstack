---
trigger: always_on
description: Non-negotiable Electa / VoteSphere branding, design tokens, typography, and default Light Mode rules.
---

# VoteSphere / Electa Branding & Design System Rules

All frontend components, pages, and styles created or modified in this repository MUST strictly follow the Electa / VoteSphere design system and branding guidelines defined below:

## 1. Light Mode is the Default Theme

- **Default Theme is LIGHT MODE (Opal Theme)**:
  - Background: Opal Slate-50 `#F8FAFC` (`--background: 210 40% 98%`)
  - Foreground: Slate-900 `#0F172A` (`--foreground: 222 47% 11%`)
  - Primary Accent: Sky Blue `#0284C7` (`--accent: 199 89% 48%`) / Slate-900 `#0F172A` (`--primary`)
  - Cards / Surfaces: Crisp Pure White `#FFFFFF` with hairline border `#CBD5E1` (`--border`)
- **NEVER default to dark mode or hardcode dark-mode pages**:
  - Do NOT make pages default to dark backgrounds (`bg-slate-900`, `bg-black`, `bg-zinc-950`).
  - Do NOT hardcode white text (`text-white`, `text-slate-100`) directly on base elements without `dark:` scoping.
- **Dual-Theme Parity**:
  - All dark mode styles MUST be scoped under `dark:` classes (e.g. `bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100`).
  - Ensure WCAG 2.1 AA contrast in BOTH light mode and dark mode.

## 2. Strict Zero-Radius Geometry (Brutalist-Refined)

- **Strict Zero-Radius (`--radius: 0px`, `rounded-none`)**:
  - All buttons, inputs, cards, dialogs, dropdowns, badges, and containers MUST have **sharp 0px corners**.
  - ❌ NEVER use `rounded-md`, `rounded-lg`, `rounded-xl`, `rounded-2xl`, or `rounded-full` (except for pure circular avatar photos).
  - ✅ Use `rounded-none` or rely on the base `--radius: 0px` design tokens.

## 3. Brand Typography

- **Headings (`--font-heading`)**: **Outfit** (`font-heading`, `heading-font`, `font-extrabold` / `font-black`, letter-spacing `-0.03em`).
- **Body & UI Text (`--font-body`, `--font-sans`)**: **Sora** (`font-sans`, clean geometric readability).
- **Numbers, Data & Code (`--font-mono`)**: **JetBrains Mono** (`font-mono`, tabular numbers).

## 4. Core Component Styling

- **Primary Action Buttons**:
  - Use `.btn-primary` class or equivalent styling:
    - Light mode: `bg-slate-900 text-white font-extrabold uppercase tracking-widest text-xs border border-slate-900 rounded-none shadow-sm hover:bg-slate-800`
    - Dark mode: `dark:bg-slate-100 dark:text-slate-900 dark:border-slate-100 dark:hover:bg-slate-200`
- **Cards & Surfaces**:
  - Use `.card-style` class or equivalent styling:
    - Light mode: `bg-white border border-slate-300 rounded-none shadow-xs hover:border-slate-400 hover:shadow-md transition-all`
    - Dark mode: `dark:bg-[#0d1424] dark:border-slate-800 dark:hover:border-slate-700`
- **Pill Badges & Filter Controls**:
  - Unselected: `bg-white text-slate-700 border border-slate-300 dark:bg-white/5 dark:text-slate-300 dark:border-white/10 rounded-none`
  - Selected / Active: `bg-sky-600 text-white dark:bg-sky-500 dark:text-slate-950 font-bold rounded-none`

## 5. Tailwind CSS v4 Conformance

- Gradients: Use `bg-linear-to-*` (e.g. `bg-linear-to-r`, `bg-linear-to-t`), NEVER legacy `bg-gradient-to-*`.
- Aspect ratios: Use `aspect-4/5`, `aspect-9/16`, `aspect-16/9`, `aspect-square`, NEVER arbitrary `aspect-[4/5]`.

---
trigger: always_on
description: WCAG 2.1 AA dual-theme contrast rules and dark/light mode parity.
---

# Accessible Color Contrast & Theme Parity Rules

Every UI component in this repository must comply with **WCAG 2.1 AA** color contrast requirements (minimum 4.5:1 for standard body text, 3:1 for large text and UI components) across **both Light Mode and Dark Mode**.

## 1. Dual-Theme Parity (Strictly Enforced)

- **Never hardcode naked dark-mode text** (e.g. `text-white`, `text-slate-300`) on page backgrounds without `dark:` scoping.
- **Never use low-contrast grays on light backgrounds**:
  - ❌ `text-slate-300`, `text-slate-400` on white/light gray background.
  - ✅ Use `text-slate-900` or `text-foreground` for headings (17:1 contrast).
  - ✅ Use `text-slate-700` for readable body text and interactive pills (10:1 contrast).
  - ✅ Use `text-slate-600` or `text-muted-foreground` for secondary text (5.7:1 contrast).

## 2. Interactive Controls & Pill Badges

- Filter pills and buttons must have distinct borders and text in both modes:
  - **Light mode unselected**: `bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 hover:text-slate-950`
  - **Dark mode unselected**: `dark:bg-white/5 dark:text-slate-300 dark:border-white/10 dark:hover:bg-white/10 dark:hover:text-white`
  - **Selected / Active**: Ensure high-contrast text on accent backgrounds (e.g., `bg-amber-500 text-slate-950 font-bold`).

## 3. Scrims & Media Overlays

- When placing text directly over images or photos, ALWAYS include an explicit high-opacity dark gradient scrim (e.g. `bg-linear-to-t from-slate-950 via-slate-950/40 to-transparent`) to protect contrast regardless of the underlying image colors.

## 4. Verification Gate

- When introducing or modifying colors, verify using the `accessibility-colors` skill and the contrast calculator:
  `node .agents/skills/accessibility-colors/scripts/check-contrast.mjs "<fg>" "<bg>"`

---
name: accessibility-colors
description: >-
  Audits, validates, and fixes color contrast across web interfaces to ensure strict compliance with WCAG 2.1 AA and AAA standards in both light and dark modes. Use whenever designing, styling, reviewing, or fixing UI colors, text contrast, button states, pill badges, and theme switches. Trigger with "accessibility colors", "check contrast", "WCAG colors", or "fix color contrast".
license: MIT
metadata:
  version: "1.0.0"
  author: "Electa Core Engineering"
  tags: "accessibility, wcag, contrast, theme, light-mode, dark-mode, tailwind"
---

# Accessibility Colors & WCAG 2.1 Compliance

Ensure all web UI components pass strict accessibility standards across all supported themes (Light Mode, Dark Mode, and High Contrast).

## 1. Core WCAG 2.1 Contrast Thresholds

| Element Type                          | Minimum Ratio (AA) | Enhanced Ratio (AAA) | Notes                                               |
| :------------------------------------ | :----------------: | :------------------: | :-------------------------------------------------- |
| **Normal Text** (<18pt or <14pt bold) |     **4.5:1**      |      **7.0:1**       | Body copy, descriptions, captions, list items       |
| **Large Text** (≥18pt or ≥14pt bold)  |     **3.0:1**      |      **4.5:1**       | Section headings (`h1`-`h3`), prominent titles      |
| **UI Components & Icons**             |     **3.0:1**      |      **4.5:1**       | Button borders, input fields, checkboxes, SVG icons |
| **Incidental / Disabled**             |        None        |         None         | Inactive buttons, decorative elements               |

---

## 2. Hard Anti-Patterns (Never Ship These)

1. **Naked Dark-Mode Classes**:
   - ❌ `text-white` on unthemed backgrounds (disappears on light mode!).
   - ✅ `text-slate-900 dark:text-white` or semantic token `text-foreground`.
2. **Low-Contrast Gray on Light Backgrounds**:
   - ❌ `text-slate-300` or `text-slate-400` on `#f8fafc` / `#ffffff` (ratio < 2.5:1, fails AA).
   - ✅ `text-slate-700` (ratio > 9:1, AAA) or `text-slate-600` (ratio > 5.5:1, AA).
3. **Ghost / Low-Opacity Overlays on Text**:
   - ❌ `text-white/40` or `text-black/40` without verified contrast.
4. **Dark Muddy Buttons in Light Mode**:
   - ❌ `bg-slate-900/40 text-slate-400` on white (unreadable).
   - ✅ `bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 dark:bg-slate-900/40 dark:text-slate-300`.

---

## 3. Approved Accessible Color Tokens for Electa

### Light Mode (`bg-background: #F8FAFC`, `card: #FFFFFF`)

| Role                 | Class                                      | Hex / Equivalent       | Contrast on #F8FAFC | Status |
| :------------------- | :----------------------------------------- | :--------------------- | :-----------------: | :----: |
| Primary Heading      | `text-slate-900` / `text-foreground`       | `#0F172A`              |     **17.1:1**      | ✅ AAA |
| Body / Labels        | `text-slate-700`                           | `#334155`              |     **10.1:1**      | ✅ AAA |
| Secondary / Muted    | `text-slate-600` / `text-muted-foreground` | `#475569`              |      **5.7:1**      | ✅ AA  |
| Gold Accent Icon/Tag | `text-amber-700`                           | `#B45309`              |      **4.8:1**      | ✅ AA  |
| Active Pill Button   | `bg-amber-500 text-slate-950 font-bold`    | `#F59E0B` on `#020617` |      **9.3:1**      | ✅ AAA |
| Inactive Pill Button | `bg-white text-slate-700 border-slate-300` | `#334155` on `#FFFFFF` |     **10.3:1**      | ✅ AAA |
| Highlight Badge      | `bg-amber-100 text-amber-950`              | `#451A03` on `#FEF3C7` |     **10.2:1**      | ✅ AAA |

### Dark Mode (`bg-background: #090D16`, `card: #0D1424`)

| Role                 | Class                                       | Hex / Equivalent       | Contrast on #090D16 | Status |
| :------------------- | :------------------------------------------ | :--------------------- | :-----------------: | :----: |
| Primary Heading      | `text-white` / `dark:text-white`            | `#FFFFFF`              |     **19.8:1**      | ✅ AAA |
| Body / Labels        | `text-slate-200` / `dark:text-slate-200`    | `#E2E8F0`              |     **14.5:1**      | ✅ AAA |
| Secondary / Muted    | `text-slate-400` / `dark:text-slate-400`    | `#94A3B8`              |      **6.4:1**      | ✅ AA  |
| Gold Accent Icon/Tag | `text-amber-400` / `dark:text-amber-400`    | `#FBBF24`              |     **10.8:1**      | ✅ AAA |
| Active Pill Button   | `bg-amber-400 text-slate-950 font-bold`     | `#FBBF24` on `#020617` |     **10.8:1**      | ✅ AAA |
| Inactive Pill Button | `bg-white/5 text-slate-300 border-white/10` | `#CBD5E1` on `#141824` |      **8.2:1**      | ✅ AAA |

---

## 4. Runbook: How to Verify Color Contrast

### Step 1: Run the Contrast Calculator

Run the bundled script to check any foreground/background color pair:

```bash
node .agents/skills/accessibility-colors/scripts/check-contrast.mjs "<foreground_hex>" "<background_hex>"
```

### Step 2: Audit Component Code for Theme Leaks

Search for hardcoded dark classes that lack dual-theme variants:

```bash
# Look for naked text-white in features
grep -rn "text-white" src/features/
```

Ensure every instance is either:

1. Within a dark card scrim / hero overlay with dark backdrop (e.g. over a photo with dark gradient).
2. Paired with a light variant: `text-slate-900 dark:text-white`.

### Step 3: Interactive Visual Verification

Always test both light and dark modes:

1. Light theme (default): Verify all titles, button texts, counters, and tags are distinct and effortless to read.
2. Toggle theme or check `dark` class: Verify that contrast remains sharp against dark backgrounds.

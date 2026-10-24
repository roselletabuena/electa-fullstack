# Implementation Plan: Organizer Dashboard Theme Selector UI

**Feature ID**: `050-organizer-dashboard-theme-selector`  
**Ticket**: [VS-122](https://the-three-devsketeers.atlassian.net/browse/VS-122)  
**Parent Epic**: [VS-119](https://the-three-devsketeers.atlassian.net/browse/VS-119)  
**Date**: 2026-10-24

---

## 1. Architecture & Component Mapping

### Component Tree & Boundaries

```
GeneralBrandingForm.tsx (Client Component)
├── BannerAspectPreview.tsx (Existing Live Banner Preview)
└── ThemeSelectorCard.tsx (New — Interactive Card for each theme in THEME_REGISTRY)
    ├── Swatches Container (Base, Surface, Primary Accent, Text Primary)
    ├── Typography Badges (Heading & Body font indicators)
    └── Selection State Badge (Checkmark / Radio pill)
```

_(Note: `ThemeAppearancePreview.tsx` was retired from `GeneralBrandingForm` to keep the branding settings clean and compact; theme swatches and font tags are self-contained in `ThemeSelectorCard`)_

---

## 2. Technical Steps

### Step 1: Create `ThemeSelectorCard.tsx`

- Build a responsive, accessible card with `role="radio"`, `aria-checked={isSelected}`.
- Sharp 0px corners (`rounded-none`, `--radius: 0px`).
- Display theme name, description, color swatches with labels, and font badges.
- Distinct selected state (`border-sky-600 bg-sky-50/20 ring-1 ring-sky-600` or accent border) vs unselected state (`border-slate-300 dark:border-slate-800`).

### Step 2: Integrate into `GeneralBrandingForm.tsx`

- Register `theme` field in `useForm<UpdateEventBrandingInput>`.
- Set `defaultValues: { ..., theme: (event.theme as EventTheme) || "ELECTA_DEFAULT" }`.
- Watch `theme` via `useWatch`.
- Wire `onSelect={(t) => setValue("theme", t, { shouldDirty: true, shouldValidate: true })}`.
- Render theme selector cards grid directly.

### Step 3: Verify Server Action `updateEventBrandingAction`

- Ensure updating `theme` correctly records the change in `eventAuditLog` and revalidates relevant paths.

---

## 3. Test Plan

1. `tests/unit/events/dashboard/theme-selector-card.test.tsx`:
   - Renders theme name, description, swatches, and font tags.
   - Highlights active card when `isSelected` is true.
   - Fires `onSelect` callback when clicked or triggered via keyboard.
2. `tests/unit/events/dashboard/general-branding-form.test.tsx`:
   - Pre-selects event's existing theme.
   - Updates selection state and dirty banner on theme card click.
   - Submits selected theme to server action.
   - Reverts theme selection when "Discard Changes" is clicked.
3. `tests/unit/events/actions/update-event-branding.test.ts`:
   - Successfully persists new theme and logs audit entry.
   - Rejects unauthenticated and unauthorized requests with 401/403.

# Data Model: Responsive Site Navigation Bar & Theme Switcher

**Feature ID**: `029-site-navigation-theme-switcher`  
**Date**: 2026-10-11  

---

## 1. Entities & Data Structures

### Theme State Entity
The client-side visual mode stored in `localStorage` and managed by `ThemeProvider`.

```typescript
export type ThemeMode = "light" | "dark";

export interface ThemeState {
  currentTheme: ThemeMode;
  isHydrated: boolean;
}
```

### Navigation Link Item DTO
Defines structural navigation items within the site header.

```typescript
export interface NavActionItem {
  id: string;
  label: string;
  href: string;
  variant: "primary" | "secondary" | "ghost" | "portal";
  external?: boolean;
  ariaLabel?: string;
}

export interface SiteHeaderConfig {
  brand: {
    title: string;
    tagline: string;
    href: string;
  };
  actions: NavActionItem[];
}
```

### Storage Invariants & Keys

| Storage Medium | Key | Permitted Values | Default | Invalidation / Cleanup |
| :--- | :--- | :--- | :--- | :--- |
| `localStorage` | `electa-theme` | `"light"`, `"dark"` | `"light"` | None (user persistent preference) |
| `localStorage` (legacy) | `votesphere-theme` | `"light"`, `"dark"` | (fallback only) | Read-only backward compatibility |
| `document.documentElement` | `classList` | `["light"]` or `["dark"]` | `light` | Mutated synchronously upon theme toggle |

---

## 2. Validation Bounds & Invariants

1. **Theme Mode Determinism**: The theme value must be strictly narrowed to `"light"` or `"dark"`. Any invalid or corrupt values in `localStorage` fall back to `"light"`.
2. **Zero-Radius Style Guard**: All buttons rendered within `SiteHeader` must receive `rounded-none`.
3. **Link URL Safety**: Action links must be relative paths (e.g. `/events/new`, `/login`) to prevent open redirect vulnerabilities.

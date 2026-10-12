# Data Model: Accessible Site Footer with Directory Links

**Feature ID**: `031-accessible-site-footer`  
**Jira Key**: [VS-89](https://the-three-devsketeers.atlassian.net/browse/VS-89)  
**Date**: 2026-10-12

---

## 1. Entities & Data Structures

### Footer Link Item DTO

Represents an individual navigation link within a directory column.

```typescript
export interface FooterLinkItem {
  id: string;
  label: string;
  href: string;
  isExternal?: boolean;
  ariaLabel?: string;
  badge?: string;
}
```

### Footer Link Section / Column DTO

Represents a grouped directory column (e.g. Explore, Organizers, Platform, Legal).

```typescript
export interface FooterSection {
  id: string;
  title: string;
  links: FooterLinkItem[];
}
```

### Footer Configuration Entity

Represents the comprehensive footer schema including brand metadata, directory sections, copyright, and system status notices.

```typescript
export interface FooterConfig {
  brand: {
    title: string;
    tagline: string;
    description: string;
    logoSrc: string;
    homeHref: string;
  };
  sections: FooterSection[];
  legal: {
    copyright: string;
    statusText: string;
  };
}
```

### Component Props Contract

```typescript
export interface SiteFooterProps {
  readonly className?: string;
  readonly config?: FooterConfig;
}
```

---

## 2. Invariants & Validation Rules

1. **Tagline Exact Match**: Must match official brand tagline `"Vote. Engage. Celebrate."`.
2. **Copyright Text Exact Match**: Must contain `"© 2026 Electa Platform. All Rights Reserved."`.
3. **Strict Column Categorization**: The standard footer configuration must contain exactly the 4 required sections:
   - `explore` ("Explore")
   - `organizers` ("Organizers")
   - `platform` ("Platform")
   - `legal` ("Legal")
4. **URL Safety**: Internal links must begin with a relative slash (`/`) to prevent phishing redirects.
5. **Zero-Radius Geometry**: All container edges, link focus rings, and status badges must enforce `rounded-none`.

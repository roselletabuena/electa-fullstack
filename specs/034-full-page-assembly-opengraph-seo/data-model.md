# Data Model: Full Page Assembly & OpenGraph SEO

**Feature**: `034-full-page-assembly-opengraph-seo`  
**Date**: 2026-10-13

## 1. Entities & Data Structures

### 1.1 Page SEO & OpenGraph Configuration Contract

```typescript
export interface LandingPageSeoConfig {
  title: string;
  description: string;
  canonicalUrl: string;
  siteName: string;
  locale: string;
  openGraph: {
    title: string;
    description: string;
    url: string;
    siteName: string;
    locale: string;
    type: "website";
    images: Array<{
      url: string;
      width: number;
      height: number;
      alt: string;
    }>;
  };
  twitter: {
    card: "summary_large_image";
    title: string;
    description: string;
    images: string[];
  };
}
```

### 1.2 Streamlined Footer Variant Model

```typescript
export type FooterVariant = "default" | "streamlined";

export interface StreamlinedFooterProps {
  variant?: FooterVariant;
  className?: string;
}
```

## 2. Invariants & Validation Rules

- **Zero Emoticons**: Visual icons rendered in `HeroMarketingCard`, `FeatureTile`, `HighlightsRibbon`, `TrendingEventCard`, and `SiteFooter` must be SVG elements from `lucide-react`.
- **Zero-Radius Geometry**: All containers, buttons, cards, and banners must include `rounded-none` or `--radius: 0px`.
- **Contrast Ratios**: Headings and body text must satisfy WCAG 2.1 AA (≥ 4.5:1 text, ≥ 3:1 UI elements) in both Light Mode (Opal) and Dark Mode.

import { z } from "zod";

/**
 * Supported Theme Modes
 */
export const themeModeSchema = z.enum(["light", "dark"]);
export type ThemeMode = z.infer<typeof themeModeSchema>;

/**
 * Navigation Action Item Schema
 */
export const navActionItemSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  href: z.string().min(1),
  variant: z.enum(["primary", "secondary", "ghost", "portal"]),
  external: z.boolean().optional(),
  ariaLabel: z.string().optional(),
});

export type NavActionItem = z.infer<typeof navActionItemSchema>;

/**
 * Site Navigation Configuration Schema
 */
export const siteHeaderConfigSchema = z.object({
  brand: z.object({
    title: z.string().min(1),
    tagline: z.string().min(1),
    href: z.string().min(1),
  }),
  actions: z.array(navActionItemSchema),
});

export type SiteHeaderConfig = z.infer<typeof siteHeaderConfigSchema>;

/**
 * Props for SiteHeader Component
 */
export interface SiteHeaderProps {
  readonly className?: string;
  readonly showActions?: boolean;
  readonly showThemeToggle?: boolean;
}

/**
 * Props for BrandMark Component
 */
export interface BrandMarkProps {
  readonly className?: string;
  readonly size?: number;
  readonly showTagline?: boolean;
  readonly href?: string;
}

/**
 * Footer Link Item Schema
 */
export const footerLinkItemSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  href: z.string().min(1),
  isExternal: z.boolean().optional(),
  ariaLabel: z.string().optional(),
  badge: z.string().optional(),
});

export type FooterLinkItem = z.infer<typeof footerLinkItemSchema>;

/**
 * Footer Column / Section Schema
 */
export const footerSectionSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  links: z.array(footerLinkItemSchema).min(1),
});

export type FooterSection = z.infer<typeof footerSectionSchema>;

/**
 * Complete Footer Configuration Schema
 */
export const footerConfigSchema = z.object({
  brand: z.object({
    title: z.string().min(1),
    tagline: z.string().min(1),
    description: z.string().min(1),
    logoSrc: z.string().min(1),
    homeHref: z.string().min(1),
  }),
  sections: z.array(footerSectionSchema).min(1),
  legal: z.object({
    copyright: z.string().min(1),
    statusText: z.string().min(1),
  }),
});

export type FooterConfig = z.infer<typeof footerConfigSchema>;

/**
 * Footer Variant Schema
 */
export const footerVariantSchema = z.enum(["default", "streamlined"]);
export type FooterVariant = z.infer<typeof footerVariantSchema>;

/**
 * Props for SiteFooter Component
 */
export interface SiteFooterProps {
  readonly className?: string;
  readonly config?: FooterConfig;
  readonly variant?: FooterVariant;
}

import { z } from "zod";

/**
 * Footer link item schema
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
 * Footer column / section schema
 */
export const footerSectionSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  links: z.array(footerLinkItemSchema).min(1),
});

export type FooterSection = z.infer<typeof footerSectionSchema>;

/**
 * Complete footer configuration schema
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
 * Component Props Contract for SiteFooter
 */
export interface SiteFooterProps {
  readonly className?: string;
  readonly config?: FooterConfig;
}

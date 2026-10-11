import { z } from "zod";

/**
 * Theme schema and types
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
 * Props Contract for SiteHeader component
 */
export interface SiteHeaderProps {
  readonly className?: string;
  readonly showActions?: boolean;
}

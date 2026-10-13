import { z } from "zod";

/**
 * Zod schema for UserSessionDto validation in Account Nav
 */
export const userAccountNavSessionSchema = z.object({
  userId: z.string().min(1),
  email: z.string().email(),
  name: z.string().min(1),
  role: z.enum(["USER", "ORGANIZER", "VOTER", "ADMIN"]).optional(),
  avatarUrl: z.string().url().nullable().optional(),
  organizationName: z.string().nullable().optional(),
  isNewUser: z.boolean().optional(),
  expiresAt: z.string(),
});

export type UserAccountNavSession = z.infer<typeof userAccountNavSessionSchema>;

/**
 * Navigation item rendered inside the account dropdown
 */
export interface AccountDropdownItem {
  id: string;
  label: string;
  href: string;
  iconName?: string;
  external?: boolean;
}

import { z } from "zod";

export const eventStatusFilterEnum = z.enum(["ALL", "PUBLISHED", "DRAFT", "ARCHIVED"]);

export const dashboardQuerySchema = z.object({
  status: eventStatusFilterEnum.default("ALL"),
  q: z.string().trim().default(""),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

export type DashboardQueryValues = z.infer<typeof dashboardQuerySchema>;

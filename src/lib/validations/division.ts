import { z } from "zod";

export const createDivisionSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Division name is required")
    .max(100, "Division name cannot exceed 100 characters"),
  description: z
    .string()
    .trim()
    .max(500, "Description cannot exceed 500 characters")
    .optional()
    .nullable(),
  displayOrder: z
    .number()
    .int("Display order must be an integer")
    .min(0, "Display order must be non-negative")
    .default(0),
});

export const updateDivisionSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Division name is required")
    .max(100, "Division name cannot exceed 100 characters")
    .optional(),
  description: z
    .string()
    .trim()
    .max(500, "Description cannot exceed 500 characters")
    .optional()
    .nullable(),
  displayOrder: z
    .number()
    .int("Display order must be an integer")
    .min(0, "Display order must be non-negative")
    .optional(),
});

export type CreateDivisionInput = z.infer<typeof createDivisionSchema>;
export type UpdateDivisionInput = z.infer<typeof updateDivisionSchema>;

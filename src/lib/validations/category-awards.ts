import { z } from "zod";

export const createAwardCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Category name is required")
    .max(100, "Category name cannot exceed 100 characters"),
  description: z
    .string()
    .trim()
    .max(500, "Description cannot exceed 500 characters")
    .optional()
    .nullable(),
  isVotingOpen: z.boolean().default(true),
  displayOrder: z
    .number()
    .int("Display order must be an integer")
    .min(0, "Display order must be non-negative")
    .default(0),
});

export const updateAwardCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Category name is required")
    .max(100, "Category name cannot exceed 100 characters")
    .optional(),
  description: z
    .string()
    .trim()
    .max(500, "Description cannot exceed 500 characters")
    .optional()
    .nullable(),
  isVotingOpen: z.boolean().optional(),
  displayOrder: z
    .number()
    .int("Display order must be an integer")
    .min(0, "Display order must be non-negative")
    .optional(),
});

export type CreateAwardCategoryInput = z.infer<typeof createAwardCategorySchema>;
export type UpdateAwardCategoryInput = z.infer<typeof updateAwardCategorySchema>;

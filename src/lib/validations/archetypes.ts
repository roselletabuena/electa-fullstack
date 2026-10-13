import { z } from "zod";
import { EVENT_ARCHETYPES } from "@/features/events/types/archetype";


export const eventArchetypeSchema = z.enum(EVENT_ARCHETYPES);

export const createEventPositionSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Position name cannot be empty")
      .max(100, "Position name cannot exceed 100 characters"),
    description: z
      .string()
      .trim()
      .max(500, "Description cannot exceed 500 characters")
      .optional()
      .nullable(),
    maxSelectionsPerVoter: z
      .number()
      .int("Maximum selections must be an integer")
      .min(1, "Maximum selections must be at least 1")
      .max(50, "Maximum selections cannot exceed 50")
      .default(1),
    minSelectionsPerVoter: z
      .number()
      .int("Minimum selections must be an integer")
      .min(0, "Minimum selections cannot be negative")
      .max(50, "Minimum selections cannot exceed 50")
      .default(0),
    displayOrder: z
      .number()
      .int("Display order must be an integer")
      .min(0, "Display order must be non-negative")
      .default(0),
    isVotingOpen: z.boolean().default(true),
  })
  .refine(
    (data) => data.minSelectionsPerVoter <= data.maxSelectionsPerVoter,
    {
      message: "Minimum selections cannot exceed maximum selections",
      path: ["minSelectionsPerVoter"],
    }
  );

export type CreateEventPositionInput = z.input<typeof createEventPositionSchema>;

export const updateEventPositionSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Position name cannot be empty")
      .max(100, "Position name cannot exceed 100 characters")
      .optional(),
    description: z
      .string()
      .trim()
      .max(500, "Description cannot exceed 500 characters")
      .optional()
      .nullable(),
    maxSelectionsPerVoter: z
      .number()
      .int("Maximum selections must be an integer")
      .min(1, "Maximum selections must be at least 1")
      .max(50, "Maximum selections cannot exceed 50")
      .optional(),
    minSelectionsPerVoter: z
      .number()
      .int("Minimum selections must be an integer")
      .min(0, "Minimum selections cannot be negative")
      .max(50, "Minimum selections cannot exceed 50")
      .optional(),
    displayOrder: z
      .number()
      .int("Display order must be an integer")
      .min(0, "Display order must be non-negative")
      .optional(),
    isVotingOpen: z.boolean().optional(),
  })
  .refine(
    (data) => {
      if (
        data.minSelectionsPerVoter !== undefined &&
        data.maxSelectionsPerVoter !== undefined
      ) {
        return data.minSelectionsPerVoter <= data.maxSelectionsPerVoter;
      }
      return true;
    },
    {
      message: "Minimum selections cannot exceed maximum selections",
      path: ["minSelectionsPerVoter"],
    }
  );

export type UpdateEventPositionInput = z.input<typeof updateEventPositionSchema>;

export const reorderPositionsSchema = z.object({
  positionIds: z
    .array(z.string().min(1, "Position ID cannot be empty"))
    .min(1, "At least one position ID is required"),
});

export type ReorderPositionsInput = z.input<typeof reorderPositionsSchema>;

export const updateEventArchetypeSchema = z.object({
  archetype: eventArchetypeSchema,
});

export type UpdateEventArchetypeInput = z.input<typeof updateEventArchetypeSchema>;


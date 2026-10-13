import { z } from "zod";
import { EVENT_ARCHETYPES, type EventArchetype } from "@/features/events/types/archetype";
import { eventSlugSchema } from "./event-slug";

export const wizardPositionDraftSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Position/Track name cannot be empty")
      .max(100, "Position/Track name cannot exceed 100 characters"),
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
    displayOrder: z.number().int().default(0),
  })
  .refine((data) => data.minSelectionsPerVoter <= data.maxSelectionsPerVoter, {
    message: "Minimum selections cannot exceed maximum selections",
    path: ["minSelectionsPerVoter"],
  });

export type WizardPositionDraftInput = z.infer<typeof wizardPositionDraftSchema>;

export const wizardDivisionDraftSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Division name cannot be empty")
    .max(100, "Division name cannot exceed 100 characters"),
  description: z
    .string()
    .trim()
    .max(500, "Description cannot exceed 500 characters")
    .optional()
    .nullable(),
  displayOrder: z.number().int().default(0),
});

export type WizardDivisionDraftInput = z.infer<typeof wizardDivisionDraftSchema>;

export const wizardAwardDraftSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Award category name cannot be empty")
    .max(100, "Award category name cannot exceed 100 characters"),
  description: z
    .string()
    .trim()
    .max(500, "Description cannot exceed 500 characters")
    .optional()
    .nullable(),
  isVotingOpen: z.boolean().default(true),
  displayOrder: z.number().int().default(0),
});

export type WizardAwardDraftInput = z.infer<typeof wizardAwardDraftSchema>;

export const createEventWizardSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, "Title must be at least 3 characters")
      .max(120, "Title must not exceed 120 characters"),
    slug: eventSlugSchema,
    description: z
      .string()
      .trim()
      .min(10, "Description must be at least 10 characters")
      .max(5000, "Description must not exceed 5000 characters"),
    bannerUrl: z.string().url("Banner URL must be a valid URL"),
    startsAt: z.string().datetime({ message: "startsAt must be a valid ISO-8601 datetime string" }),
    endsAt: z.string().datetime({ message: "endsAt must be a valid ISO-8601 datetime string" }),
    archetype: z.enum(EVENT_ARCHETYPES).default("PAGEANT"),
    positions: z.array(wizardPositionDraftSchema).default([]),
    divisions: z.array(wizardDivisionDraftSchema).default([]),
    awardCategories: z.array(wizardAwardDraftSchema).default([]),
  })
  .superRefine((data, ctx) => {
    const starts = new Date(data.startsAt).getTime();
    const ends = new Date(data.endsAt).getTime();
    const ONE_HOUR_MS = 60 * 60 * 1000;

    if (ends - starts < ONE_HOUR_MS) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Event end time must be at least 1 hour after the start time",
        path: ["endsAt"],
      });
    }

    if (data.archetype === "HACKATHON" && data.positions.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "At least one challenge track or category is required for hackathons.",
        path: ["positions"],
      });
    }
  });

export type CreateEventWizardInput = z.infer<typeof createEventWizardSchema>;
export { EVENT_ARCHETYPES, type EventArchetype };

import { z } from "zod";
import { EVENT_ARCHETYPES, type EventArchetype } from "@/features/events/types/archetype";
import { eventSlugSchema } from "@/lib/validations/event";

export const wizardPositionDraftSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Position/Track name cannot be empty")
    .max(100, "Position/Track name cannot exceed 100 characters"),
  description: z
    .string()
    .trim()
    .max(500, "Description cannot exceed 500 characters")
    .optional(),
  maxSelectionsPerVoter: z
    .number()
    .int()
    .min(1, "Max selections must be at least 1")
    .max(50, "Max selections cannot exceed 50")
    .default(1),
  minSelectionsPerVoter: z
    .number()
    .int()
    .min(0, "Min selections cannot be negative")
    .max(50, "Min selections cannot exceed 50")
    .default(0),
  displayOrder: z.number().int().default(0),
});

export const wizardDivisionDraftSchema = z.object({
  name: z.string().trim().min(1, "Division name cannot be empty").max(100),
  description: z.string().trim().max(500).optional(),
  displayOrder: z.number().int().default(0),
});

export const wizardAwardDraftSchema = z.object({
  name: z.string().trim().min(1, "Award name cannot be empty").max(100),
  description: z.string().trim().max(500).optional(),
  isVotingOpen: z.boolean().default(true),
  displayOrder: z.number().int().default(0),
});

export const createEventWizardSchema = z
  .object({
    title: z.string().trim().min(3, "Title must be at least 3 characters").max(120),
    slug: eventSlugSchema,
    description: z.string().trim().min(10, "Description must be at least 10 characters").max(5000),
    bannerUrl: z.string().url("Banner URL must be a valid URL"),
    startsAt: z.string().datetime(),
    endsAt: z.string().datetime(),
    archetype: z.enum(EVENT_ARCHETYPES).default("PAGEANT"),
    positions: z.array(wizardPositionDraftSchema).default([]),
    divisions: z.array(wizardDivisionDraftSchema).default([]),
    awardCategories: z.array(wizardAwardDraftSchema).default([]),
  })
  .superRefine((data, ctx) => {
    const starts = new Date(data.startsAt).getTime();
    const ends = new Date(data.endsAt).getTime();
    if (ends - starts < 60 * 60 * 1000) {
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

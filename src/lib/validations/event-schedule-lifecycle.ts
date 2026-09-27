import { z } from "zod";

export const eventPublicationStatusSchema = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);

export const scheduleLifecycleFormSchema = z
  .object({
    startsAt: z
      .string()
      .min(1, "Voting start date and time is required")
      .refine((val) => !isNaN(Date.parse(val)), "Invalid start date format"),
    endsAt: z
      .string()
      .min(1, "Voting end date and time is required")
      .refine((val) => !isNaN(Date.parse(val)), "Invalid end date format"),
    publicationStatus: eventPublicationStatusSchema,
    draftPassphrase: z
      .string()
      .max(100, "Draft passphrase cannot exceed 100 characters")
      .optional(),
    clearDraftPassphrase: z.boolean().optional(),
    reason: z.string().max(500, "Reason must not exceed 500 characters").optional(),
  })
  .refine(
    (data) => {
      const start = new Date(data.startsAt).getTime();
      const end = new Date(data.endsAt).getTime();
      return end > start;
    },
    {
      message: "Voting end date must be after start date",
      path: ["endsAt"],
    },
  )
  .refine(
    (data) => {
      if (data.draftPassphrase && data.draftPassphrase.trim().length > 0) {
        return data.draftPassphrase.trim().length >= 4;
      }
      return true;
    },
    {
      message: "Draft preview passphrase must be at least 4 characters",
      path: ["draftPassphrase"],
    },
  );

export const updateScheduleLifecycleSchema = scheduleLifecycleFormSchema;

export type ScheduleLifecycleFormValues = z.infer<typeof scheduleLifecycleFormSchema>;
export type UpdateScheduleLifecycleInput = z.infer<typeof updateScheduleLifecycleSchema>;

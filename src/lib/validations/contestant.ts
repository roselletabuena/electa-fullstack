import { z } from "zod";

export const contestantDivisionEnum = z.enum(["FEMALE", "MALE", "LGBTQ", "TEEN"]);
export const contestantStatusEnum = z.enum(["ACTIVE", "HIDDEN", "WITHDRAWN"]);
export const mediaTypeEnum = z.enum(["PHOTO", "VIDEO_EMBED"]);
export const embedPlatformEnum = z.enum(["YOUTUBE", "TIKTOK", "INSTAGRAM", "FACEBOOK", "NONE"]);

export const contestantMediaSchema = z.object({
  mediaType: mediaTypeEnum.default("PHOTO"),
  url: z.string().min(1, "Media URL is required"),
  embedPlatform: embedPlatformEnum.default("NONE"),
  embedId: z.string().nullable().optional(),
  displayOrder: z.number().int().min(0).default(0),
  aspectRatio: z.string().default("4:5"),
  isCover: z.boolean().default(false),
});

export const createContestantSchema = z.object({
  contestantNumber: z.coerce.number().int().min(1, "Candidate number must be at least 1"),
  name: z.string().min(1, "Name is required").max(100, "Name must be at most 100 characters"),
  division: z.string().min(1).default("FEMALE"),
  divisionId: z.string().optional().nullable(),
  hometown: z
    .string()
    .max(120, "Hometown must be at most 120 characters")
    .optional()
    .or(z.literal("")),
  heightCm: z.coerce.number().int().min(50).max(250).optional().nullable(),
  bio: z.string().max(1000, "Bio must be at most 1000 characters").optional().or(z.literal("")),
  advocacy: z
    .string()
    .max(1000, "Advocacy must be at most 1000 characters")
    .optional()
    .or(z.literal("")),
  avatarUrl: z.string().min(1, "Cover avatar image is required"),
  instagramUrl: z.string().optional().or(z.literal("")),
  tiktokUrl: z.string().optional().or(z.literal("")),
  facebookUrl: z.string().optional().or(z.literal("")),
  categoryIds: z.array(z.string()).optional(),
  media: z.array(contestantMediaSchema).max(10, "Maximum of 10 media items allowed").optional(),
});

export const updateContestantSchema = createContestantSchema.partial().extend({
  status: contestantStatusEnum.optional(),
});

export const updateContestantStatusSchema = z.object({
  status: contestantStatusEnum,
});

export type CreateContestantSchema = z.infer<typeof createContestantSchema>;
export type UpdateContestantSchema = z.infer<typeof updateContestantSchema>;
export type UpdateContestantStatusSchema = z.infer<typeof updateContestantStatusSchema>;

import { z } from "zod";

/**
 * Validates repository URL: must be valid HTTPS GitHub or GitLab URL.
 * Examples:
 * - https://github.com/owner/repo
 * - https://gitlab.com/group/subgroup/project
 */
export const gitRepositoryUrlRegex = /^https:\/\/(www\.)?(github\.com|gitlab\.com)\/[A-Za-z0-9_.-]+(\/[A-Za-z0-9_.-]+)+(\/)?$/;

/**
 * Validates optional demo video URLs (YouTube or Loom HTTPS only)
 */
export const videoUrlRegex = /^https:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|loom\.com\/share\/)[A-Za-z0-9_.-]+(\/)?$/;

/**
 * Validates optional design prototype URLs (Figma HTTPS only)
 */
export const figmaUrlRegex = /^https:\/\/(www\.)?figma\.com\/(file|design|proto)\/[A-Za-z0-9_.-]+/;

export const projectMemberSchema = z.object({
  name: z.string().trim().min(2, "Member name must be at least 2 characters").max(100),
  email: z.string().trim().email("Invalid member email address"),
  role: z.string().trim().max(50).default("Contributor"),
});

export const projectSubmissionLinkSchema = z.object({
  label: z.string().trim().min(1, "Link label is required").max(50),
  url: z.string().trim().url("Must be a valid URL").refine((val) => val.startsWith("https://"), {
    message: "Link URL must use HTTPS protocol",
  }),
});

export const createProjectSubmissionSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(120),
  tagline: z.string().trim().max(200).optional(),
  description: z.string().trim().min(10, "Description must be at least 10 characters").max(5000),
  repositoryUrl: z
    .string()
    .trim()
    .url("Must be a valid URL")
    .refine((url) => gitRepositoryUrlRegex.test(url), {
      message: "Must be a valid GitHub or GitLab repository URL.",
    }),
  demoUrl: z
    .string()
    .trim()
    .url("Demo URL must be a valid URL")
    .refine((url) => url.startsWith("https://"), {
      message: "Demo URL must use HTTPS protocol",
    })
    .optional()
    .or(z.literal("")),
  videoUrl: z
    .string()
    .trim()
    .url("Video URL must be a valid URL")
    .refine((url) => url.startsWith("https://"), {
      message: "Video URL must use HTTPS protocol",
    })
    .optional()
    .or(z.literal("")),
  trackTags: z
    .array(z.string().trim().min(1, "Track tag cannot be empty"))
    .min(1, "At least one track tag is required")
    .max(5, "Maximum 5 track tags allowed")
    .refine((tracks) => new Set(tracks.map((t) => t.toLowerCase())).size === tracks.length, {
      message: "Duplicate track tags are not allowed",
    }),
  members: z.array(projectMemberSchema).max(10, "A project team may have at most 10 members").default([]),
  links: z.array(projectSubmissionLinkSchema).max(10, "Maximum 10 custom links allowed").default([]),
});

export type CreateProjectSubmissionInput = z.infer<typeof createProjectSubmissionSchema>;
export type ProjectMemberInput = z.infer<typeof projectMemberSchema>;
export type ProjectSubmissionLinkInput = z.infer<typeof projectSubmissionLinkSchema>;

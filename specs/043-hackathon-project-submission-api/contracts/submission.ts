import { z } from "zod";

/**
 * Validates repository URL (GitHub or GitLab HTTPS only)
 */
export const gitRepositoryUrlRegex = /^https:\/\/(www\.)?(github\.com|gitlab\.com)\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+(\/)?$/;

/**
 * Validates video URLs (YouTube or Loom HTTPS only)
 */
export const videoUrlRegex = /^https:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|loom\.com\/share\/)[A-Za-z0-9_.-]+(\/)?$/;

/**
 * Validates design URLs (Figma HTTPS only)
 */
export const figmaUrlRegex = /^https:\/\/(www\.)?figma\.com\/(file|design|proto)\/[A-Za-z0-9_.-]+(\/)?/;

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
  trackTags: z.array(z.string().trim().min(1)).min(1, "At least one track tag is required").max(5, "Maximum 5 track tags allowed"),
  members: z.array(projectMemberSchema).max(10, "A project team may have at most 10 members").default([]),
  links: z.array(projectSubmissionLinkSchema).max(10, "Maximum 10 custom links allowed").default([]),
});

export type CreateProjectSubmissionInput = z.infer<typeof createProjectSubmissionSchema>;

export interface ProjectMemberDto {
  id: string;
  submissionId: string;
  name: string;
  email: string;
  role: string | null;
  createdAt: string;
}

export interface ProjectTrackTagDto {
  id: string;
  submissionId: string;
  trackName: string;
  createdAt: string;
}

export interface ProjectSubmissionLinkDto {
  id: string;
  submissionId: string;
  label: string;
  url: string;
  createdAt: string;
}

export interface ProjectSubmissionDto {
  id: string;
  eventId: string;
  teamLeadId: string;
  title: string;
  tagline: string | null;
  description: string;
  repositoryUrl: string;
  demoUrl: string | null;
  videoUrl: string | null;
  status: "DRAFT" | "SUBMITTED" | "UNDER_REVIEW" | "ACCEPTED" | "REJECTED";
  createdAt: string;
  updatedAt: string;
  members: ProjectMemberDto[];
  trackTags: ProjectTrackTagDto[];
  links: ProjectSubmissionLinkDto[];
}

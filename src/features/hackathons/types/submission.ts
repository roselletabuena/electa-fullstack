import type { ProjectSubmissionStatus } from "@/generated/client/enums";

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
  status: ProjectSubmissionStatus;
  voteCount?: number | undefined;
  createdAt: string;
  updatedAt: string;
  members: ProjectMemberDto[];
  trackTags: ProjectTrackTagDto[];
  links: ProjectSubmissionLinkDto[];
}

export interface GetProjectSubmissionsFilter {
  track?: string | undefined;
  status?: ProjectSubmissionStatus | undefined;
  teamLeadId?: string | undefined;
}

export type SubmissionServiceErrorCode =
  | "EVENT_NOT_FOUND"
  | "NOT_A_HACKATHON"
  | "EVENT_NOT_PUBLISHED"
  | "SUBMISSION_WINDOW_CLOSED"
  | "DUPLICATE_SUBMISSION"
  | "VALIDATION_FAILED";

export interface SubmissionServiceError {
  code: SubmissionServiceErrorCode;
  message: string;
  status: 400 | 403 | 404 | 409;
}

export type CreateSubmissionResult =
  | { success: true; data: ProjectSubmissionDto }
  | { success: false; error: SubmissionServiceError };

export type GetSubmissionsResult =
  | { success: true; data: ProjectSubmissionDto[] }
  | { success: false; error: SubmissionServiceError };

export type GetSubmissionResult =
  | { success: true; data: ProjectSubmissionDto }
  | { success: false; error: SubmissionServiceError };

export interface SubmitProjectActionResult {
  success: boolean;
  data?: ProjectSubmissionDto | undefined;
  error?: string | undefined;
  fieldErrors?: Record<string, string> | undefined;
}

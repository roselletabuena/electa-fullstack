import { z } from "zod";

export const CastPeoplesChoiceVoteSchema = z.object({
  eventId: z.string().min(1, "Event ID is required"),
  submissionId: z.string().min(1, "Project submission ID is required"),
});

export type CastPeoplesChoiceVoteInput = z.infer<typeof CastPeoplesChoiceVoteSchema>;

export interface CastPeoplesChoiceVoteResultDto {
  submissionId: string;
  totalVotes: number;
  hasVoted: boolean;
}

export interface PeoplesChoiceVotingErrorDto {
  code:
    | "NOT_AUTHENTICATED"
    | "ALREADY_VOTED"
    | "EVENT_NOT_ACTIVE"
    | "SUBMISSION_NOT_FOUND"
    | "RATE_LIMIT_EXCEEDED"
    | "INTERNAL_ERROR";
  message: string;
}

export type CastPeoplesChoiceVoteResponse =
  | { success: true; data: CastPeoplesChoiceVoteResultDto; error: null }
  | { success: false; data: null; error: PeoplesChoiceVotingErrorDto };

export interface AttendeePeoplesChoiceStatusDto {
  hasVoted: boolean;
  votedSubmissionId: string | null;
  remainingCredits: number;
}

export interface StageProjectLeaderboardEntryDto {
  id: string;
  title: string;
  tagline: string | null;
  repositoryUrl: string;
  demoUrl: string | null;
  trackTags: string[];
  members: string[];
  voteCount: number;
  rank: number;
  votePercentage: number;
}

export interface StageLeaderboardDataDto {
  eventId: string;
  eventSlug: string;
  eventTitle: string;
  totalVotesCast: number;
  totalProjects: number;
  topProjects: StageProjectLeaderboardEntryDto[];
  tracks: string[];
}

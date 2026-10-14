import { z } from "zod";
import type { OfficeSelection, CastBallotInput } from "@/lib/validations/ballot";

export type { OfficeSelection, CastBallotInput };

export interface BallotPositionDto {
  id: string;
  name: string;
  description?: string | null;
  minSelectionsPerVoter: number;
  maxSelectionsPerVoter: number;
  displayOrder: number;
  isVotingOpen: boolean;
}

export interface BallotCandidateDto {
  id: string;
  contestantNumber: number;
  name: string;
  avatarUrl: string;
  bio?: string | null;
  positionId: string;
  positionName?: string;
}

export interface PublicBallotEventDto {
  id: string;
  slug: string;
  title: string;
  description: string;
  bannerUrl: string;
  startsAt: string;
  endsAt: string;
  operationalState: string;
  positions: BallotPositionDto[];
  candidates: BallotCandidateDto[];
}

export interface BallotSubmissionReceiptDto {
  ballotId: string;
  eventId: string;
  votesCount: number;
  submittedAt: string;
}

export const ballotSelectionsSchema = z.record(
  z.string().uuid(),
  z.array(z.string().uuid())
);

export type BallotSelections = z.infer<typeof ballotSelectionsSchema>;

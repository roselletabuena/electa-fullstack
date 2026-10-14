import { z } from "zod";

export const TurnoutMetricsSchema = z.object({
  totalWhitelistedVoters: z.number().int().nonnegative(),
  recordedParticipations: z.number().int().nonnegative(),
  turnoutPercentage: z.number().min(0).max(100),
  isQuorumMet: z.boolean(),
  quorumThresholdPercentage: z.number().min(0).max(100).default(50),
  votingVelocityPerHour: z.number().nonnegative(),
  isPollClosed: z.boolean(),
  endsAt: z.string(),
});

export type TurnoutMetricsDto = z.infer<typeof TurnoutMetricsSchema>;

export const CandidateTallySchema = z.object({
  candidateId: z.string(),
  candidateName: z.string().min(1),
  contestantNumber: z.number().int().positive(),
  avatarUrl: z.string(),
  voteCount: z.number().int().nonnegative(),
  votePercentage: z.number().min(0).max(100),
  isWinner: z.boolean(),
});

export type CandidateTallyDto = z.infer<typeof CandidateTallySchema>;

export const OfficeTallySchema = z.object({
  officeId: z.string(),
  officeName: z.string().min(1),
  maxSelectionsPerVoter: z.number().int().positive(),
  totalVotesCast: z.number().int().nonnegative(),
  candidates: z.array(CandidateTallySchema),
  winners: z.array(CandidateTallySchema),
});

export type OfficeTallyDto = z.infer<typeof OfficeTallySchema>;

export const CertifiedElectionAuditSchema = z.object({
  eventId: z.string(),
  eventTitle: z.string().min(1),
  eventSlug: z.string().min(1),
  startsAt: z.string(),
  endsAt: z.string(),
  certifiedAt: z.string(),
  certifiedBy: z.string().min(1),
  turnout: TurnoutMetricsSchema,
  offices: z.array(OfficeTallySchema),
  auditHash: z.string().regex(/^[a-f0-9]{64}$/i, "Invalid SHA-256 hash"),
});

export type CertifiedElectionAuditDto = z.infer<typeof CertifiedElectionAuditSchema>;

export const ExportFormatSchema = z.enum(["json", "csv"]);
export type ExportFormat = z.infer<typeof ExportFormatSchema>;

export const ExportCertifiedTallyInputSchema = z.object({
  eventId: z.string(),
  format: ExportFormatSchema.default("csv"),
});

export type ExportCertifiedTallyInput = z.infer<typeof ExportCertifiedTallyInputSchema>;

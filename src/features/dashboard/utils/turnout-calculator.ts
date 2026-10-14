import { createHash } from "node:crypto";
import type {
  TurnoutMetricsDto,
  OfficeTallyDto,
  CandidateTallyDto,
  CertifiedElectionAuditDto,
} from "../types/turnout-audit";

export interface ComputeTurnoutParams {
  totalWhitelistedVoters: number;
  recordedParticipations: number;
  recentParticipationsCount?: number;
  endsAt: Date | string;
  now?: Date | string;
  quorumThresholdPercentage?: number;
}

export function computeTurnoutMetrics(params: ComputeTurnoutParams): TurnoutMetricsDto {
  const {
    totalWhitelistedVoters,
    recordedParticipations,
    recentParticipationsCount = 0,
    endsAt,
    now = new Date(),
    quorumThresholdPercentage = 50,
  } = params;

  const validRoster = Math.max(0, totalWhitelistedVoters);
  const validParticipations = Math.max(0, recordedParticipations);

  let turnoutPercentage = 0;
  if (validRoster > 0) {
    const raw = (validParticipations / validRoster) * 100;
    // Round to 1 decimal place, clamp to 100
    turnoutPercentage = Math.min(100, Math.round(raw * 10) / 10);
  }

  const endsDate = new Date(endsAt);
  const nowDate = new Date(now);
  const isPollClosed = nowDate.getTime() >= endsDate.getTime();
  const isQuorumMet = turnoutPercentage >= quorumThresholdPercentage;

  return {
    totalWhitelistedVoters: validRoster,
    recordedParticipations: validParticipations,
    turnoutPercentage,
    isQuorumMet,
    quorumThresholdPercentage,
    votingVelocityPerHour: Math.max(0, recentParticipationsCount),
    isPollClosed,
    endsAt: endsDate.toISOString(),
  };
}

export interface RawOfficeInput {
  id: string;
  name: string;
  maxSelectionsPerVoter?: number;
  contestants: Array<{
    id: string;
    name: string;
    contestantNumber: number;
    avatarUrl?: string | null;
  }>;
}

export interface RawBallotSelectionInput {
  officeId: string;
  candidateId: string;
}

export function computeOfficeTallies(
  offices: RawOfficeInput[],
  ballotSelections: RawBallotSelectionInput[],
): OfficeTallyDto[] {
  // Map ballot selections by officeId -> candidateId -> count
  const countsByOffice = new Map<string, Map<string, number>>();

  for (const selection of ballotSelections) {
    if (!countsByOffice.has(selection.officeId)) {
      countsByOffice.set(selection.officeId, new Map());
    }
    const candidateMap = countsByOffice.get(selection.officeId)!;
    candidateMap.set(selection.candidateId, (candidateMap.get(selection.candidateId) ?? 0) + 1);
  }

  return offices.map((office) => {
    const candidateMap = countsByOffice.get(office.id);
    let totalVotesCast = 0;

    const candidatesWithCounts = office.contestants.map((c) => {
      const voteCount = candidateMap?.get(c.id) ?? 0;
      totalVotesCast += voteCount;
      return {
        candidateId: c.id,
        candidateName: c.name,
        contestantNumber: c.contestantNumber,
        avatarUrl: c.avatarUrl || "/placeholder-avatar.png",
        voteCount,
      };
    });

    // Find highest vote count
    let maxVotes = 0;
    for (const c of candidatesWithCounts) {
      if (c.voteCount > maxVotes) {
        maxVotes = c.voteCount;
      }
    }

    const candidates: CandidateTallyDto[] = candidatesWithCounts.map((c) => {
      const votePercentage =
        totalVotesCast > 0 ? Math.round(((c.voteCount / totalVotesCast) * 100) * 10) / 10 : 0;
      const isWinner = maxVotes > 0 && c.voteCount === maxVotes;

      return {
        ...c,
        votePercentage,
        isWinner,
      };
    });

    const winners = candidates.filter((c) => c.isWinner);

    return {
      officeId: office.id,
      officeName: office.name,
      maxSelectionsPerVoter: office.maxSelectionsPerVoter ?? 1,
      totalVotesCast,
      candidates,
      winners,
    };
  });
}

export function generateAuditHash(payload: Omit<CertifiedElectionAuditDto, "auditHash">): string {
  const deterministicString = JSON.stringify({
    eventId: payload.eventId,
    eventSlug: payload.eventSlug,
    endsAt: payload.endsAt,
    certifiedAt: payload.certifiedAt,
    turnout: {
      totalWhitelistedVoters: payload.turnout.totalWhitelistedVoters,
      recordedParticipations: payload.turnout.recordedParticipations,
      turnoutPercentage: payload.turnout.turnoutPercentage,
      isQuorumMet: payload.turnout.isQuorumMet,
    },
    offices: payload.offices.map((o) => ({
      officeId: o.officeId,
      totalVotesCast: o.totalVotesCast,
      candidates: o.candidates.map((c) => ({
        candidateId: c.candidateId,
        voteCount: c.voteCount,
        isWinner: c.isWinner,
      })),
    })),
  });

  return createHash("sha256").update(deterministicString).digest("hex");
}

function escapeCsvField(val: string | number | boolean): string {
  const str = String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function formatAuditCsv(audit: CertifiedElectionAuditDto): string {
  const lines: string[] = [];

  // Metadata block
  lines.push(`ELECTA OFFICIAL ELECTION CERTIFICATION REPORT`);
  lines.push(`Event Title,${escapeCsvField(audit.eventTitle)}`);
  lines.push(`Event Slug,${escapeCsvField(audit.eventSlug)}`);
  lines.push(`Event ID,${escapeCsvField(audit.eventId)}`);
  lines.push(`Polls Closed At,${escapeCsvField(audit.endsAt)}`);
  lines.push(`Certified At,${escapeCsvField(audit.certifiedAt)}`);
  lines.push(`Certified By,${escapeCsvField(audit.certifiedBy)}`);
  lines.push(`Whitelisted Roster,${audit.turnout.totalWhitelistedVoters}`);
  lines.push(`Total Participations,${audit.turnout.recordedParticipations}`);
  lines.push(`Final Turnout,${audit.turnout.turnoutPercentage}%`);
  lines.push(`Quorum Met,${audit.turnout.isQuorumMet ? "YES" : "NO"}`);
  lines.push(`Cryptographic Audit Hash (SHA-256),${audit.auditHash}`);
  lines.push("");

  // Detailed Tally Section
  lines.push(
    "Office Name,Contestant Number,Candidate Name,Votes Cast,Vote Share (%),Winner Status",
  );

  for (const office of audit.offices) {
    for (const c of office.candidates) {
      lines.push(
        [
          escapeCsvField(office.officeName),
          escapeCsvField(c.contestantNumber),
          escapeCsvField(c.candidateName),
          escapeCsvField(c.voteCount),
          escapeCsvField(`${c.votePercentage}%`),
          escapeCsvField(c.isWinner ? "WINNER" : ""),
        ].join(","),
      );
    }
  }

  return lines.join("\r\n");
}

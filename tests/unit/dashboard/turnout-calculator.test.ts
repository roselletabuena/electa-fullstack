import { describe, it, expect } from "vitest";
import {
  computeTurnoutMetrics,
  computeOfficeTallies,
  generateAuditHash,
  formatAuditCsv,
} from "@/features/dashboard/utils/turnout-calculator";

describe("turnout-calculator", () => {
  describe("computeTurnoutMetrics", () => {
    it("handles Scenario 1: 2,000 whitelisted voters and 750 participations = 37.5% turnout", () => {
      const endsAt = new Date(Date.now() + 3600000).toISOString();
      const metrics = computeTurnoutMetrics({
        totalWhitelistedVoters: 2000,
        recordedParticipations: 750,
        recentParticipationsCount: 42,
        endsAt,
        quorumThresholdPercentage: 50,
      });

      expect(metrics.totalWhitelistedVoters).toBe(2000);
      expect(metrics.recordedParticipations).toBe(750);
      expect(metrics.turnoutPercentage).toBe(37.5);
      expect(metrics.isQuorumMet).toBe(false);
      expect(metrics.votingVelocityPerHour).toBe(42);
      expect(metrics.isPollClosed).toBe(false);
    });

    it("handles Scenario 4 (edge case): 0 whitelisted voters without division by zero", () => {
      const metrics = computeTurnoutMetrics({
        totalWhitelistedVoters: 0,
        recordedParticipations: 0,
        endsAt: new Date().toISOString(),
      });

      expect(metrics.turnoutPercentage).toBe(0);
      expect(metrics.isQuorumMet).toBe(false);
    });

    it("handles 100% turnout and quorum met boundary", () => {
      const metrics = computeTurnoutMetrics({
        totalWhitelistedVoters: 500,
        recordedParticipations: 500,
        endsAt: new Date(Date.now() - 1000).toISOString(),
        quorumThresholdPercentage: 50,
      });

      expect(metrics.turnoutPercentage).toBe(100);
      expect(metrics.isQuorumMet).toBe(true);
      expect(metrics.isPollClosed).toBe(true);
    });

    it("clamps negative counts safely to 0", () => {
      const metrics = computeTurnoutMetrics({
        totalWhitelistedVoters: -10,
        recordedParticipations: -5,
        endsAt: new Date().toISOString(),
      });

      expect(metrics.totalWhitelistedVoters).toBe(0);
      expect(metrics.recordedParticipations).toBe(0);
      expect(metrics.turnoutPercentage).toBe(0);
    });
  });

  describe("computeOfficeTallies", () => {
    const mockOffices = [
      {
        id: "office-1",
        name: "President",
        contestants: [
          { id: "cand-1", name: "Alice Chen", contestantNumber: 1 },
          { id: "cand-2", name: "Bob Smith", contestantNumber: 2 },
        ],
      },
      {
        id: "office-2",
        name: "Vice President",
        contestants: [
          { id: "cand-3", name: "Charlie Davis", contestantNumber: 1 },
        ],
      },
    ];

    it("correctly computes vote counts, shares, and marks winners", () => {
      const selections = [
        { officeId: "office-1", candidateId: "cand-1" },
        { officeId: "office-1", candidateId: "cand-1" },
        { officeId: "office-1", candidateId: "cand-2" },
        { officeId: "office-2", candidateId: "cand-3" },
      ];

      const tallies = computeOfficeTallies(mockOffices, selections);

      expect(tallies).toHaveLength(2);

      const pres = tallies[0]!;
      expect(pres.officeName).toBe("President");
      expect(pres.totalVotesCast).toBe(3);

      const alice = pres.candidates.find((c) => c.candidateId === "cand-1")!;
      expect(alice.voteCount).toBe(2);
      expect(alice.votePercentage).toBe(66.7);
      expect(alice.isWinner).toBe(true);

      const bob = pres.candidates.find((c) => c.candidateId === "cand-2")!;
      expect(bob.voteCount).toBe(1);
      expect(bob.votePercentage).toBe(33.3);
      expect(bob.isWinner).toBe(false);

      expect(pres.winners).toHaveLength(1);
      expect(pres.winners[0]!.candidateId).toBe("cand-1");
    });

    it("handles tied votes by marking all tied top candidates as winners", () => {
      const selections = [
        { officeId: "office-1", candidateId: "cand-1" },
        { officeId: "office-1", candidateId: "cand-2" },
      ];

      const tallies = computeOfficeTallies(mockOffices, selections);
      const pres = tallies[0]!;
      expect(pres.winners).toHaveLength(2);
      expect(pres.candidates[0]!.isWinner).toBe(true);
      expect(pres.candidates[1]!.isWinner).toBe(true);
    });

    it("handles 0 votes cast gracefully without winners", () => {
      const tallies = computeOfficeTallies(mockOffices, []);
      const pres = tallies[0]!;
      expect(pres.totalVotesCast).toBe(0);
      expect(pres.winners).toHaveLength(0);
      expect(pres.candidates.every((c) => !c.isWinner && c.votePercentage === 0)).toBe(true);
    });
  });

  describe("generateAuditHash & formatAuditCsv", () => {
    const mockAudit = {
      eventId: "550e8400-e29b-41d4-a716-446655440000",
      eventTitle: "USC General Elections 2026",
      eventSlug: "usc-elections-2026",
      startsAt: "2026-10-14T08:00:00.000Z",
      endsAt: "2026-10-14T18:00:00.000Z",
      certifiedAt: "2026-10-14T18:05:00.000Z",
      certifiedBy: "Commissioner John Doe",
      turnout: {
        totalWhitelistedVoters: 2000,
        recordedParticipations: 1200,
        turnoutPercentage: 60.0,
        isQuorumMet: true,
        quorumThresholdPercentage: 50,
        votingVelocityPerHour: 150,
        isPollClosed: true,
        endsAt: "2026-10-14T18:00:00.000Z",
      },
      offices: [
        {
          officeId: "office-1",
          officeName: "President",
          maxSelectionsPerVoter: 1,
          totalVotesCast: 1200,
          candidates: [
            {
              candidateId: "cand-1",
              candidateName: "Alice, the \"Leader\"",
              contestantNumber: 1,
              avatarUrl: "/avatars/1.jpg",
              voteCount: 800,
              votePercentage: 66.7,
              isWinner: true,
            },
          ],
          winners: [
            {
              candidateId: "cand-1",
              candidateName: "Alice, the \"Leader\"",
              contestantNumber: 1,
              avatarUrl: "/avatars/1.jpg",
              voteCount: 800,
              votePercentage: 66.7,
              isWinner: true,
            },
          ],
        },
      ],
    };

    it("generates a deterministic 64-character SHA-256 hash", () => {
      const hash1 = generateAuditHash(mockAudit);
      const hash2 = generateAuditHash(mockAudit);

      expect(hash1).toMatch(/^[a-f0-9]{64}$/);
      expect(hash1).toBe(hash2);
    });

    it("formats compliant CSV with escaped quotes and commas", () => {
      const auditWithHash = {
        ...mockAudit,
        auditHash: generateAuditHash(mockAudit),
      };

      const csv = formatAuditCsv(auditWithHash);
      expect(csv).toContain("ELECTA OFFICIAL ELECTION CERTIFICATION REPORT");
      expect(csv).toContain("USC General Elections 2026");
      expect(csv).toContain('"Alice, the ""Leader"""');
      expect(csv).toContain("WINNER");
      expect(csv).toContain(auditWithHash.auditHash);
    });
  });
});

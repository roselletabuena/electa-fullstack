import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  ingestRosterCsv,
  verifyVoterEligibility,
  updateEventAllowedDomains,
  getEventRosterStatus,
  hashStudentId,
} from "@/features/institutions/services/roster-service";
import { db } from "@/lib/db";

vi.mock("@/lib/db", () => ({
  db: {
    $transaction: vi.fn(async (cb) => {
      return cb({
        studentRosterEntry: {
          deleteMany: vi.fn().mockResolvedValue({ count: 10 }),
          createMany: vi.fn().mockResolvedValue({ count: 2 }),
        },
      });
    }),
    event: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    studentRosterEntry: {
      count: vi.fn(),
      findFirst: vi.fn(),
    },
  },
}));

describe("roster-service: Ingestion & Voter Eligibility", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockEventId = "11111111-1111-4111-8111-111111111111";

  describe("ingestRosterCsv", () => {
    it("deletes previous entries and batches new records when replace is true", async () => {
      const deleteManySpy = vi.fn().mockResolvedValue({ count: 5 });
      const createManySpy = vi.fn().mockResolvedValue({ count: 2 });

      vi.mocked(db.$transaction).mockImplementationOnce(async (cb) => {
        return cb({
          studentRosterEntry: {
            deleteMany: deleteManySpy,
            createMany: createManySpy,
          },
        } as any);
      });

      const csv = `studentId,email
2024-0001,alice@school.edu
2024-0002,bob@school.edu`;

      const summary = await ingestRosterCsv({
        eventId: mockEventId,
        csvContent: csv,
        replace: true,
      });

      expect(deleteManySpy).toHaveBeenCalledWith({ where: { eventId: mockEventId } });
      expect(createManySpy).toHaveBeenCalledTimes(1);
      expect(summary.totalIngested).toBe(2);
      expect(summary.totalProcessed).toBe(2);
    });

    it("does not delete previous entries when replace is false", async () => {
      const deleteManySpy = vi.fn();
      const createManySpy = vi.fn().mockResolvedValue({ count: 1 });

      vi.mocked(db.$transaction).mockImplementationOnce(async (cb) => {
        return cb({
          studentRosterEntry: {
            deleteMany: deleteManySpy,
            createMany: createManySpy,
          },
        } as any);
      });

      const csv = `studentId,email
2024-0001,alice@school.edu`;

      await ingestRosterCsv({
        eventId: mockEventId,
        csvContent: csv,
        replace: false,
      });

      expect(deleteManySpy).not.toHaveBeenCalled();
      expect(createManySpy).toHaveBeenCalledTimes(1);
    });
  });

  describe("verifyVoterEligibility (Hybrid OR)", () => {
    it("returns eligible when email matches approved institutional domain", async () => {
      vi.mocked(db.event.findUnique).mockResolvedValueOnce({
        id: mockEventId,
        allowedEmailDomains: ["up.edu.ph", "school.edu"],
      } as any);

      const result = await verifyVoterEligibility({
        eventId: mockEventId,
        email: "student@up.edu.ph",
      });

      expect(result.isEligible).toBe(true);
      expect(result.matchType).toBe("EMAIL_DOMAIN");
      expect(db.studentRosterEntry.findFirst).not.toHaveBeenCalled();
    });

    it("returns eligible when studentId matches hashed roster entry", async () => {
      vi.mocked(db.event.findUnique).mockResolvedValueOnce({
        id: mockEventId,
        allowedEmailDomains: [],
      } as any);

      vi.mocked(db.studentRosterEntry.findFirst).mockResolvedValueOnce({
        id: "roster-entry-1",
      } as any);

      const rawId = "2024-9999";
      const expectedHash = hashStudentId(rawId);

      const result = await verifyVoterEligibility({
        eventId: mockEventId,
        studentId: rawId,
      });

      expect(result.isEligible).toBe(true);
      expect(result.matchType).toBe("ROSTER_STUDENT_ID");
      expect(db.studentRosterEntry.findFirst).toHaveBeenCalledWith({
        where: {
          eventId: mockEventId,
          studentIdHash: expectedHash,
        },
        select: { id: true },
      });
    });

    it("returns eligible when email matches roster entry directly", async () => {
      vi.mocked(db.event.findUnique).mockResolvedValueOnce({
        id: mockEventId,
        allowedEmailDomains: ["other.edu"],
      } as any);

      // findFirst for studentId (not provided), so called for email
      vi.mocked(db.studentRosterEntry.findFirst).mockResolvedValueOnce({
        id: "roster-entry-2",
      } as any);

      const result = await verifyVoterEligibility({
        eventId: mockEventId,
        email: "alice@gmail.com",
      });

      expect(result.isEligible).toBe(true);
      expect(result.matchType).toBe("ROSTER_EMAIL");
    });

    it("returns ineligible when neither domain nor roster matches", async () => {
      vi.mocked(db.event.findUnique).mockResolvedValueOnce({
        id: mockEventId,
        allowedEmailDomains: ["school.edu"],
      } as any);

      vi.mocked(db.studentRosterEntry.findFirst).mockResolvedValue(null);

      const result = await verifyVoterEligibility({
        eventId: mockEventId,
        studentId: "UNKNOWN-ID",
        email: "stranger@gmail.com",
      });

      expect(result.isEligible).toBe(false);
      expect(result.matchType).toBe("NONE");
    });
  });

  describe("updateEventAllowedDomains", () => {
    it("normalizes domains and updates event record", async () => {
      vi.mocked(db.event.update).mockResolvedValueOnce({
        allowedEmailDomains: ["up.edu.ph", "ateneo.edu"],
      } as any);

      const updated = await updateEventAllowedDomains({
        eventId: mockEventId,
        domains: ["@UP.EDU.PH", "ateneo.edu "],
      });

      expect(db.event.update).toHaveBeenCalledWith({
        where: { id: mockEventId },
        data: {
          allowedEmailDomains: ["up.edu.ph", "ateneo.edu"],
        },
        select: {
          allowedEmailDomains: true,
        },
      });
      expect(updated).toEqual(["up.edu.ph", "ateneo.edu"]);
    });
  });

  describe("getEventRosterStatus", () => {
    it("returns total students and allowed email domains", async () => {
      vi.mocked(db.event.findUnique).mockResolvedValueOnce({
        id: mockEventId,
        allowedEmailDomains: ["school.edu"],
      } as any);
      vi.mocked(db.studentRosterEntry.count).mockResolvedValueOnce(150);
      vi.mocked(db.studentRosterEntry.findFirst).mockResolvedValueOnce({
        updatedAt: new Date("2026-10-14T10:00:00.000Z"),
      } as any);

      const status = await getEventRosterStatus(mockEventId);

      expect(status).toEqual({
        eventId: mockEventId,
        totalStudents: 150,
        allowedEmailDomains: ["school.edu"],
        hasRoster: true,
        lastUpdated: "2026-10-14T10:00:00.000Z",
      });
    });
  });
});

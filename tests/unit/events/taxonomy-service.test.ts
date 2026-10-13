import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getEventTaxonomy,
  createEventPosition,
  updateEventPosition,
  deleteEventPosition,
  reorderEventPositions,
  updateEventArchetype,
  assignContestantToPosition,
} from "@/features/events/services/taxonomy-service";
import type { Event } from "@/generated/client/client";
import { db } from "@/lib/db";


vi.mock("@/lib/db", () => ({
  db: {
    event: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    eventPosition: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      delete: vi.fn(),
    },
    division: {
      findMany: vi.fn(),
    },
    awardCategory: {
      findMany: vi.fn(),
    },
    contestant: {
      update: vi.fn(),
    },
    $transaction: vi.fn((promises) => Promise.all(promises)),
  },
}));

describe("Taxonomy Service (Multi-Archetype & Positions)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getEventTaxonomy", () => {
    it("returns null when event does not exist", async () => {
      vi.mocked(db.event.findFirst).mockResolvedValue(null);

      const result = await getEventTaxonomy("non-existent");
      expect(result).toBeNull();
    });

    it("returns unified taxonomy with archetype, positions, divisions, and categories", async () => {
      vi.mocked(db.event.findFirst).mockResolvedValue({
        id: "evt-1",
        archetype: "STUDENT_COUNCIL",
      } as unknown as Event);


      vi.mocked(db.eventPosition.findMany).mockResolvedValue([
        {
          id: "pos-1",
          eventId: "evt-1",
          name: "President",
          description: "Executive President",
          maxSelectionsPerVoter: 1,
          minSelectionsPerVoter: 0,
          displayOrder: 1,
          isVotingOpen: true,
          createdAt: new Date("2026-10-13T00:00:00Z"),
          updatedAt: new Date("2026-10-13T00:00:00Z"),
          _count: { contestants: 3 },
        },
      ] as unknown as never);

      vi.mocked(db.division.findMany).mockResolvedValue([]);
      vi.mocked(db.awardCategory.findMany).mockResolvedValue([]);

      const result = await getEventTaxonomy("evt-1");
      expect(result).not.toBeNull();
      expect(result?.archetype).toBe("STUDENT_COUNCIL");
      expect(result?.positions).toHaveLength(1);
      expect(result?.positions[0]?.name).toBe("President");
      expect(result?.positions[0]?.candidateCount).toBe(3);
      expect(result?.positions[0]?.maxSelectionsPerVoter).toBe(1);
    });

    it("defaults archetype to PAGEANT for backward compatibility (Scenario 3)", async () => {
      vi.mocked(db.event.findFirst).mockResolvedValue({
        id: "evt-legacy",
        archetype: null,
      } as unknown as Event);


      vi.mocked(db.eventPosition.findMany).mockResolvedValue([]);
      vi.mocked(db.division.findMany).mockResolvedValue([
        {
          id: "div-1",
          eventId: "evt-legacy",
          name: "Miss",
          description: null,
          displayOrder: 1,
          createdAt: new Date("2026-10-13T00:00:00Z"),
          updatedAt: new Date("2026-10-13T00:00:00Z"),
          _count: { contestants: 12 },
        },
      ] as unknown as never);
      vi.mocked(db.awardCategory.findMany).mockResolvedValue([]);

      const result = await getEventTaxonomy("evt-legacy");
      expect(result?.archetype).toBe("PAGEANT");
      expect(result?.divisions).toHaveLength(1);
      expect(result?.divisions[0]?.name).toBe("Miss");
    });
  });

  describe("createEventPosition (Scenario 1)", () => {
    it("creates an office/position with selection constraints", async () => {
      vi.mocked(db.eventPosition.findFirst).mockResolvedValue(null);
      vi.mocked(db.eventPosition.create).mockResolvedValue({
        id: "pos-pres",
        eventId: "evt-1",
        name: "President",
        description: "Chief Executive",
        maxSelectionsPerVoter: 1,
        minSelectionsPerVoter: 0,
        displayOrder: 1,
        isVotingOpen: true,
        createdAt: new Date("2026-10-13T00:00:00Z"),
        updatedAt: new Date("2026-10-13T00:00:00Z"),
        _count: { contestants: 0 },
      } as unknown as never);

      const result = await createEventPosition("evt-1", {
        name: "President",
        description: "Chief Executive",
        maxSelectionsPerVoter: 1,
        minSelectionsPerVoter: 0,
        displayOrder: 1,
        isVotingOpen: true,
      });

      expect(result.id).toBe("pos-pres");
      expect(result.name).toBe("President");
      expect(result.maxSelectionsPerVoter).toBe(1);
      expect(db.eventPosition.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: "President",
            maxSelectionsPerVoter: 1,
          }),
        })
      );
    });

    it("prevents duplicate position name within the same event", async () => {
      vi.mocked(db.eventPosition.findFirst).mockResolvedValue({
        id: "existing-1",
        name: "President",
      } as unknown as never);

      await expect(
        createEventPosition("evt-1", {
          name: "President",
          maxSelectionsPerVoter: 1,
        })
      ).rejects.toThrow('A position with name "President" already exists');
    });

    it("automatically computes displayOrder when omitted", async () => {
      vi.mocked(db.eventPosition.findFirst)
        .mockResolvedValueOnce(null) // no duplicate
        .mockResolvedValueOnce({ displayOrder: 4 } as unknown as never); // highest displayOrder

      vi.mocked(db.eventPosition.create).mockResolvedValue({
        id: "pos-new",
        eventId: "evt-1",
        name: "Treasurer",
        description: null,
        maxSelectionsPerVoter: 1,
        minSelectionsPerVoter: 0,
        displayOrder: 5,
        isVotingOpen: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: { contestants: 0 },
      } as unknown as never);

      const result = await createEventPosition("evt-1", {
        name: "Treasurer",
        maxSelectionsPerVoter: 1,
      });

      expect(result.displayOrder).toBe(5);
    });
  });

  describe("updateEventPosition", () => {
    it("updates position fields", async () => {
      vi.mocked(db.eventPosition.findFirst).mockResolvedValue({
        id: "pos-1",
        eventId: "evt-1",
        name: "Senator",
      } as unknown as never);

      vi.mocked(db.eventPosition.update).mockResolvedValue({
        id: "pos-1",
        eventId: "evt-1",
        name: "Senator",
        description: "Updated description",
        maxSelectionsPerVoter: 6,
        minSelectionsPerVoter: 1,
        displayOrder: 2,
        isVotingOpen: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: { contestants: 10 },
      } as unknown as never);

      const result = await updateEventPosition("evt-1", "pos-1", {
        maxSelectionsPerVoter: 6,
        description: "Updated description",
      });

      expect(result.maxSelectionsPerVoter).toBe(6);
      expect(result.description).toBe("Updated description");
    });

    it("throws when position is not found", async () => {
      vi.mocked(db.eventPosition.findFirst).mockResolvedValue(null);

      await expect(
        updateEventPosition("evt-1", "pos-missing", { name: "VP" })
      ).rejects.toThrow('Position "pos-missing" not found');
    });
  });

  describe("deleteEventPosition", () => {
    it("deletes position successfully", async () => {
      vi.mocked(db.eventPosition.findFirst).mockResolvedValue({
        id: "pos-del",
        eventId: "evt-1",
      } as unknown as never);
      vi.mocked(db.eventPosition.delete).mockResolvedValue({} as never);

      const result = await deleteEventPosition("evt-1", "pos-del");
      expect(result.success).toBe(true);
      expect(result.deletedId).toBe("pos-del");
      expect(db.eventPosition.delete).toHaveBeenCalledWith({
        where: { id: "pos-del" },
      });
    });

    it("throws when position to delete is not found", async () => {
      vi.mocked(db.eventPosition.findFirst).mockResolvedValue(null);

      await expect(deleteEventPosition("evt-1", "pos-missing")).rejects.toThrow(
        'Position "pos-missing" not found'
      );
    });
  });

  describe("reorderEventPositions", () => {
    it("updates display orders in transaction and returns updated positions", async () => {
      vi.mocked(db.eventPosition.findMany).mockResolvedValue([
        {
          id: "pos-b",
          eventId: "evt-1",
          name: "Vice President",
          description: null,
          maxSelectionsPerVoter: 1,
          minSelectionsPerVoter: 0,
          displayOrder: 1,
          isVotingOpen: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          _count: { contestants: 2 },
        },
        {
          id: "pos-a",
          eventId: "evt-1",
          name: "President",
          description: null,
          maxSelectionsPerVoter: 1,
          minSelectionsPerVoter: 0,
          displayOrder: 2,
          isVotingOpen: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          _count: { contestants: 3 },
        },
      ] as unknown as never);

      const result = await reorderEventPositions("evt-1", ["pos-b", "pos-a"]);
      expect(db.$transaction).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0]?.name).toBe("Vice President");
      expect(result[1]?.name).toBe("President");
    });
  });

  describe("updateEventArchetype", () => {
    it("updates event archetype to STUDENT_COUNCIL", async () => {
      vi.mocked(db.event.update).mockResolvedValue({
        id: "evt-1",
        archetype: "STUDENT_COUNCIL",
      } as unknown as never);

      const result = await updateEventArchetype("evt-1", "STUDENT_COUNCIL");
      expect(result.archetype).toBe("STUDENT_COUNCIL");
      expect(db.event.update).toHaveBeenCalledWith({
        where: { id: "evt-1" },
        data: { archetype: "STUDENT_COUNCIL" },
        select: { id: true, archetype: true },
      });
    });
  });

  describe("assignContestantToPosition", () => {
    it("assigns candidate to an office position", async () => {
      vi.mocked(db.contestant.update).mockResolvedValue({
        id: "c-1",
        positionId: "pos-pres",
      } as unknown as never);

      const result = await assignContestantToPosition("c-1", "pos-pres");
      expect(result.positionId).toBe("pos-pres");
    });

    it("unassigns candidate when positionId is null", async () => {
      vi.mocked(db.contestant.update).mockResolvedValue({
        id: "c-1",
        positionId: null,
      } as unknown as never);

      const result = await assignContestantToPosition("c-1", null);
      expect(result.positionId).toBeNull();
    });
  });
});

// @vitest-environment node
import { describe, it, expect } from "vitest";

import {
  eventArchetypeSchema,
  createEventPositionSchema,
  updateEventPositionSchema,
  reorderPositionsSchema,
  updateEventArchetypeSchema,
} from "@/lib/validations/archetypes";

describe("Archetype & Position Validations", () => {
  describe("eventArchetypeSchema", () => {
    it("accepts valid event archetypes", () => {
      expect(eventArchetypeSchema.safeParse("PAGEANT").success).toBe(true);
      expect(eventArchetypeSchema.safeParse("STUDENT_COUNCIL").success).toBe(true);
      expect(eventArchetypeSchema.safeParse("HACKATHON").success).toBe(true);
      expect(eventArchetypeSchema.safeParse("CUSTOM").success).toBe(true);
    });

    it("rejects invalid archetypes", () => {
      const res = eventArchetypeSchema.safeParse("INVALID_TYPE");
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.issues[0]?.code).toBe("invalid_value");
      }
    });


  });

  describe("createEventPositionSchema", () => {
    it("validates a standard single-winner executive office", () => {
      const input = {
        name: "President",
        description: "Chief Executive Officer of the Student Body",
        maxSelectionsPerVoter: 1,
        minSelectionsPerVoter: 0,
        displayOrder: 1,
        isVotingOpen: true,
      };
      const res = createEventPositionSchema.safeParse(input);
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.name).toBe("President");
        expect(res.data.maxSelectionsPerVoter).toBe(1);
      }
    });

    it("validates a multi-seat position (e.g. Senators / Councilors)", () => {
      const input = {
        name: "Senator",
        maxSelectionsPerVoter: 5,
        minSelectionsPerVoter: 1,
      };
      const res = createEventPositionSchema.safeParse(input);
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.maxSelectionsPerVoter).toBe(5);
        expect(res.data.minSelectionsPerVoter).toBe(1);
        expect(res.data.displayOrder).toBe(0);
        expect(res.data.isVotingOpen).toBe(true);
      }
    });

    it("rejects empty position name", () => {
      const res = createEventPositionSchema.safeParse({
        name: "   ",
        maxSelectionsPerVoter: 1,
      });
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.issues[0]?.message).toBe("Position name cannot be empty");
      }
    });

    it("rejects maxSelectionsPerVoter less than 1 (Scenario 2)", () => {
      const res = createEventPositionSchema.safeParse({
        name: "Representative",
        maxSelectionsPerVoter: 0,
      });
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.issues[0]?.message).toBe("Maximum selections must be at least 1");
      }
    });

    it("rejects negative maxSelectionsPerVoter", () => {
      const res = createEventPositionSchema.safeParse({
        name: "Representative",
        maxSelectionsPerVoter: -3,
      });
      expect(res.success).toBe(false);
    });

    it("rejects maxSelectionsPerVoter exceeding bound (> 50)", () => {
      const res = createEventPositionSchema.safeParse({
        name: "Representative",
        maxSelectionsPerVoter: 51,
      });
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.issues[0]?.message).toBe("Maximum selections cannot exceed 50");
      }
    });

    it("rejects when minSelectionsPerVoter exceeds maxSelectionsPerVoter", () => {
      const res = createEventPositionSchema.safeParse({
        name: "Representative",
        maxSelectionsPerVoter: 2,
        minSelectionsPerVoter: 3,
      });
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.issues[0]?.message).toBe(
          "Minimum selections cannot exceed maximum selections"
        );
      }
    });

    it("rejects non-integer selection counts", () => {
      const res = createEventPositionSchema.safeParse({
        name: "Representative",
        maxSelectionsPerVoter: 2.5,
      });
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.issues[0]?.message).toBe("Maximum selections must be an integer");
      }
    });
  });

  describe("updateEventPositionSchema", () => {
    it("allows updating partial fields", () => {
      const res = updateEventPositionSchema.safeParse({
        name: "Executive Vice President",
      });
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data.name).toBe("Executive Vice President");
      }
    });

    it("validates minSelectionsPerVoter <= maxSelectionsPerVoter when both are provided", () => {
      const res = updateEventPositionSchema.safeParse({
        minSelectionsPerVoter: 4,
        maxSelectionsPerVoter: 2,
      });
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.issues[0]?.message).toBe(
          "Minimum selections cannot exceed maximum selections"
        );
      }
    });
  });

  describe("reorderPositionsSchema", () => {
    it("accepts valid position IDs", () => {
      const res = reorderPositionsSchema.safeParse({
        positionIds: ["pos-1", "pos-2", "pos-3"],
      });
      expect(res.success).toBe(true);
    });

    it("rejects empty position IDs list", () => {
      const res = reorderPositionsSchema.safeParse({
        positionIds: [],
      });
      expect(res.success).toBe(false);
    });
  });

  describe("updateEventArchetypeSchema", () => {
    it("accepts valid archetype update", () => {
      const res = updateEventArchetypeSchema.safeParse({
        archetype: "STUDENT_COUNCIL",
      });
      expect(res.success).toBe(true);
    });
  });

  describe("Archetype Availability Helpers & Configuration (VS-117)", () => {
    it("marks only PAGEANT as available and all other archetypes as coming soon", async () => {
      const {
        isArchetypeAvailable,
        isArchetypeComingSoon,
        ACTIVE_ARCHETYPES,
        COMING_SOON_ARCHETYPES,
        EVENT_ARCHETYPE_CONFIGS,
      } = await import("@/features/events/types/archetype");

      expect(ACTIVE_ARCHETYPES).toEqual(["PAGEANT"]);
      expect(COMING_SOON_ARCHETYPES).toEqual(["STUDENT_COUNCIL", "HACKATHON", "CUSTOM"]);

      expect(isArchetypeAvailable("PAGEANT")).toBe(true);
      expect(isArchetypeComingSoon("PAGEANT")).toBe(false);
      expect(EVENT_ARCHETYPE_CONFIGS.PAGEANT.isComingSoon).toBe(false);

      const comingSoonList = ["STUDENT_COUNCIL", "HACKATHON", "CUSTOM"] as const;
      for (const arch of comingSoonList) {
        expect(isArchetypeAvailable(arch)).toBe(false);
        expect(isArchetypeComingSoon(arch)).toBe(true);
        expect(EVENT_ARCHETYPE_CONFIGS[arch].isComingSoon).toBe(true);
      }
    });
  });
});

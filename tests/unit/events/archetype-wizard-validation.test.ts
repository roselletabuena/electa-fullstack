// @vitest-environment node
import { describe, it, expect } from "vitest";
import {
  createEventWizardSchema,
  wizardPositionDraftSchema,
  wizardDivisionDraftSchema,
  wizardAwardDraftSchema,
} from "@/lib/validations/archetype-wizard";

describe("Archetype Wizard Validation Schemas", () => {
  const validBasePayload = {
    title: "Annual Hackathon 2026",
    slug: "annual-hackathon-2026",
    description: "An exciting 48-hour innovation challenge for builders and designers.",
    bannerUrl: "https://example.com/banner.jpg",
    startsAt: "2026-11-01T09:00:00.000Z",
    endsAt: "2026-11-03T18:00:00.000Z",
    archetype: "HACKATHON" as const,
    positions: [
      {
        name: "Web3 & Fintech Track",
        description: "Decentralized applications and financial tooling",
        maxSelectionsPerVoter: 1,
        minSelectionsPerVoter: 0,
        displayOrder: 1,
      },
    ],
    divisions: [],
    awardCategories: [],
  };

  describe("createEventWizardSchema", () => {
    it("accepts a valid hackathon event with at least one track", () => {
      const res = createEventWizardSchema.safeParse(validBasePayload);
      expect(res.success).toBe(true);
    });

    it("rejects a hackathon event with zero tracks with exact scenario error message", () => {
      const invalidPayload = {
        ...validBasePayload,
        archetype: "HACKATHON" as const,
        positions: [],
      };
      const res = createEventWizardSchema.safeParse(invalidPayload);
      expect(res.success).toBe(false);
      if (!res.success) {
        const error = res.error.issues.find((i) => i.path.includes("positions"));
        expect(error?.message).toBe(
          "At least one challenge track or category is required for hackathons."
        );
      }
    });

    it("accepts a student council election with positions and seat limits", () => {
      const studentCouncilPayload = {
        ...validBasePayload,
        title: "Supreme Student Council Election",
        slug: "ssc-election-2026",
        archetype: "STUDENT_COUNCIL" as const,
        positions: [
          {
            name: "President",
            maxSelectionsPerVoter: 1,
            minSelectionsPerVoter: 0,
            displayOrder: 1,
          },
          {
            name: "Senators",
            maxSelectionsPerVoter: 5,
            minSelectionsPerVoter: 1,
            displayOrder: 2,
          },
        ],
      };
      const res = createEventWizardSchema.safeParse(studentCouncilPayload);
      expect(res.success).toBe(true);
    });

    it("accepts a pageant with divisions and awards", () => {
      const pageantPayload = {
        ...validBasePayload,
        title: "Miss Universe Campus 2026",
        slug: "miss-universe-campus",
        archetype: "PAGEANT" as const,
        positions: [],
        divisions: [
          { name: "Teen Category", displayOrder: 0 },
          { name: "Senior Category", displayOrder: 1 },
        ],
        awardCategories: [
          { name: "People's Choice", isVotingOpen: true, displayOrder: 0 },
        ],
      };
      const res = createEventWizardSchema.safeParse(pageantPayload);
      expect(res.success).toBe(true);
    });

    it("rejects if end time is less than 1 hour after start time", () => {
      const invalidTimePayload = {
        ...validBasePayload,
        startsAt: "2026-11-01T09:00:00.000Z",
        endsAt: "2026-11-01T09:30:00.000Z",
      };
      const res = createEventWizardSchema.safeParse(invalidTimePayload);
      expect(res.success).toBe(false);
      if (!res.success) {
        const timeError = res.error.issues.find((i) => i.path.includes("endsAt"));
        expect(timeError?.message).toBe(
          "Event end time must be at least 1 hour after the start time"
        );
      }
    });
  });

  describe("wizardPositionDraftSchema", () => {
    it("validates position with valid min and max selections", () => {
      const input = {
        name: "Councilor",
        maxSelectionsPerVoter: 3,
        minSelectionsPerVoter: 1,
      };
      const res = wizardPositionDraftSchema.safeParse(input);
      expect(res.success).toBe(true);
    });

    it("rejects when minSelectionsPerVoter exceeds maxSelectionsPerVoter", () => {
      const input = {
        name: "Councilor",
        maxSelectionsPerVoter: 2,
        minSelectionsPerVoter: 4,
      };
      const res = wizardPositionDraftSchema.safeParse(input);
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.issues[0]?.message).toBe(
          "Minimum selections cannot exceed maximum selections"
        );
      }
    });

    it("rejects empty position name", () => {
      const input = {
        name: "   ",
        maxSelectionsPerVoter: 1,
        minSelectionsPerVoter: 0,
      };
      const res = wizardPositionDraftSchema.safeParse(input);
      expect(res.success).toBe(false);
    });
  });
});

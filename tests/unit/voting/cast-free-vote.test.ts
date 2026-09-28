import { describe, it, expect } from "vitest";
import { CastFreeVoteSchema } from "@/features/voting/types";

describe("CastFreeVoteSchema", () => {
  it("validates a well-formed free vote submission payload", () => {
    const validPayload = {
      eventId: "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
      contestantId: "f1e2d3c4-b5a6-4f5e-8d9c-0b1a2c3d4e5f",
      awardCategoryId: "11223344-5566-4778-8899-aabbccddeeff",
    };

    const result = CastFreeVoteSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.eventId).toBe(validPayload.eventId);
      expect(result.data.contestantId).toBe(validPayload.contestantId);
      expect(result.data.awardCategoryId).toBe(validPayload.awardCategoryId);
    }
  });

  it("allows optional awardCategoryId", () => {
    const payloadWithoutAward = {
      eventId: "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
      contestantId: "f1e2d3c4-b5a6-4f5e-8d9c-0b1a2c3d4e5f",
    };

    const result = CastFreeVoteSchema.safeParse(payloadWithoutAward);
    expect(result.success).toBe(true);
  });

  it("rejects invalid non-UUID strings for eventId or contestantId", () => {
    const invalidPayload = {
      eventId: "not-a-uuid",
      contestantId: "123",
    };

    const result = CastFreeVoteSchema.safeParse(invalidPayload);
    expect(result.success).toBe(false);
  });
});

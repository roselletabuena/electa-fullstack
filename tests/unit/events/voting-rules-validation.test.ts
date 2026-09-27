import { describe, it, expect } from "vitest";
import {
  votingRulesFormSchema,
  updateVotingRulesInputSchema,
} from "@/lib/validations/event-voting-rules";

describe("votingRulesFormSchema", () => {
  it("validates a complete valid voting rules payload", () => {
    const validData = {
      isFreeVotingEnabled: true,
      dailyFreeVoteLimit: 3,
      reason: "Increased free vote quota for preliminary round",
    };

    const result = votingRulesFormSchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.isFreeVotingEnabled).toBe(true);
      expect(result.data.dailyFreeVoteLimit).toBe(3);
      expect(result.data.reason).toBe("Increased free vote quota for preliminary round");
    }
  });

  it("accepts minimum allowed daily quota of 1 and empty reason", () => {
    const validData = {
      isFreeVotingEnabled: false,
      dailyFreeVoteLimit: 1,
      reason: "",
    };

    const result = votingRulesFormSchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.isFreeVotingEnabled).toBe(false);
      expect(result.data.dailyFreeVoteLimit).toBe(1);
    }
  });

  it("accepts maximum allowed daily quota of 5", () => {
    const validData = {
      isFreeVotingEnabled: true,
      dailyFreeVoteLimit: 5,
    };

    const result = votingRulesFormSchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.dailyFreeVoteLimit).toBe(5);
    }
  });

  it("fails when dailyFreeVoteLimit is a string or non-number", () => {
    const invalidData = {
      isFreeVotingEnabled: true,
      dailyFreeVoteLimit: "4",
    };

    const result = votingRulesFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("fails when dailyFreeVoteLimit is less than 1", () => {
    const result = votingRulesFormSchema.safeParse({
      isFreeVotingEnabled: true,
      dailyFreeVoteLimit: 0,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain(
        "Daily free vote limit must be between 1 and 5",
      );
    }
  });

  it("fails when dailyFreeVoteLimit is greater than 5", () => {
    const result = votingRulesFormSchema.safeParse({
      isFreeVotingEnabled: true,
      dailyFreeVoteLimit: 6,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain(
        "Daily free vote limit must be between 1 and 5",
      );
    }
  });

  it("fails when dailyFreeVoteLimit is a decimal/non-integer", () => {
    const result = votingRulesFormSchema.safeParse({
      isFreeVotingEnabled: true,
      dailyFreeVoteLimit: 2.5,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain("Daily free vote limit must be an integer");
    }
  });

  it("fails when reason exceeds 500 characters", () => {
    const result = votingRulesFormSchema.safeParse({
      isFreeVotingEnabled: true,
      dailyFreeVoteLimit: 2,
      reason: "r".repeat(501),
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain(
        "Reason for change must not exceed 500 characters",
      );
    }
  });
});

describe("updateVotingRulesInputSchema", () => {
  it("validates valid input including slug", () => {
    const result = updateVotingRulesInputSchema.safeParse({
      slug: "miss-visayas-2026",
      isFreeVotingEnabled: true,
      dailyFreeVoteLimit: 2,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.slug).toBe("miss-visayas-2026");
    }
  });

  it("fails when slug is empty", () => {
    const result = updateVotingRulesInputSchema.safeParse({
      slug: "",
      isFreeVotingEnabled: true,
      dailyFreeVoteLimit: 2,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain("Event slug is required");
    }
  });
});

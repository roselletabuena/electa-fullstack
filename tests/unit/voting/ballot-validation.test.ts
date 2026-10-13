import { describe, it, expect } from "vitest";
import { castBallotSchema, officeSelectionSchema } from "@/lib/validations/ballot";

describe("officeSelectionSchema", () => {
  it("validates a properly structured office selection", () => {
    const validSelection = {
      positionId: "11111111-1111-4111-8111-111111111111",
      contestantIds: [
        "22222222-2222-4222-8222-222222222222",
        "33333333-3333-4333-8333-333333333333",
      ],
    };

    const result = officeSelectionSchema.safeParse(validSelection);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.contestantIds).toHaveLength(2);
    }
  });

  it("allows null or omitted positionId for general/unpositioned ballots", () => {
    const resultNull = officeSelectionSchema.safeParse({
      positionId: null,
      contestantIds: ["22222222-2222-4222-8222-222222222222"],
    });
    expect(resultNull.success).toBe(true);

    const resultOmitted = officeSelectionSchema.safeParse({
      contestantIds: ["22222222-2222-4222-8222-222222222222"],
    });
    expect(resultOmitted.success).toBe(true);
  });

  it("rejects invalid positionId UUID format", () => {
    const result = officeSelectionSchema.safeParse({
      positionId: "not-a-uuid",
      contestantIds: ["22222222-2222-4222-8222-222222222222"],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain("Invalid position ID format");
    }
  });

  it("rejects empty contestantIds array", () => {
    const result = officeSelectionSchema.safeParse({
      positionId: "11111111-1111-4111-8111-111111111111",
      contestantIds: [],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain("At least one contestant must be selected");
    }
  });
});

describe("castBallotSchema", () => {
  const validPayload = {
    eventId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    selections: [
      {
        positionId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
        contestantIds: ["cccccccc-cccc-4ccc-8ccc-cccccccccccc"],
      },
      {
        positionId: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
        contestantIds: [
          "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
          "ffffffff-ffff-4fff-8fff-ffffffffffff",
        ],
      },
    ],
    turnstileToken: "token-abc-123",
    deviceFingerprint: "fp-xyz-789",
    idempotencyKey: "12345678-1234-4234-8234-123456789012",
  };

  it("validates a full institutional ballot submission payload", () => {
    const result = castBallotSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.selections).toHaveLength(2);
      expect(result.data.turnstileToken).toBe("token-abc-123");
      expect(result.data.deviceFingerprint).toBe("fp-xyz-789");
    }
  });

  it("rejects invalid eventId format", () => {
    const result = castBallotSchema.safeParse({
      ...validPayload,
      eventId: "invalid-event-id",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain("Invalid event ID format");
    }
  });

  it("rejects empty selections array", () => {
    const result = castBallotSchema.safeParse({
      ...validPayload,
      selections: [],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain("A ballot must contain at least one office");
    }
  });

  it("rejects invalid idempotencyKey format", () => {
    const result = castBallotSchema.safeParse({
      ...validPayload,
      idempotencyKey: "invalid-uuid-key",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain("Invalid idempotency key format");
    }
  });
});

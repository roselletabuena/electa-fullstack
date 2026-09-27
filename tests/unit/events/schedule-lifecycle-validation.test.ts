import { describe, it, expect } from "vitest";
import { scheduleLifecycleFormSchema } from "@/lib/validations/event-schedule-lifecycle";

describe("scheduleLifecycleFormSchema", () => {
  const validPayload = {
    startsAt: "2026-10-01T09:00:00.000Z",
    endsAt: "2026-10-15T23:59:59.000Z",
    publicationStatus: "PUBLISHED" as const,
    draftPassphrase: "",
    clearDraftPassphrase: false,
    reason: "Updated election timeline",
  };

  it("validates a valid schedule and publication status payload", () => {
    const result = scheduleLifecycleFormSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it("fails when endsAt is earlier than startsAt", () => {
    const invalidPayload = {
      ...validPayload,
      startsAt: "2026-10-15T00:00:00.000Z",
      endsAt: "2026-10-01T00:00:00.000Z",
    };
    const result = scheduleLifecycleFormSchema.safeParse(invalidPayload);
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path.includes("endsAt"));
      expect(issue).toBeDefined();
      expect(issue?.message).toBe("Voting end date must be after start date");
    }
  });

  it("fails when endsAt is identical to startsAt", () => {
    const invalidPayload = {
      ...validPayload,
      startsAt: "2026-10-01T00:00:00.000Z",
      endsAt: "2026-10-01T00:00:00.000Z",
    };
    const result = scheduleLifecycleFormSchema.safeParse(invalidPayload);
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path.includes("endsAt"));
      expect(issue?.message).toBe("Voting end date must be after start date");
    }
  });

  it("fails when draftPassphrase is less than 4 characters", () => {
    const invalidPayload = {
      ...validPayload,
      draftPassphrase: "abc",
    };
    const result = scheduleLifecycleFormSchema.safeParse(invalidPayload);
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path.includes("draftPassphrase"));
      expect(issue?.message).toBe("Draft preview passphrase must be at least 4 characters");
    }
  });

  it("allows empty or omitted draftPassphrase", () => {
    const result = scheduleLifecycleFormSchema.safeParse({
      ...validPayload,
      draftPassphrase: "",
    });
    expect(result.success).toBe(true);
  });

  it("allows valid draftPassphrase of 4 or more characters", () => {
    const result = scheduleLifecycleFormSchema.safeParse({
      ...validPayload,
      draftPassphrase: "judge-pass-2026",
    });
    expect(result.success).toBe(true);
  });

  it("defaults publicationStatus to DRAFT if omitted", () => {
    const payloadWithoutStatus = {
      startsAt: "2026-10-01T09:00:00.000Z",
      endsAt: "2026-10-15T23:59:59.000Z",
    };
    const result = scheduleLifecycleFormSchema.safeParse(payloadWithoutStatus);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.publicationStatus).toBe("DRAFT");
    }
  });

  it("fails when date format is invalid", () => {
    const invalidPayload = {
      ...validPayload,
      startsAt: "not-a-date",
    };
    const result = scheduleLifecycleFormSchema.safeParse(invalidPayload);
    expect(result.success).toBe(false);
  });

  it("fails when reason exceeds 500 characters", () => {
    const invalidPayload = {
      ...validPayload,
      reason: "a".repeat(501),
    };
    const result = scheduleLifecycleFormSchema.safeParse(invalidPayload);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain("500 characters");
    }
  });
});

import { describe, it, expect, vi } from "vitest";
import { storyCardPayloadSchema } from "@/features/voting/types/story";

describe("storyCardPayloadSchema", () => {
  it("validates valid story payload", () => {
    const payload = {
      eventSlug: "miss-philippines-2026",
      eventTitle: "Miss Philippines 2026",
      candidateId: "cand-1",
      candidateNumber: 1,
      candidateName: "Roselle Tabuena",
      candidateAvatarUrl: "https://example.com/avatar.jpg",
      divisionName: "Female Category",
      categoryName: "People's Choice Award",
      votingUrl: "https://electa.app/events/miss-philippines-2026?contestantId=cand-1",
      theme: "midnight" as const,
    };

    const parsed = storyCardPayloadSchema.safeParse(payload);
    expect(parsed.success).toBe(true);
  });

  it("fails when required fields are missing", () => {
    const invalid = {
      eventSlug: "",
      candidateNumber: 0,
    };

    const parsed = storyCardPayloadSchema.safeParse(invalid);
    expect(parsed.success).toBe(false);
  });
});

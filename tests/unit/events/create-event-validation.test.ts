import { describe, it, expect } from "vitest";
import {
  createEventSchema,
  eventSlugSchema,
  checkSlugQuerySchema,
  RESERVED_SLUGS,
} from "@/lib/validations/event";

describe("eventSlugSchema", () => {
  it("accepts valid alphanumeric slugs with single hyphens", () => {
    const validSlugs = ["pageant-2026", "summer-gala", "voice-of-the-year", "event123"];
    for (const slug of validSlugs) {
      const result = eventSlugSchema.safeParse(slug);
      expect(result.success).toBe(true);
    }
  });

  it("normalizes uppercase and trimmed characters", () => {
    const result = eventSlugSchema.safeParse("  MUPH-2026  ");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe("muph-2026");
    }
  });

  it("rejects slugs under 3 characters or over 60 characters", () => {
    expect(eventSlugSchema.safeParse("ab").success).toBe(false);
    expect(eventSlugSchema.safeParse("a".repeat(61)).success).toBe(false);
  });

  it("rejects reserved system keywords", () => {
    for (const reserved of RESERVED_SLUGS) {
      const result = eventSlugSchema.safeParse(reserved);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain("reserved");
      }
    }
  });

  it("rejects invalid characters or consecutive hyphens", () => {
    const invalid = [
      "pageant--2026",
      "-leading-hyphen",
      "trailing-hyphen-",
      "event with spaces",
      "event_underscore",
      "event!",
    ];
    for (const slug of invalid) {
      expect(eventSlugSchema.safeParse(slug).success).toBe(false);
    }
  });
});

describe("checkSlugQuerySchema", () => {
  it("validates query object containing valid slug", () => {
    const result = checkSlugQuerySchema.safeParse({ slug: "summer-gala-2026" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid query slug", () => {
    const result = checkSlugQuerySchema.safeParse({ slug: "new" });
    expect(result.success).toBe(false);
  });
});

describe("createEventSchema", () => {
  const validPayload = {
    title: "Miss Universe Philippines 2026",
    slug: "muph-2026",
    description: "Annual nationwide beauty pageant competition for candidate selection.",
    bannerUrl: "https://example.com/banner.jpg",
    startsAt: "2026-10-01T00:00:00.000Z",
    endsAt: "2026-10-01T02:00:00.000Z",
  };

  it("accepts a completely valid event creation payload", () => {
    const result = createEventSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it("rejects titles that are too short (<3 chars) or too long (>120 chars)", () => {
    expect(createEventSchema.safeParse({ ...validPayload, title: "ab" }).success).toBe(false);
    expect(createEventSchema.safeParse({ ...validPayload, title: "a".repeat(121) }).success).toBe(
      false,
    );
  });

  it("rejects descriptions under 10 characters", () => {
    expect(createEventSchema.safeParse({ ...validPayload, description: "Short" }).success).toBe(
      false,
    );
  });

  it("rejects invalid banner URLs", () => {
    expect(
      createEventSchema.safeParse({ ...validPayload, bannerUrl: "not-a-valid-url" }).success,
    ).toBe(false);
  });

  it("rejects end time that is less than 1 hour after start time", () => {
    const thirtyMinDuration = {
      ...validPayload,
      startsAt: "2026-10-01T00:00:00.000Z",
      endsAt: "2026-10-01T00:30:00.000Z",
    };
    const result = createEventSchema.safeParse(thirtyMinDuration);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain("at least 1 hour after");
    }
  });

  it("rejects end time that precedes start time", () => {
    const invertedTime = {
      ...validPayload,
      startsAt: "2026-10-01T12:00:00.000Z",
      endsAt: "2026-10-01T10:00:00.000Z",
    };
    const result = createEventSchema.safeParse(invertedTime);
    expect(result.success).toBe(false);
  });

  it("accepts exactly 1 hour duration", () => {
    const exactOneHour = {
      ...validPayload,
      startsAt: "2026-10-01T00:00:00.000Z",
      endsAt: "2026-10-01T01:00:00.000Z",
    };
    const result = createEventSchema.safeParse(exactOneHour);
    expect(result.success).toBe(true);
  });
});

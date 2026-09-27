import { describe, it, expect } from "vitest";
import {
  eventSlugParamsSchema,
  eventSettingsTabQuerySchema,
} from "@/lib/validations/event-settings";

describe("eventSlugParamsSchema", () => {
  it("validates valid slugs", () => {
    const valid = eventSlugParamsSchema.safeParse({ slug: "miss-universe-2026" });
    expect(valid.success).toBe(true);
    if (valid.success) {
      expect(valid.data.slug).toBe("miss-universe-2026");
    }
  });

  it("rejects empty or uppercase slugs", () => {
    const empty = eventSlugParamsSchema.safeParse({ slug: "" });
    expect(empty.success).toBe(false);

    const uppercase = eventSlugParamsSchema.safeParse({ slug: "Miss-Universe" });
    expect(uppercase.success).toBe(false);

    const specialChars = eventSlugParamsSchema.safeParse({ slug: "event_name!@#" });
    expect(specialChars.success).toBe(false);
  });
});

describe("eventSettingsTabQuerySchema", () => {
  it("accepts valid tab names", () => {
    expect(eventSettingsTabQuerySchema.parse({ tab: "general" }).tab).toBe("general");
    expect(eventSettingsTabQuerySchema.parse({ tab: "schedule" }).tab).toBe("schedule");
    expect(eventSettingsTabQuerySchema.parse({ tab: "voting-rules" }).tab).toBe("voting-rules");
    expect(eventSettingsTabQuerySchema.parse({ tab: "categories" }).tab).toBe("categories");
  });

  it("defaults and catches invalid or missing tabs to 'general'", () => {
    expect(eventSettingsTabQuerySchema.parse({}).tab).toBe("general");
    expect(eventSettingsTabQuerySchema.parse({ tab: "unknown" }).tab).toBe("general");
    expect(eventSettingsTabQuerySchema.parse({ tab: "" }).tab).toBe("general");
  });
});

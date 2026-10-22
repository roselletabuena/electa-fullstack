import { describe, it, expect } from "vitest";
import { updateEventBrandingSchema } from "@/lib/validations/event-branding";

describe("updateEventBrandingSchema", () => {
  it("validates a complete valid branding payload", () => {
    const validData = {
      title: "Miss Earth Philippines 2026",
      description: "Annual beauty and advocacy competition celebrating environmental preservation.",
      bannerUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865",
      reason: "Updated title and high-resolution banner image",
    };

    const result = updateEventBrandingSchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe("Miss Earth Philippines 2026");
      expect(result.data.reason).toBe("Updated title and high-resolution banner image");
    }
  });

  it("accepts empty optional reason and trims fields", () => {
    const validData = {
      title: "  Miss Universe 2026  ",
      description: "  Celebration of women empowerment.  ",
      bannerUrl: "  https://example.com/banner.jpg  ",
      reason: "",
    };

    const result = updateEventBrandingSchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe("Miss Universe 2026");
      expect(result.data.description).toBe("Celebration of women empowerment.");
      expect(result.data.bannerUrl).toBe("https://example.com/banner.jpg");
    }
  });

  it("fails when title is shorter than 3 characters", () => {
    const result = updateEventBrandingSchema.safeParse({
      title: "Ab",
      description: "Short",
      bannerUrl: "https://example.com/banner.jpg",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain(
        "Event title must be at least 3 characters",
      );
    }
  });

  it("fails when title exceeds 100 characters", () => {
    const result = updateEventBrandingSchema.safeParse({
      title: "a".repeat(101),
      description: "Valid description",
      bannerUrl: "https://example.com/banner.jpg",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain(
        "Event title must not exceed 100 characters",
      );
    }
  });

  it("fails when bannerUrl is not HTTPS", () => {
    const result = updateEventBrandingSchema.safeParse({
      title: "Valid Title",
      description: "Valid description",
      bannerUrl: "http://example.com/banner.jpg",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain("HTTPS protocol");
    }
  });

  it("fails when reason exceeds 500 characters", () => {
    const result = updateEventBrandingSchema.safeParse({
      title: "Valid Title",
      description: "Valid description",
      bannerUrl: "https://example.com/banner.jpg",
      reason: "r".repeat(501),
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain("Reason must not exceed 500 characters");
    }
  });

  it("validates when valid theme is provided (ELECTA_DEFAULT or PAGEANT_EDITORIAL)", () => {
    const defaultThemeResult = updateEventBrandingSchema.safeParse({
      title: "Valid Title",
      description: "Valid description",
      bannerUrl: "https://example.com/banner.jpg",
      theme: "ELECTA_DEFAULT",
    });
    expect(defaultThemeResult.success).toBe(true);
    if (defaultThemeResult.success) {
      expect(defaultThemeResult.data.theme).toBe("ELECTA_DEFAULT");
    }

    const pageantThemeResult = updateEventBrandingSchema.safeParse({
      title: "Valid Title",
      description: "Valid description",
      bannerUrl: "https://example.com/banner.jpg",
      theme: "PAGEANT_EDITORIAL",
    });
    expect(pageantThemeResult.success).toBe(true);
    if (pageantThemeResult.success) {
      expect(pageantThemeResult.data.theme).toBe("PAGEANT_EDITORIAL");
    }
  });

  it("fails when invalid theme identifier is provided", () => {
    const result = updateEventBrandingSchema.safeParse({
      title: "Valid Title",
      description: "Valid description",
      bannerUrl: "https://example.com/banner.jpg",
      theme: "INVALID_NEON_THEME",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain("Invalid event theme identifier");
    }
  });
});

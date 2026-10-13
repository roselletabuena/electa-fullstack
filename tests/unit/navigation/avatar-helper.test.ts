import { describe, it, expect } from "vitest";
import { getInitials } from "@/features/navigation/utils/avatar-helper";

describe("getInitials helper", () => {
  it("returns uppercase first letters of first and last name", () => {
    expect(getInitials("Maria Santos")).toBe("MS");
    expect(getInitials("John Doe")).toBe("JD");
  });

  it("handles single-word names by taking first two letters capitalized", () => {
    expect(getInitials("Alex")).toBe("AL");
    expect(getInitials("A")).toBe("A");
  });

  it("handles multi-word names with extra spaces gracefully", () => {
    expect(getInitials("  Maria   Elena   Santos  ")).toBe("ME");
  });

  it("falls back to email prefix when name is undefined or empty", () => {
    expect(getInitials("", "voter@electa.ph")).toBe("V");
    expect(getInitials(undefined, "organizer@electa.ph")).toBe("O");
    expect(getInitials(null, "admin@electa.ph")).toBe("A");
  });

  it("returns fallback 'U' when neither name nor email is provided", () => {
    expect(getInitials("", "")).toBe("U");
    expect(getInitials(undefined, undefined)).toBe("U");
    expect(getInitials(null, null)).toBe("U");
    expect(getInitials("   ", "   ")).toBe("U");
  });
});

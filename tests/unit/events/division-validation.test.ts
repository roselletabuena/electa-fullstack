import { describe, it, expect } from "vitest";
import { createDivisionSchema, updateDivisionSchema } from "@/lib/validations/division";

describe("createDivisionSchema", () => {
  it("validates a valid division payload", () => {
    const validData = {
      name: "Miss Universe Division",
      description: "Primary female tier",
      displayOrder: 1,
    };

    const result = createDivisionSchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Miss Universe Division");
      expect(result.data.displayOrder).toBe(1);
    }
  });

  it("trims whitespace from division name", () => {
    const input = {
      name: "   Junior Teen   ",
      description: "   Ages 13-17   ",
      displayOrder: 2,
    };

    const result = createDivisionSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Junior Teen");
      expect(result.data.description).toBe("Ages 13-17");
    }
  });

  it("defaults displayOrder to 0 when omitted", () => {
    const input = {
      name: "Grand Division",
    };

    const result = createDivisionSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.displayOrder).toBe(0);
    }
  });

  it("rejects empty division name", () => {
    const input = {
      name: "   ",
    };

    const result = createDivisionSchema.safeParse(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain("Division name is required");
    }
  });

  it("rejects division name exceeding 100 characters", () => {
    const input = {
      name: "A".repeat(101),
    };

    const result = createDivisionSchema.safeParse(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain("cannot exceed 100 characters");
    }
  });

  it("rejects negative displayOrder", () => {
    const input = {
      name: "Invalid Order Division",
      displayOrder: -1,
    };

    const result = createDivisionSchema.safeParse(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain("must be non-negative");
    }
  });
});

describe("updateDivisionSchema", () => {
  it("allows partial updates", () => {
    const input = {
      displayOrder: 5,
    };

    const result = updateDivisionSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.displayOrder).toBe(5);
    }
  });

  it("rejects empty name if provided in update", () => {
    const input = {
      name: "   ",
    };

    const result = updateDivisionSchema.safeParse(input);
    expect(result.success).toBe(false);
  });
});

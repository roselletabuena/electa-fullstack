import { describe, it, expect } from "vitest";
import {
  createAwardCategorySchema,
  updateAwardCategorySchema,
} from "@/lib/validations/category-awards";

describe("createAwardCategorySchema", () => {
  it("validates a valid award category payload", () => {
    const validData = {
      name: "People's Choice Award",
      description: "Voted by the public",
      isVotingOpen: true,
      displayOrder: 1,
    };

    const result = createAwardCategorySchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("People's Choice Award");
      expect(result.data.isVotingOpen).toBe(true);
      expect(result.data.displayOrder).toBe(1);
    }
  });

  it("defaults isVotingOpen to true and displayOrder to 0", () => {
    const input = {
      name: "Best in Swimsuit",
    };

    const result = createAwardCategorySchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.isVotingOpen).toBe(true);
      expect(result.data.displayOrder).toBe(0);
    }
  });

  it("rejects empty category name", () => {
    const input = {
      name: "   ",
    };

    const result = createAwardCategorySchema.safeParse(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain("Category name is required");
    }
  });

  it("rejects category name exceeding 100 characters", () => {
    const input = {
      name: "C".repeat(101),
    };

    const result = createAwardCategorySchema.safeParse(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain("cannot exceed 100 characters");
    }
  });

  it("rejects negative displayOrder", () => {
    const input = {
      name: "Evening Gown",
      displayOrder: -2,
    };

    const result = createAwardCategorySchema.safeParse(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain("must be non-negative");
    }
  });
});

describe("updateAwardCategorySchema", () => {
  it("allows updating voting toggle only", () => {
    const input = {
      isVotingOpen: false,
    };

    const result = updateAwardCategorySchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.isVotingOpen).toBe(false);
    }
  });

  it("allows updating displayOrder only", () => {
    const input = {
      displayOrder: 10,
    };

    const result = updateAwardCategorySchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.displayOrder).toBe(10);
    }
  });
});

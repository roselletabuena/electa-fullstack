import { describe, it, expect } from "vitest";
import {
  criterionScoreInputSchema,
  submitScorecardSchema,
  rubricCriterionSchema,
} from "@/lib/validations/rubric";

describe("Rubric Validations", () => {
  const validUuid = "11111111-1111-4111-a111-111111111111";
  const validCriterionId = "22222222-2222-4222-a222-222222222222";

  describe("criterionScoreInputSchema", () => {
    it("should accept valid criterion score between 1 and 10", () => {
      const valid = {
        criterionId: validCriterionId,
        score: 8.5,
      };
      const result = criterionScoreInputSchema.safeParse(valid);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.score).toBe(8.5);
      }
    });

    it("should reject scores below 1", () => {
      const result = criterionScoreInputSchema.safeParse({
        criterionId: validCriterionId,
        score: 0.5,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toMatch(/at least 1/i);
      }
    });

    it("should reject scores exceeding 10", () => {
      const result = criterionScoreInputSchema.safeParse({
        criterionId: validCriterionId,
        score: 11,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toMatch(/cannot exceed 10/i);
      }
    });

    it("should reject non-uuid criterionId", () => {
      const result = criterionScoreInputSchema.safeParse({
        criterionId: "not-a-uuid",
        score: 7,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toMatch(/invalid criterion id/i);
      }
    });
  });

  describe("submitScorecardSchema", () => {
    it("should accept valid scorecard submission", () => {
      const payload = {
        eventId: validUuid,
        submissionId: "submission-prj-101",
        scores: [
          { criterionId: validCriterionId, score: 9 },
          { criterionId: "33333333-3333-4333-a333-333333333333", score: 8 },
        ],
        notes: "Great technical architecture and UI demo.",
        isDraft: false,
      };

      const result = submitScorecardSchema.safeParse(payload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isDraft).toBe(false);
        expect(result.data.scores).toHaveLength(2);
      }
    });

    it("should default isDraft to false if omitted", () => {
      const payload = {
        eventId: validUuid,
        submissionId: "submission-prj-101",
        scores: [{ criterionId: validCriterionId, score: 7 }],
      };

      const result = submitScorecardSchema.safeParse(payload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isDraft).toBe(false);
      }
    });

    it("should reject empty scores array", () => {
      const payload = {
        eventId: validUuid,
        submissionId: "submission-prj-101",
        scores: [],
      };

      const result = submitScorecardSchema.safeParse(payload);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toMatch(/at least one criterion score/i);
      }
    });

    it("should reject notes exceeding 2000 characters", () => {
      const payload = {
        eventId: validUuid,
        submissionId: "submission-prj-101",
        scores: [{ criterionId: validCriterionId, score: 8 }],
        notes: "a".repeat(2001),
      };

      const result = submitScorecardSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });

    it("should reject invalid eventId", () => {
      const payload = {
        eventId: "invalid-event-id",
        submissionId: "submission-prj-101",
        scores: [{ criterionId: validCriterionId, score: 8 }],
      };

      const result = submitScorecardSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });
  });

  describe("rubricCriterionSchema", () => {
    it("should validate and default criterion fields correctly", () => {
      const input = {
        title: "Technical Complexity",
      };

      const result = rubricCriterionSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.weight).toBe(1);
        expect(result.data.maxScore).toBe(10);
        expect(result.data.displayOrder).toBe(0);
      }
    });

    it("should reject title shorter than 2 characters", () => {
      const result = rubricCriterionSchema.safeParse({
        title: "T",
      });
      expect(result.success).toBe(false);
    });

    it("should reject non-positive weight", () => {
      const result = rubricCriterionSchema.safeParse({
        title: "Innovation",
        weight: 0,
      });
      expect(result.success).toBe(false);
    });
  });
});

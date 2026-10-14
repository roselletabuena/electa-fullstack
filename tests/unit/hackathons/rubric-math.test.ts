import { describe, it, expect } from "vitest";
import { calculateWeightedScore } from "@/features/hackathons/services/rubric-service";

describe("Rubric Math Calculation Engine", () => {
  it("should calculate exact composite score for 4 weighted criteria (Scenario 1 Happy Path)", () => {
    // Technical Complexity 30%, Impact 30%, Innovation 20%, Presentation 20%
    // Scores: 8, 9, 7, 10
    // Expected: 2.4 + 2.7 + 1.4 + 2.0 = 8.50
    const criteriaScores = [
      { score: 8, weight: 30, maxScore: 10 },
      { score: 9, weight: 30, maxScore: 10 },
      { score: 7, weight: 20, maxScore: 10 },
      { score: 10, weight: 20, maxScore: 10 },
    ];

    const composite = calculateWeightedScore(criteriaScores);
    expect(composite).toBe(8.5);
  });

  it("should support fractional weights that sum to 1.0", () => {
    const criteriaScores = [
      { score: 8, weight: 0.3, maxScore: 10 },
      { score: 9, weight: 0.3, maxScore: 10 },
      { score: 7, weight: 0.2, maxScore: 10 },
      { score: 10, weight: 0.2, maxScore: 10 },
    ];

    const composite = calculateWeightedScore(criteriaScores);
    expect(composite).toBe(8.5);
  });

  it("should handle equal default weights (1, 1, 1, 1)", () => {
    const criteriaScores = [
      { score: 6, weight: 1, maxScore: 10 },
      { score: 8, weight: 1, maxScore: 10 },
      { score: 7, weight: 1, maxScore: 10 },
      { score: 9, weight: 1, maxScore: 10 },
    ];

    // Average: (6 + 8 + 7 + 9) / 4 = 30 / 4 = 7.50
    const composite = calculateWeightedScore(criteriaScores);
    expect(composite).toBe(7.5);
  });

  it("should handle different maxScore thresholds and scale to 10-point basis", () => {
    // Criterion 1: score 4/5 (80%), weight 50%
    // Criterion 2: score 16/20 (80%), weight 50%
    // Expected: 8.00
    const criteriaScores = [
      { score: 4, weight: 50, maxScore: 5 },
      { score: 16, weight: 50, maxScore: 20 },
    ];

    const composite = calculateWeightedScore(criteriaScores);
    expect(composite).toBe(8.0);
  });

  it("should round composite score to exactly 2 decimal places without floating drift", () => {
    // 3 criteria with weights 1, 1, 1 (1/3 each) and scores 7, 8, 8 -> 23 / 3 = 7.6666... -> 7.67
    const criteriaScores = [
      { score: 7, weight: 1, maxScore: 10 },
      { score: 8, weight: 1, maxScore: 10 },
      { score: 8, weight: 1, maxScore: 10 },
    ];

    const composite = calculateWeightedScore(criteriaScores);
    expect(composite).toBe(7.67);
  });

  it("should return 0 when criteria list is empty or total weight is zero", () => {
    expect(calculateWeightedScore([])).toBe(0);
    expect(calculateWeightedScore([{ score: 10, weight: 0, maxScore: 10 }])).toBe(0);
  });
});

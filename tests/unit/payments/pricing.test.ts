import { describe, it, expect } from "vitest";
import {
  PRICING_TIERS,
  calculateBonusVotes,
  calculateCustomVotePackage,
  formatPhp,
} from "@/features/payments/utils/pricing";

describe("Payments - Pricing and Bonus Engine", () => {
  it("defines the standard 8 pricing tiers accurately", () => {
    expect(PRICING_TIERS).toHaveLength(8);

    const starter = PRICING_TIERS.find((t) => t.id === "tier_starter");
    expect(starter).toBeDefined();
    expect(starter?.pricePhp).toBe(50);
    expect(starter?.totalVotes).toBe(5);
    expect(starter?.bonusVotes).toBe(0);

    const supporter = PRICING_TIERS.find((t) => t.id === "tier_supporter");
    expect(supporter).toBeDefined();
    expect(supporter?.pricePhp).toBe(250);
    expect(supporter?.baseVotes).toBe(25);
    expect(supporter?.bonusVotes).toBe(1);
    expect(supporter?.totalVotes).toBe(26);

    const grandBenefactor = PRICING_TIERS.find((t) => t.id === "tier_grand_benefactor");
    expect(grandBenefactor).toBeDefined();
    expect(grandBenefactor?.pricePhp).toBe(10000);
    expect(grandBenefactor?.baseVotes).toBe(1000);
    expect(grandBenefactor?.bonusVotes).toBe(300);
    expect(grandBenefactor?.totalVotes).toBe(1300);
  });

  it("calculates tiered bonus votes correctly for arbitrary amounts", () => {
    // Under 25 votes: 0 bonus
    expect(calculateBonusVotes(10)).toEqual({ bonusVotes: 0, bonusPercentage: 0 });

    // 25 to 49 votes: +1 bonus
    expect(calculateBonusVotes(25)).toEqual({ bonusVotes: 1, bonusPercentage: 4 });
    expect(calculateBonusVotes(40)).toEqual({ bonusVotes: 1, bonusPercentage: 4 });

    // 50 to 99 votes: +10%
    expect(calculateBonusVotes(50)).toEqual({ bonusVotes: 5, bonusPercentage: 10 });
    expect(calculateBonusVotes(80)).toEqual({ bonusVotes: 8, bonusPercentage: 10 });

    // 100 to 249 votes: +15%
    expect(calculateBonusVotes(100)).toEqual({ bonusVotes: 15, bonusPercentage: 15 });

    // 250 to 499 votes: +20%
    expect(calculateBonusVotes(250)).toEqual({ bonusVotes: 50, bonusPercentage: 20 });

    // 500 to 999 votes: +25%
    expect(calculateBonusVotes(500)).toEqual({ bonusVotes: 125, bonusPercentage: 25 });

    // 1000+ votes: +30%
    expect(calculateBonusVotes(1000)).toEqual({ bonusVotes: 300, bonusPercentage: 30 });
    expect(calculateBonusVotes(2000)).toEqual({ bonusVotes: 600, bonusPercentage: 30 });
  });

  it("calculates custom vote packages and total prices", () => {
    const pkg60 = calculateCustomVotePackage(60);
    expect(pkg60.baseVotes).toBe(60);
    expect(pkg60.pricePhp).toBe(600); // ₱10/vote
    expect(pkg60.bonusVotes).toBe(6); // 10%
    expect(pkg60.totalVotes).toBe(66);

    const pkgClamped = calculateCustomVotePackage(0);
    expect(pkgClamped.baseVotes).toBe(1);
    expect(pkgClamped.pricePhp).toBe(10);
  });

  it("formats PHP currency accurately", () => {
    const formatted = formatPhp(250);
    expect(formatted).toContain("250.00");
  });
});

import type { PricingTier } from "../types";

export const VOTE_PRICE_PER_UNIT_PHP = 10; // Base: ₱10 per vote

export const PRICING_TIERS: PricingTier[] = [
  {
    id: "tier_starter",
    name: "Starter Boost",
    pricePhp: 50,
    baseVotes: 5,
    bonusVotes: 0,
    totalVotes: 5,
    bonusPercentage: 0,
    badge: "Quick Vote",
  },
  {
    id: "tier_popular",
    name: "Fan Favorite",
    pricePhp: 100,
    baseVotes: 10,
    bonusVotes: 0,
    totalVotes: 10,
    bonusPercentage: 0,
    isPopular: true,
    badge: "Most Popular",
  },
  {
    id: "tier_supporter",
    name: "Supporter Pack",
    pricePhp: 250,
    baseVotes: 25,
    bonusVotes: 1,
    totalVotes: 26,
    bonusPercentage: 4,
    badge: "+1 Bonus",
  },
  {
    id: "tier_super_fan",
    name: "Super Fan",
    pricePhp: 500,
    baseVotes: 50,
    bonusVotes: 5,
    totalVotes: 55,
    bonusPercentage: 10,
    badge: "+5 Bonus (+10%)",
  },
  {
    id: "tier_patron",
    name: "Pageant Patron",
    pricePhp: 1000,
    baseVotes: 100,
    bonusVotes: 15,
    totalVotes: 115,
    bonusPercentage: 15,
    badge: "+15 Bonus (+15%)",
  },
  {
    id: "tier_champion",
    name: "Crown Champion",
    pricePhp: 2500,
    baseVotes: 250,
    bonusVotes: 50,
    totalVotes: 300,
    bonusPercentage: 20,
    badge: "+50 Bonus (+20%)",
  },
  {
    id: "tier_crown_sponsor",
    name: "Crown Sponsor",
    pricePhp: 5000,
    baseVotes: 500,
    bonusVotes: 125,
    totalVotes: 625,
    bonusPercentage: 25,
    badge: "+125 Bonus (+25%)",
  },
  {
    id: "tier_grand_benefactor",
    name: "Grand Benefactor",
    pricePhp: 10000,
    baseVotes: 1000,
    bonusVotes: 300,
    totalVotes: 1300,
    bonusPercentage: 30,
    badge: "+300 Bonus (+30%)",
  },
];

/**
 * Calculates bonus votes based on base vote count
 */
export function calculateBonusVotes(baseVotes: number): {
  bonusVotes: number;
  bonusPercentage: number;
} {
  if (baseVotes >= 1000) {
    return { bonusVotes: Math.floor(baseVotes * 0.3), bonusPercentage: 30 };
  }
  if (baseVotes >= 500) {
    return { bonusVotes: Math.floor(baseVotes * 0.25), bonusPercentage: 25 };
  }
  if (baseVotes >= 250) {
    return { bonusVotes: Math.floor(baseVotes * 0.2), bonusPercentage: 20 };
  }
  if (baseVotes >= 100) {
    return { bonusVotes: Math.floor(baseVotes * 0.15), bonusPercentage: 15 };
  }
  if (baseVotes >= 50) {
    return { bonusVotes: Math.floor(baseVotes * 0.1), bonusPercentage: 10 };
  }
  if (baseVotes >= 25) {
    return { bonusVotes: 1, bonusPercentage: 4 };
  }
  return { bonusVotes: 0, bonusPercentage: 0 };
}

/**
 * Calculates total votes and pricing for custom slider amounts
 */
export function calculateCustomVotePackage(customVotes: number): {
  pricePhp: number;
  baseVotes: number;
  bonusVotes: number;
  totalVotes: number;
  bonusPercentage: number;
} {
  const safeBase = Math.max(1, Math.min(10000, Math.floor(customVotes)));
  const pricePhp = safeBase * VOTE_PRICE_PER_UNIT_PHP;
  const { bonusVotes, bonusPercentage } = calculateBonusVotes(safeBase);

  return {
    pricePhp,
    baseVotes: safeBase,
    bonusVotes,
    totalVotes: safeBase + bonusVotes,
    bonusPercentage,
  };
}

/**
 * Formats Philippine Peso amount with currency symbol and commas
 */
export function formatPhp(amount: number): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

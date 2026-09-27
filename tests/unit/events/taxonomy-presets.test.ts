import { describe, it, expect } from "vitest";
import { TAXONOMY_PRESETS } from "@/features/events/constants/taxonomy-presets";

describe("TAXONOMY_PRESETS catalog", () => {
  it("contains all 4 standard competition presets", () => {
    expect(TAXONOMY_PRESETS).toHaveLength(4);
    const presetIds = TAXONOMY_PRESETS.map((p) => p.id);
    expect(presetIds).toEqual([
      "beauty-pageant",
      "talent-singing",
      "dance-championship",
      "academic-hackathon",
    ]);
  });

  it("ensures each preset defines valid divisions and award categories", () => {
    for (const preset of TAXONOMY_PRESETS) {
      expect(preset.title).toBeTruthy();
      expect(preset.badge).toBeTruthy();
      expect(preset.description).toBeTruthy();
      expect(preset.divisions.length).toBeGreaterThanOrEqual(3);
      expect(preset.awardCategories.length).toBeGreaterThanOrEqual(3);

      // Verify displayOrder sequencing
      for (const [idx, div] of preset.divisions.entries()) {
        expect(div.name.length).toBeGreaterThan(0);
        expect(div.displayOrder).toBe(idx);
      }

      for (const [idx, award] of preset.awardCategories.entries()) {
        expect(award.name.length).toBeGreaterThan(0);
        expect(typeof award.isVotingOpen).toBe("boolean");
        expect(award.displayOrder).toBe(idx);
      }
    }
  });

  it("verifies beauty-pageant preset contains expected items", () => {
    const pageant = TAXONOMY_PRESETS.find((p) => p.id === "beauty-pageant");
    expect(pageant).toBeDefined();
    expect(pageant?.divisions.map((d) => d.name)).toContain("Female Category");
    expect(pageant?.divisions.map((d) => d.name)).toContain("Male Category");
    expect(pageant?.awardCategories.map((a) => a.name)).toContain("People's Choice Award");

    const peoplesChoice = pageant?.awardCategories.find((a) => a.name === "People's Choice Award");
    expect(peoplesChoice?.isVotingOpen).toBe(true);

    const eveningGown = pageant?.awardCategories.find((a) => a.name === "Best in Evening Gown");
    expect(eveningGown?.isVotingOpen).toBe(false);
  });
});

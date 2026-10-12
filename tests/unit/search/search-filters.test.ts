import { describe, it, expect } from "vitest";
import {
  normalizeSearchText,
  filterEventsByQuery,
  filterContestantsByQuery,
} from "@/features/search/utils/search-filters";

describe("search-filters utility", () => {
  describe("normalizeSearchText", () => {
    it("trims and lowercases input text", () => {
      expect(normalizeSearchText("  Miss Universe  ")).toBe("miss universe");
    });

    it("returns empty string for null or undefined", () => {
      expect(normalizeSearchText(null)).toBe("");
      expect(normalizeSearchText(undefined)).toBe("");
      expect(normalizeSearchText("")).toBe("");
    });
  });

  describe("filterEventsByQuery", () => {
    const mockEvents = [
      {
        title: "Miss Luzon 2026",
        description: "Annual regional beauty pageant",
        slug: "miss-luzon-2026",
      },
      {
        title: "Mr. Campus King",
        description: "Collegiate leadership contest",
        slug: "mr-campus-king",
      },
      {
        title: "Best in Talent Gala",
        description: "Special event category showcase",
        slug: "talent-gala",
      },
    ];

    it("returns all events if query is empty", () => {
      expect(filterEventsByQuery(mockEvents, "")).toEqual(mockEvents);
      expect(filterEventsByQuery(mockEvents, "   ")).toEqual(mockEvents);
    });

    it.each([
      { query: "luzon", expectedTitle: "Miss Luzon 2026" },
      { query: "leadership", expectedTitle: "Mr. Campus King" },
      { query: "talent-gala", expectedTitle: "Best in Talent Gala" },
    ])("filters events matching query '$query'", ({ query, expectedTitle }) => {
      const results = filterEventsByQuery(mockEvents, query);
      expect(results).toHaveLength(1);
      expect(results[0]?.title).toBe(expectedTitle);
    });

    it("returns empty array when no events match query", () => {
      const results = filterEventsByQuery(mockEvents, "nonexistent event xyz");
      expect(results).toHaveLength(0);
    });
  });

  describe("filterContestantsByQuery", () => {
    const mockContestants = [
      {
        name: "Maria Santos",
        hometown: "Baguio City",
        bio: "Advocate for indigenous cultural preservation",
        contestantNumber: 7,
      },
      {
        name: "Juan Dela Cruz",
        hometown: "Manila",
        bio: "Engineering student and community organizer",
        contestantNumber: 12,
      },
    ];

    it("returns all contestants if query is empty", () => {
      expect(filterContestantsByQuery(mockContestants, "")).toEqual(mockContestants);
    });

    it.each([
      { query: "maria", expectedName: "Maria Santos" },
      { query: "baguio", expectedName: "Maria Santos" },
      { query: "12", expectedName: "Juan Dela Cruz" },
    ])("filters contestants matching query '$query'", ({ query, expectedName }) => {
      const results = filterContestantsByQuery(mockContestants, query);
      expect(results).toHaveLength(1);
      expect(results[0]?.name).toBe(expectedName);
    });
  });
});

import { describe, expect, it } from "vitest";
import type { ContestantDto } from "@/features/contestants/types";

describe("Contestant Category & Division Filtering Logic", () => {
  const sampleContestants: ContestantDto[] = [
    {
      id: "c1",
      eventId: "ev1",
      contestantNumber: 1,
      name: "Maria Clara",
      division: "FEMALE",
      status: "ACTIVE",
      avatarUrl: "https://example.com/c1.webp",
      voteCount: 100,
      media: [],
      categories: [{ id: "cat-pc", eventId: "ev1", name: "People's Choice", isVotingOpen: true }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "c2",
      eventId: "ev1",
      contestantNumber: 2,
      name: "Crisostomo Ibarra",
      division: "MALE",
      status: "ACTIVE",
      avatarUrl: "https://example.com/c2.webp",
      voteCount: 200,
      media: [],
      categories: [
        { id: "cat-swim", eventId: "ev1", name: "Best in Swimsuit", isVotingOpen: true },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "c3",
      eventId: "ev1",
      contestantNumber: 3,
      name: "Elena Ramos",
      division: "FEMALE",
      status: "WITHDRAWN",
      avatarUrl: "https://example.com/c3.webp",
      voteCount: 50,
      media: [],
      categories: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "c4",
      eventId: "ev1",
      contestantNumber: 4,
      name: "Alex Gonzaga",
      division: "LGBTQ",
      status: "ACTIVE",
      avatarUrl: "https://example.com/c4.webp",
      voteCount: 300,
      media: [],
      categories: [{ id: "cat-pc", eventId: "ev1", name: "People's Choice", isVotingOpen: true }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  it("filters out non-active candidates for public rosters", () => {
    const active = sampleContestants.filter((c) => c.status === "ACTIVE");
    expect(active.length).toBe(3);
    expect(active.some((c) => c.id === "c3")).toBe(false);
  });

  it("filters by division correctly", () => {
    const femaleCandidates = sampleContestants.filter(
      (c) => c.status === "ACTIVE" && c.division === "FEMALE",
    );
    expect(femaleCandidates.length).toBe(1);
    expect(femaleCandidates[0]?.name).toBe("Maria Clara");

    const maleCandidates = sampleContestants.filter(
      (c) => c.status === "ACTIVE" && c.division === "MALE",
    );
    expect(maleCandidates.length).toBe(1);
    expect(maleCandidates[0]?.name).toBe("Crisostomo Ibarra");
  });

  it("filters by award category nomination", () => {
    const peoplesChoice = sampleContestants.filter(
      (c) => c.status === "ACTIVE" && c.categories.some((cat) => cat.id === "cat-pc"),
    );
    expect(peoplesChoice.length).toBe(2);
    expect(peoplesChoice.map((c) => c.name)).toEqual(["Maria Clara", "Alex Gonzaga"]);
  });

  it("handles combined division and award category filter", () => {
    const femalePeoplesChoice = sampleContestants.filter(
      (c) =>
        c.status === "ACTIVE" &&
        c.division === "FEMALE" &&
        c.categories.some((cat) => cat.id === "cat-pc"),
    );
    expect(femalePeoplesChoice.length).toBe(1);
    expect(femalePeoplesChoice[0]?.name).toBe("Maria Clara");
  });

  it("dynamically matches custom division names to contestant division values", () => {
    const _customDivisions = [
      { id: "div-f", name: "Female Category" },
      { id: "div-m", name: "Male Division" },
    ];

    const matchDivision = (contestantDiv: string, selectedDiv: string) => {
      if (selectedDiv === "ALL") return true;
      const matchExact = contestantDiv.toLowerCase() === selectedDiv.toLowerCase();
      const isFemaleFilter = selectedDiv.toLowerCase().includes("female");
      const isMaleFilter = !isFemaleFilter && selectedDiv.toLowerCase().includes("male");
      const matchNormalized =
        (contestantDiv === "FEMALE" && isFemaleFilter) ||
        (contestantDiv === "MALE" && isMaleFilter) ||
        (contestantDiv === "LGBTQ" && selectedDiv.toLowerCase().includes("lgbt")) ||
        (contestantDiv === "TEEN" && selectedDiv.toLowerCase().includes("teen"));
      return matchExact || matchNormalized;
    };

    const femaleFiltered = sampleContestants.filter(
      (c) => c.status === "ACTIVE" && matchDivision(c.division, "Female Category"),
    );
    expect(femaleFiltered.length).toBe(1);
    expect(femaleFiltered[0]?.name).toBe("Maria Clara");

    const maleFiltered = sampleContestants.filter(
      (c) => c.status === "ACTIVE" && matchDivision(c.division, "Male Division"),
    );
    expect(maleFiltered.length).toBe(1);
    expect(maleFiltered[0]?.name).toBe("Crisostomo Ibarra");
  });
});

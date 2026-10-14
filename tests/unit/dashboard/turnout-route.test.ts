import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/events/[slug]/turnout/route";
import { db } from "@/lib/db";

vi.mock("@/lib/db", () => ({
  db: {
    event: {
      findUnique: vi.fn(),
    },
    studentRosterEntry: {
      count: vi.fn(),
    },
    voterParticipation: {
      count: vi.fn(),
    },
  },
}));

describe("Turnout API Route (GET /api/events/[slug]/turnout)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 404 when election event does not exist", async () => {
    vi.mocked(db.event.findUnique).mockResolvedValue(null);

    const res = await GET(new Request("https://localhost/api/events/unknown/turnout"), {
      params: Promise.resolve({ slug: "unknown" }),
    });

    const json = (await res.json()) as { success: boolean; error: string };
    expect(res.status).toBe(404);
    expect(json.success).toBe(false);
    expect(json.error).toBe("Event not found");
  });

  it("returns real-time turnout metrics without candidate vote counts (Scenario 1)", async () => {
    vi.mocked(db.event.findUnique).mockResolvedValue({
      id: "550e8400-e29b-41d4-a716-446655440000",
      slug: "usc-election-2026",
      title: "USC General Election 2026",
      endsAt: new Date(Date.now() + 3600000),
    } as unknown as Awaited<ReturnType<typeof db.event.findUnique>>);

    vi.mocked(db.studentRosterEntry.count).mockResolvedValue(2000);
    vi.mocked(db.voterParticipation.count)
      .mockResolvedValueOnce(750) // recordedParticipations
      .mockResolvedValueOnce(45); // recent velocity

    const res = await GET(new Request("https://localhost/api/events/usc-election-2026/turnout"), {
      params: Promise.resolve({ slug: "usc-election-2026" }),
    });

    const json = (await res.json()) as {
      success: boolean;
      data: {
        event: { id: string; slug: string; title: string };
        turnout: {
          totalWhitelistedVoters: number;
          recordedParticipations: number;
          turnoutPercentage: number;
          isQuorumMet: boolean;
          votingVelocityPerHour: number;
          isPollClosed: boolean;
        };
      };
    };

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.turnout.totalWhitelistedVoters).toBe(2000);
    expect(json.data.turnout.recordedParticipations).toBe(750);
    expect(json.data.turnout.turnoutPercentage).toBe(37.5);
    expect(json.data.turnout.isQuorumMet).toBe(false);
    expect(json.data.turnout.votingVelocityPerHour).toBe(45);
    expect(json.data.turnout.isPollClosed).toBe(false);
    // Crucially: Candidate vote counts or standings are NEVER present in this public endpoint!
    expect((json.data as Record<string, unknown>).offices).toBeUndefined();
    expect((json.data as Record<string, unknown>).candidates).toBeUndefined();
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import { exportCertifiedTally } from "@/features/dashboard/actions/export-certified-tally";
import { getSession } from "@/lib/auth/get-session";
import { db } from "@/lib/db";

vi.mock("@/lib/auth/get-session", () => ({
  getSession: vi.fn(),
}));

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
    eventPosition: {
      findMany: vi.fn(),
    },
    ballotSelection: {
      findMany: vi.fn(),
    },
  },
}));

describe("exportCertifiedTally action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects unauthenticated requests", async () => {
    vi.mocked(getSession).mockResolvedValue(null);

    const result = await exportCertifiedTally({
      eventId: "550e8400-e29b-41d4-a716-446655440000",
      format: "csv",
    });

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe("UNAUTHORIZED");
  });

  it("rejects non-organizer requests", async () => {
    vi.mocked(getSession).mockResolvedValue({
      userId: "user-attacker",
      email: "attacker@school.edu",
      role: "VOTER",
    });

    vi.mocked(db.event.findUnique).mockResolvedValue({
      id: "550e8400-e29b-41d4-a716-446655440000",
      title: "USC Elections",
      slug: "usc-elections",
      startsAt: new Date(Date.now() - 7200000),
      endsAt: new Date(Date.now() - 3600000),
      organizerId: "user-commissioner",
    } as unknown as Awaited<ReturnType<typeof db.event.findUnique>>);

    const result = await exportCertifiedTally({
      eventId: "550e8400-e29b-41d4-a716-446655440000",
      format: "csv",
    });

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe("FORBIDDEN");
  });

  it("rejects export attempts before polls close (Scenario 2 validation)", async () => {
    vi.mocked(getSession).mockResolvedValue({
      userId: "user-commissioner",
      email: "commissioner@school.edu",
      role: "ORGANIZER",
    });

    vi.mocked(db.event.findUnique).mockResolvedValue({
      id: "550e8400-e29b-41d4-a716-446655440000",
      title: "USC Elections",
      slug: "usc-elections",
      startsAt: new Date(Date.now() - 3600000),
      endsAt: new Date(Date.now() + 3600000), // In the future!
      organizerId: "user-commissioner",
    } as unknown as Awaited<ReturnType<typeof db.event.findUnique>>);

    const result = await exportCertifiedTally({
      eventId: "550e8400-e29b-41d4-a716-446655440000",
      format: "csv",
    });

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe("POLL_NOT_CLOSED");
  });

  it("successfully generates certified CSV export with SHA-256 audit hash post-closure (Scenario 3)", async () => {
    vi.mocked(getSession).mockResolvedValue({
      userId: "user-commissioner",
      email: "commissioner@school.edu",
      role: "ORGANIZER",
    });

    vi.mocked(db.event.findUnique).mockResolvedValue({
      id: "550e8400-e29b-41d4-a716-446655440000",
      title: "USC Elections",
      slug: "usc-elections",
      startsAt: new Date(Date.now() - 7200000),
      endsAt: new Date(Date.now() - 3600000), // Closed in past
      organizerId: "user-commissioner",
    } as unknown as Awaited<ReturnType<typeof db.event.findUnique>>);

    vi.mocked(db.studentRosterEntry.count).mockResolvedValue(2000);
    vi.mocked(db.voterParticipation.count).mockResolvedValue(1200);

    vi.mocked(db.eventPosition.findMany).mockResolvedValue([
      {
        id: "office-1",
        name: "President",
        displayOrder: 0,
        maxSelectionsPerVoter: 1,
        contestants: [
          {
            id: "cand-1",
            name: "Alice",
            contestantNumber: 1,
            avatarUrl: "/avatars/alice.png",
          },
          {
            id: "cand-2",
            name: "Bob",
            contestantNumber: 2,
            avatarUrl: "/avatars/bob.png",
          },
        ],
      },
    ] as unknown as Awaited<ReturnType<typeof db.eventPosition.findMany>>);

    vi.mocked(db.ballotSelection.findMany).mockResolvedValue([
      { officeId: "office-1", candidateId: "cand-1" },
      { officeId: "office-1", candidateId: "cand-1" },
      { officeId: "office-1", candidateId: "cand-2" },
    ] as unknown as Awaited<ReturnType<typeof db.ballotSelection.findMany>>);

    const result = await exportCertifiedTally({
      eventId: "550e8400-e29b-41d4-a716-446655440000",
      format: "csv",
    });

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data?.auditHash).toMatch(/^[a-f0-9]{64}$/);
    expect(result.data?.filename).toContain("certified-election-audit-usc-elections");
    expect(result.data?.content).toContain("ELECTA OFFICIAL ELECTION CERTIFICATION REPORT");
    expect(result.data?.content).toContain("Alice");
    expect(result.data?.content).toContain("WINNER");
  });
});

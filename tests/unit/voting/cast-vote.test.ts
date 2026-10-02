import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { castVoteAction } from "@/features/voting/actions/cast-vote";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth/get-session";
import { resetRateLimiterStores } from "@/features/voting/utils/rate-limiter";
import type { EventPublicationStatus, ContestantStatus } from "@/generated/client/client";

vi.mock("@/lib/auth/get-session");
vi.mock("@/lib/db", () => {
  const mockDb = {
    event: {
      findUnique: vi.fn(),
    },
    contestant: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    vote: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      findFirst: vi.fn(),
    },
    $transaction: vi.fn(),
  };
  return { db: mockDb };
});

vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue(
    new Map([
      ["x-forwarded-for", "127.0.0.1"],
      ["cf-connecting-ip", "127.0.0.1"],
    ]),
  ),
  cookies: vi.fn().mockResolvedValue({
    get: vi.fn(),
    set: vi.fn(),
  }),
}));

interface MockTx {
  vote: {
    findMany: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    findFirst: ReturnType<typeof vi.fn>;
  };
  contestant: {
    update: ReturnType<typeof vi.fn>;
  };
}

describe("Core Voting Engine: castVoteAction", () => {
  const mockEventId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
  const mockContestantId = "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22";
  const mockVoterId = "usr_voter_test_123";

  beforeEach(() => {
    vi.clearAllMocks();
    resetRateLimiterStores();

    vi.mocked(getSession).mockResolvedValue({
      userId: mockVoterId,
      email: "voter@example.com",
      name: "Test Voter",
      role: "VOTER",
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
    });

    vi.mocked(db.event.findUnique).mockResolvedValue({
      id: mockEventId,
      slug: "pageant-2026",
      title: "Pageant 2026",
      description: "Annual competition",
      bannerUrl: "https://example.com/banner.jpg",
      publicationStatus: "PUBLISHED" as EventPublicationStatus,
      draftPassphraseHash: null,
      showResultsOnClose: true,
      organizerId: "org-1",
      startsAt: new Date(Date.now() - 3600 * 1000),
      endsAt: new Date(Date.now() + 3600 * 1000),
      isFreeVotingEnabled: true,
      dailyFreeVoteLimit: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    vi.mocked(db.contestant.findFirst).mockResolvedValue({
      id: mockContestantId,
      eventId: mockEventId,
      contestantNumber: 1,
      name: "Maria Santos",
      division: "FEMALE",
      divisionId: null,
      status: "ACTIVE" as ContestantStatus,
      hometown: "Cebu",
      heightCm: 175,
      bio: "Test bio",
      advocacy: "Test advocacy",
      avatarUrl: "https://example.com/avatar.jpg",
      instagramUrl: null,
      tiktokUrl: null,
      facebookUrl: null,
      voteCount: 10,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    vi.mocked(db.vote.findUnique).mockResolvedValue(null);

    (db.$transaction as unknown as Mock).mockImplementation(
      async (callback: (tx: MockTx) => Promise<unknown>) => {
        const tx: MockTx = {
          vote: {
            findMany: vi.fn().mockResolvedValue([]),
            create: vi.fn().mockResolvedValue({ id: "mock-vote-id-123" }),
            findFirst: vi.fn().mockResolvedValue(null),
          },
          contestant: {
            update: vi.fn().mockResolvedValue({ voteCount: 11 }),
          },
        };
        return callback(tx);
      },
    );
  });

  it("rejects unauthenticated requests", async () => {
    vi.mocked(getSession).mockResolvedValueOnce(null);

    const result = await castVoteAction({
      eventId: mockEventId,
      contestantId: mockContestantId,
      voteType: "FREE",
      voteWeight: 1,
      turnstileToken: "mock-turnstile-token",
    });

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe("NOT_AUTHENTICATED");
  });

  it("rejects free vote requests with missing or empty turnstileToken", async () => {
    const result = await castVoteAction({
      eventId: mockEventId,
      contestantId: mockContestantId,
      voteType: "FREE",
      voteWeight: 1,
      turnstileToken: "",
    });

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe("BOT_DETECTION_FAILED");
  });

  it("successfully casts a FREE vote with valid turnstile token", async () => {
    const result = await castVoteAction({
      eventId: mockEventId,
      contestantId: mockContestantId,
      voteType: "FREE",
      voteWeight: 1,
      turnstileToken: "mock-turnstile-token",
      deviceFingerprint: "fp_test_device_001",
    });

    expect(result.success).toBe(true);
    expect(result.data?.voteType).toBe("FREE");
    expect(result.data?.newContestantVoteCount).toBe(11);
    expect(result.data?.quotaState?.remainingVotes).toBe(0);
  });

  it("successfully casts a BOOST vote with weight > 1", async () => {
    (db.$transaction as unknown as Mock).mockImplementation(
      async (callback: (tx: MockTx) => Promise<unknown>) => {
        const tx: MockTx = {
          vote: {
            findMany: vi.fn().mockResolvedValue([]),
            create: vi.fn().mockResolvedValue({ id: "mock-boost-vote-id" }),
            findFirst: vi.fn().mockResolvedValue(null),
          },
          contestant: {
            update: vi.fn().mockResolvedValue({ voteCount: 20 }),
          },
        };
        return callback(tx);
      },
    );

    const result = await castVoteAction({
      eventId: mockEventId,
      contestantId: mockContestantId,
      voteType: "BOOST",
      voteWeight: 10,
      deviceFingerprint: "fp_test_device_001",
    });

    expect(result.success).toBe(true);
    expect(result.data?.voteType).toBe("BOOST");
    expect(result.data?.voteWeight).toBe(10);
    expect(result.data?.newContestantVoteCount).toBe(20);
  });

  it("enforces free daily vote quota exhaustion", async () => {
    (db.$transaction as unknown as Mock).mockImplementation(
      async (callback: (tx: MockTx) => Promise<unknown>) => {
        const tx: MockTx = {
          vote: {
            findMany: vi.fn().mockResolvedValue([{ createdAt: new Date() }]),
            create: vi.fn(),
            findFirst: vi.fn(),
          },
          contestant: {
            update: vi.fn(),
          },
        };
        return callback(tx);
      },
    );

    const result = await castVoteAction({
      eventId: mockEventId,
      contestantId: mockContestantId,
      voteType: "FREE",
      voteWeight: 1,
      turnstileToken: "mock-turnstile-token",
      deviceFingerprint: "fp_test_device_001",
    });

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe("DAILY_QUOTA_EXHAUSTED");
  });

  it("throttles when IP velocity limit is exceeded", async () => {
    for (let i = 0; i < 10; i++) {
      await castVoteAction({
        eventId: mockEventId,
        contestantId: mockContestantId,
        voteType: "FREE",
        turnstileToken: "mock-turnstile-token",
        deviceFingerprint: `fp_device_${i}`,
      });
    }

    const throttled = await castVoteAction({
      eventId: mockEventId,
      contestantId: mockContestantId,
      voteType: "FREE",
      turnstileToken: "mock-turnstile-token",
      deviceFingerprint: "fp_device_11",
    });

    expect(throttled.success).toBe(false);
    expect(throttled.error?.code).toBe("RATE_LIMIT_EXCEEDED");
  });

  it("enforces device account threshold limit across accounts", async () => {
    const deviceId = "fp_shared_device_999";

    // 3 distinct accounts voting from the same device
    for (let i = 1; i <= 3; i++) {
      vi.mocked(getSession).mockResolvedValueOnce({
        userId: `usr_voter_account_${i}`,
        email: `voter${i}@example.com`,
        name: `Voter ${i}`,
        role: "VOTER",
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
      });

      const res = await castVoteAction({
        eventId: mockEventId,
        contestantId: mockContestantId,
        voteType: "FREE",
        turnstileToken: "mock-turnstile-token",
        deviceFingerprint: deviceId,
      });
      expect(res.success).toBe(true);
    }

    // 4th distinct account attempting to vote from the same device
    vi.mocked(getSession).mockResolvedValueOnce({
      userId: "usr_voter_account_4",
      email: "voter4@example.com",
      name: "Voter 4",
      role: "VOTER",
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
    });

    const blocked = await castVoteAction({
      eventId: mockEventId,
      contestantId: mockContestantId,
      voteType: "FREE",
      turnstileToken: "mock-turnstile-token",
      deviceFingerprint: deviceId,
    });

    expect(blocked.success).toBe(false);
    expect(blocked.error?.code).toBe("DEVICE_ACCOUNT_LIMIT_EXCEEDED");
  });

  it("safely deduplicates idempotent retries with existing idempotencyKey", async () => {
    const mockIdempotencyKey = "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33";

    vi.mocked(db.vote.findUnique).mockResolvedValueOnce({
      id: mockIdempotencyKey,
      eventId: mockEventId,
      contestantId: mockContestantId,
      voterId: mockVoterId,
      awardCategoryId: null,
      voteType: "FREE",
      voteWeight: 1,
      paymentTransactionId: null,
      createdAt: new Date(),
    });

    vi.mocked(db.contestant.findUnique).mockResolvedValueOnce({
      id: mockContestantId,
      eventId: mockEventId,
      contestantNumber: 1,
      name: "Maria Santos",
      division: "FEMALE",
      divisionId: null,
      status: "ACTIVE" as ContestantStatus,
      hometown: "Cebu",
      heightCm: 175,
      bio: null,
      advocacy: null,
      avatarUrl: "https://example.com/avatar.jpg",
      instagramUrl: null,
      tiktokUrl: null,
      facebookUrl: null,
      voteCount: 15,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await castVoteAction({
      eventId: mockEventId,
      contestantId: mockContestantId,
      voteType: "FREE",
      voteWeight: 1,
      turnstileToken: "mock-turnstile-token",
      idempotencyKey: mockIdempotencyKey,
    });

    expect(result.success).toBe(true);
    expect(result.data?.voteId).toBe(mockIdempotencyKey);
    expect(result.data?.newContestantVoteCount).toBe(15);
    // Verified that db.$transaction was not called for an existing idempotent record
    expect(db.$transaction).not.toHaveBeenCalled();
  });
});

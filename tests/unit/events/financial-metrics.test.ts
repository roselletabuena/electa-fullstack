import { describe, it, expect, vi, beforeEach } from "vitest";
import { db } from "@/lib/db";
import {
  Prisma,
  type Event,
  type PaymentTransaction,
  type PayoutRequest,
  type Contestant,
} from "@/generated/client/client";
// Financial metrics service
import { calculateFinancialMetrics } from "@/features/events/services/financial-metrics";
import type {
  ContestantRevenueShare,
  PaymentChannelBreakdown,
} from "@/features/events/types/revenue";

vi.mock("@/lib/db", () => ({
  db: {
    event: {
      findUnique: vi.fn(),
    },
    paymentTransaction: {
      findMany: vi.fn(),
    },
    payoutRequest: {
      findMany: vi.fn(),
    },
    contestant: {
      findMany: vi.fn(),
    },
  },
}));

const mockEvent: Event = {
  id: "evt-123",
  slug: "pageant-2026",
  title: "Miss Electa 2026",
  description: "Annual pageant",
  bannerUrl: "https://example.com/banner.jpg",
  startsAt: new Date("2026-10-01T00:00:00Z"),
  endsAt: new Date("2026-10-05T00:00:00Z"),
  publicationStatus: "PUBLISHED",
  draftPassphraseHash: null,
  showResultsOnClose: true,
  isFreeVotingEnabled: true,
  dailyFreeVoteLimit: 1,
  takeRatePercentage: new Prisma.Decimal(12.0),
  organizerId: "org-123",
  createdAt: new Date("2026-09-01T00:00:00Z"),
  updatedAt: new Date("2026-09-01T00:00:00Z"),
};

function createMockTransaction(overrides: Partial<PaymentTransaction>): PaymentTransaction {
  return {
    id: "tx-default",
    referenceNumber: "TX-REF-DEFAULT",
    eventId: "evt-123",
    contestantId: "c-1",
    awardCategoryId: null,
    voterIdentifier: "vot_12345678",
    amountInPhp: new Prisma.Decimal(1000.0),
    amountInCents: 100000,
    votesAwarded: 100,
    bonusVotes: 0,
    status: "PAID",
    provider: "PAYMONGO",
    paymentChannel: "QR_PH",
    paymongoPaymentIntentId: null,
    paymongoPaymentMethodId: null,
    paymongoClientKey: null,
    qrCodeUrl: null,
    qrCodeString: null,
    checkoutUrl: null,
    paidAt: new Date("2026-10-01T10:00:00Z"),
    failedAt: null,
    failureReason: null,
    metadata: null,
    createdAt: new Date("2026-10-01T10:00:00Z"),
    updatedAt: new Date("2026-10-01T10:00:00Z"),
    ...overrides,
  };
}

function createMockPayout(overrides: Partial<PayoutRequest>): PayoutRequest {
  return {
    id: "po-default",
    referenceNumber: "PO-DEFAULT",
    eventId: "evt-123",
    organizerId: "org-123",
    amountInPhp: new Prisma.Decimal(1000.0),
    payoutMethod: "BANK_TRANSFER",
    accountName: "Maria Santos",
    accountNumber: "09171234567",
    bankOrProviderName: null,
    status: "PENDING",
    requestedAt: new Date("2026-10-02T10:00:00Z"),
    processedAt: null,
    adminReferenceNumber: null,
    fulfilledByAdminId: null,
    notes: null,
    rejectionReason: null,
    createdAt: new Date("2026-10-02T10:00:00Z"),
    updatedAt: new Date("2026-10-02T10:00:00Z"),
    ...overrides,
  };
}

function createMockContestant(overrides: Partial<Contestant>): Contestant {
  return {
    id: "c-default",
    eventId: "evt-123",
    contestantNumber: 1,
    name: "Default Candidate",
    division: "FEMALE",
    divisionId: null,
    status: "ACTIVE",
    hometown: null,
    heightCm: null,
    bio: null,
    advocacy: null,
    avatarUrl: "https://example.com/default-avatar.jpg",
    instagramUrl: null,
    tiktokUrl: null,
    facebookUrl: null,
    voteCount: 0,
    createdAt: new Date("2026-10-01T00:00:00Z"),
    updatedAt: new Date("2026-10-01T00:00:00Z"),
    ...overrides,
  };
}

describe("Financial Metrics Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calculates accurate gross, gateway fees, 12% take-rate, and net revenue across channels", async () => {
    vi.mocked(db.event.findUnique).mockResolvedValue(mockEvent);

    const mockTransactions: PaymentTransaction[] = [
      createMockTransaction({
        id: "tx-1",
        contestantId: "c-1",
        amountInPhp: new Prisma.Decimal(1000.0),
        paymentChannel: "QR_PH",
        status: "PAID",
        votesAwarded: 100,
        bonusVotes: 0,
        createdAt: new Date("2026-10-01T10:00:00Z"),
      }),
      createMockTransaction({
        id: "tx-2",
        contestantId: "c-1",
        amountInPhp: new Prisma.Decimal(2000.0),
        paymentChannel: "GCASH",
        status: "PAID",
        votesAwarded: 200,
        bonusVotes: 0,
        createdAt: new Date("2026-10-01T11:00:00Z"),
      }),
      createMockTransaction({
        id: "tx-3",
        contestantId: "c-2",
        amountInPhp: new Prisma.Decimal(1000.0),
        paymentChannel: "CARD",
        status: "PAID",
        votesAwarded: 100,
        bonusVotes: 0,
        createdAt: new Date("2026-10-01T12:00:00Z"),
      }),
    ];

    const mockPayouts: PayoutRequest[] = [
      createMockPayout({
        id: "po-1",
        referenceNumber: "PO-2026-001",
        amountInPhp: new Prisma.Decimal(1000.0),
        status: "PENDING",
        payoutMethod: "GCASH",
        accountName: "Maria Santos",
        accountNumber: "09171234567",
        bankOrProviderName: "GCash",
        requestedAt: new Date("2026-10-02T10:00:00Z"),
        createdAt: new Date("2026-10-02T10:00:00Z"),
      }),
      createMockPayout({
        id: "po-2",
        referenceNumber: "PO-2026-002",
        amountInPhp: new Prisma.Decimal(500.0),
        status: "COMPLETED",
        payoutMethod: "BANK_TRANSFER",
        accountName: "Maria Santos",
        accountNumber: "1234567890",
        bankOrProviderName: "BDO",
        adminReferenceNumber: "BDO-REF-123",
        fulfilledByAdminId: "admin-1",
        notes: "Completed disbursement",
        requestedAt: new Date("2026-10-02T11:00:00Z"),
        processedAt: new Date("2026-10-02T11:30:00Z"),
        createdAt: new Date("2026-10-02T11:00:00Z"),
      }),
      createMockPayout({
        id: "po-3",
        referenceNumber: "PO-2026-003",
        amountInPhp: new Prisma.Decimal(300.0),
        status: "REJECTED",
        payoutMethod: "MAYA",
        accountName: "Maria Santos",
        accountNumber: "09181234567",
        bankOrProviderName: "Maya",
        rejectionReason: "Invalid account name",
        requestedAt: new Date("2026-10-02T12:00:00Z"),
        processedAt: new Date("2026-10-02T12:15:00Z"),
        createdAt: new Date("2026-10-02T12:00:00Z"),
      }),
    ];

    const mockContestants: Contestant[] = [
      createMockContestant({
        id: "c-1",
        contestantNumber: 1,
        name: "Maria Santos",
        avatarUrl: "https://example.com/c1.jpg",
      }),
      createMockContestant({
        id: "c-2",
        contestantNumber: 2,
        name: "Juana Dela Cruz",
        avatarUrl: "https://example.com/c2.jpg",
      }),
    ];

    vi.mocked(db.paymentTransaction.findMany).mockResolvedValue(mockTransactions);
    vi.mocked(db.payoutRequest.findMany).mockResolvedValue(mockPayouts);
    vi.mocked(db.contestant.findMany).mockResolvedValue(mockContestants);

    const metrics = await calculateFinancialMetrics("evt-123");

    // Gross: 1000 + 2000 + 1000 = 4000
    expect(metrics.summary.grossSalesPhp).toBe(4000);
    expect(metrics.summary.totalTransactionsCount).toBe(3);

    // Gateway fees:
    // QR_PH (1.5% of 1000) = 15
    // GCASH (2.0% of 2000) = 40
    // CARD (3.5% of 1000 + 15) = 50
    // Total Gateway Fees = 105
    expect(metrics.summary.gatewayFeesPhp).toBe(105);

    // Electa Take-Rate: 12% of 4000 = 480
    expect(metrics.summary.platformTakeRatePercentage).toBe(12.0);
    expect(metrics.summary.platformCommissionPhp).toBe(480);

    // Net Organizer Revenue: 4000 - 105 - 480 = 3415
    expect(metrics.summary.netOrganizerRevenuePhp).toBe(3415);

    // Locked Balance: PENDING (1000) + COMPLETED (500) = 1500 (REJECTED 300 is excluded)
    expect(metrics.summary.totalPendingPayoutPhp).toBe(1000);
    expect(metrics.summary.totalDisbursedPhp).toBe(500);
    expect(metrics.summary.availablePayoutBalancePhp).toBe(3415 - 1500); // 1915

    // Contestant breakdown:
    expect(metrics.contestantShares).toHaveLength(2);
    const c1 = metrics.contestantShares.find(
      (c: ContestantRevenueShare) => c.contestantId === "c-1",
    );
    expect(c1?.grossSalesPhp).toBe(3000);
    expect(c1?.totalVotes).toBe(300);
    expect(c1?.revenueSharePercentage).toBe(75.0);

    // Channel breakdown:
    expect(metrics.channelBreakdown).toHaveLength(3);
    const qrChannel = metrics.channelBreakdown.find(
      (ch: PaymentChannelBreakdown) => ch.channel === "QR_PH",
    );
    expect(qrChannel?.grossSalesPhp).toBe(1000);
    expect(qrChannel?.gatewayFeePhp).toBe(15);
    expect(qrChannel?.displayName).toBe("QR Ph");
    expect(qrChannel?.transactionCount).toBe(1);
    expect(qrChannel?.percentageOfSales).toBe(25.0);

    // Recent payouts:
    expect(metrics.recentPayouts).toHaveLength(3);
    expect(metrics.recentPayouts[0]?.accountNumberMasked).toBe("•••• 4567");
  });

  it("handles zero transactions gracefully with 0 totals", async () => {
    vi.mocked(db.event.findUnique).mockResolvedValue(mockEvent);
    vi.mocked(db.paymentTransaction.findMany).mockResolvedValue([]);
    vi.mocked(db.payoutRequest.findMany).mockResolvedValue([]);
    vi.mocked(db.contestant.findMany).mockResolvedValue([]);

    const metrics = await calculateFinancialMetrics("evt-123");

    expect(metrics.summary.grossSalesPhp).toBe(0);
    expect(metrics.summary.totalTransactionsCount).toBe(0);
    expect(metrics.summary.gatewayFeesPhp).toBe(0);
    expect(metrics.summary.platformCommissionPhp).toBe(0);
    expect(metrics.summary.netOrganizerRevenuePhp).toBe(0);
    expect(metrics.summary.availablePayoutBalancePhp).toBe(0);
    expect(metrics.summary.totalPendingPayoutPhp).toBe(0);
    expect(metrics.summary.totalDisbursedPhp).toBe(0);
    expect(metrics.contestantShares).toEqual([]);
    expect(metrics.channelBreakdown).toEqual([]);
    expect(metrics.recentPayouts).toEqual([]);
  });
});

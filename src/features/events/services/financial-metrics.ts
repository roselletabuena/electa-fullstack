import { db } from "@/lib/db";
import { calculateGatewayFee } from "@/features/payments/utils/gateway-fees";
import type {
  FinancialMetricsSummary,
  ContestantRevenueShare,
  PaymentChannelBreakdown,
  PayoutLedgerItem,
} from "../types/revenue";

export interface EventFinancialData {
  summary: FinancialMetricsSummary;
  contestantShares: ContestantRevenueShare[];
  channelBreakdown: PaymentChannelBreakdown[];
  recentPayouts: PayoutLedgerItem[];
}

const CHANNEL_DISPLAY_NAMES: Record<string, string> = {
  QR_PH: "QR Ph",
  GCASH: "GCash",
  MAYA: "Maya",
  CARD: "Credit / Debit Card",
  ONLINE_BANKING: "Online Banking",
};

/**
 * Calculates complete real-time financial telemetry for an event, including:
 * - Gross Revenue across confirmed transactions
 * - Exact Payment Gateway Processing Fees (QR Ph 1.5%, GCash/Maya 2.0%, Card 3.5% + ₱15)
 * - Platform Commission based on the event's configured take-rate (default 12.0%)
 * - Net Organizer Revenue
 * - Locked Payouts & Available Payout Balance
 * - Contestant and Payment Channel breakdowns
 */
export async function calculateFinancialMetrics(eventId: string): Promise<EventFinancialData> {
  const event = await db.event.findUnique({
    where: { id: eventId },
    select: {
      id: true,
      takeRatePercentage: true,
    },
  });

  if (!event) {
    throw new Error(`Event with ID "${eventId}" not found`);
  }

  const takeRate = Number(event.takeRatePercentage ?? 12.0);

  // Fetch paid transactions, payout requests, and contestants in parallel
  const [transactions, payouts, contestants] = await Promise.all([
    db.paymentTransaction.findMany({
      where: {
        eventId,
        status: "PAID",
      },
      orderBy: { createdAt: "desc" },
    }),
    db.payoutRequest.findMany({
      where: { eventId },
      orderBy: { requestedAt: "desc" },
    }),
    db.contestant.findMany({
      where: { eventId },
      select: {
        id: true,
        contestantNumber: true,
        name: true,
        avatarUrl: true,
      },
    }),
  ]);

  // Aggregate gross revenue and gateway fees
  let grossSalesPhp = 0;
  let gatewayFeesPhp = 0;

  // Breakdown aggregators
  const contestantMap = new Map<string, { gross: number; votes: number }>();
  const channelMap = new Map<string, { volume: number; count: number; fee: number }>();

  for (const tx of transactions) {
    const amount = Number(tx.amountInPhp);
    const votes = (tx.votesAwarded ?? 0) + (tx.bonusVotes ?? 0);
    const channel = tx.paymentChannel;
    const fee = calculateGatewayFee(amount, channel);

    grossSalesPhp += amount;
    gatewayFeesPhp += fee;

    // Contestant aggregation
    if (tx.contestantId) {
      const current = contestantMap.get(tx.contestantId) ?? { gross: 0, votes: 0 };
      contestantMap.set(tx.contestantId, {
        gross: current.gross + amount,
        votes: current.votes + votes,
      });
    }

    // Channel aggregation
    const curChannel = channelMap.get(channel) ?? { volume: 0, count: 0, fee: 0 };
    channelMap.set(channel, {
      volume: curChannel.volume + amount,
      count: curChannel.count + 1,
      fee: curChannel.fee + fee,
    });
  }

  // Round summary figures to 2 decimal places
  grossSalesPhp = Math.round(grossSalesPhp * 100) / 100;
  gatewayFeesPhp = Math.round(gatewayFeesPhp * 100) / 100;

  const platformCommissionRate = takeRate / 100;
  const platformCommissionPhp = Math.round(grossSalesPhp * platformCommissionRate * 100) / 100;

  const netOrganizerRevenuePhp = Math.max(
    0,
    Math.round((grossSalesPhp - gatewayFeesPhp - platformCommissionPhp) * 100) / 100,
  );

  // Payout aggregations
  let totalPendingPayoutPhp = 0;
  let totalDisbursedPhp = 0;

  for (const po of payouts) {
    const poAmount = Number(po.amountInPhp);
    if (po.status === "PENDING" || po.status === "PROCESSING") {
      totalPendingPayoutPhp += poAmount;
    } else if (po.status === "COMPLETED") {
      totalDisbursedPhp += poAmount;
    }
  }

  totalPendingPayoutPhp = Math.round(totalPendingPayoutPhp * 100) / 100;
  totalDisbursedPhp = Math.round(totalDisbursedPhp * 100) / 100;

  const availablePayoutBalancePhp = Math.max(
    0,
    Math.round((netOrganizerRevenuePhp - totalPendingPayoutPhp - totalDisbursedPhp) * 100) / 100,
  );

  // Format Contestant Shares
  const contestantShares: ContestantRevenueShare[] = [];
  const contestantInfoMap = new Map(contestants.map((c) => [c.id, c]));

  for (const [contestantId, stats] of contestantMap.entries()) {
    const info = contestantInfoMap.get(contestantId);
    if (info) {
      const sharePct =
        grossSalesPhp > 0 ? Math.round((stats.gross / grossSalesPhp) * 1000) / 10 : 0;

      contestantShares.push({
        contestantId: info.id,
        contestantNumber: info.contestantNumber,
        name: info.name,
        avatarUrl: info.avatarUrl ?? "",
        grossSalesPhp: Math.round(stats.gross * 100) / 100,
        totalVotes: stats.votes,
        revenueSharePercentage: sharePct,
      });
    }
  }

  contestantShares.sort((a, b) => b.grossSalesPhp - a.grossSalesPhp);

  // Format Channel Breakdown
  const channelBreakdown: PaymentChannelBreakdown[] = [];
  for (const [channel, stats] of channelMap.entries()) {
    const volumePct =
      grossSalesPhp > 0 ? Math.round((stats.volume / grossSalesPhp) * 1000) / 10 : 0;

    channelBreakdown.push({
      channel,
      displayName: CHANNEL_DISPLAY_NAMES[channel] ?? channel,
      transactionCount: stats.count,
      grossSalesPhp: Math.round(stats.volume * 100) / 100,
      gatewayFeePhp: Math.round(stats.fee * 100) / 100,
      percentageOfSales: volumePct,
    });
  }

  channelBreakdown.sort((a, b) => b.grossSalesPhp - a.grossSalesPhp);

  // Format Recent Payouts
  const recentPayouts: PayoutLedgerItem[] = payouts.slice(0, 10).map((po) => {
    const rawAccount = po.accountNumber ?? "";
    const masked = rawAccount.length > 4 ? `•••• ${rawAccount.slice(-4)}` : rawAccount;

    return {
      id: po.id,
      referenceNumber: po.referenceNumber,
      amountInPhp: Number(po.amountInPhp),
      payoutMethod: po.payoutMethod,
      accountName: po.accountName,
      accountNumberMasked: masked,
      bankOrProviderName: po.bankOrProviderName,
      status: po.status,
      adminReferenceNumber: po.adminReferenceNumber,
      fulfilledByAdminId: po.fulfilledByAdminId,
      notes: po.notes,
      rejectionReason: po.rejectionReason,
      requestedAt: (po.requestedAt ?? po.createdAt ?? new Date()).toISOString(),
      processedAt: po.processedAt ? po.processedAt.toISOString() : null,
    };
  });

  return {
    summary: {
      grossSalesPhp,
      totalTransactionsCount: transactions.length,
      gatewayFeesPhp,
      platformTakeRatePercentage: takeRate,
      platformCommissionPhp,
      netOrganizerRevenuePhp,
      totalPendingPayoutPhp,
      availablePayoutBalancePhp,
      totalDisbursedPhp,
    },
    contestantShares,
    channelBreakdown,
    recentPayouts,
  };
}

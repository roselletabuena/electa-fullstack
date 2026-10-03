// Electa Financial Telemetry Contract

export interface FinancialMetricsSummary {
  grossSalesPhp: number;
  totalTransactionsCount: number;
  gatewayFeesPhp: number;
  platformTakeRatePercentage: number;
  platformCommissionPhp: number;
  netOrganizerRevenuePhp: number;
  totalDisbursedPhp: number;
  totalPendingPayoutPhp: number;
  availablePayoutBalancePhp: number;
}

export interface ContestantRevenueShare {
  contestantId: string;
  contestantNumber: number;
  name: string;
  avatarUrl: string;
  totalVotes: number;
  grossSalesPhp: number;
  revenueSharePercentage: number;
}

export interface PaymentChannelBreakdown {
  channel: "QR_PH" | "GCASH" | "MAYA" | "CARD" | "ONLINE_BANKING";
  displayName: string;
  transactionCount: number;
  grossSalesPhp: number;
  gatewayFeePhp: number;
}

/**
 * Endpoint: GET /api/events/:slug/finance/metrics
 * Authorization: Authenticated Event Organizer or Platform Admin
 */
export interface GetFinancialMetricsResponse {
  success: boolean;
  data: {
    summary: FinancialMetricsSummary;
    contestantShares: ContestantRevenueShare[];
    channelBreakdown: PaymentChannelBreakdown[];
    recentPayouts: Array<{
      id: string;
      referenceNumber: string;
      amountInPhp: number;
      payoutMethod: string;
      status: string;
      requestedAt: string;
    }>;
  };
  error?: string;
}

/**
 * Server Action: updateEventTakeRateAction
 * Authorization: Strictly Platform Admin (HTTP 403 Forbidden for Organizers)
 */
export interface UpdateTakeRateInput {
  eventId: string;
  takeRatePercentage: number; // 0.0 - 50.0
}

export interface UpdateTakeRateResult {
  success: boolean;
  takeRatePercentage?: number;
  error?: string;
}

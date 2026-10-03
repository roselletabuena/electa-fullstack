import type { PayoutMethod, PayoutStatus } from "@/generated/client/client";

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
  divisionName?: string;
  totalVotes: number;
  grossSalesPhp: number;
  revenueSharePercentage: number;
}

export interface PaymentChannelBreakdown {
  channel: string;
  displayName: string;
  transactionCount: number;
  grossSalesPhp: number;
  gatewayFeePhp: number;
  percentageOfSales: number;
}

export interface VoteAuditLogEntry {
  transactionId: string;
  referenceNumber: string;
  timestamp: string; // ISO-8601
  contestantName: string;
  contestantNumber: number;
  votesAwarded: number;
  amountInPhp: number;
  paymentChannel: string;
  status: string;
  maskedVoterId: string; // e.g. "vot_***9a3b"
  voterIpHash: string; // SHA-256 salted hash
}

export interface PayoutLedgerItem {
  id: string;
  referenceNumber: string;
  amountInPhp: number;
  payoutMethod: PayoutMethod;
  accountName: string;
  accountNumberMasked: string;
  bankOrProviderName: string | null;
  status: PayoutStatus;
  requestedAt: string;
  processedAt: string | null;
  adminReferenceNumber: string | null;
  fulfilledByAdminId: string | null;
  notes: string | null;
  rejectionReason: string | null;
}

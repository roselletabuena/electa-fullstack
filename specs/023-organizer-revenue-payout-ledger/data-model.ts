import { z } from "zod";

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

export interface VoteAuditLogEntry {
  transactionId: string;
  referenceNumber: string;
  timestamp: string; // ISO-8601
  contestantName: string;
  contestantNumber: number;
  votesAwarded: number;
  amountInPhp: number;
  paymentChannel: string;
  status: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  maskedVoterId: string; // e.g. "vot_***9a3b"
  voterIpHash: string; // SHA-256 salted hash
}

export const createPayoutRequestSchema = z.object({
  eventId: z.string().uuid("Invalid event ID"),
  amountInPhp: z
    .number()
    .min(1000, "Minimum payout request is ₱1,000.00")
    .max(10000000, "Maximum payout request exceeded"),
  payoutMethod: z.enum(["BANK_TRANSFER", "GCASH", "MAYA"]),
  accountName: z.string().min(2, "Account name is required").max(100),
  accountNumber: z.string().min(8, "Valid account or mobile number is required").max(30),
  bankOrProviderName: z.string().max(50).optional(),
});

export const fulfillPayoutRequestSchema = z.object({
  payoutId: z.string().uuid("Invalid payout ID"),
  status: z.enum(["COMPLETED", "REJECTED"]),
  adminReferenceNumber: z.string().min(3, "Disbursement reference number is required").optional(),
  rejectionReason: z.string().max(250).optional(),
  notes: z.string().max(500).optional(),
});

export const updateTakeRateSchema = z.object({
  eventId: z.string().uuid("Invalid event ID"),
  takeRatePercentage: z
    .number()
    .min(0, "Take rate cannot be negative")
    .max(50, "Take rate cannot exceed 50.0%"),
});

export const auditLogQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25),
  contestantId: z.string().uuid().optional(),
  paymentChannel: z.enum(["QR_PH", "GCASH", "MAYA", "CARD", "ONLINE_BANKING"]).optional(),
  status: z.enum(["PENDING", "PAID", "FAILED", "REFUNDED"]).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  search: z.string().max(100).optional(),
});

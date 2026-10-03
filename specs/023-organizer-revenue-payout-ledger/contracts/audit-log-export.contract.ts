// Electa Audit Log Export Contract

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

/**
 * Endpoint: GET /api/events/:slug/audit-logs
 * Query Parameters: page, limit, contestantId, paymentChannel, status, startDate, endDate, search
 */
export interface GetAuditLogsResponse {
  success: boolean;
  data: {
    items: VoteAuditLogEntry[];
    pagination: {
      page: number;
      limit: number;
      totalItems: number;
      totalPages: number;
    };
  };
  error?: string;
}

/**
 * Endpoint: GET /api/events/:slug/audit-logs/export
 * Query Parameters: format ("csv" | "pdf"), contestantId, paymentChannel, status, startDate, endDate
 * Content-Type: text/csv or application/pdf
 * Header: Content-Disposition: attachment; filename="electa-audit-:slug-:date.csv"
 */
export interface AuditLogCsvColumns {
  referenceNumber: string;
  timestampUtc: string;
  timestampLocal: string;
  contestantNumber: number;
  contestantName: string;
  votesAwarded: number;
  grossAmountPhp: string;
  gatewayFeePhp: string;
  paymentChannel: string;
  transactionStatus: string;
  maskedVoterId: string;
  voterIpHashSha256: string;
}

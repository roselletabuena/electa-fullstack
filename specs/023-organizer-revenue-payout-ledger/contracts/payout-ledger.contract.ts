/**
 * Server Action: requestPayoutAction
 * Authorization: Authenticated Event Organizer
 */
export interface RequestPayoutInput {
  eventId: string;
  amountInPhp: number;
  payoutMethod: "BANK_TRANSFER" | "GCASH" | "MAYA";
  accountName: string;
  accountNumber: string;
  bankOrProviderName?: string;
}

export interface RequestPayoutResult {
  success: boolean;
  payoutRequest?: {
    id: string;
    referenceNumber: string;
    amountInPhp: number;
    status: "PENDING";
    availableBalanceRemainingPhp: number;
    requestedAt: string;
  };
  error?: string;
}

/**
 * Server Action: fulfillPayoutAction
 * Authorization: Strictly Platform Administrator (Electa Admin)
 */
export interface FulfillPayoutInput {
  payoutId: string;
  status: "COMPLETED" | "REJECTED";
  adminReferenceNumber?: string;
  rejectionReason?: string;
  notes?: string;
}

export interface FulfillPayoutResult {
  success: boolean;
  payoutId?: string;
  status?: "COMPLETED" | "REJECTED";
  processedAt?: string;
  error?: string;
}

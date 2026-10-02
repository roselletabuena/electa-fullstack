import { z } from "zod";

export type PaymentStatusType = "PENDING" | "PAID" | "FAILED" | "EXPIRED" | "REFUNDED";
export type PaymentProviderType = "PAYMONGO" | "MOCK";
export type PaymentChannelType =
  "QR_PH" | "GCASH" | "MAYA" | "CARD" | "GRAB_PAY" | "ONLINE_BANKING";

export interface PricingTier {
  id: string;
  name: string;
  pricePhp: number;
  baseVotes: number;
  bonusVotes: number;
  totalVotes: number;
  bonusPercentage: number;
  badge?: string;
  isPopular?: boolean;
}

export const createPaymentIntentSchema = z.object({
  eventId: z.string().min(1, "Event ID is required"),
  contestantId: z.string().min(1, "Contestant ID is required"),
  awardCategoryId: z.string().optional().nullable(),
  voterIdentifier: z.string().min(1, "Voter identifier is required"),
  tierId: z.string().optional(),
  customVotes: z.number().int().positive().max(10000).optional(),
  paymentChannel: z
    .enum(["QR_PH", "GCASH", "MAYA", "CARD", "GRAB_PAY", "ONLINE_BANKING"])
    .default("QR_PH"),
});

export type CreatePaymentIntentInput = z.infer<typeof createPaymentIntentSchema>;

export const verifyPaymentSchema = z.object({
  referenceNumber: z.string().min(1, "Reference number is required"),
});

export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;

export interface PaymentIntentResult {
  referenceNumber: string;
  amountInPhp: number;
  amountInCents: number;
  totalVotes: number;
  baseVotes: number;
  bonusVotes: number;
  qrCodeData: string;
  qrCodeUrl?: string | null;
  checkoutUrl?: string | null;
  expiresAt: string;
  status: PaymentStatusType;
  provider: PaymentProviderType;
  clientKey?: string | null;
}

export interface VoterReceipt {
  referenceNumber: string;
  eventTitle: string;
  candidateName: string;
  candidateNumber: number;
  candidateAvatarUrl?: string | null;
  amountPaid: number;
  votesAwarded: number;
  baseVotes: number;
  bonusVotes: number;
  paidAt: string;
  paymentChannel: string;
  verificationHash: string;
}

export interface PayMongoPaymentIntentResponse {
  data: {
    id: string;
    type: string;
    attributes: {
      amount: number;
      currency: string;
      description?: string;
      statement_descriptor?: string;
      status: string;
      client_key: string;
      payment_method_allowed: string[];
      payments: Array<{
        id: string;
        attributes: {
          status: string;
          amount: number;
          paid_at: number;
        };
      }>;
      next_action?: {
        type: string;
        redirect?: {
          url: string;
          return_url: string;
        };
      };
      metadata?: Record<string, unknown>;
    };
  };
}

import { z } from "zod";

export const createPaymentIntentSchema = z.object({
  eventId: z.string().uuid(),
  contestantId: z.string().uuid(),
  awardCategoryId: z.string().uuid().optional().nullable(),
  voterIdentifier: z.string().min(1),
  tierId: z.string().optional(),
  customVotes: z.number().int().positive().max(10000).optional(),
  paymentChannel: z.enum(["QR_PH", "GCASH", "MAYA", "CARD"]).default("QR_PH"),
});

export type CreatePaymentIntentInput = z.infer<typeof createPaymentIntentSchema>;

export const verifyPaymentSchema = z.object({
  referenceNumber: z.string().min(1),
});

export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;

export interface PaymentIntentResult {
  referenceNumber: string;
  amountInPhp: number;
  totalVotes: number;
  bonusVotes: number;
  qrCodeData: string;
  checkoutUrl?: string;
  expiresAt: string;
  status: "PENDING" | "PAID" | "FAILED" | "EXPIRED";
}

export interface VoterReceipt {
  referenceNumber: string;
  eventTitle: string;
  candidateName: string;
  candidateNumber: number;
  amountPaid: number;
  votesAwarded: number;
  bonusVotes: number;
  paidAt: string;
  verificationHash: string;
}

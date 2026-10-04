import { z } from "zod";

export const payoutMethodEnum = z.enum(["BANK_TRANSFER", "GCASH", "MAYA"]);
export type PayoutMethod = z.infer<typeof payoutMethodEnum>;

export const payoutStatusEnum = z.enum(["PENDING", "PROCESSING", "COMPLETED", "REJECTED"]);
export type PayoutStatus = z.infer<typeof payoutStatusEnum>;

export const createPayoutRequestSchema = z.object({
  eventId: z.string().min(1, "Event ID is required"),
  amountInPhp: z
    .number()
    .positive("Requested amount must be greater than zero")
    .min(100, "Minimum payout request is ₱100.00"),
  payoutMethod: payoutMethodEnum,
  accountName: z
    .string()
    .trim()
    .min(2, "Account holder name must be at least 2 characters")
    .max(100, "Account holder name cannot exceed 100 characters"),
  accountNumber: z
    .string()
    .trim()
    .min(6, "Account number must be at least 6 digits")
    .max(50, "Account number cannot exceed 50 characters"),
  bankOrProviderName: z
    .string()
    .trim()
    .max(100, "Bank or provider name cannot exceed 100 characters")
    .optional(),
});

export type CreatePayoutRequestInput = z.infer<typeof createPayoutRequestSchema>;

export const fulfillPayoutRequestSchema = z.object({
  payoutId: z.string().min(1, "Payout request ID is required"),
  status: z.enum(["COMPLETED", "REJECTED"]),
  adminReferenceNumber: z
    .string()
    .trim()
    .max(100, "Reference number cannot exceed 100 characters")
    .optional(),
  rejectionReason: z
    .string()
    .trim()
    .max(500, "Rejection reason cannot exceed 500 characters")
    .optional(),
  notes: z.string().trim().max(500, "Admin notes cannot exceed 500 characters").optional(),
});

export type FulfillPayoutRequestInput = z.infer<typeof fulfillPayoutRequestSchema>;

export const updateTakeRateSchema = z.object({
  eventId: z.string().min(1, "Event ID is required"),
  takeRatePercentage: z
    .number()
    .min(0, "Take rate cannot be negative")
    .max(50, "Take rate cannot exceed 50%"),
});

export type UpdateTakeRateInput = z.infer<typeof updateTakeRateSchema>;

export const auditLogQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  contestantId: z.string().optional(),
  paymentChannel: z.string().optional(),
  status: z.string().optional(),
  startDate: z
    .string()
    .datetime({ offset: true })
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/))
    .optional(),
  endDate: z
    .string()
    .datetime({ offset: true })
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/))
    .optional(),
  search: z.string().trim().optional(),
});

export type AuditLogQueryParams = z.infer<typeof auditLogQuerySchema>;

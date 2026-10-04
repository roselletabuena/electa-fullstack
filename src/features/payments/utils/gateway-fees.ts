import type { PaymentChannelType } from "../types";

export interface GatewayFeeStructure {
  percentage: number; // e.g. 0.015 for 1.5%
  fixedPhp: number; // e.g. 15 for ₱15 fixed fee
  label: string;
}

export const GATEWAY_FEE_RATES: Record<string, GatewayFeeStructure> = {
  QR_PH: { percentage: 0.015, fixedPhp: 0, label: "QR Ph (1.5%)" },
  GCASH: { percentage: 0.02, fixedPhp: 0, label: "GCash (2.0%)" },
  MAYA: { percentage: 0.02, fixedPhp: 0, label: "Maya (2.0%)" },
  CARD: { percentage: 0.035, fixedPhp: 15.0, label: "Credit/Debit Card (3.5% + ₱15)" },
  GRAB_PAY: { percentage: 0.02, fixedPhp: 0, label: "GrabPay (2.0%)" },
  ONLINE_BANKING: { percentage: 0.02, fixedPhp: 0, label: "Online Banking (2.0%)" },
};

export const DEFAULT_GATEWAY_FEE: GatewayFeeStructure = {
  percentage: 0.02,
  fixedPhp: 0,
  label: "Standard Gateway (2.0%)",
};

/**
 * Deterministically computes the exact payment gateway processing fee in Philippine Pesos.
 * Rounded to 2 decimal places.
 */
export function calculateGatewayFee(
  amountInPhp: number,
  channel: PaymentChannelType | string,
): number {
  if (amountInPhp <= 0) return 0;
  const structure = GATEWAY_FEE_RATES[channel.toUpperCase()] ?? DEFAULT_GATEWAY_FEE;
  const rawFee = amountInPhp * structure.percentage + structure.fixedPhp;
  return Math.round(rawFee * 100) / 100;
}

/**
 * Computes the complete fee breakdown: gross, gateway fee, platform commission, and net proceeds.
 */
export function calculateNetProceeds(
  amountInPhp: number,
  channel: PaymentChannelType | string,
  takeRatePercentage: number = 12.0,
): {
  grossAmount: number;
  gatewayFee: number;
  platformCommission: number;
  netProceeds: number;
} {
  const gross = Math.max(0, Math.round(amountInPhp * 100) / 100);
  const gatewayFee = calculateGatewayFee(gross, channel);
  const commissionRate = Math.max(0, Math.min(100, takeRatePercentage)) / 100;
  const platformCommission = Math.round(gross * commissionRate * 100) / 100;
  const netProceeds = Math.max(
    0,
    Math.round((gross - gatewayFee - platformCommission) * 100) / 100,
  );

  return {
    grossAmount: gross,
    gatewayFee,
    platformCommission,
    netProceeds,
  };
}

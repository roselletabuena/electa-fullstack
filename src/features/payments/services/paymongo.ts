import crypto from "node:crypto";
import { env } from "@/env";
import type { PayMongoPaymentIntentResponse, PaymentChannelType } from "../types";

const PAYMONGO_API_BASE = "https://api.paymongo.com/v1";

function getAuthHeader(): string {
  const secretKey = env.PAYMONGO_SECRET_KEY;
  if (!secretKey) return "";
  const encoded = Buffer.from(`${secretKey}:`).toString("base64");
  return `Basic ${encoded}`;
}

export function isPayMongoConfigured(): boolean {
  const key = env.PAYMONGO_SECRET_KEY;
  return Boolean(key?.startsWith("sk_"));
}

export interface CreatePayMongoIntentParams {
  amountInCents: number; // in centavos, e.g. ₱50.00 = 5000
  description: string;
  referenceNumber: string;
  paymentChannel?: PaymentChannelType;
  metadata?: Record<string, unknown>;
}

export interface PayMongoIntentOutput {
  id: string;
  clientKey: string;
  status: string;
  amount: number;
  qrCodeData?: string;
  checkoutUrl?: string;
}

function formatMetadataValue(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return value.toString();
  return JSON.stringify(value);
}

function buildFlatMetadata(
  referenceNumber: string,
  metadata?: Record<string, unknown>,
): Record<string, string> {
  const flatMetadata: Record<string, string> = {
    reference_number: referenceNumber,
  };

  if (!metadata) return flatMetadata;

  for (const [key, rawValue] of Object.entries(metadata)) {
    if (rawValue === null || rawValue === undefined) continue;
    const stringValue = formatMetadataValue(rawValue);
    if (stringValue.trim().length > 0) {
      flatMetadata[key.replace(/\W/g, "_")] = stringValue;
    }
  }

  return flatMetadata;
}

async function attachQrPhPaymentMethod(
  intentId: string,
  clientKey: string,
  authHeader: string,
): Promise<string | undefined> {
  try {
    const pmResponse = await fetch(`${PAYMONGO_API_BASE}/payment_methods`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify({
        data: {
          attributes: {
            type: "qrph",
          },
        },
      }),
    });

    if (!pmResponse.ok) return undefined;

    const pmJson = await pmResponse.json();
    const paymentMethodId = pmJson.data?.id;
    if (!paymentMethodId) return undefined;

    const attachResponse = await fetch(`${PAYMONGO_API_BASE}/payment_intents/${intentId}/attach`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify({
        data: {
          attributes: {
            payment_method: paymentMethodId,
            client_key: clientKey,
          },
        },
      }),
    });

    if (!attachResponse.ok) return undefined;

    const attachJson = await attachResponse.json();
    const nextAction = attachJson.data?.attributes?.next_action;
    return nextAction?.consume_qr_code?.image_url ?? nextAction?.consume_qr_code?.code ?? undefined;
  } catch (attachErr) {
    console.warn("PayMongo QR Ph auto-attach fallback:", attachErr);
    return undefined;
  }
}

/**
 * Creates a PayMongo Payment Intent
 */
export async function createPayMongoPaymentIntent(
  params: CreatePayMongoIntentParams,
): Promise<PayMongoIntentOutput> {
  if (!isPayMongoConfigured()) {
    const randomHex = crypto.randomBytes(3).toString("hex");
    // Return mock intent for sandbox simulation
    return {
      id: `pi_mock_${Date.now()}_${randomHex}`,
      clientKey: `client_key_mock_${params.referenceNumber}`,
      status: "awaiting_payment_method",
      amount: params.amountInCents,
      qrCodeData: `00020101021228460012ph.gov.bsp.qrph0118ELECTA${params.referenceNumber}5406${(params.amountInCents / 100).toFixed(2)}53036085802PH5910ELECTA6006MANILA6304ABCD`,
    };
  }

  const authHeader = getAuthHeader();
  const paymentMethods = ["qrph", "gcash", "paymaya", "card", "grab_pay", "dob"];
  const flatMetadata = buildFlatMetadata(params.referenceNumber, params.metadata);

  const intentPayload = {
    data: {
      attributes: {
        amount: Math.round(params.amountInCents),
        payment_method_allowed: paymentMethods,
        payment_method_options: {
          card: { request_three_d_secure: "any" },
        },
        currency: "PHP",
        description: params.description.slice(0, 200),
        statement_descriptor: "ELECTABOOST",
        metadata: flatMetadata,
      },
    },
  };

  const intentResponse = await fetch(`${PAYMONGO_API_BASE}/payment_intents`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: authHeader,
    },
    body: JSON.stringify(intentPayload),
  });

  if (!intentResponse.ok) {
    const errorBody = await intentResponse.text();
    console.error(
      "PayMongo create payment intent failed. Request:",
      JSON.stringify(intentPayload),
      "Response:",
      errorBody,
    );
    throw new Error(`PayMongo API error (${intentResponse.status}): ${errorBody}`);
  }

  const intentJson = (await intentResponse.json()) as PayMongoPaymentIntentResponse;
  const intentData = intentJson.data;
  const clientKey = intentData.attributes.client_key;

  let qrCodeData: string | undefined;

  // Auto-attach QR Ph if requested or default
  if (!params.paymentChannel || params.paymentChannel === "QR_PH") {
    qrCodeData = await attachQrPhPaymentMethod(intentData.id, clientKey, authHeader);
  }

  return {
    id: intentData.id,
    clientKey,
    status: intentData.attributes.status,
    amount: intentData.attributes.amount,
    ...(qrCodeData ? { qrCodeData } : {}),
  };
}

/**
 * Retrieves payment intent status from PayMongo
 */
export async function getPayMongoPaymentIntent(intentId: string): Promise<{
  id: string;
  status: string;
  isPaid: boolean;
  paidAt?: Date;
}> {
  if (!isPayMongoConfigured() || intentId.startsWith("pi_mock_")) {
    return {
      id: intentId,
      status: "awaiting_payment_method",
      isPaid: false,
    };
  }

  const authHeader = getAuthHeader();
  const response = await fetch(`${PAYMONGO_API_BASE}/payment_intents/${intentId}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: authHeader,
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("PayMongo retrieve payment intent failed:", errorBody);
    throw new Error(`PayMongo retrieve error (${response.status}): ${errorBody}`);
  }

  const json = (await response.json()) as PayMongoPaymentIntentResponse;
  const attributes = json.data.attributes;
  const isPaid = attributes.status === "succeeded";

  let paidAt: Date | undefined;
  if (isPaid && attributes.payments && attributes.payments.length > 0) {
    const latestPayment = attributes.payments[0];
    if (latestPayment?.attributes.paid_at) {
      paidAt = new Date(latestPayment.attributes.paid_at * 1000);
    }
  }

  return {
    id: json.data.id,
    status: attributes.status,
    isPaid,
    ...(paidAt ? { paidAt } : {}),
  };
}

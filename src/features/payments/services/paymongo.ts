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
  return Boolean(key && key.startsWith("sk_"));
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

/**
 * Creates a PayMongo Payment Intent
 */
export async function createPayMongoPaymentIntent(
  params: CreatePayMongoIntentParams,
): Promise<PayMongoIntentOutput> {
  if (!isPayMongoConfigured()) {
    // Return mock intent for sandbox simulation
    return {
      id: `pi_mock_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      clientKey: `client_key_mock_${params.referenceNumber}`,
      status: "awaiting_payment_method",
      amount: params.amountInCents,
      qrCodeData: `00020101021228460012ph.gov.bsp.qrph0118VOTESPHERE${params.referenceNumber}5406${(params.amountInCents / 100).toFixed(2)}53036085802PH5910VOTESPHERE6006MANILA6304ABCD`,
    };
  }

  const authHeader = getAuthHeader();

  // 1. Create Payment Intent
  const paymentMethods = ["qrph", "gcash", "paymaya", "card", "grab_pay", "dob"];

  const flatMetadata: Record<string, string> = {
    reference_number: String(params.referenceNumber),
  };

  if (params.metadata) {
    for (const [key, value] of Object.entries(params.metadata)) {
      if (value !== null && value !== undefined && String(value).trim().length > 0) {
        flatMetadata[key.replace(/[^a-zA-Z0-9_]/g, "_")] = String(value);
      }
    }
  }

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
  const intentId = intentData.id;
  const clientKey = intentData.attributes.client_key;

  let qrCodeData: string | undefined;

  // 2. If channel is QR_PH or default, create payment_method of type qrph and attach to intent
  if (!params.paymentChannel || params.paymentChannel === "QR_PH") {
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

      if (pmResponse.ok) {
        const pmJson = await pmResponse.json();
        const paymentMethodId = pmJson.data?.id;

        if (paymentMethodId) {
          // 3. Attach Payment Method to Payment Intent
          const attachResponse = await fetch(
            `${PAYMONGO_API_BASE}/payment_intents/${intentId}/attach`,
            {
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
            },
          );

          if (attachResponse.ok) {
            const attachJson = await attachResponse.json();
            const nextAction = attachJson.data?.attributes?.next_action;
            if (nextAction?.consume_qr_code?.image_url) {
              qrCodeData = nextAction.consume_qr_code.image_url;
            } else if (nextAction?.consume_qr_code?.code) {
              qrCodeData = nextAction.consume_qr_code.code;
            }
          }
        }
      }
    } catch (attachErr) {
      console.warn("PayMongo QR Ph auto-attach fallback:", attachErr);
    }
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

import { type NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/api/response";
import { createPaymentIntentAction } from "@/features/payments/actions/create-payment-intent";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await createPaymentIntentAction(body);

    if (!result.success || !result.data) {
      return apiError(result.error ?? "Failed to create payment intent", 400);
    }

    return apiSuccess(result.data, 200);
  } catch (error) {
    console.error("API /api/payments/intent error:", error);
    return apiError(error instanceof Error ? error.message : "Internal error", 500);
  }
}

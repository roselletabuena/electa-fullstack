import { type NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/api/response";
import { verifyPaymentStatusAction } from "@/features/payments/actions/verify-payment";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await verifyPaymentStatusAction(
      { referenceNumber: body.referenceNumber },
      { simulateSuccess: Boolean(body.simulateSuccess) },
    );

    if (!result.success) {
      return apiError(result.error ?? "Failed to verify payment status", 400);
    }

    return apiSuccess(result, 200);
  } catch (error) {
    console.error("API /api/payments/verify error:", error);
    return apiError(error instanceof Error ? error.message : "Internal error", 500);
  }
}

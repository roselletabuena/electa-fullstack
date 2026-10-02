import { type NextRequest, NextResponse } from "next/server";
import { createPaymentIntentAction } from "@/features/payments/actions/create-payment-intent";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await createPaymentIntentAction(body);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("API /api/payments/intent error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Internal error" },
      { status: 500 },
    );
  }
}

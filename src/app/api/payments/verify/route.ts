import { type NextRequest, NextResponse } from "next/server";
import { verifyPaymentStatusAction } from "@/features/payments/actions/verify-payment";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await verifyPaymentStatusAction(
      { referenceNumber: body.referenceNumber },
      { simulateSuccess: Boolean(body.simulateSuccess) },
    );

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("API /api/payments/verify error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Internal error" },
      { status: 500 },
    );
  }
}

"use server";

import { db } from "@/lib/db";
import {
  createPaymentIntentSchema,
  type CreatePaymentIntentInput,
  type PaymentIntentResult,
} from "../types";
import { PRICING_TIERS, calculateCustomVotePackage } from "../utils/pricing";
import { createPayMongoPaymentIntent, isPayMongoConfigured } from "../services/paymongo";
import { buildQrPhPayload, generateQrCodeDataUrl } from "../services/qrph-generator";

export interface CreatePaymentIntentResponse {
  success: boolean;
  data?: PaymentIntentResult;
  error?: string;
}

export async function createPaymentIntentAction(
  rawInput: CreatePaymentIntentInput,
): Promise<CreatePaymentIntentResponse> {
  try {
    const validated = createPaymentIntentSchema.parse(rawInput);

    // 1. Verify Event & Contestant exist
    const event = await db.event.findUnique({
      where: { id: validated.eventId },
      select: { id: true, title: true, publicationStatus: true, startsAt: true, endsAt: true },
    });

    if (!event) {
      return { success: false, error: "Event not found." };
    }

    const contestant = await db.contestant.findUnique({
      where: { id: validated.contestantId },
      select: { id: true, name: true, contestantNumber: true, eventId: true, status: true },
    });

    if (!contestant || contestant.eventId !== event.id) {
      return { success: false, error: "Contestant not found in this event." };
    }

    if (contestant.status !== "ACTIVE") {
      return { success: false, error: "Contestant is currently not active for voting." };
    }

    // 2. Resolve Price & Vote Counts
    let pricePhp = 50;
    let baseVotes = 5;
    let bonusVotes = 0;
    let totalVotes = 5;

    if (validated.tierId) {
      const tier = PRICING_TIERS.find((t) => t.id === validated.tierId);
      if (tier) {
        pricePhp = tier.pricePhp;
        baseVotes = tier.baseVotes;
        bonusVotes = tier.bonusVotes;
        totalVotes = tier.totalVotes;
      }
    } else if (validated.customVotes && validated.customVotes > 0) {
      const customPkg = calculateCustomVotePackage(validated.customVotes);
      pricePhp = customPkg.pricePhp;
      baseVotes = customPkg.baseVotes;
      bonusVotes = customPkg.bonusVotes;
      totalVotes = customPkg.totalVotes;
    }

    const amountInCents = Math.round(pricePhp * 100);
    const referenceNumber = `VS-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

    // 3. Request PayMongo / Mock Gateway Intent
    const intentOutput = await createPayMongoPaymentIntent({
      amountInCents,
      description: `Vote Boost for #${contestant.contestantNumber} ${contestant.name} (${event.title})`,
      referenceNumber,
      paymentChannel: validated.paymentChannel,
      metadata: {
        eventId: event.id,
        contestantId: contestant.id,
        awardCategoryId: validated.awardCategoryId ?? "",
        voterIdentifier: validated.voterIdentifier,
        baseVotes,
        bonusVotes,
        totalVotes,
      },
    });

    // 4. Resolve QR Ph Payload / Image
    let finalQrCode = "";
    let rawQrString = intentOutput.qrCodeData ?? "";

    if (
      intentOutput.qrCodeData &&
      (intentOutput.qrCodeData.startsWith("http") || intentOutput.qrCodeData.startsWith("data:"))
    ) {
      finalQrCode = intentOutput.qrCodeData;
    } else if (intentOutput.qrCodeData) {
      finalQrCode = await generateQrCodeDataUrl(intentOutput.qrCodeData);
    } else {
      rawQrString = buildQrPhPayload({
        referenceNumber,
        amountInPhp: pricePhp,
        merchantName: "VoteSphere",
        city: "Manila",
      });
      finalQrCode = await generateQrCodeDataUrl(rawQrString);
    }

    // 5. Expiry 15 minutes from now
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // 6. Record in Database
    await db.paymentTransaction.create({
      data: {
        referenceNumber,
        eventId: event.id,
        contestantId: contestant.id,
        awardCategoryId: validated.awardCategoryId ?? null,
        voterIdentifier: validated.voterIdentifier,
        amountInPhp: pricePhp,
        amountInCents,
        votesAwarded: totalVotes,
        bonusVotes,
        status: "PENDING",
        provider: isPayMongoConfigured() ? "PAYMONGO" : "MOCK",
        paymentChannel: validated.paymentChannel,
        paymongoPaymentIntentId: intentOutput.id,
        paymongoClientKey: intentOutput.clientKey,
        qrCodeString: rawQrString,
        metadata: {
          baseVotes,
          bonusVotes,
          expiresAt: expiresAt.toISOString(),
        },
      },
    });

    return {
      success: true,
      data: {
        referenceNumber,
        amountInPhp: pricePhp,
        amountInCents,
        totalVotes,
        baseVotes,
        bonusVotes,
        qrCodeData: finalQrCode,
        expiresAt: expiresAt.toISOString(),
        status: "PENDING",
        provider: isPayMongoConfigured() ? "PAYMONGO" : "MOCK",
        clientKey: intentOutput.clientKey,
        checkoutUrl: intentOutput.checkoutUrl ?? null,
      },
    };
  } catch (error) {
    console.error("Error in createPaymentIntentAction:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create payment intent.",
    };
  }
}

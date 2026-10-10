"use server";

import crypto from "node:crypto";
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

interface VotePackage {
  pricePhp: number;
  baseVotes: number;
  bonusVotes: number;
  totalVotes: number;
}

function resolveVotePackage(validated: CreatePaymentIntentInput): VotePackage {
  if (validated.tierId) {
    const tier = PRICING_TIERS.find((t) => t.id === validated.tierId);
    if (tier) {
      return {
        pricePhp: tier.pricePhp,
        baseVotes: tier.baseVotes,
        bonusVotes: tier.bonusVotes,
        totalVotes: tier.totalVotes,
      };
    }
  }
  if (validated.customVotes && validated.customVotes > 0) {
    const customPkg = calculateCustomVotePackage(validated.customVotes);
    return {
      pricePhp: customPkg.pricePhp,
      baseVotes: customPkg.baseVotes,
      bonusVotes: customPkg.bonusVotes,
      totalVotes: customPkg.totalVotes,
    };
  }
  return { pricePhp: 50, baseVotes: 5, bonusVotes: 0, totalVotes: 5 };
}

async function resolveQrCodeDisplay(
  qrCodeData: string | null | undefined,
  referenceNumber: string,
  pricePhp: number,
): Promise<{ finalQrCode: string; rawQrString: string }> {
  if (!qrCodeData) {
    const rawQrString = buildQrPhPayload({
      referenceNumber,
      amountInPhp: pricePhp,
      merchantName: "Electa",
      city: "Manila",
    });
    const finalQrCode = await generateQrCodeDataUrl(rawQrString);
    return { finalQrCode, rawQrString };
  }

  if (qrCodeData.startsWith("http") || qrCodeData.startsWith("data:")) {
    return { finalQrCode: qrCodeData, rawQrString: qrCodeData };
  }

  const finalQrCode = await generateQrCodeDataUrl(qrCodeData);
  return { finalQrCode, rawQrString: qrCodeData };
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

    if (contestant?.eventId !== event.id) {
      return { success: false, error: "Contestant not found in this event." };
    }

    if (contestant.status !== "ACTIVE") {
      return { success: false, error: "Contestant is currently not active for voting." };
    }

    // 2. Resolve Price & Vote Counts
    const { pricePhp, baseVotes, bonusVotes, totalVotes } = resolveVotePackage(validated);

    const amountInCents = Math.round(pricePhp * 100);
    const randomSuffix = crypto.randomBytes(2).toString("hex").toUpperCase();
    const referenceNumber = `VS-${Date.now().toString(36).toUpperCase()}-${randomSuffix}`;

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
    const { finalQrCode, rawQrString } = await resolveQrCodeDisplay(
      intentOutput.qrCodeData,
      referenceNumber,
      pricePhp,
    );

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

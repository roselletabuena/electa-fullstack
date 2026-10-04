"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth/get-session";
import { Prisma } from "@/generated/client/client";
import { updateTakeRateSchema, type UpdateTakeRateInput } from "@/lib/validations/payout";

export interface UpdateTakeRateResult {
  success: boolean;
  takeRatePercentage?: number;
  error?: string;
}

/**
 * Server Action: updateEventTakeRateAction
 * Authorization: Strictly Platform Administrator (Electa Admin)
 * Organizers attempting to execute this will receive a Forbidden (403) error.
 */
export async function updateEventTakeRateAction(
  input: UpdateTakeRateInput,
): Promise<UpdateTakeRateResult> {
  const session = await getSession();

  if (!session) {
    return {
      success: false,
      error: "Authentication required",
    };
  }

  // Strict Platform Administrator authorization check
  const isAdmin = session.role === "ADMIN" || session.role === "SUPER_ADMIN";
  if (!isAdmin) {
    return {
      success: false,
      error: "Forbidden: Only platform administrators can modify the platform take rate",
    };
  }

  const parseResult = updateTakeRateSchema.safeParse(input);
  if (!parseResult.success) {
    const issue = parseResult.error.issues[0];
    return {
      success: false,
      error: issue ? issue.message : "Invalid take rate input",
    };
  }

  const { eventId, takeRatePercentage } = parseResult.data;

  try {
    const existingEvent = await db.event.findUnique({
      where: { id: eventId },
      select: { id: true, slug: true },
    });

    if (!existingEvent) {
      return {
        success: false,
        error: "Event not found",
      };
    }

    await db.event.update({
      where: { id: eventId },
      data: {
        takeRatePercentage: new Prisma.Decimal(takeRatePercentage),
      },
    });

    revalidatePath(`/events/${existingEvent.slug}/revenue`);
    revalidatePath(`/events/${existingEvent.slug}`);

    return {
      success: true,
      takeRatePercentage,
    };
  } catch (err) {
    console.error("Failed to update take rate:", err);
    return {
      success: false,
      error: "Failed to update platform take rate. Please try again.",
    };
  }
}

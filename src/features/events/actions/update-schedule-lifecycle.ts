"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireEventOwnership } from "@/features/events/utils/ownership-guard";
import { hashPassphrase } from "@/features/events/utils/passphrase";
import {
  updateScheduleLifecycleSchema,
  type UpdateScheduleLifecycleInput,
} from "@/lib/validations/event-schedule-lifecycle";
import type { ActionResponse } from "@/features/events/types";
import type { Event } from "@/generated/client/client";

function getAuthErrorMessage(authResult: Awaited<ReturnType<typeof requireEventOwnership>>): string | null {
  if (authResult.authorized) return null;
  if (authResult.reason === "UNAUTHENTICATED") return "You must be signed in to perform this action.";
  if (authResult.reason === "NOT_FOUND") return "Event not found.";
  return "Forbidden: You do not have ownership of this event.";
}

function computeNewPassphraseHash(
  currentHash: string | null,
  clearDraftPassphrase?: boolean,
  draftPassphrase?: string,
): string | null {
  if (clearDraftPassphrase) return null;
  if (draftPassphrase && draftPassphrase.trim().length > 0) {
    return hashPassphrase(draftPassphrase.trim());
  }
  return currentHash;
}

export async function updateScheduleLifecycleAction(
  slug: string,
  input: UpdateScheduleLifecycleInput,
): Promise<ActionResponse<Event>> {
  // 1. Authorize event ownership server-side
  const authResult = await requireEventOwnership(slug);
  const authError = getAuthErrorMessage(authResult);
  if (authError || !authResult.authorized) {
    return { success: false, error: authError ?? "Unauthorized" };
  }

  // 2. Validate input payload against Zod schema
  const parsed = updateScheduleLifecycleSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Validation failed. Please check your inputs.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { startsAt, endsAt, publicationStatus, draftPassphrase, clearDraftPassphrase, reason } =
    parsed.data;
  const currentEvent = authResult.event;

  const newPassphraseHash = computeNewPassphraseHash(
    currentEvent.draftPassphraseHash,
    clearDraftPassphrase,
    draftPassphrase,
  );

  const newStartsAt = new Date(startsAt);
  const newEndsAt = new Date(endsAt);

  // 3. Atomically update event schedule & lifecycle, then write audit log
  try {
    const updatedEvent = await db.$transaction(async (tx) => {
      const updated = await tx.event.update({
        where: { id: currentEvent.id },
        data: {
          startsAt: newStartsAt,
          endsAt: newEndsAt,
          publicationStatus,
          draftPassphraseHash: newPassphraseHash,
        },
      });

      await tx.eventAuditLog.create({
        data: {
          eventId: currentEvent.id,
          action: "UPDATE_SCHEDULE_LIFECYCLE",
          changedBy: authResult.session.userId,
          previousVal: {
            startsAt:
              currentEvent.startsAt instanceof Date
                ? currentEvent.startsAt.toISOString()
                : new Date(currentEvent.startsAt).toISOString(),
            endsAt:
              currentEvent.endsAt instanceof Date
                ? currentEvent.endsAt.toISOString()
                : new Date(currentEvent.endsAt).toISOString(),
            publicationStatus: currentEvent.publicationStatus,
            hasDraftPassphrase: Boolean(currentEvent.draftPassphraseHash),
          },
          newVal: {
            startsAt:
              updated.startsAt instanceof Date
                ? updated.startsAt.toISOString()
                : new Date(updated.startsAt).toISOString(),
            endsAt:
              updated.endsAt instanceof Date
                ? updated.endsAt.toISOString()
                : new Date(updated.endsAt).toISOString(),
            publicationStatus: updated.publicationStatus,
            hasDraftPassphrase: Boolean(updated.draftPassphraseHash),
          },
          reason: reason && reason.trim().length > 0 ? reason.trim() : null,
        },
      });

      return updated;
    });

    try {
      revalidatePath(`/events/${slug}/settings`);
      revalidatePath(`/events/${slug}`);
    } catch {
      // Ignored outside Next.js request context
    }

    return {
      success: true,
      data: updatedEvent,
      message: "Schedule and lifecycle settings updated successfully",
    };
  } catch (error) {
    console.error("Failed to update schedule and lifecycle settings:", error);
    return {
      success: false,
      error: "An unexpected error occurred while saving schedule settings. Please try again.",
    };
  }
}

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

export async function updateScheduleLifecycleAction(
  slug: string,
  input: UpdateScheduleLifecycleInput,
): Promise<ActionResponse<Event>> {
  // 1. Authorize event ownership server-side
  const authResult = await requireEventOwnership(slug);
  if (!authResult.authorized) {
    if (authResult.reason === "UNAUTHENTICATED") {
      return { success: false, error: "You must be signed in to perform this action." };
    }
    if (authResult.reason === "NOT_FOUND") {
      return { success: false, error: "Event not found." };
    }
    return { success: false, error: "Forbidden: You do not have ownership of this event." };
  }

  // 2. Validate input payload against Zod schema
  const parsed = updateScheduleLifecycleSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as string;
      if (!fieldErrors[field]) {
        fieldErrors[field] = [];
      }
      fieldErrors[field].push(issue.message);
    }
    return {
      success: false,
      error: "Validation failed. Please check your inputs.",
      fieldErrors,
    };
  }

  const { startsAt, endsAt, publicationStatus, draftPassphrase, clearDraftPassphrase, reason } =
    parsed.data;
  const currentEvent = authResult.event;

  // Determine new draft passphrase hash
  let newPassphraseHash: string | null = currentEvent.draftPassphraseHash;
  if (clearDraftPassphrase) {
    newPassphraseHash = null;
  } else if (draftPassphrase && draftPassphrase.trim().length > 0) {
    newPassphraseHash = hashPassphrase(draftPassphrase.trim());
  }

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

"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireEventOwnership } from "@/features/events/utils/ownership-guard";
import {
  updateEventBrandingSchema,
  type UpdateEventBrandingInput,
} from "@/lib/validations/event-branding";
import type { ActionResponse } from "@/features/events/types";
import type { Event } from "@/generated/client/client";

export async function updateEventBrandingAction(
  slug: string,
  input: UpdateEventBrandingInput,
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
  const parsed = updateEventBrandingSchema.safeParse(input);
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

  const { title, description, bannerUrl, reason } = parsed.data;
  const currentEvent = authResult.event;

  // 3. Atomically update event and write audit log
  try {
    const updatedEvent = await db.$transaction(async (tx) => {
      const updated = await tx.event.update({
        where: { id: currentEvent.id },
        data: {
          title,
          description,
          bannerUrl,
        },
      });

      await tx.eventAuditLog.create({
        data: {
          eventId: currentEvent.id,
          action: "UPDATE_BRANDING",
          changedBy: authResult.session.userId,
          previousVal: {
            title: currentEvent.title,
            description: currentEvent.description,
            bannerUrl: currentEvent.bannerUrl,
          },
          newVal: {
            title: updated.title,
            description: updated.description,
            bannerUrl: updated.bannerUrl,
          },
          reason: reason && reason.trim().length > 0 ? reason.trim() : null,
        },
      });

      return updated;
    });

    revalidatePath(`/events/${slug}/settings`);
    revalidatePath(`/events/${slug}`);

    return {
      success: true,
      data: updatedEvent,
      message: "Event branding updated successfully",
    };
  } catch (error) {
    console.error("Failed to update event branding:", error);
    return {
      success: false,
      error: "An unexpected error occurred while saving branding settings. Please try again.",
    };
  }
}

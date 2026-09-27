"use server";

import { revalidatePath } from "next/cache";
import { createEvent } from "../services/create-event";
import type { CreateEventInput } from "@/lib/validations/event";
import type { CreateEventResult } from "../types";

/**
 * Server Action for creating a new event from UI form submissions.
 */
export async function createEventAction(input: CreateEventInput): Promise<CreateEventResult> {
  const result = await createEvent(input);

  if (result.success && result.data) {
    try {
      revalidatePath("/dashboard");
      revalidatePath("/events");
      revalidatePath(`/events/${result.data.slug}`);
    } catch {
      // Ignored in test environment outside Next.js server context
    }
  }

  return result;
}

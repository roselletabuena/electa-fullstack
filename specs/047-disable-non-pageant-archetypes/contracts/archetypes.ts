import { z } from "zod";
import {
  EVENT_ARCHETYPES,
  type EventArchetype,
  isArchetypeAvailable,
  isArchetypeComingSoon,
} from "@/features/events/types/archetype";

/**
 * Schema validating that an archetype is supported for event creation.
 * Rejects non-pageant archetypes with a 400 Bad Request message.
 */
export const availableEventArchetypeSchema = z
  .enum(EVENT_ARCHETYPES)
  .default("PAGEANT")
  .refine(
    (archetype: EventArchetype) => isArchetypeAvailable(archetype),
    {
      message: "This event archetype is coming soon and currently disabled.",
    }
  );

export type AvailableEventArchetype = z.infer<typeof availableEventArchetypeSchema>;

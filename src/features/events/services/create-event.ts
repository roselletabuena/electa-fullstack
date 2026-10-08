import { getSession } from "@/lib/auth/get-session";
import { db } from "@/lib/db";
import { createEventSchema, type CreateEventInput } from "@/lib/validations/event";
import type { CreateEventResult } from "../types";

/**
 * Atomic event creation service that validates inputs, verifies authenticated session,
 * checks for slug collisions, and creates the Event and initial EventAuditLog in a transaction.
 */
export async function createEvent(input: CreateEventInput): Promise<CreateEventResult> {
  // 1. Session verification
  const session = await getSession();
  if (!session?.userId) {
    return {
      success: false,
      error: "Unauthorized: Organizer session required",
    };
  }

  // 2. Schema validation
  const validation = createEventSchema.safeParse(input);
  if (!validation.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of validation.error.issues) {
      const field = issue.path[0]?.toString() || "form";
      fieldErrors[field] ??= [];
      fieldErrors[field].push(issue.message);
    }
    return {
      success: false,
      error: validation.error.issues.map((i) => i.message).join(", "),
      fieldErrors,
    };
  }

  const { title, slug, description, bannerUrl, startsAt, endsAt } = validation.data;
  const normalizedSlug = slug.toLowerCase().trim();

  // 3. Check for existing slug collision
  const existing = await db.event.findFirst({
    where: {
      slug: {
        equals: normalizedSlug,
        mode: "insensitive",
      },
    },
    select: { id: true },
  });

  if (existing) {
    return {
      success: false,
      error: "An event with this URL slug already exists",
      fieldErrors: {
        slug: ["This URL slug is already taken. Please choose another one."],
      },
    };
  }

  // 4. Atomic transaction creating Event and initial EventAuditLog
  try {
    const createdEvent = await db.$transaction(async (tx) => {
      const event = await tx.event.create({
        data: {
          title,
          slug: normalizedSlug,
          description,
          bannerUrl,
          startsAt: new Date(startsAt),
          endsAt: new Date(endsAt),
          publicationStatus: "DRAFT",
          isFreeVotingEnabled: true,
          dailyFreeVoteLimit: 1,
          showResultsOnClose: true,
          organizerId: session.userId,
        },
      });

      await tx.eventAuditLog.create({
        data: {
          eventId: event.id,
          action: "EVENT_CREATED",
          changedBy: session.userId,
          previousVal: {},
          newVal: {
            title: event.title,
            slug: event.slug,
            startsAt: event.startsAt.toISOString(),
            endsAt: event.endsAt.toISOString(),
            publicationStatus: event.publicationStatus,
            organizerId: event.organizerId,
          },
          reason: "Initial event record creation",
        },
      });

      return event;
    });

    return {
      success: true,
      data: createdEvent,
      message: "Event created successfully",
    };
  } catch (error: unknown) {
    // Handle Prisma unique constraint collision (P2002) if concurrent request slipped through
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      return {
        success: false,
        error: "An event with this URL slug already exists",
        fieldErrors: {
          slug: ["This URL slug is already taken. Please choose another one."],
        },
      };
    }

    console.error("Error creating event:", error);
    return {
      success: false,
      error: "Failed to create event due to an internal server error",
    };
  }
}

import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/api/response";
import { requireEventOwnership } from "@/features/events/utils/ownership-guard";
import { createDivisionSchema } from "@/lib/validations/division";

interface RouteParams {
  params: Promise<{
    slug: string;
  }>;
}

export async function GET(_request: NextRequest, context: RouteParams) {
  try {
    const { slug } = await context.params;
    const event = await db.event.findUnique({
      where: { slug },
      select: { id: true, publicationStatus: true, organizerId: true },
    });

    if (!event) {
      return apiError("Event not found", 404);
    }

    const divisions = await db.division.findMany({
      where: { eventId: event.id },
      orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
      include: {
        _count: {
          select: { contestants: true },
        },
      },
    });

    const formatted = divisions.map((div) => ({
      id: div.id,
      eventId: div.eventId,
      name: div.name,
      description: div.description,
      displayOrder: div.displayOrder,
      contestantCount: div._count.contestants,
      createdAt: div.createdAt.toISOString(),
      updatedAt: div.updatedAt.toISOString(),
    }));

    return apiSuccess(formatted);
  } catch (error) {
    console.error("Failed to list divisions:", error);
    return apiError("Internal server error", 500);
  }
}

export async function POST(request: NextRequest, context: RouteParams) {
  try {
    const { slug } = await context.params;
    const authResult = await requireEventOwnership(slug);

    if (!authResult.authorized) {
      if (authResult.reason === "UNAUTHENTICATED") {
        return apiError("Authentication required", 401);
      }
      if (authResult.reason === "NOT_FOUND") {
        return apiError("Event not found", 404);
      }
      return apiError("You do not have permission to manage this event", 403);
    }

    const body = await request.json().catch(() => null);
    const parsed = createDivisionSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message || "Invalid division input", 400);
    }

    const existing = await db.division.findFirst({
      where: {
        eventId: authResult.event.id,
        name: {
          equals: parsed.data.name,
          mode: "insensitive",
        },
      },
    });

    if (existing) {
      return apiError("A division with this name already exists for this event", 409);
    }

    const division = await db.division.create({
      data: {
        eventId: authResult.event.id,
        name: parsed.data.name,
        description: parsed.data.description ?? null,
        displayOrder: parsed.data.displayOrder,
      },
    });

    return apiSuccess(
      {
        id: division.id,
        eventId: division.eventId,
        name: division.name,
        description: division.description,
        displayOrder: division.displayOrder,
        createdAt: division.createdAt.toISOString(),
        updatedAt: division.updatedAt.toISOString(),
      },
      201,
    );
  } catch (error) {
    console.error("Failed to create division:", error);
    return apiError("Internal server error", 500);
  }
}

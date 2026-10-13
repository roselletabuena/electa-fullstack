import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/api/response";
import { requireEventOwnership } from "@/features/events/utils/ownership-guard";
import { createEventPositionSchema } from "@/lib/validations/archetypes";
import { createEventPosition } from "@/features/events/services/taxonomy-service";

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
      select: { id: true },
    });

    if (!event) {
      return apiError("Event not found", 404);
    }

    const positions = await db.eventPosition.findMany({
      where: { eventId: event.id },
      orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
      include: {
        _count: {
          select: { contestants: true },
        },
      },
    });

    const dtos = positions.map((p) => ({
      id: p.id,
      eventId: p.eventId,
      name: p.name,
      description: p.description,
      maxSelectionsPerVoter: p.maxSelectionsPerVoter,
      minSelectionsPerVoter: p.minSelectionsPerVoter,
      displayOrder: p.displayOrder,
      isVotingOpen: p.isVotingOpen,
      candidateCount: p._count.contestants,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    }));

    return apiSuccess(dtos);
  } catch (error) {
    console.error("Failed to list event positions:", error);
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
    const parsed = createEventPositionSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message || "Invalid position input", 400);
    }

    const created = await createEventPosition(authResult.event.id, parsed.data);
    return apiSuccess(created, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create position";
    if (message.includes("already exists")) {
      return apiError(message, 409);
    }
    console.error("Failed to create event position:", error);
    return apiError(message, 500);
  }
}

import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/api/response";
import { requireEventOwnership } from "@/features/events/utils/ownership-guard";
import { updateDivisionSchema } from "@/lib/validations/division";

interface RouteParams {
  params: Promise<{
    slug: string;
    divisionId: string;
  }>;
}

export async function PATCH(request: NextRequest, context: RouteParams) {
  try {
    const { slug, divisionId } = await context.params;
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

    const division = await db.division.findUnique({
      where: { id: divisionId },
    });

    if (!division || division.eventId !== authResult.event.id) {
      return apiError("Division not found", 404);
    }

    const body = await request.json().catch(() => null);
    const parsed = updateDivisionSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message || "Invalid division input", 400);
    }

    if (parsed.data.name && parsed.data.name.toLowerCase() !== division.name.toLowerCase()) {
      const duplicate = await db.division.findFirst({
        where: {
          eventId: authResult.event.id,
          id: { not: divisionId },
          name: {
            equals: parsed.data.name,
            mode: "insensitive",
          },
        },
      });

      if (duplicate) {
        return apiError("A division with this name already exists for this event", 409);
      }
    }

    const updated = await db.division.update({
      where: { id: divisionId },
      data: {
        ...(parsed.data.name !== undefined ? { name: parsed.data.name } : {}),
        ...(parsed.data.description !== undefined ? { description: parsed.data.description } : {}),
        ...(parsed.data.displayOrder !== undefined
          ? { displayOrder: parsed.data.displayOrder }
          : {}),
      },
    });

    return apiSuccess({
      id: updated.id,
      eventId: updated.eventId,
      name: updated.name,
      description: updated.description,
      displayOrder: updated.displayOrder,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error("Failed to update division:", error);
    return apiError("Internal server error", 500);
  }
}

export async function DELETE(_request: NextRequest, context: RouteParams) {
  try {
    const { slug, divisionId } = await context.params;
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

    const division = await db.division.findUnique({
      where: { id: divisionId },
      include: {
        _count: {
          select: { contestants: true },
        },
      },
    });

    if (!division || division.eventId !== authResult.event.id) {
      return apiError("Division not found", 404);
    }

    if (division._count.contestants > 0) {
      return apiError(
        "Cannot delete division with registered contestants. Reassign or remove contestants first.",
        409,
      );
    }

    await db.division.delete({
      where: { id: divisionId },
    });

    return apiSuccess({ id: divisionId, deleted: true });
  } catch (error) {
    console.error("Failed to delete division:", error);
    return apiError("Internal server error", 500);
  }
}

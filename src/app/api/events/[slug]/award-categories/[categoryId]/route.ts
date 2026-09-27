import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/api/response";
import { requireEventOwnership } from "@/features/events/utils/ownership-guard";
import { updateAwardCategorySchema } from "@/lib/validations/category-awards";

interface RouteParams {
  params: Promise<{
    slug: string;
    categoryId: string;
  }>;
}

export async function PATCH(request: NextRequest, context: RouteParams) {
  try {
    const { slug, categoryId } = await context.params;
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

    const category = await db.awardCategory.findUnique({
      where: { id: categoryId },
    });

    if (!category || category.eventId !== authResult.event.id) {
      return apiError("Award category not found", 404);
    }

    const body = await request.json().catch(() => null);
    const parsed = updateAwardCategorySchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message || "Invalid category input", 400);
    }

    if (parsed.data.name && parsed.data.name.toLowerCase() !== category.name.toLowerCase()) {
      const duplicate = await db.awardCategory.findFirst({
        where: {
          eventId: authResult.event.id,
          id: { not: categoryId },
          name: {
            equals: parsed.data.name,
            mode: "insensitive",
          },
        },
      });

      if (duplicate) {
        return apiError("An award category with this name already exists for this event", 409);
      }
    }

    const updated = await db.awardCategory.update({
      where: { id: categoryId },
      data: {
        ...(parsed.data.name !== undefined ? { name: parsed.data.name } : {}),
        ...(parsed.data.description !== undefined ? { description: parsed.data.description } : {}),
        ...(parsed.data.isVotingOpen !== undefined
          ? { isVotingOpen: parsed.data.isVotingOpen }
          : {}),
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
      isVotingOpen: updated.isVotingOpen,
      displayOrder: updated.displayOrder,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error("Failed to update award category:", error);
    return apiError("Internal server error", 500);
  }
}

export async function DELETE(_request: NextRequest, context: RouteParams) {
  try {
    const { slug, categoryId } = await context.params;
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

    const category = await db.awardCategory.findUnique({
      where: { id: categoryId },
      include: {
        _count: {
          select: { contestants: true },
        },
      },
    });

    if (!category || category.eventId !== authResult.event.id) {
      return apiError("Award category not found", 404);
    }

    if (category._count.contestants > 0) {
      return apiError(
        "Cannot delete award category assigned to contestants. Unlink contestants first.",
        409,
      );
    }

    await db.awardCategory.delete({
      where: { id: categoryId },
    });

    return apiSuccess({ id: categoryId, deleted: true });
  } catch (error) {
    console.error("Failed to delete award category:", error);
    return apiError("Internal server error", 500);
  }
}

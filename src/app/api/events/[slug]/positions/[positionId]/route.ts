import type { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/api/response";
import { requireEventOwnership } from "@/features/events/utils/ownership-guard";
import { updateEventPositionSchema } from "@/lib/validations/archetypes";
import {
  updateEventPosition,
  deleteEventPosition,
} from "@/features/events/services/taxonomy-service";

interface RouteParams {
  params: Promise<{
    slug: string;
    positionId: string;
  }>;
}

export async function PATCH(request: NextRequest, context: RouteParams) {
  try {
    const { slug, positionId } = await context.params;
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
    const parsed = updateEventPositionSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message || "Invalid position input", 400);
    }

    const updated = await updateEventPosition(authResult.event.id, positionId, parsed.data);
    return apiSuccess(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update position";
    if (message.includes("not found")) {
      return apiError(message, 404);
    }
    if (message.includes("already exists")) {
      return apiError(message, 409);
    }
    console.error("Failed to update position:", error);
    return apiError(message, 500);
  }
}

export async function DELETE(_request: NextRequest, context: RouteParams) {
  try {
    const { slug, positionId } = await context.params;
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

    const result = await deleteEventPosition(authResult.event.id, positionId);
    return apiSuccess(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete position";
    if (message.includes("not found")) {
      return apiError(message, 404);
    }
    console.error("Failed to delete position:", error);
    return apiError(message, 500);
  }
}

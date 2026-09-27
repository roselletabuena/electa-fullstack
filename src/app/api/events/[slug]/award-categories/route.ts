import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/api/response";
import { requireEventOwnership } from "@/features/events/utils/ownership-guard";
import { createAwardCategorySchema } from "@/lib/validations/category-awards";

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

    const categories = await db.awardCategory.findMany({
      where: { eventId: event.id },
      orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
      include: {
        _count: {
          select: { contestants: true },
        },
      },
    });

    const formatted = categories.map((cat) => ({
      id: cat.id,
      eventId: cat.eventId,
      name: cat.name,
      description: cat.description,
      isVotingOpen: cat.isVotingOpen,
      displayOrder: cat.displayOrder,
      contestantCount: cat._count.contestants,
      createdAt: cat.createdAt.toISOString(),
      updatedAt: cat.updatedAt.toISOString(),
    }));

    return apiSuccess(formatted);
  } catch (error) {
    console.error("Failed to list award categories:", error);
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
    const parsed = createAwardCategorySchema.safeParse(body);

    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message || "Invalid category input", 400);
    }

    const existing = await db.awardCategory.findFirst({
      where: {
        eventId: authResult.event.id,
        name: {
          equals: parsed.data.name,
          mode: "insensitive",
        },
      },
    });

    if (existing) {
      return apiError("An award category with this name already exists for this event", 409);
    }

    const category = await db.awardCategory.create({
      data: {
        eventId: authResult.event.id,
        name: parsed.data.name,
        description: parsed.data.description ?? null,
        isVotingOpen: parsed.data.isVotingOpen,
        displayOrder: parsed.data.displayOrder,
      },
    });

    return apiSuccess(
      {
        id: category.id,
        eventId: category.eventId,
        name: category.name,
        description: category.description,
        isVotingOpen: category.isVotingOpen,
        displayOrder: category.displayOrder,
        createdAt: category.createdAt.toISOString(),
        updatedAt: category.updatedAt.toISOString(),
      },
      201,
    );
  } catch (error) {
    console.error("Failed to create award category:", error);
    return apiError("Internal server error", 500);
  }
}

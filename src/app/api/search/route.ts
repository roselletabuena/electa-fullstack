import { type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api/response";
import { searchQuerySchema, type SearchResultsDto } from "@/features/search/types";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const rawQuery = searchParams.get("q") ?? "";
    const rawLimit = searchParams.get("limit") ?? "5";

    if (!rawQuery.trim()) {
      const emptyResults: SearchResultsDto = {
        query: "",
        events: [],
        contestants: [],
        categories: [],
        totalMatches: 0,
      };
      return apiSuccess(emptyResults);
    }

    const validationResult = searchQuerySchema.safeParse({
      q: rawQuery,
      limit: rawLimit,
    });

    if (!validationResult.success) {
      const errorMessage = validationResult.error.issues[0]?.message ?? "Invalid search query";
      return apiError(errorMessage, 400);
    }

    const { q, limit } = validationResult.data;

    const [events, contestants, categories] = await Promise.all([
      db.event.findMany({
        where: {
          publicationStatus: "PUBLISHED",
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
            { slug: { contains: q, mode: "insensitive" } },
          ],
        },
        take: limit,
        orderBy: { startsAt: "desc" },
      }),
      db.contestant.findMany({
        where: {
          status: "ACTIVE",
          event: {
            publicationStatus: "PUBLISHED",
          },
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { hometown: { contains: q, mode: "insensitive" } },
            { bio: { contains: q, mode: "insensitive" } },
          ],
        },
        include: {
          event: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
        },
        take: limit,
      }),
      db.awardCategory.findMany({
        where: {
          event: {
            publicationStatus: "PUBLISHED",
          },
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
          ],
        },
        include: {
          event: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
        },
        take: limit,
      }),
    ]);

    const formattedEvents = events.map((event) => ({
      id: event.id,
      title: event.title,
      slug: event.slug,
      description: event.description,
      bannerUrl: event.bannerUrl,
      startsAt: event.startsAt.toISOString(),
      endsAt: event.endsAt.toISOString(),
      publicationStatus: event.publicationStatus as "PUBLISHED" | "DRAFT" | "ARCHIVED",
    }));

    const formattedContestants = contestants.map((c) => ({
      id: c.id,
      name: c.name,
      contestantNumber: c.contestantNumber,
      hometown: c.hometown,
      bio: c.bio,
      eventId: c.eventId,
      eventTitle: c.event.title,
      eventSlug: c.event.slug,
    }));

    const formattedCategories = categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      description: cat.description,
      eventId: cat.eventId,
      eventTitle: cat.event.title,
      eventSlug: cat.event.slug,
    }));

    const searchResults: SearchResultsDto = {
      query: q,
      events: formattedEvents,
      contestants: formattedContestants,
      categories: formattedCategories,
      totalMatches:
        formattedEvents.length + formattedContestants.length + formattedCategories.length,
    };

    return apiSuccess(searchResults);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return apiError(message, 500);
  }
}

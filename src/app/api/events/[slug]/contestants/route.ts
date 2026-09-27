import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/api/response";
import { getSession } from "@/lib/auth/get-session";
import { createContestantSchema } from "@/lib/validations/contestant";
import { normalizeSocialLinks } from "@/features/contestants/utils/normalize-social-links";
import { parseVideoEmbedUrl } from "@/features/contestants/utils/parse-video-embed";
import type { ContestantDivision, ContestantDto } from "@/features/contestants/types";

interface RouteParams {
  params: Promise<{
    slug: string;
  }>;
}

export async function GET(request: NextRequest, context: RouteParams) {
  try {
    const { slug } = await context.params;
    if (!slug) {
      return apiError("Event slug is required", 400);
    }

    const event = await db.event.findUnique({
      where: { slug },
      select: { id: true, organizerId: true },
    });

    if (!event) {
      return apiError("Event not found", 404);
    }

    const { searchParams } = new URL(request.url);
    const divisionParam = searchParams.get("division");
    const categoryIdParam = searchParams.get("categoryId");
    const statusParam = searchParams.get("status");

    const session = await getSession();
    const isOrganizer = session?.role === "ORGANIZER" || session?.userId === event.organizerId;

    let statusFilter: unknown = "ACTIVE";
    if (isOrganizer && statusParam) {
      statusFilter = statusParam === "ALL" ? undefined : statusParam;
    }

    const whereClause: Record<string, unknown> = {
      eventId: event.id,
      ...(statusFilter !== undefined ? { status: statusFilter } : {}),
    };

    if (divisionParam && divisionParam !== "ALL") {
      whereClause.division = divisionParam as ContestantDivision;
    }

    if (categoryIdParam && categoryIdParam !== "ALL") {
      whereClause.categories = {
        some: {
          awardCategoryId: categoryIdParam,
        },
      };
    }

    const contestants = await db.contestant.findMany({
      where: whereClause,
      orderBy: { contestantNumber: "asc" },
      include: {
        media: {
          orderBy: { displayOrder: "asc" },
        },
        categories: {
          include: {
            awardCategory: true,
          },
        },
      },
    });

    const dtoList: ContestantDto[] = contestants.map((c) => ({
      id: c.id,
      eventId: c.eventId,
      contestantNumber: c.contestantNumber,
      name: c.name,
      division: c.division as ContestantDivision,
      status: c.status,
      hometown: c.hometown,
      heightCm: c.heightCm,
      bio: c.bio,
      advocacy: c.advocacy,
      avatarUrl: c.avatarUrl,
      instagramUrl: c.instagramUrl,
      tiktokUrl: c.tiktokUrl,
      facebookUrl: c.facebookUrl,
      voteCount: c.voteCount,
      media: c.media.map((m) => ({
        id: m.id,
        contestantId: m.contestantId,
        mediaType: m.mediaType,
        url: m.url,
        embedPlatform: m.embedPlatform,
        embedId: m.embedId,
        displayOrder: m.displayOrder,
        aspectRatio: m.aspectRatio,
        isCover: m.isCover,
        createdAt: m.createdAt.toISOString(),
      })),
      categories: c.categories.map((cat) => ({
        id: cat.awardCategory.id,
        eventId: cat.awardCategory.eventId,
        name: cat.awardCategory.name,
        description: cat.awardCategory.description,
        isVotingOpen: cat.awardCategory.isVotingOpen,
        createdAt: cat.awardCategory.createdAt.toISOString(),
        updatedAt: cat.awardCategory.updatedAt.toISOString(),
      })),
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    }));

    return apiSuccess(dtoList);
  } catch (error) {
    console.error("Failed to list contestants:", error);
    return apiError("Internal server error while fetching contestants", 500);
  }
}

export async function POST(request: NextRequest, context: RouteParams) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "ORGANIZER" && !session.email.includes("organizer"))) {
      return apiError("Unauthorized: Only event organizers can manage contestants", 403);
    }

    const { slug } = await context.params;
    const event = await db.event.findUnique({
      where: { slug },
      select: { id: true, organizerId: true },
    });

    if (!event) {
      return apiError("Event not found", 404);
    }

    const body = await request.json();
    const parsed = createContestantSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message || "Invalid contestant data", 400);
    }

    const data = parsed.data;

    // Check duplicate candidate number in the same division
    const existing = await db.contestant.findUnique({
      where: {
        eventId_division_contestantNumber: {
          eventId: event.id,
          division: data.division,
          contestantNumber: data.contestantNumber,
        },
      },
    });

    if (existing) {
      return apiError(
        `Candidate number #${data.contestantNumber} already exists in the ${data.division} division`,
        409,
      );
    }

    const social = normalizeSocialLinks({
      instagramUrl: data.instagramUrl,
      tiktokUrl: data.tiktokUrl,
      facebookUrl: data.facebookUrl,
    });

    const newContestant = await db.$transaction(async (tx) => {
      const created = await tx.contestant.create({
        data: {
          eventId: event.id,
          contestantNumber: data.contestantNumber,
          name: data.name,
          division: data.division,
          hometown: data.hometown || null,
          heightCm: data.heightCm ?? null,
          bio: data.bio || null,
          advocacy: data.advocacy || null,
          avatarUrl: data.avatarUrl,
          instagramUrl: social.instagramUrl || null,
          tiktokUrl: social.tiktokUrl || null,
          facebookUrl: social.facebookUrl || null,
          status: "ACTIVE",
        },
      });

      // Media items
      if (data.media && data.media.length > 0) {
        await tx.contestantMedia.createMany({
          data: data.media.map((m, index) => {
            const parsedVideo = m.mediaType === "VIDEO_EMBED" ? parseVideoEmbedUrl(m.url) : null;
            return {
              contestantId: created.id,
              mediaType: m.mediaType,
              url: m.url,
              embedPlatform: parsedVideo ? parsedVideo.platform : m.embedPlatform || "NONE",
              embedId: parsedVideo ? parsedVideo.embedId : m.embedId || null,
              displayOrder: m.displayOrder ?? index,
              aspectRatio: m.aspectRatio || "4:5",
              isCover: m.isCover ?? index === 0,
            };
          }),
        });
      }

      // Categories
      if (data.categoryIds && data.categoryIds.length > 0) {
        await tx.contestantCategoryAssignment.createMany({
          data: data.categoryIds.map((awardCategoryId) => ({
            contestantId: created.id,
            awardCategoryId,
          })),
        });
      }

      return tx.contestant.findUnique({
        where: { id: created.id },
        include: {
          media: { orderBy: { displayOrder: "asc" } },
          categories: { include: { awardCategory: true } },
        },
      });
    });

    return apiSuccess(newContestant, 201);
  } catch (error) {
    console.error("Failed to create contestant:", error);
    return apiError("Internal server error while creating contestant", 500);
  }
}

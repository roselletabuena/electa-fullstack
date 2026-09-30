import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/api/response";
import { getSession } from "@/lib/auth/get-session";
import { updateContestantSchema } from "@/lib/validations/contestant";
import { normalizeSocialLinks } from "@/features/contestants/utils/normalize-social-links";
import { parseVideoEmbedUrl } from "@/features/contestants/utils/parse-video-embed";
import type { ContestantDivision, ContestantDto } from "@/features/contestants/types";

interface RouteParams {
  params: Promise<{
    slug: string;
    contestantId: string;
  }>;
}

export async function GET(_request: NextRequest, context: RouteParams) {
  try {
    const { contestantId } = await context.params;

    const contestant = await db.contestant.findUnique({
      where: { id: contestantId },
      include: {
        divisionRef: true,
        media: { orderBy: { displayOrder: "asc" } },
        categories: { include: { awardCategory: true } },
      },
    });

    if (!contestant) {
      return apiError("Contestant not found", 404);
    }

    const dto: ContestantDto = {
      id: contestant.id,
      eventId: contestant.eventId,
      contestantNumber: contestant.contestantNumber,
      name: contestant.name,
      division: contestant.division as ContestantDivision,
      divisionId: contestant.divisionId,
      divisionName: contestant.divisionRef?.name,
      divisionRef: contestant.divisionRef
        ? { id: contestant.divisionRef.id, name: contestant.divisionRef.name }
        : undefined,
      status: contestant.status,
      hometown: contestant.hometown,
      heightCm: contestant.heightCm,
      bio: contestant.bio,
      advocacy: contestant.advocacy,
      avatarUrl: contestant.avatarUrl,
      instagramUrl: contestant.instagramUrl,
      tiktokUrl: contestant.tiktokUrl,
      facebookUrl: contestant.facebookUrl,
      voteCount: contestant.voteCount,
      media: contestant.media.map((m) => ({
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
      categories: contestant.categories.map((cat) => ({
        id: cat.awardCategory.id,
        eventId: cat.awardCategory.eventId,
        name: cat.awardCategory.name,
        description: cat.awardCategory.description,
        isVotingOpen: cat.awardCategory.isVotingOpen,
        createdAt: cat.awardCategory.createdAt.toISOString(),
        updatedAt: cat.awardCategory.updatedAt.toISOString(),
      })),
      createdAt: contestant.createdAt.toISOString(),
      updatedAt: contestant.updatedAt.toISOString(),
    };

    return apiSuccess(dto);
  } catch (error) {
    console.error("Failed to get contestant detail:", error);
    return apiError("Internal server error", 500);
  }
}

export async function PATCH(request: NextRequest, context: RouteParams) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "ORGANIZER" && !session.email.includes("organizer"))) {
      return apiError("Unauthorized", 403);
    }

    const { contestantId } = await context.params;
    const body = await request.json();
    const parsed = updateContestantSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(parsed.error.issues[0]?.message || "Invalid input", 400);
    }

    const data = parsed.data;

    const existing = await db.contestant.findUnique({
      where: { id: contestantId },
    });
    if (!existing) {
      return apiError("Contestant not found", 404);
    }

    // Check number collision if changing number or division
    if (
      (data.contestantNumber && data.contestantNumber !== existing.contestantNumber) ||
      (data.division && data.division !== existing.division)
    ) {
      const isStandard = data.division
        ? ["FEMALE", "MALE", "LGBTQ", "TEEN"].includes(data.division.toUpperCase())
        : false;
      const divisionToCheck: ContestantDivision =
        data.division && isStandard
          ? (data.division.toUpperCase() as ContestantDivision)
          : existing.division;
      const numberToCheck = data.contestantNumber || existing.contestantNumber;
      const duplicate = await db.contestant.findUnique({
        where: {
          eventId_division_contestantNumber: {
            eventId: existing.eventId,
            division: divisionToCheck,
            contestantNumber: numberToCheck,
          },
        },
      });
      if (duplicate && duplicate.id !== contestantId) {
        return apiError(
          `Candidate number #${numberToCheck} is already taken in ${divisionToCheck}`,
          409,
        );
      }
    }

    const social = normalizeSocialLinks({
      instagramUrl: data.instagramUrl,
      tiktokUrl: data.tiktokUrl,
      facebookUrl: data.facebookUrl,
    });

    const updated = await db.$transaction(async (tx) => {
      const updateData: Parameters<typeof tx.contestant.update>[0]["data"] = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.contestantNumber !== undefined) updateData.contestantNumber = data.contestantNumber;
      if (data.division !== undefined) {
        const isStandard = ["FEMALE", "MALE", "LGBTQ", "TEEN"].includes(
          data.division.toUpperCase(),
        );
        updateData.division = isStandard
          ? (data.division.toUpperCase() as ContestantDivision)
          : "FEMALE";
      }
      if (data.divisionId !== undefined) {
        updateData.divisionId = data.divisionId;
      }
      if (data.hometown !== undefined) updateData.hometown = data.hometown;
      if (data.heightCm !== undefined) updateData.heightCm = data.heightCm;
      if (data.bio !== undefined) updateData.bio = data.bio;
      if (data.advocacy !== undefined) updateData.advocacy = data.advocacy;
      if (data.avatarUrl !== undefined) updateData.avatarUrl = data.avatarUrl;
      if (data.instagramUrl !== undefined) updateData.instagramUrl = social.instagramUrl ?? null;
      if (data.tiktokUrl !== undefined) updateData.tiktokUrl = social.tiktokUrl ?? null;
      if (data.facebookUrl !== undefined) updateData.facebookUrl = social.facebookUrl ?? null;
      if (data.status !== undefined) updateData.status = data.status;

      const contestant = await tx.contestant.update({
        where: { id: contestantId },
        data: updateData,
      });

      if (data.media) {
        await tx.contestantMedia.deleteMany({ where: { contestantId } });
        if (data.media.length > 0) {
          await tx.contestantMedia.createMany({
            data: data.media.map((m, index) => {
              const parsedVideo = m.mediaType === "VIDEO_EMBED" ? parseVideoEmbedUrl(m.url) : null;
              return {
                contestantId,
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
      }

      if (data.categoryIds) {
        await tx.contestantCategoryAssignment.deleteMany({ where: { contestantId } });
        if (data.categoryIds.length > 0) {
          await tx.contestantCategoryAssignment.createMany({
            data: data.categoryIds.map((awardCategoryId) => ({
              contestantId,
              awardCategoryId,
            })),
          });
        }
      }

      return tx.contestant.findUnique({
        where: { id: contestant.id },
        include: {
          media: { orderBy: { displayOrder: "asc" } },
          categories: { include: { awardCategory: true } },
        },
      });
    });

    return apiSuccess(updated);
  } catch (error) {
    console.error("Failed to update contestant:", error);
    return apiError("Internal server error", 500);
  }
}

export async function DELETE(_request: NextRequest, context: RouteParams) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "ORGANIZER" && !session.email.includes("organizer"))) {
      return apiError("Unauthorized", 403);
    }

    const { contestantId } = await context.params;
    await db.contestant.delete({
      where: { id: contestantId },
    });

    return apiSuccess({ deleted: true });
  } catch (error) {
    console.error("Failed to delete contestant:", error);
    return apiError("Internal server error", 500);
  }
}

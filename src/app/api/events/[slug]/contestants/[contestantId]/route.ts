import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/api/response";
import { getSession } from "@/lib/auth/get-session";
import { updateContestantSchema, type UpdateContestantSchema } from "@/lib/validations/contestant";
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

type TransactionClient = Parameters<Parameters<typeof db.$transaction>[0]>[0];

async function checkContestantNumberCollision(
  existing: { eventId: string; division: ContestantDivision; contestantNumber: number },
  data: UpdateContestantSchema,
  contestantId: string,
): Promise<string | null> {
  const isNumberChanged = data.contestantNumber !== undefined && data.contestantNumber !== existing.contestantNumber;
  const isDivisionChanged = data.division !== undefined && data.division !== existing.division;

  if (!isNumberChanged && !isDivisionChanged) {
    return null;
  }

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
    return `Candidate number #${numberToCheck} is already taken in ${divisionToCheck}`;
  }
  return null;
}

function buildContestantUpdateData(
  data: UpdateContestantSchema,
  social: ReturnType<typeof normalizeSocialLinks>,
) {
  const updateData: Parameters<TransactionClient["contestant"]["update"]>[0]["data"] = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.contestantNumber !== undefined) updateData.contestantNumber = data.contestantNumber;
  if (data.division !== undefined) {
    const isStandard = ["FEMALE", "MALE", "LGBTQ", "TEEN"].includes(data.division.toUpperCase());
    updateData.division = isStandard
      ? (data.division.toUpperCase() as ContestantDivision)
      : "FEMALE";
  }
  if (data.divisionId !== undefined) updateData.divisionId = data.divisionId;
  if (data.hometown !== undefined) updateData.hometown = data.hometown;
  if (data.heightCm !== undefined) updateData.heightCm = data.heightCm;
  if (data.bio !== undefined) updateData.bio = data.bio;
  if (data.advocacy !== undefined) updateData.advocacy = data.advocacy;
  if (data.avatarUrl !== undefined) updateData.avatarUrl = data.avatarUrl;
  if (data.instagramUrl !== undefined) updateData.instagramUrl = social.instagramUrl ?? null;
  if (data.tiktokUrl !== undefined) updateData.tiktokUrl = social.tiktokUrl ?? null;
  if (data.facebookUrl !== undefined) updateData.facebookUrl = social.facebookUrl ?? null;
  if (data.status !== undefined) updateData.status = data.status;
  return updateData;
}

async function syncContestantMedia(
  tx: TransactionClient,
  contestantId: string,
  media: UpdateContestantSchema["media"],
) {
  if (!media) return;
  await tx.contestantMedia.deleteMany({ where: { contestantId } });
  if (media.length === 0) return;
  await tx.contestantMedia.createMany({
    data: media.map((m, index) => {
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

async function syncContestantCategories(
  tx: TransactionClient,
  contestantId: string,
  categoryIds: UpdateContestantSchema["categoryIds"],
) {
  if (!categoryIds) return;
  await tx.contestantCategoryAssignment.deleteMany({ where: { contestantId } });
  if (categoryIds.length === 0) return;
  await tx.contestantCategoryAssignment.createMany({
    data: categoryIds.map((awardCategoryId) => ({
      contestantId,
      awardCategoryId,
    })),
  });
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

    const collisionError = await checkContestantNumberCollision(existing, data, contestantId);
    if (collisionError) {
      return apiError(collisionError, 409);
    }

    const social = normalizeSocialLinks({
      instagramUrl: data.instagramUrl,
      tiktokUrl: data.tiktokUrl,
      facebookUrl: data.facebookUrl,
    });

    const updateData = buildContestantUpdateData(data, social);

    const updated = await db.$transaction(async (tx) => {
      const contestant = await tx.contestant.update({
        where: { id: contestantId },
        data: updateData,
      });

      await syncContestantMedia(tx, contestantId, data.media);
      await syncContestantCategories(tx, contestantId, data.categoryIds);

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

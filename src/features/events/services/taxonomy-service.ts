import { db } from "@/lib/db";
import type {
  EventArchetype,
  EventPositionDto,
  UnifiedTaxonomyDto,
} from "../types/archetype";
import {
  createEventPositionSchema,
  updateEventPositionSchema,
  reorderPositionsSchema,
  updateEventArchetypeSchema,
  type CreateEventPositionInput,
  type UpdateEventPositionInput,
} from "@/lib/validations/archetypes";

/**
 * Maps a Prisma EventPosition record with candidate count to an EventPositionDto.
 */
function toPositionDto(
  position: {
    id: string;
    eventId: string;
    name: string;
    description: string | null;
    maxSelectionsPerVoter: number;
    minSelectionsPerVoter: number;
    displayOrder: number;
    isVotingOpen: boolean;
    createdAt: Date;
    updatedAt: Date;
    _count?: { contestants: number };
  }
): EventPositionDto {
  return {
    id: position.id,
    eventId: position.eventId,
    name: position.name,
    description: position.description,
    maxSelectionsPerVoter: position.maxSelectionsPerVoter,
    minSelectionsPerVoter: position.minSelectionsPerVoter,
    displayOrder: position.displayOrder,
    isVotingOpen: position.isVotingOpen,
    candidateCount: position._count?.contestants ?? 0,
    createdAt: position.createdAt.toISOString(),
    updatedAt: position.updatedAt.toISOString(),
  };
}

/**
 * Retrieves the full unified taxonomy for an event, including archetype,
 * positions (with candidate counts), divisions, and award categories.
 */
export async function getEventTaxonomy(
  eventIdOrSlug: string
): Promise<UnifiedTaxonomyDto | null> {
  const event = await db.event.findFirst({
    where: {
      OR: [{ id: eventIdOrSlug }, { slug: eventIdOrSlug }],
    },
    select: {
      id: true,
      archetype: true,
    },
  });

  if (!event) {
    return null;
  }

  const [positions, divisions, awardCategories] = await Promise.all([
    db.eventPosition.findMany({
      where: { eventId: event.id },
      orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
      include: {
        _count: {
          select: { contestants: true },
        },
      },
    }),
    db.division.findMany({
      where: { eventId: event.id },
      orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
      include: {
        _count: {
          select: { contestants: true },
        },
      },
    }),
    db.awardCategory.findMany({
      where: { eventId: event.id },
      orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
      include: {
        _count: {
          select: { contestants: true },
        },
      },
    }),
  ]);

  return {
    archetype: (event.archetype ?? "PAGEANT") as EventArchetype,
    positions: positions.map(toPositionDto),
    divisions: divisions.map((div) => ({
      id: div.id,
      eventId: div.eventId,
      name: div.name,
      description: div.description,
      displayOrder: div.displayOrder,
      contestantCount: div._count.contestants,
      createdAt: div.createdAt.toISOString(),
      updatedAt: div.updatedAt.toISOString(),
    })),
    awardCategories: awardCategories.map((cat) => ({
      id: cat.id,
      eventId: cat.eventId,
      name: cat.name,
      description: cat.description,
      isVotingOpen: cat.isVotingOpen,
      displayOrder: cat.displayOrder,
      contestantCount: cat._count.contestants,
      createdAt: cat.createdAt.toISOString(),
      updatedAt: cat.updatedAt.toISOString(),
    })),
  };
}

/**
 * Creates a new position/office/track for an event.
 */
export async function createEventPosition(
  eventId: string,
  input: CreateEventPositionInput
): Promise<EventPositionDto> {
  const parsed = createEventPositionSchema.parse(input);

  const existing = await db.eventPosition.findFirst({
    where: {
      eventId,
      name: {
        equals: parsed.name,
        mode: "insensitive",
      },
    },
  });

  if (existing) {
    throw new Error(`A position with name "${parsed.name}" already exists for this event.`);
  }

  // If displayOrder not specified or 0, place at end
  let orderToUse = parsed.displayOrder;
  if (!orderToUse) {
    const highest = await db.eventPosition.findFirst({
      where: { eventId },
      orderBy: { displayOrder: "desc" },
      select: { displayOrder: true },
    });
    orderToUse = (highest?.displayOrder ?? 0) + 1;
  }

  const created = await db.eventPosition.create({
    data: {
      eventId,
      name: parsed.name,
      description: parsed.description ?? null,
      maxSelectionsPerVoter: parsed.maxSelectionsPerVoter,
      minSelectionsPerVoter: parsed.minSelectionsPerVoter,
      displayOrder: orderToUse,
      isVotingOpen: parsed.isVotingOpen,
    },
    include: {
      _count: {
        select: { contestants: true },
      },
    },
  });

  return toPositionDto(created);
}

/**
 * Updates an existing position for an event.
 */
export async function updateEventPosition(
  eventId: string,
  positionId: string,
  input: UpdateEventPositionInput
): Promise<EventPositionDto> {
  const parsed = updateEventPositionSchema.parse(input);

  const position = await db.eventPosition.findFirst({
    where: { id: positionId, eventId },
  });

  if (!position) {
    throw new Error(`Position "${positionId}" not found for event "${eventId}".`);
  }

  if (parsed.name && parsed.name.toLowerCase() !== position.name.toLowerCase()) {
    const duplicate = await db.eventPosition.findFirst({
      where: {
        eventId,
        name: {
          equals: parsed.name,
          mode: "insensitive",
        },
        id: { not: positionId },
      },
    });

    if (duplicate) {
      throw new Error(`A position with name "${parsed.name}" already exists for this event.`);
    }
  }

  const updated = await db.eventPosition.update({
    where: { id: positionId },
    data: {
      ...(parsed.name !== undefined && { name: parsed.name }),
      ...(parsed.description !== undefined && { description: parsed.description ?? null }),
      ...(parsed.maxSelectionsPerVoter !== undefined && {
        maxSelectionsPerVoter: parsed.maxSelectionsPerVoter,
      }),
      ...(parsed.minSelectionsPerVoter !== undefined && {
        minSelectionsPerVoter: parsed.minSelectionsPerVoter,
      }),
      ...(parsed.displayOrder !== undefined && { displayOrder: parsed.displayOrder }),
      ...(parsed.isVotingOpen !== undefined && { isVotingOpen: parsed.isVotingOpen }),
    },
    include: {
      _count: {
        select: { contestants: true },
      },
    },
  });

  return toPositionDto(updated);
}

/**
 * Deletes a position. Associated contestants will have positionId set to null (onDelete: SetNull).
 */
export async function deleteEventPosition(
  eventId: string,
  positionId: string
): Promise<{ success: true; deletedId: string }> {
  const position = await db.eventPosition.findFirst({
    where: { id: positionId, eventId },
  });

  if (!position) {
    throw new Error(`Position "${positionId}" not found for event "${eventId}".`);
  }

  await db.eventPosition.delete({
    where: { id: positionId },
  });

  return { success: true, deletedId: positionId };
}

/**
 * Reorders positions for an event according to the given array of IDs.
 */
export async function reorderEventPositions(
  eventId: string,
  positionIds: string[]
): Promise<EventPositionDto[]> {
  const parsed = reorderPositionsSchema.parse({ positionIds });

  // Update in a transaction
  await db.$transaction(
    parsed.positionIds.map((id, index) =>
      db.eventPosition.updateMany({
        where: { id, eventId },
        data: { displayOrder: index + 1 },
      })
    )
  );

  const updatedPositions = await db.eventPosition.findMany({
    where: { eventId },
    orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
    include: {
      _count: {
        select: { contestants: true },
      },
    },
  });

  return updatedPositions.map(toPositionDto);
}

/**
 * Updates the archetype of an event (e.g. PAGEANT -> STUDENT_COUNCIL).
 */
export async function updateEventArchetype(
  eventId: string,
  archetype: EventArchetype
): Promise<{ id: string; archetype: EventArchetype }> {
  const parsed = updateEventArchetypeSchema.parse({ archetype });

  const updated = await db.event.update({
    where: { id: eventId },
    data: { archetype: parsed.archetype },
    select: { id: true, archetype: true },
  });

  return {
    id: updated.id,
    archetype: updated.archetype as EventArchetype,
  };
}

/**
 * Assigns or unassigns a contestant/candidate to a position.
 */
export async function assignContestantToPosition(
  contestantId: string,
  positionId: string | null
): Promise<{ id: string; positionId: string | null }> {
  const updated = await db.contestant.update({
    where: { id: contestantId },
    data: { positionId },
    select: { id: true, positionId: true },
  });

  return updated;
}
